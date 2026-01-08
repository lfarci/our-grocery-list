/**
 * Element locator helpers for common UI elements
 */
import { Page } from '@playwright/test';

/**
 * Get the checkbox for a specific item by name
 */
export function getItemCheckbox(page: Page, itemName: string) {
  return page.getByRole('checkbox', { name: itemName });
}

/**
 * Get the container list item for a specific item by name
 */
export function getItemContainer(page: Page, itemName: string) {
  return page.getByRole('listitem').filter({ hasText: itemName });
}

/**
 * Get the swipeable element within an item container
 */
export function getSwipeableElement(itemContainer: ReturnType<typeof getItemContainer>) {
  return itemContainer.locator('[data-swipeable="true"]');
}

/**
 * Get the add item input field
 */
export function getAddItemInput(page: Page) {
  return page.getByRole('textbox', { name: 'Item Name' });
}

/**
 * Get the add item button
 */
export function getAddItemButton(page: Page) {
  return page.getByRole('button', { name: 'Add Item' });
}

/**
 * Get the back button on details page
 */
export function getBackButton(page: Page) {
  return page.getByRole('button', { name: /back to list/i });
}

/**
 * Get the item title on the details page
 */
export function getItemDetailsTitle(page: Page, itemName: string) {
  return page.locator('h1, [role="button"]', { hasText: itemName });
}
