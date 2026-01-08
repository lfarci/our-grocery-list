/**
 * Test cleanup utilities for removing test items
 */
import { Page, expect } from '@playwright/test';
import { TIMEOUTS } from './config';
import { getItemCheckbox } from './locators';
import { deleteItemBySwipe } from './actions';
import { RUN_ID } from './test-naming';

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
    
    type ApiItem = { id?: string; name: string };
    const items = await response.json() as ApiItem[];
    const currentRunToken = `-${RUN_ID}-`;
    const staleTestItems = items.filter((item) =>
      item.name.startsWith('t-') && !item.name.includes(currentRunToken)
    );
    const testItems = items.filter((item) => item.name.startsWith(prefix));

    for (const item of staleTestItems) {
      if (!item?.id) continue;
      await page.request.delete(`/api/items/${item.id}`).catch(() => undefined);
    }
    
    for (const item of testItems) {
      if (item?.id) {
        await page.request.delete(`/api/items/${item.id}`).catch(() => undefined);
      }
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
