/**
 * Test cleanup utilities for removing test items
 */
import { Page, expect } from '@playwright/test';
import { TIMEOUTS } from './config';
import { getItemCheckbox } from './locators';
import { deleteItemBySwipe } from './actions';

/**
 * Clean up test items that match a specific prefix
 * Fetches items directly via API request instead of waiting for page responses
 */
export async function cleanupItemsByPrefix(page: Page, prefix: string): Promise<void> {
  try {
    // Direct API call to get items
    const response = await page.request.get('/api/items');
    if (!response.ok()) return;
    
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('application/json')) return;
    
    const items = await response.json();
    const testItems = items.filter((item: { name: string }) => item.name.startsWith(prefix));
    
    for (const item of testItems) {
      const checkbox = getItemCheckbox(page, item.name);
      if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
        await deleteItemBySwipe(page, item.name);
        await expect(checkbox).not.toBeVisible({ timeout: TIMEOUTS.ELEMENT });
      }
    }
  } catch {
    // Silently fail cleanup - non-critical for test execution
  }
}

/**
 * Clean up all test items (uses common test prefixes)
 */
export async function cleanupTestItems(page: Page): Promise<void> {
  await cleanupItemsByPrefix(page, 'test-');
}

/**
 * Delete all visible items from the list
 */
export async function deleteAllItems(page: Page): Promise<void> {
  const listItems = page.getByRole('listitem');
  let count = await listItems.count();
  
  while (count > 0) {
    const firstItem = listItems.first();
    const checkbox = firstItem.getByRole('checkbox');
    const itemName = await checkbox.getAttribute('aria-label') || '';
    
    if (itemName) {
      await deleteItemBySwipe(page, itemName);
    }
    
    count = await listItems.count();
  }
}
