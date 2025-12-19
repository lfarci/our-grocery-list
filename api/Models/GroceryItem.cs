namespace api.Models;

/// <summary>
/// Represents a grocery list item.
/// </summary>
public class GroceryItem
{
    /// <summary>
    /// Unique identifier for the item.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Item name (required).
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional quantity or notes.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Whether the item is marked as done.
    /// </summary>
    public bool IsDone { get; set; }

    /// <summary>
    /// Timestamp when the item was created (ISO 8601).
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the item was last updated (ISO 8601).
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Request payload for creating a new item.
/// </summary>
public class CreateItemRequest
{
    /// <summary>
    /// Item name (required).
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional quantity or notes.
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Request payload for updating an item.
/// </summary>
public class UpdateItemRequest
{
    /// <summary>
    /// Whether the item is marked as done.
    /// </summary>
    public bool? IsDone { get; set; }
}
