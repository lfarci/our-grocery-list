/**
 * Core data model for a grocery list item
 */
export interface GroceryItem {
  id: string;
  name: string;
  notes?: string;
  state: ItemState;
  createdAt: string;
  updatedAt: string;
}

export type ItemState = 'active' | 'checked' | 'archived';

/**
 * Request payload for creating a new grocery item
 */
export interface CreateItemRequest {
  name: string;
  notes?: string;
}

/**
 * Request payload for updating a grocery item
 */
export interface UpdateItemRequest {
  state?: ItemState;
}
