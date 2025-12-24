using System.Collections.Concurrent;
using api.Models;

namespace api.Repositories;

/// <summary>
/// In-memory implementation of the item repository
/// Uses ConcurrentDictionary for thread-safe operations
/// Suitable for testing scenarios only - use Cosmos DB Emulator for local development
/// </summary>
public class InMemoryItemRepository : IItemRepository
{
    private static readonly ConcurrentDictionary<string, GroceryItem> _items = new();

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
