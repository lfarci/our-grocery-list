using System.Net;
using System.Text.Json;
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

        if (request.Quantity.HasValue && request.Quantity.Value < 0)
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync("Quantity cannot be negative");
            return new CreateItemOutput { HttpResponse = errorResponse };
        }

        string? normalizedQuantityUnit = null;
        if (request.QuantityUnit is not null)
        {
            if (!QuantityUnits.TryNormalize(request.QuantityUnit, out normalizedQuantityUnit))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteStringAsync("Invalid quantity unit");
                return new CreateItemOutput { HttpResponse = errorResponse };
            }
        }

        var now = DateTime.UtcNow;
        var item = new GroceryItem
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Notes = request.Notes,
            Quantity = request.Quantity,
            QuantityUnit = normalizedQuantityUnit,
            State = ItemState.Active,
            Category = Category.Other,
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

        var (rawRequest, readError) = await ReadUpdateRequestAsync(req, id);
        if (readError is not null)
        {
            return await CreateBadRequestOutputAsync(req, readError);
        }
        
        var hasChanges = false;
        if (!TryApplyNameUpdate(rawRequest, existingItem, ref hasChanges, out var nameError))
        {
            return await CreateBadRequestOutputAsync(req, nameError ?? "Invalid item name");
        }

        if (!TryApplyNotesUpdate(rawRequest, existingItem, ref hasChanges, out var notesError))
        {
            return await CreateBadRequestOutputAsync(req, notesError ?? "Invalid notes");
        }

        if (!TryApplyQuantityUpdate(rawRequest, existingItem, ref hasChanges, out var quantityError))
        {
            return await CreateBadRequestOutputAsync(req, quantityError ?? "Invalid quantity");
        }

        if (!TryApplyQuantityUnitUpdate(rawRequest, existingItem, ref hasChanges, out var quantityUnitError))
        {
            return await CreateBadRequestOutputAsync(req, quantityUnitError ?? "Invalid quantity unit");
        }

        if (!TryApplyStateUpdate(rawRequest, existingItem, ref hasChanges, out var stateError))
        {
            return await CreateBadRequestOutputAsync(req, stateError ?? "Invalid item state");
        }

        if (!TryApplyCategoryUpdate(rawRequest, existingItem, ref hasChanges, out var categoryError))
        {
            return await CreateBadRequestOutputAsync(req, categoryError ?? "Invalid category");
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
    /// Reads and validates the update request body.
    /// </summary>
    private async Task<(JsonElement RawRequest, string? ErrorMessage)> ReadUpdateRequestAsync(HttpRequestData req, string id)
    {
        JsonElement rawRequest;

        try
        {
            rawRequest = await req.ReadFromJsonAsync<JsonElement>();
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid JSON in update request for item {ItemId}", id);
            return (default, "Invalid JSON format in request body");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading update request for item {ItemId}: {ErrorMessage}", id, ex.Message);
            throw; // Let Azure Functions handle transient errors with retries
        }

        if (rawRequest.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
        {
            return (default, "Request body is required");
        }

        if (rawRequest.ValueKind != JsonValueKind.Object)
        {
            return (default, "Request body must be a JSON object");
        }

        return (rawRequest, null);
    }

    /// <summary>
    /// Builds a bad-request response with a message payload.
    /// </summary>
    private static async Task<UpdateItemOutput> CreateBadRequestOutputAsync(HttpRequestData req, string message)
    {
        var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
        await errorResponse.WriteStringAsync(message);
        return new UpdateItemOutput { HttpResponse = errorResponse };
    }

    /// <summary>
    /// Validates and applies the name update, if provided.
    /// </summary>
    private static bool TryApplyNameUpdate(JsonElement rawRequest, GroceryItem existingItem, ref bool hasChanges, out string? errorMessage)
    {
        errorMessage = null;

        if (!rawRequest.TryGetProperty("name", out var nameElement))
        {
            return true;
        }

        if (nameElement.ValueKind != JsonValueKind.String)
        {
            errorMessage = "Item name must be a string";
            return false;
        }

        var name = nameElement.GetString() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            errorMessage = "Item name is required";
            return false;
        }

        if (name.Length > GroceryItem.MaxNameLength)
        {
            errorMessage = $"Item name must be {GroceryItem.MaxNameLength} characters or less";
            return false;
        }

        existingItem.Name = name;
        hasChanges = true;
        return true;
    }

    /// <summary>
    /// Validates and applies the notes update, if provided.
    /// </summary>
    private static bool TryApplyNotesUpdate(JsonElement rawRequest, GroceryItem existingItem, ref bool hasChanges, out string? errorMessage)
    {
        errorMessage = null;

        if (!rawRequest.TryGetProperty("notes", out var notesElement))
        {
            return true;
        }

        switch (notesElement.ValueKind)
        {
            case JsonValueKind.Null:
                existingItem.Notes = null;
                hasChanges = true;
                return true;
            case JsonValueKind.String:
                var notes = notesElement.GetString();
                existingItem.Notes = string.IsNullOrWhiteSpace(notes) ? null : notes;
                hasChanges = true;
                return true;
            default:
                errorMessage = "Notes must be a string";
                return false;
        }
    }

    /// <summary>
    /// Validates and applies the quantity update, if provided.
    /// </summary>
    private static bool TryApplyQuantityUpdate(JsonElement rawRequest, GroceryItem existingItem, ref bool hasChanges, out string? errorMessage)
    {
        errorMessage = null;

        if (!rawRequest.TryGetProperty("quantity", out var quantityElement))
        {
            return true;
        }

        switch (quantityElement.ValueKind)
        {
            case JsonValueKind.Null:
                existingItem.Quantity = null;
                hasChanges = true;
                return true;
            case JsonValueKind.Number:
                var quantity = quantityElement.GetDouble();
                if (quantity < 0)
                {
                    errorMessage = "Quantity cannot be negative";
                    return false;
                }
                existingItem.Quantity = quantity;
                hasChanges = true;
                return true;
            default:
                errorMessage = "Quantity must be a number";
                return false;
        }
    }

    /// <summary>
    /// Validates and applies the quantity unit update, if provided.
    /// </summary>
    private static bool TryApplyQuantityUnitUpdate(JsonElement rawRequest, GroceryItem existingItem, ref bool hasChanges, out string? errorMessage)
    {
        errorMessage = null;

        if (!rawRequest.TryGetProperty("quantityUnit", out var quantityUnitElement))
        {
            return true;
        }

        switch (quantityUnitElement.ValueKind)
        {
            case JsonValueKind.Null:
                existingItem.QuantityUnit = null;
                hasChanges = true;
                return true;
            case JsonValueKind.String:
                var providedUnit = quantityUnitElement.GetString();
                if (!QuantityUnits.TryNormalize(providedUnit, out var normalizedUnit))
                {
                    errorMessage = "Invalid quantity unit";
                    return false;
                }
                existingItem.QuantityUnit = normalizedUnit;
                hasChanges = true;
                return true;
            default:
                errorMessage = "Quantity unit must be a string";
                return false;
        }
    }

    /// <summary>
    /// Validates and applies the state update, if provided.
    /// </summary>
    private static bool TryApplyStateUpdate(JsonElement rawRequest, GroceryItem existingItem, ref bool hasChanges, out string? errorMessage)
    {
        errorMessage = null;

        if (!rawRequest.TryGetProperty("state", out var stateElement))
        {
            return true;
        }

        if (stateElement.ValueKind != JsonValueKind.String)
        {
            errorMessage = "State must be a string";
            return false;
        }

        var state = stateElement.GetString();
        if (!ItemState.IsValid(state))
        {
            errorMessage = "Invalid item state";
            return false;
        }

        existingItem.State = ItemState.Normalize(state);
        hasChanges = true;
        return true;
    }

    /// <summary>
    /// Validates and applies the category update, if provided.
    /// </summary>
    private bool TryApplyCategoryUpdate(JsonElement rawRequest, GroceryItem existingItem, ref bool hasChanges, out string? errorMessage)
    {
        errorMessage = null;

        if (!rawRequest.TryGetProperty("category", out var categoryElement))
        {
            return true;
        }

        if (categoryElement.ValueKind != JsonValueKind.String)
        {
            errorMessage = "Category must be a string";
            return false;
        }

        var category = categoryElement.GetString();
        _logger.LogInformation("Updating category for item {ItemId} from '{OldCategory}' to '{NewCategory}'",
            existingItem.Id, existingItem.Category, category);

        if (!Category.IsValid(category))
        {
            _logger.LogWarning("Invalid category '{Category}' provided for item {ItemId}", category, existingItem.Id);
            errorMessage = "Invalid category";
            return false;
        }

        var normalizedCategory = Category.Normalize(category);
        _logger.LogInformation("Normalized category '{RequestCategory}' to '{NormalizedCategory}' for item {ItemId}",
            category, normalizedCategory, existingItem.Id);

        existingItem.Category = normalizedCategory;
        hasChanges = true;
        return true;
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
