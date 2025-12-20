/**
 * Core data model for a grocery list item
 */
export interface GroceryItem {
  id: string;
  name: string;
  notes?: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  isDone?: boolean;
}
