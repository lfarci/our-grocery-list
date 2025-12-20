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
 * Fetch all grocery items from the API
 */
export async function getItems(): Promise<GroceryItem[]> {
  return apiFetch<GroceryItem[]>('/items');
}

/**
 * Create a new grocery item
 */
export async function createItem(item: CreateItemRequest): Promise<GroceryItem> {
  return apiFetch<GroceryItem>('/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
}

/**
 * Update an existing grocery item
 */
export async function updateItem(id: string, update: UpdateItemRequest): Promise<GroceryItem> {
  return apiFetch<GroceryItem>(`/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
}

/**
 * Delete a grocery item
 */
export async function deleteItem(id: string): Promise<void> {
  return apiFetch<void>(`/items/${id}`, {
    method: 'DELETE',
  });
}
