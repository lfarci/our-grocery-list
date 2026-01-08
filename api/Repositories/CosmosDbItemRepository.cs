using api.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace api.Repositories;

/// <summary>
/// Cosmos DB implementation of the item repository
/// Uses Azure Cosmos DB NoSQL API for persistent storage with strong consistency
/// Partitions items by listId for efficient querying and future multi-list support
/// </summary>
public class CosmosDbItemRepository : IItemRepository
{
    private readonly Container _container;
    private readonly ILogger<CosmosDbItemRepository> _logger;
    private const string DefaultListId = "default";

    public CosmosDbItemRepository(
        CosmosClient cosmosClient,
        ILogger<CosmosDbItemRepository> logger,
        string databaseId,
        string containerId)
    {
        _logger = logger;
        _container = cosmosClient.GetContainer(databaseId, containerId);
        _logger.LogInformation("CosmosDbItemRepository initialized with database: {DatabaseId}, container: {ContainerId}", databaseId, containerId);
    }

    public async Task<IEnumerable<GroceryItem>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all grocery items from Cosmos DB");

            var query = new QueryDefinition("SELECT * FROM c WHERE c.listId = @listId")
                .WithParameter("@listId", DefaultListId);

            var iterator = _container.GetItemQueryIterator<GroceryItem>(query);
            var items = new List<GroceryItem>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                items.AddRange(response);
            }

            foreach (var item in items)
            {
                item.EnsureState();
            }

            _logger.LogInformation("Retrieved {Count} items from Cosmos DB", items.Count);
            return items;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Database or container doesn't exist yet - return empty list
            _logger.LogWarning("Database or container not found in Cosmos DB. Returning empty list.");
            return new List<GroceryItem>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving items from Cosmos DB. Check that CosmosDbConnectionString is properly configured.");
            throw;
        }
    }

    public async Task<GroceryItem?> GetByIdAsync(string id)
    {
        try
        {
            _logger.LogInformation("Retrieving item {ItemId} from Cosmos DB", id);

            var response = await _container.ReadItemAsync<GroceryItem>(
                id,
                new PartitionKey(DefaultListId));

            var item = response.Resource;
            item.EnsureState();
            return item;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Item {ItemId} not found in Cosmos DB", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving item {ItemId} from Cosmos DB", id);
            throw;
        }
    }

    public async Task<GroceryItem> CreateAsync(GroceryItem item)
    {
        try
        {
            _logger.LogInformation("Creating item {ItemId} in Cosmos DB", item.Id);

            // Set listId and partitionKey to default for single shared list
            item.ListId = DefaultListId;
            item.PartitionKey = DefaultListId;
            item.EnsureState();
            
            var response = await _container.CreateItemAsync(
                item,
                new PartitionKey(DefaultListId));

            _logger.LogInformation("Created item {ItemId} in Cosmos DB", item.Id);
            return response.Resource;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item {ItemId} in Cosmos DB", item.Id);
            throw;
        }
    }

    public async Task<GroceryItem?> UpdateAsync(GroceryItem item)
    {
        try
        {
            _logger.LogInformation("Updating item {ItemId} in Cosmos DB with category {Category}", item.Id, item.Category);

            // Ensure listId and partitionKey are set
            item.ListId = DefaultListId;
            item.PartitionKey = DefaultListId;
            // DO NOT call EnsureState() here - the item has already been validated and normalized
            // in the ItemFunctions before calling UpdateAsync
            
            var response = await _container.ReplaceItemAsync(
                item,
                item.Id,
                new PartitionKey(DefaultListId));

            _logger.LogInformation("Updated item {ItemId} in Cosmos DB, returned category {Category}", item.Id, response.Resource.Category);
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Item {ItemId} not found in Cosmos DB for update", item.Id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item {ItemId} in Cosmos DB", item.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            _logger.LogInformation("Deleting item {ItemId} from Cosmos DB", id);

            await _container.DeleteItemAsync<GroceryItem>(
                id,
                new PartitionKey(DefaultListId));

            _logger.LogInformation("Deleted item {ItemId} from Cosmos DB", id);
            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Item {ItemId} not found in Cosmos DB for deletion", id);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item {ItemId} from Cosmos DB", id);
            throw;
        }
    }

    public async Task<IEnumerable<GroceryItem>> SearchByNameAsync(string namePattern)
    {
        try
        {
            _logger.LogInformation("Searching for items matching pattern: {Pattern}", namePattern);

            // Use CONTAINS for case-insensitive partial match in Cosmos DB
            var query = new QueryDefinition(
                "SELECT * FROM c WHERE c.listId = @listId AND CONTAINS(LOWER(c.name), @pattern)")
                .WithParameter("@listId", DefaultListId)
                .WithParameter("@pattern", namePattern.ToLower());

            var iterator = _container.GetItemQueryIterator<GroceryItem>(query);
            var items = new List<GroceryItem>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                items.AddRange(response);
            }

            foreach (var item in items)
            {
                item.EnsureState();
            }

            _logger.LogInformation("Found {Count} items matching pattern: {Pattern}", items.Count, namePattern);
            return items;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Database or container not found in Cosmos DB. Returning empty list.");
            return new List<GroceryItem>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching items in Cosmos DB");
            throw;
        }
    }
}
