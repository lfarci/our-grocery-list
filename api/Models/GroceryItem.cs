using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace api.Models;

/// <summary>
/// Represents a grocery list item
/// Configured for both Cosmos DB storage and API serialization
/// </summary>
public class GroceryItem
{
    /// <summary>
    /// Unique identifier for the item
    /// </summary>
    [JsonProperty("id")]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Partition key for Cosmos DB (always "global" for single shared list)
    /// </summary>
    [JsonProperty("partitionKey")]
    [JsonPropertyName("partitionKey")]
    public string PartitionKey { get; set; } = "global";

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
    /// Whether the item has been marked as done
    /// </summary>
    [JsonProperty("isDone")]
    [JsonPropertyName("isDone")]
    public bool IsDone { get; set; }

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
    public bool? IsDone { get; set; }
}
