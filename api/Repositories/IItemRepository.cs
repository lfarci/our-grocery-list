using api.Models;

namespace api.Repositories;

/// <summary>
/// Repository interface for managing grocery items
/// Provides abstraction between data access and business logic
/// </summary>
public interface IItemRepository
{
    /// <summary>
    /// Get all grocery items
    /// </summary>
    Task<IEnumerable<GroceryItem>> GetAllAsync();

    /// <summary>
    /// Get a grocery item by ID
    /// </summary>
    Task<GroceryItem?> GetByIdAsync(string id);

    /// <summary>
    /// Create a new grocery item
    /// </summary>
    Task<GroceryItem> CreateAsync(GroceryItem item);

    /// <summary>
    /// Update an existing grocery item
    /// </summary>
    Task<GroceryItem?> UpdateAsync(GroceryItem item);

    /// <summary>
    /// Delete a grocery item by ID
    /// </summary>
    Task<bool> DeleteAsync(string id);

    /// <summary>
    /// Search for grocery items by name pattern (case-insensitive)
    /// Includes both active and archived items
    /// </summary>
    Task<IEnumerable<GroceryItem>> SearchByNameAsync(string namePattern);
}
