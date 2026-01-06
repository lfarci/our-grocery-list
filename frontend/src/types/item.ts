/**
 * Core data model for a grocery list item
 */
export interface GroceryItem {
  id: string;
  name: string;
  notes?: string;
  quantity?: number | null;
  quantityUnit?: QuantityUnit | null;
  state: ItemState;
  createdAt: string;
  updatedAt: string;
}

export type ItemState = 'active' | 'checked' | 'archived';
export type QuantityUnit = 'g' | 'kg' | 'L' | 'ml' | 'cl' | 'portion' | 'piece';

/**
 * Request payload for creating a new grocery item
 */
export interface CreateItemRequest {
  name: string;
  notes?: string;
  quantity?: number | null;
  quantityUnit?: string | null;
}

/**
 * Request payload for updating a grocery item
 */
export interface UpdateItemRequest {
  name?: string;
  notes?: string | null;
  quantity?: number | null;
  quantityUnit?: string | null;
  state?: ItemState;
}
