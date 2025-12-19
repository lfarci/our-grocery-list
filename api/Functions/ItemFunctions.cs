using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using api.Models;

namespace api.Functions;

/// <summary>
/// HTTP trigger functions for managing grocery list items.
/// </summary>
public class ItemFunctions
{
    private readonly ILogger<ItemFunctions> _logger;

    public ItemFunctions(ILogger<ItemFunctions> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// GET /api/items - Get all grocery items.
    /// </summary>
    [Function("GetItems")]
    public async Task<HttpResponseData> GetItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items")] HttpRequestData req)
    {
        _logger.LogInformation("GetItems called");

        // Stub: Return empty list
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new List<GroceryItem>());
        return response;
    }

    /// <summary>
    /// POST /api/items - Create a new grocery item.
    /// </summary>
    [Function("CreateItem")]
    public async Task<HttpResponseData> CreateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "items")] HttpRequestData req)
    {
        _logger.LogInformation("CreateItem called");

        var request = await req.ReadFromJsonAsync<CreateItemRequest>();
        if (request == null || string.IsNullOrWhiteSpace(request.Name))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync("Item name is required");
            return errorResponse;
        }

        // Stub: Create and return a new item
        var newItem = new GroceryItem
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Notes = request.Notes,
            IsDone = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(newItem);
        return response;
    }

    /// <summary>
    /// PATCH /api/items/{id} - Update a grocery item.
    /// </summary>
    [Function("UpdateItem")]
    public async Task<HttpResponseData> UpdateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation($"UpdateItem called for id: {id}");

        var request = await req.ReadFromJsonAsync<UpdateItemRequest>();
        if (request == null)
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync("Invalid request body");
            return errorResponse;
        }

        // Stub: Return updated item
        var updatedItem = new GroceryItem
        {
            Id = id,
            Name = "Stub Item",
            IsDone = request.IsDone ?? false,
            CreatedAt = DateTime.UtcNow.AddHours(-1),
            UpdatedAt = DateTime.UtcNow
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(updatedItem);
        return response;
    }

    /// <summary>
    /// DELETE /api/items/{id} - Delete a grocery item.
    /// </summary>
    [Function("DeleteItem")]
    public HttpResponseData DeleteItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "items/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation($"DeleteItem called for id: {id}");

        // Stub: Return no content
        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}
