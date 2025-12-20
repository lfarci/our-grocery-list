using System.Collections.Concurrent;
using System.Net;
using api.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace api.Functions;

/// <summary>
/// Azure Functions for managing grocery list items
/// Uses in-memory ConcurrentDictionary for data storage
/// </summary>
public class ItemFunctions
{
    private readonly ILogger<ItemFunctions> _logger;
    
    // In-memory data store - shared across all requests
    private static readonly ConcurrentDictionary<string, GroceryItem> _items = new();

    // Static constructor to pre-seed with sample data
    static ItemFunctions()
    {
        var now = DateTime.UtcNow;
        
        var sampleItems = new[]
        {
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Milk",
                Notes = "2 gallons, whole milk",
                IsDone = false,
                CreatedAt = now.AddMinutes(-10),
                UpdatedAt = now.AddMinutes(-10)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Bread",
                Notes = "Whole wheat",
                IsDone = false,
                CreatedAt = now.AddMinutes(-8),
                UpdatedAt = now.AddMinutes(-8)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Eggs",
                Notes = "1 dozen",
                IsDone = true,
                CreatedAt = now.AddMinutes(-5),
                UpdatedAt = now.AddMinutes(-2)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Apples",
                IsDone = false,
                CreatedAt = now.AddMinutes(-3),
                UpdatedAt = now.AddMinutes(-3)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Cheese",
                Notes = "Cheddar",
                IsDone = true,
                CreatedAt = now.AddMinutes(-1),
                UpdatedAt = now
            }
        };

        foreach (var item in sampleItems)
        {
            _items.TryAdd(item.Id, item);
        }
    }

    public ItemFunctions(ILogger<ItemFunctions> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// GET /api/items - Get all grocery items
    /// </summary>
    [Function("GetItems")]
    public async Task<HttpResponseData> GetItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items")] HttpRequestData req)
    {
        _logger.LogInformation("Getting all grocery items");

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(_items.Values.ToList());
        return response;
    }

    /// <summary>
    /// POST /api/items - Create a new grocery item
    /// </summary>
    [Function("CreateItem")]
    public async Task<HttpResponseData> CreateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "items")] HttpRequestData req)
    {
        _logger.LogInformation("Creating new grocery item");

        var request = await req.ReadFromJsonAsync<CreateItemRequest>();
        
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync("Item name is required");
            return errorResponse;
        }

        var now = DateTime.UtcNow;
        var item = new GroceryItem
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Notes = request.Notes,
            IsDone = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        _items.TryAdd(item.Id, item);

        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(item);
        return response;
    }

    /// <summary>
    /// PATCH /api/items/{id} - Update a grocery item (toggle done status)
    /// </summary>
    [Function("UpdateItem")]
    public async Task<HttpResponseData> UpdateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("Updating grocery item {ItemId}", id);

        if (!_items.TryGetValue(id, out var item))
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var request = await req.ReadFromJsonAsync<UpdateItemRequest>();
        
        if (request?.IsDone is not null)
        {
            item.IsDone = request.IsDone.Value;
            item.UpdatedAt = DateTime.UtcNow;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(item);
        return response;
    }

    /// <summary>
    /// DELETE /api/items/{id} - Delete a grocery item
    /// </summary>
    [Function("DeleteItem")]
    public HttpResponseData DeleteItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("Deleting grocery item {ItemId}", id);

        if (!_items.TryRemove(id, out _))
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}
