using System.Collections.Concurrent;
using api.Models;

namespace api.Repositories;

/// <summary>
/// In-memory implementation of the item repository
/// Uses ConcurrentDictionary for thread-safe operations
/// Suitable for local development and testing
/// </summary>
public class InMemoryItemRepository : IItemRepository
{
    private static readonly ConcurrentDictionary<string, GroceryItem> _items = new();

    // Static constructor to pre-seed with sample data
    static InMemoryItemRepository()
    {
        var now = DateTime.UtcNow;
        
        var sampleItems = new[]
        {
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Milk",
                Notes = "2 gallons, whole milk",
                IsDone = false,
                CreatedAt = now.AddMinutes(-10),
                UpdatedAt = now.AddMinutes(-10)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Bread",
                Notes = "Whole wheat",
                IsDone = false,
                CreatedAt = now.AddMinutes(-8),
                UpdatedAt = now.AddMinutes(-8)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Eggs",
                Notes = "1 dozen",
                IsDone = true,
                CreatedAt = now.AddMinutes(-5),
                UpdatedAt = now.AddMinutes(-2)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Apples",
                IsDone = false,
                CreatedAt = now.AddMinutes(-3),
                UpdatedAt = now.AddMinutes(-3)
            },
            new GroceryItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Cheese",
                Notes = "Cheddar",
                IsDone = true,
                CreatedAt = now.AddMinutes(-1),
                UpdatedAt = now
            }
        };

        foreach (var item in sampleItems)
        {
            _items.TryAdd(item.Id, item);
        }
    }

    public Task<IEnumerable<GroceryItem>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<GroceryItem>>(_items.Values.ToList());
    }

    public Task<GroceryItem?> GetByIdAsync(string id)
    {
        _items.TryGetValue(id, out var item);
        return Task.FromResult(item);
    }

    public Task<GroceryItem> CreateAsync(GroceryItem item)
    {
        _items.TryAdd(item.Id, item);
        return Task.FromResult(item);
    }

    public Task<GroceryItem?> UpdateAsync(GroceryItem item)
    {
        if (_items.TryGetValue(item.Id, out var existingItem))
        {
            existingItem.Name = item.Name;
            existingItem.Notes = item.Notes;
            existingItem.IsDone = item.IsDone;
            existingItem.UpdatedAt = item.UpdatedAt;
            return Task.FromResult<GroceryItem?>(existingItem);
        }
        return Task.FromResult<GroceryItem?>(null);
    }

    public Task<bool> DeleteAsync(string id)
    {
        return Task.FromResult(_items.TryRemove(id, out _));
    }
}
