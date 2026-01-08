namespace api.Models;

/// <summary>
/// Request payload for creating a new grocery item.
/// </summary>
public class CreateItemRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public double? Quantity { get; set; }
    public string? QuantityUnit { get; set; }
}
