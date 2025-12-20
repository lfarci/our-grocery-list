namespace api.Models;

/// <summary>
/// Represents a grocery list item
/// </summary>
public class GroceryItem
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsDone { get; set; }
    public DateTime CreatedAt { get; set; }
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
