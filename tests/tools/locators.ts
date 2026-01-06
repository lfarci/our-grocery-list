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
  return page.getByRole('combobox', { name: 'Add item to grocery list' });
}

/**
 * Get the add item button - No longer exists in the new UI
 * @deprecated The add button has been removed. Items are added via Enter key or dropdown selection.
 */
export function getAddItemButton(page: Page) {
  // Return a locator that will never match for backward compatibility
  return page.locator('[data-testid="deprecated-add-button"]');
}

/**
 * Get the main heading of the page
 * @deprecated The main heading "Our Grocery List" has been removed from the page
 */
export function getMainHeading(page: Page) {
  // Return a locator that will never match since heading was removed
  return page.locator('[data-testid="deprecated-main-heading"]');
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
