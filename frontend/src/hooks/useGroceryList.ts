import { useState, useEffect } from 'react';
import type { GroceryItem } from '../types';
import * as api from '../api';

/**
 * Hook for managing grocery list items.
 * Provides methods to fetch, create, update, and delete items.
 */
export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string, notes?: string) => {
    try {
      const newItem = await api.createItem({ name, notes });
      setItems((prev) => [...prev, newItem]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  };

  const toggleDone = async (id: string, isDone: boolean) => {
    try {
      const updatedItem = await api.updateItem(id, { isDone });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    loadItems,
    addItem,
    toggleDone,
    removeItem,
  };
}
