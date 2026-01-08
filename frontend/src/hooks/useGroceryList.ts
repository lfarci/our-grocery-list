import { useState, useEffect, useCallback } from 'react';
import { GroceryItem, CreateItemRequest, UpdateItemRequest, ItemState, CATEGORIES } from '../types';
import * as api from '../api';
import { useSignalR } from './useSignalR';

/**
 * Custom hook for managing grocery list state and operations
 * Integrates with SignalR for real-time updates across clients
 */
export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeUpdatedItem = useCallback((item: GroceryItem) => {
    const createdAt = new Date(item.createdAt);
    const updatedAt = new Date(item.updatedAt);

    if (isNaN(createdAt.getTime())) {
      return item;
    }

    if (!isNaN(updatedAt.getTime()) && updatedAt.getTime() > createdAt.getTime()) {
      return item;
    }

    const bumped = new Date(createdAt.getTime() + 1000);
    return { ...item, updatedAt: bumped.toISOString() };
  }, []);

  // Load items on mount
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (item: CreateItemRequest) => {
    try {
      const newItem = await api.createItem(item);
      // Optimistically add item immediately for better UX
      // SignalR broadcast will be deduplicated by ID check in onItemCreated
      setItems(prev => {
        // Prevent duplicates if somehow already exists
        if (prev.some(i => i.id === newItem.id)) {
          return prev;
        }
        return [...prev, newItem];
      });
      return newItem;
    } catch (err) {
      console.error('Error creating item:', err);
      throw err;
    }
  }, []);

  const toggleChecked = useCallback(async (id: string, state: ItemState) => {
    try {
      const updated = await api.updateItem(id, { state });
      // Optimistically update the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    try {
      await api.deleteItem(id);
      // Optimistically remove the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }, []);

  const archiveItem = useCallback(async (id: string) => {
    try {
      const updated = await api.updateItem(id, { state: 'archived' });
      // Optimistically update the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Error archiving item:', err);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, update: UpdateItemRequest) => {
    try {
      const updated = await api.updateItem(id, update);
      const normalized = normalizeUpdatedItem(updated);
      // Optimistically update the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.map(item => item.id === id ? normalized : item));
      return normalized;
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }, [normalizeUpdatedItem]);

  // Set up SignalR handlers for real-time updates from other clients
  useSignalR({
    onItemCreated: useCallback((item: GroceryItem) => {
      // Normalize category for backward compatibility
      const normalizedItem = { ...item, category: item.category || 'Other' };
      // Add item from SignalR broadcast (includes items created by this client)
      setItems(prev => {
        // Check if item already exists to prevent duplicates
        if (prev.some(i => i.id === normalizedItem.id)) {
          return prev;
        }
        return [...prev, normalizedItem];
      });
    }, []),

    onItemUpdated: useCallback((item: GroceryItem) => {
      // Normalize category for backward compatibility
      const normalizedItem = { ...item, category: item.category || 'Other' };
      // Update item with latest data from server
      const normalized = normalizeUpdatedItem(normalizedItem);
      setItems(prev => prev.map(i => i.id === normalizedItem.id ? normalized : i));
    }, [normalizeUpdatedItem]),

    onItemDeleted: useCallback((id: string) => {
      // Remove item from list
      setItems(prev => prev.filter(i => i.id !== id));
    }, []),
  });

  const visibleItems = items.filter(item => item.state !== 'archived');
  const stateOrder: Record<ItemState, number> = {
    active: 0,
    checked: 1,
    archived: 2
  };

  // Create category order mapping dynamically from CATEGORIES constant
  const categoryOrder: Record<string, number> = Object.fromEntries(
    CATEGORIES.map((cat, idx) => [cat, idx])
  );

  // Group items by category, maintaining order within each category
  // Sort: active first, then checked; oldest first within each state group
  const sortedItems = [...visibleItems].sort((a, b) => {
    // First sort by category according to fixed order
    const catA = categoryOrder[a.category] ?? CATEGORIES.length; // Default to end if unknown
    const catB = categoryOrder[b.category] ?? CATEGORIES.length;
    
    if (catA !== catB) {
      return catA - catB;
    }
    
    // Within same category, sort by state (active before checked)
    if (a.state !== b.state) {
      return stateOrder[a.state] - stateOrder[b.state];
    }
    
    // Within same category and state, sort by creation date (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    items: sortedItems,
    loading,
    error,
    loadItems,
    addItem,
    toggleChecked,
    removeItem,
    archiveItem,
    updateItem,
  };
}
