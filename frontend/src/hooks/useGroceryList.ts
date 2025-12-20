import { useState, useEffect, useCallback } from 'react';
import { GroceryItem, CreateItemRequest } from '../types';
import * as api from '../api';

/**
 * Custom hook for managing grocery list state and operations
 */
export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items on mount
  useEffect(() => {
    loadItems();
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
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error creating item:', err);
      throw err;
    }
  }, []);

  const toggleDone = useCallback(async (id: string, isDone: boolean) => {
    try {
      const updated = await api.updateItem(id, { isDone });
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }, []);

  // Sort items: undone first, then done, oldest first within each group
  const sortedItems = [...items].sort((a, b) => {
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    items: sortedItems,
    loading,
    error,
    loadItems,
    addItem,
    toggleDone,
    removeItem,
  };
}
