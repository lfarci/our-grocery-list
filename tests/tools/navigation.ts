/**
 * Navigation helpers for page transitions and verification
 */
import { Page, expect } from '@playwright/test';
import { TIMEOUTS, ADDED_TIME_PATTERN } from './config';
import { getSwipeableElement, getBackButton, getMainHeading, getItemCheckbox, getItemContainer, getItemDetailsTitle } from './locators';

/**
 * Navigate to item details page by clicking on the item.
 * Returns the item ID from the URL.
 */
export async function navigateToItemDetails(page: Page, itemName: string): Promise<string> {
  const itemContainer = getItemContainer(page, itemName).first();
  await expect(itemContainer).toBeVisible({ timeout: TIMEOUTS.ITEM_APPEAR });
  const swipeableDiv = getSwipeableElement(itemContainer);
  
  // Click on the item content area (not on the checkbox)
  await swipeableDiv.click();
  
  // Wait for navigation to details page
  await page.waitForURL('**/items/*', { timeout: TIMEOUTS.NAVIGATION });
  
  // Extract and return item ID from URL
  const currentUrl = page.url();
  const itemId = currentUrl.split('/items/')[1];
  return itemId ?? '';
}

/**
 * Navigate back to main list using the back button.
 */
export async function navigateBackToList(page: Page): Promise<void> {
  const backButton = getBackButton(page);
  await expect(backButton).toBeVisible();
  await backButton.click();
  await expect(page).toHaveURL('/');
}

/**
 * Verify that the page is showing the main grocery list.
 */
export async function verifyOnMainList(page: Page, itemName?: string): Promise<void> {
  await expect(page).toHaveURL('/');
  await expect(getMainHeading(page)).toBeVisible();
  if (itemName) {
    await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
  }
}

/**
 * Verify that the details page shows correct content for an item.
 */
export async function verifyDetailsPageContent(page: Page, itemName: string): Promise<void> {
  const title = getItemDetailsTitle(page, itemName);
  await expect(title).toHaveText(itemName);
  await expect(page.getByText(ADDED_TIME_PATTERN)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
}
