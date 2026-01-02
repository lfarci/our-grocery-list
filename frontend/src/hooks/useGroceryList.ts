import { useState, useEffect, useCallback } from 'react';
import { GroceryItem, CreateItemRequest, ItemState } from '../types';
import * as api from '../api';
import { useSignalR } from './useSignalR';

// Track item-level errors for retry affordances
interface ItemError {
  itemId: string;
  type: 'toggle' | 'archive' | 'delete';
  previousItem?: GroceryItem; // For rollback
}

/**
 * Custom hook for managing grocery list state and operations
 * Integrates with SignalR for real-time updates across clients
 */
export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemErrors, setItemErrors] = useState<Map<string, ItemError>>(new Map());
  const [isOffline, setIsOffline] = useState(false);

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
    // TASK-003: Store previous state for rollback on failure
    const previousItem = items.find(item => item.id === id);
    if (!previousItem) return;

    try {
      // Clear any existing error for this item
      setItemErrors(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });

      const updated = await api.updateItem(id, { state });
      // Optimistically update the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Error updating item:', err);
      // Rollback to previous state
      setItems(prev => prev.map(item => item.id === id ? previousItem : item));
      // Track error for retry affordance
      setItemErrors(prev => {
        const next = new Map(prev);
        next.set(id, { itemId: id, type: 'toggle', previousItem });
        return next;
      });
      throw err;
    }
  }, [items]);

  const removeItem = useCallback(async (id: string) => {
    // TASK-005: Store item for rollback on delete failure
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    try {
      // Clear any existing error for this item
      setItemErrors(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });

      await api.deleteItem(id);
      // Optimistically remove the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      // Rollback: restore the item to the list
      setItems(prev => {
        // Only restore if not already present (in case SignalR hasn't removed it yet)
        if (prev.some(item => item.id === id)) {
          return prev;
        }
        return [...prev, itemToDelete];
      });
      // Track error for retry affordance
      setItemErrors(prev => {
        const next = new Map(prev);
        next.set(id, { itemId: id, type: 'delete', previousItem: itemToDelete });
        return next;
      });
      throw err;
    }
  }, [items]);

  const archiveItem = useCallback(async (id: string) => {
    // TASK-004: Store previous state for rollback on archive failure
    const previousItem = items.find(item => item.id === id);
    if (!previousItem) return;

    try {
      // Clear any existing error for this item
      setItemErrors(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });

      const updated = await api.updateItem(id, { state: 'archived' });
      // Optimistically update the item (will be confirmed by SignalR broadcast)
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Error archiving item:', err);
      // Rollback to previous state
      setItems(prev => prev.map(item => item.id === id ? previousItem : item));
      // Track error for retry affordance
      setItemErrors(prev => {
        const next = new Map(prev);
        next.set(id, { itemId: id, type: 'archive', previousItem });
        return next;
      });
      throw err;
    }
  }, [items]);

  // Set up SignalR handlers for real-time updates from other clients
  const { connectionState } = useSignalR({
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
      // Clear error if update was successful via SignalR
      setItemErrors(prev => {
        if (prev.has(item.id)) {
          const next = new Map(prev);
          next.delete(item.id);
          return next;
        }
        return prev;
      });
    }, []),

    onItemDeleted: useCallback((id: string) => {
      // Remove item from list
      setItems(prev => prev.filter(i => i.id !== id));
      // Clear error if delete was successful via SignalR
      setItemErrors(prev => {
        if (prev.has(id)) {
          const next = new Map(prev);
          next.delete(id);
          return next;
        }
        return prev;
      });
    }, []),
  });

  // TASK-006: Track offline state based on SignalR connection
  useEffect(() => {
    const offline = connectionState === 'disconnected' || connectionState === 'reconnecting';
    setIsOffline(offline);
  }, [connectionState]);

  // Retry functions for failed operations
  const retryToggleChecked = useCallback(async (id: string) => {
    const itemError = itemErrors.get(id);
    if (!itemError || itemError.type !== 'toggle' || !itemError.previousItem) return;

    // Determine target state (opposite of what failed)
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) return;

    const targetState: ItemState = currentItem.state === 'checked' ? 'active' : 'checked';
    await toggleChecked(id, targetState);
  }, [itemErrors, items, toggleChecked]);

  const retryArchive = useCallback(async (id: string) => {
    const itemError = itemErrors.get(id);
    if (!itemError || itemError.type !== 'archive') return;

    await archiveItem(id);
  }, [itemErrors, archiveItem]);

  const retryDelete = useCallback(async (id: string) => {
    const itemError = itemErrors.get(id);
    if (!itemError || itemError.type !== 'delete') return;

    await removeItem(id);
  }, [itemErrors, removeItem]);

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
    itemErrors,
    isOffline,
    loadItems,
    addItem,
    toggleChecked,
    removeItem,
    archiveItem,
    retryToggleChecked,
    retryArchive,
    retryDelete,
  };
}
