namespace api.Models;

/// <summary>
/// Request payload for updating a grocery item.
/// </summary>
public class UpdateItemRequest
{
    public string? Name { get; set; }
    public string? Notes { get; set; }
    public double? Quantity { get; set; }
    public string? QuantityUnit { get; set; }
    public string? State { get; set; }
    public string? Category { get; set; }
}
