import { GroceryItem, CreateItemRequest, UpdateItemRequest } from '../types';

/**
 * Get the API base URL from environment variable
 */
function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

/**
 * Generic fetch helper that handles common error checking and JSON parsing
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  // Only parse JSON if there's content
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  
  return response.json();
}

/**
 * Normalize item to ensure it has a category field
 * For backward compatibility with items that don't have a category
 */
function normalizeItem(item: any): GroceryItem {
  return {
    ...item,
    category: item.category || 'Other',
  };
}

/**
 * Fetch all grocery items from the API
 */
export async function getItems(): Promise<GroceryItem[]> {
  const items = await apiFetch<any[]>('/items');
  return items.map(normalizeItem);
}

/**
 * Search for grocery items by name pattern
 */
export async function searchItems(query: string): Promise<GroceryItem[]> {
  const encodedQuery = encodeURIComponent(query);
  const items = await apiFetch<any[]>(`/items/search?q=${encodedQuery}`);
  return items.map(normalizeItem);
}

/**
 * Create a new grocery item
 */
export async function createItem(item: CreateItemRequest): Promise<GroceryItem> {
  const created = await apiFetch<any>('/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  return normalizeItem(created);
}

/**
 * Update an existing grocery item
 */
export async function updateItem(id: string, update: UpdateItemRequest): Promise<GroceryItem> {
  const updated = await apiFetch<any>(`/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  return normalizeItem(updated);
}

/**
 * Delete a grocery item
 */
export async function deleteItem(id: string): Promise<void> {
  return apiFetch<void>(`/items/${id}`, {
    method: 'DELETE',
  });
}
