using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace api.Models;

/// <summary>
/// Represents a grocery list item
/// Configured for both Cosmos DB storage and API serialization
/// </summary>
public class GroceryItem
{
    public const int MaxNameLength = 50;

    /// <summary>
    /// Unique identifier for the item
    /// </summary>
    [JsonProperty("id")]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// List identifier - identifies which list this item belongs to
    /// Used as the partition key for Cosmos DB for efficient querying
    /// </summary>
    [JsonProperty("listId")]
    [JsonPropertyName("listId")]
    public string ListId { get; set; } = "default";

    /// <summary>
    /// Partition key for Cosmos DB (uses listId value)
    /// </summary>
    [JsonProperty("partitionKey")]
    [JsonPropertyName("partitionKey")]
    public string PartitionKey { get; set; } = "default";

    /// <summary>
    /// Name of the grocery item (required)
    /// </summary>
    [JsonProperty("name")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional quantity or notes about the item
    /// </summary>
    [JsonProperty("notes")]
    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// State of the item (active, checked, archived)
    /// </summary>
    [JsonProperty("state")]
    [JsonPropertyName("state")]
    public string State { get; set; } = ItemState.Active;

    /// <summary>
    /// Timestamp when the item was created (UTC)
    /// </summary>
    [JsonProperty("createdAt")]
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the item was last updated (UTC)
    /// </summary>
    [JsonProperty("updatedAt")]
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    public void EnsureState()
    {
        State = string.IsNullOrWhiteSpace(State) ? ItemState.Active : ItemState.Normalize(State);
    }
}

/// <summary>
/// Request payload for creating a new grocery item
/// </summary>
public class CreateItemRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

/// <summary>
/// Request payload for updating a grocery item
/// </summary>
public class UpdateItemRequest
{
    public string? State { get; set; }
    public string? Name { get; set; }
}
