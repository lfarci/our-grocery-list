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
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export type ItemState = 'active' | 'checked' | 'archived';
export type QuantityUnit = 'g' | 'kg' | 'L' | 'ml' | 'cl' | 'portion' | 'piece';

/**
 * Fixed set of item categories
 * Categories are displayed in this order
 */
export type Category = 'Produce' | 'Meat & Fish' | 'Dairy' | 'Bakery & Cereals' | 'Household' | 'Other';

export const CATEGORIES: readonly Category[] = [
  'Produce',
  'Meat & Fish',
  'Dairy',
  'Bakery & Cereals',
  'Household',
  'Other'
] as const;

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
  category?: Category;
}
