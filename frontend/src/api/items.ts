import type { GroceryItem, CreateItemRequest, UpdateItemRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get all grocery items from the API.
 */
export async function getItems(): Promise<GroceryItem[]> {
  const response = await fetch(`${API_BASE_URL}/items`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

/**
 * Create a new grocery item.
 */
export async function createItem(data: CreateItemRequest): Promise<GroceryItem> {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create item');
  }
  return response.json();
}

/**
 * Update an existing grocery item.
 */
export async function updateItem(id: string, data: UpdateItemRequest): Promise<GroceryItem> {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update item');
  }
  return response.json();
}

/**
 * Delete a grocery item.
 */
export async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete item');
  }
}
