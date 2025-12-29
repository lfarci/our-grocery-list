using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace api.Models;

public static class ItemState
{
    public const string Active = "active";
    public const string Checked = "checked";
    public const string Archived = "archived";

    private static readonly HashSet<string> ValidStates = new(StringComparer.OrdinalIgnoreCase)
    {
        Active,
        Checked,
        Archived
    };

    public static string Normalize(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return Active;
        }

        var trimmed = state.Trim();
        if (!ValidStates.Contains(trimmed))
        {
            return Active;
        }

        return trimmed.ToLowerInvariant();
    }

    public static bool IsValid(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return false;
        }

        return ValidStates.Contains(state.Trim());
    }
}

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
    /// Legacy completion flag from older records (use State instead)
    /// </summary>
    [JsonProperty("isDone", NullValueHandling = NullValueHandling.Ignore)]
    [JsonPropertyName("isDone")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? LegacyIsDone { get; set; }

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
        if (string.IsNullOrWhiteSpace(State))
        {
            State = LegacyIsDone == true ? ItemState.Checked : ItemState.Active;
        }
        else
        {
            State = ItemState.Normalize(State);
        }

        LegacyIsDone = null;
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
}
