using System.Net;
using api.Models;
using api.Repositories;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace api.Functions;

/// <summary>
/// Azure Functions for managing grocery list items
/// Uses repository pattern for data access abstraction
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

        var createdItem = await _repository.CreateAsync(item);

        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(createdItem);
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

        var existingItem = await _repository.GetByIdAsync(id);
        if (existingItem is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var request = await req.ReadFromJsonAsync<UpdateItemRequest>();
        
        if (request?.IsDone is not null)
        {
            existingItem.IsDone = request.IsDone.Value;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }

        var updatedItem = await _repository.UpdateAsync(existingItem);
        
        if (updatedItem is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(updatedItem);
        return response;
    }

    /// <summary>
    /// DELETE /api/items/{id} - Delete a grocery item
    /// </summary>
    [Function("DeleteItem")]
    public async Task<HttpResponseData> DeleteItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("Deleting grocery item {ItemId}", id);

        var deleted = await _repository.DeleteAsync(id);

        if (!deleted)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}
