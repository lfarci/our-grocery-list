using System.Net;
using api.Models;
using api.Repositories;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.SignalRService;
using Microsoft.Extensions.Logging;

namespace api.Functions;

/// <summary>
/// Azure Functions for managing grocery list items
/// Uses repository pattern for data access abstraction
/// Broadcasts changes via Azure SignalR Service for real-time updates
/// </summary>
public class ItemFunctions
{
    private readonly ILogger<ItemFunctions> _logger;
    private readonly IItemRepository _repository;

    public ItemFunctions(
        ILogger<ItemFunctions> logger,
        IItemRepository repository)
    {
        _logger = logger;
        _repository = repository;
    }

    /// <summary>
    /// GET /api/items - Get all grocery items
    /// </summary>
    [Function("GetItems")]
    public async Task<HttpResponseData> GetItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items")] HttpRequestData req)
    {
        _logger.LogInformation("Getting all grocery items");

        var items = await _repository.GetAllAsync();

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(items);
        return response;
    }

    /// <summary>
    /// GET /api/items/search?q={query} - Search grocery items by name
    /// Returns both active and archived items matching the search query
    /// </summary>
    [Function("SearchItems")]
    public async Task<HttpResponseData> SearchItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items/search")] HttpRequestData req)
    {
        _logger.LogInformation("Searching grocery items");

        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var searchQuery = query["q"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(searchQuery))
        {
            var emptyResponse = req.CreateResponse(HttpStatusCode.OK);
            await emptyResponse.WriteAsJsonAsync(Array.Empty<GroceryItem>());
            return emptyResponse;
        }

        var items = await _repository.SearchByNameAsync(searchQuery);

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(items);
        return response;
    }

    /// <summary>
    /// POST /api/items - Create a new grocery item
    /// Broadcasts the new item to all connected clients via SignalR
    /// </summary>
    [Function("CreateItem")]
    public async Task<CreateItemOutput> CreateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "items")] HttpRequestData req)
    {
        _logger.LogInformation("Creating new grocery item");

        var request = await req.ReadFromJsonAsync<CreateItemRequest>();
        
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync("Item name is required");
            return new CreateItemOutput { HttpResponse = errorResponse };
        }

        if (request.Name.Length > GroceryItem.MaxNameLength)
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync($"Item name must be {GroceryItem.MaxNameLength} characters or less");
            return new CreateItemOutput { HttpResponse = errorResponse };
        }

        var now = DateTime.UtcNow;
        var item = new GroceryItem
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Notes = request.Notes,
            State = ItemState.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        var createdItem = await _repository.CreateAsync(item);

        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(createdItem);
        
        _logger.LogInformation("Broadcasting item created: {ItemId}", createdItem.Id);
        
        return new CreateItemOutput
        {
            HttpResponse = response,
            SignalRMessages = new[]
            {
                new SignalRMessageAction(SignalRConstants.Methods.ItemCreated)
                {
                    Arguments = new[] { createdItem }
                }
            }
        };
    }

    /// <summary>
    /// PATCH /api/items/{id} - Update a grocery item state
    /// Broadcasts the updated item to all connected clients via SignalR
    /// </summary>
    [Function("UpdateItem")]
    public async Task<UpdateItemOutput> UpdateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("Updating grocery item {ItemId}", id);

        var existingItem = await _repository.GetByIdAsync(id);
        if (existingItem is null)
        {
            return new UpdateItemOutput { HttpResponse = req.CreateResponse(HttpStatusCode.NotFound) };
        }

        var request = await req.ReadFromJsonAsync<UpdateItemRequest>();
        
        var hasChanges = false;

        if (!string.IsNullOrEmpty(request?.Name))
        {
            if (request.Name.Length > GroceryItem.MaxNameLength)
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteStringAsync($"Item name must be {GroceryItem.MaxNameLength} characters or less");
                return new UpdateItemOutput { HttpResponse = errorResponse };
            }

            existingItem.Name = request.Name;
            hasChanges = true;
        }

        if (request?.Notes is not null)
        {
            existingItem.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes;
            hasChanges = true;
        }

        if (request?.State is not null)
        {
            if (!ItemState.IsValid(request.State))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteStringAsync("Invalid item state");
                return new UpdateItemOutput { HttpResponse = errorResponse };
            }

            existingItem.State = ItemState.Normalize(request.State);
            hasChanges = true;
        }

        if (hasChanges)
        {
            existingItem.UpdatedAt = DateTime.UtcNow;
        }

        var updatedItem = await _repository.UpdateAsync(existingItem);
        
        if (updatedItem is null)
        {
            return new UpdateItemOutput { HttpResponse = req.CreateResponse(HttpStatusCode.NotFound) };
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(updatedItem);
        
        _logger.LogInformation("Broadcasting item updated: {ItemId}", updatedItem.Id);
        
        return new UpdateItemOutput
        {
            HttpResponse = response,
            SignalRMessages = new[]
            {
                new SignalRMessageAction(SignalRConstants.Methods.ItemUpdated)
                {
                    Arguments = new[] { updatedItem }
                }
            }
        };
    }

    /// <summary>
    /// DELETE /api/items/{id} - Delete a grocery item
    /// Broadcasts the deleted item ID to all connected clients via SignalR
    /// </summary>
    [Function("DeleteItem")]
    public async Task<DeleteItemOutput> DeleteItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("Deleting grocery item {ItemId}", id);

        var deleted = await _repository.DeleteAsync(id);

        if (!deleted)
        {
            return new DeleteItemOutput { HttpResponse = req.CreateResponse(HttpStatusCode.NotFound) };
        }

        _logger.LogInformation("Broadcasting item deleted: {ItemId}", id);
        
        return new DeleteItemOutput
        {
            HttpResponse = req.CreateResponse(HttpStatusCode.NoContent),
            SignalRMessages = new[]
            {
                new SignalRMessageAction(SignalRConstants.Methods.ItemDeleted)
                {
                    Arguments = new[] { id }
                }
            }
        };
    }
}

/// <summary>
/// Output binding for CreateItem function with Azure SignalR Service support
/// </summary>
public class CreateItemOutput
{
    [HttpResult]
    public HttpResponseData? HttpResponse { get; set; }

    [SignalROutput(HubName = SignalRConstants.HubName)]
    public SignalRMessageAction[]? SignalRMessages { get; set; }
}

/// <summary>
/// Output binding for UpdateItem function with Azure SignalR Service support
/// </summary>
public class UpdateItemOutput
{
    [HttpResult]
    public HttpResponseData? HttpResponse { get; set; }

    [SignalROutput(HubName = SignalRConstants.HubName)]
    public SignalRMessageAction[]? SignalRMessages { get; set; }
}

/// <summary>
/// Output binding for DeleteItem function with Azure SignalR Service support
/// </summary>
public class DeleteItemOutput
{
    [HttpResult]
    public HttpResponseData? HttpResponse { get; set; }

    [SignalROutput(HubName = SignalRConstants.HubName)]
    public SignalRMessageAction[]? SignalRMessages { get; set; }
}
