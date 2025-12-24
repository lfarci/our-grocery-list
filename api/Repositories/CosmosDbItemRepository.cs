using api.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace api.Repositories;

/// <summary>
/// Cosmos DB implementation of the item repository
/// Uses Azure Cosmos DB for persistent storage with strong consistency
/// </summary>
public class CosmosDbItemRepository : IItemRepository
{
    private readonly Container _container;
    private readonly ILogger<CosmosDbItemRepository> _logger;
    private const string PartitionKeyValue = "global";

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

            var query = new QueryDefinition("SELECT * FROM c WHERE c.partitionKey = @partitionKey")
                .WithParameter("@partitionKey", PartitionKeyValue);

            var iterator = _container.GetItemQueryIterator<GroceryItem>(query);
            var items = new List<GroceryItem>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                items.AddRange(response);
            }

            _logger.LogInformation("Retrieved {Count} items from Cosmos DB", items.Count);
            return items;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving items from Cosmos DB");
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
                new PartitionKey(PartitionKeyValue));

            return response.Resource;
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

            item.PartitionKey = PartitionKeyValue;
            var response = await _container.CreateItemAsync(
                item,
                new PartitionKey(PartitionKeyValue));

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
            _logger.LogInformation("Updating item {ItemId} in Cosmos DB", item.Id);

            item.PartitionKey = PartitionKeyValue;
            var response = await _container.ReplaceItemAsync(
                item,
                item.Id,
                new PartitionKey(PartitionKeyValue));

            _logger.LogInformation("Updated item {ItemId} in Cosmos DB", item.Id);
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
                new PartitionKey(PartitionKeyValue));

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
}
