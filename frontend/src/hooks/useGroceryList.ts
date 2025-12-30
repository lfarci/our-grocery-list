import { useState, useEffect, useCallback } from 'react';
import { GroceryItem, CreateItemRequest, ItemState } from '../types';
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
      // Don't add optimistically - let SignalR broadcast handle it for consistency
      // This prevents duplicate items on the creating client
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

  // Set up SignalR handlers for real-time updates from other clients
  useSignalR({
    onItemCreated: useCallback((item: GroceryItem) => {
      // Add item from SignalR broadcast (includes items created by this client)
      setItems(prev => {
        // Check if item already exists to prevent duplicates
        if (prev.some(i => i.id === item.id)) {
          return prev;
        }
        return [...prev, item];
      });
    }, []),

    onItemUpdated: useCallback((item: GroceryItem) => {
      // Update item with latest data from server
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    }, []),

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

  // Sort items: active first, then checked, oldest first within each group
  const sortedItems = [...visibleItems].sort((a, b) => {
    if (a.state !== b.state) {
      return stateOrder[a.state] - stateOrder[b.state];
    }
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
  };
}
