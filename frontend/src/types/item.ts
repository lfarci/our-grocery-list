/**
 * Represents a grocery list item.
 */
export interface GroceryItem {
  /** Unique identifier for the item */
  id: string;
  /** Item name (required) */
  name: string;
  /** Optional quantity or notes */
  notes?: string;
  /** Whether the item is marked as done */
  isDone: boolean;
  /** Timestamp when the item was created (ISO 8601) */
  createdAt: string;
  /** Timestamp when the item was last updated (ISO 8601) */
  updatedAt: string;
}

/**
 * Request payload for creating a new item.
 */
export interface CreateItemRequest {
  name: string;
  notes?: string;
}

/**
 * Request payload for updating an item.
 */
export interface UpdateItemRequest {
  isDone?: boolean;
}
