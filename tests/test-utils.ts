import { Page, expect } from '@playwright/test';
import type { TestInfo } from '@playwright/test';

/**
 * Configuration for swipe operations
 */
export const SWIPE_CONFIG = {
  THRESHOLD: 100,  // pixels to trigger action (matches component)
  STEPS: 10,       // animation steps for smooth movement
  TIMEOUT: 5000,   // API response timeout
} as const;

function sanitizeForItemName(value: string): string {
  return value.replace(/[^a-zA-Z0-9-]/g, '-');
}

function fnv1a32(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function clampItemNameToMaxLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;

  const suffix = fnv1a32(value).toString(16).slice(0, 6);
  const keep = Math.max(0, maxLength - (1 + suffix.length));
  return `${value.slice(0, keep)}-${suffix}`;
}

export function getTestPrefix(testInfo: TestInfo): string {
  const shortId = sanitizeForItemName(testInfo.testId).slice(0, 8);
  return `E2E-${testInfo.workerIndex}-${shortId}`;
}

export function makeTestItemName(testInfo: TestInfo, baseName: string): string {
  const raw = `${getTestPrefix(testInfo)}-${sanitizeForItemName(baseName)}`;
  return clampItemNameToMaxLength(raw, 50);
}

export function isItemsListRequest(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.endsWith('/api/items');
  } catch {
    return url.includes('/api/items');
  }
}

export function waitForSearch(page: Page, query: string) {
  return page.waitForResponse(response => {
    if (response.request().method() !== 'GET') return false;
    try {
      const url = new URL(response.url());
      return url.pathname.endsWith('/api/items/search') && url.searchParams.get('q') === query;
    } catch {
      return response.url().includes('/api/items/search') && response.url().includes(`q=${encodeURIComponent(query)}`);
    }
  }, { timeout: SWIPE_CONFIG.TIMEOUT });
}

/**
 * Creates a locator for a grocery item checkbox by name.
 * Uses role-based locator for accessibility.
 */
export function getItemCheckbox(page: Page, itemName: string) {
  return page.getByRole('checkbox', { name: new RegExp(`Mark ${itemName} as`) });
}

/**
 * Gets the item container element by test ID.
 */
export function getItemContainer(page: Page, itemName: string) {
  return page.getByTestId(`item-container-${itemName}`);
}

/**
 * Adds a new item to the grocery list and waits for it to appear.
 */
export async function addItem(page: Page, itemName: string): Promise<void> {
  const nameInput = page.getByPlaceholder('Add an item...');
  await nameInput.fill(itemName);
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/items') && response.request().method() === 'POST',
    { timeout: SWIPE_CONFIG.TIMEOUT }
  );
  
  await page.getByRole('button', { name: 'Add Item' }).click();
  await responsePromise;
  
  // Wait for item to appear in the list
  await expect(getItemCheckbox(page, itemName).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Performs a swipe gesture on an item (left for delete, right for archive).
 * Uses a combination of Playwright's locator methods to reliably trigger React events.
 * 
 * @param page - Playwright page object
 * @param itemName - Name of the item to swipe
 * @param direction - 'left' for delete, 'right' for archive
 * @returns true if swipe was performed successfully
 */
export async function swipeItem(
  page: Page, 
  itemName: string, 
  direction: 'left' | 'right'
): Promise<boolean> {
  const container = getItemContainer(page, itemName).first();
  const box = await container.boundingBox();
  
  if (!box) return false;
  
  const centerY = box.y + box.height / 2;
  const padding = 20;
  
  // Calculate swipe coordinates based on direction
  const [startX, endX] = direction === 'left'
    ? [box.x + box.width - padding, box.x + padding]          // Right to left
    : [box.x + padding, box.x + box.width - padding];         // Left to right
  
  // Find the inner swipeable div (child with touch-none class that has event handlers)
  const swipeableDiv = container.locator('.touch-none');
  
  // Dispatch mousedown on the swipeable element
  await swipeableDiv.dispatchEvent('mousedown', { 
    clientX: startX, 
    clientY: centerY,
    bubbles: true
  });
  
  // Simulate multiple mousemove events for smooth swipe
  const steps = SWIPE_CONFIG.STEPS;
  for (let i = 1; i <= steps; i++) {
    const currentX = startX + ((endX - startX) * i / steps);
    await swipeableDiv.dispatchEvent('mousemove', {
      clientX: currentX,
      clientY: centerY,
      bubbles: true
    });
    await page.waitForTimeout(10);
  }
  
  // Dispatch mouseup on window (component listens on window)
  await page.evaluate(() => {
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
  
  return true;
}

/**
 * Deletes an item using swipe left gesture and waits for API confirmation.
 */
export async function deleteItemBySwipe(page: Page, itemName: string): Promise<boolean> {
  const swiped = await swipeItem(page, itemName, 'left');
  if (!swiped) return false;
  
  // Wait for delete API call to complete
  await page.waitForResponse(
    response => response.url().includes('/api/items') && response.request().method() === 'DELETE',
    { timeout: SWIPE_CONFIG.TIMEOUT }
  ).catch(() => null);
  return true;
}

/**
 * Archives an item using swipe right gesture and waits for API confirmation.
 */
export async function archiveItemBySwipe(page: Page, itemName: string): Promise<boolean> {
  const swiped = await swipeItem(page, itemName, 'right');
  if (!swiped) return false;
  
  // Wait for archive API call (PATCH request)
  await page.waitForResponse(
    response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
    { timeout: SWIPE_CONFIG.TIMEOUT }
  ).catch(() => null);
  return true;
}

/**
 * Cleans up any items created by a specific test prefix.
 * This is safe to run against shared environments because the prefix is unique to the test.
 */
export async function cleanupItemsByPrefix(page: Page, prefix: string): Promise<void> {
  if (page.isClosed()) return;

  const maxDeletions = 25;
  for (let i = 0; i < maxDeletions; i++) {
    const containers = page.locator(`[data-testid^="item-container-${prefix}"]`);
    const count = await containers.count().catch(() => 0);
    if (count === 0) return;

    const testId = await containers.first().getAttribute('data-testid');
    if (!testId || !testId.startsWith('item-container-')) return;

    const itemName = testId.slice('item-container-'.length);
    const beforeCount = await getItemCheckbox(page, itemName).count().catch(() => 0);
    if (beforeCount === 0) return;

    await deleteItemBySwipe(page, itemName);
    await expect(getItemCheckbox(page, itemName)).toHaveCount(Math.max(0, beforeCount - 1));
  }
}

/**
 * Cleans up specific test items from the list.
 * Attempts to delete each item multiple times to handle duplicates.
 */
export async function cleanupTestItems(page: Page, itemNames: string[]): Promise<void> {
  if (page.isClosed()) return;
  
  const maxAttemptsPerItem = 5;
  
  for (const itemName of itemNames) {
    for (let attempt = 0; attempt < maxAttemptsPerItem; attempt++) {
      const checkbox = getItemCheckbox(page, itemName);
      const count = await checkbox.count().catch(() => 0);
      
      if (count === 0) break;
      
      await deleteItemBySwipe(page, itemName);
    }
  }
}

/**
 * Deletes all visible items from the grocery list.
 * Useful for testing empty state scenarios.
 */
export async function deleteAllItems(page: Page, maxItems = 50): Promise<number> {
  let deletedCount = 0;
  
  while (deletedCount < maxItems) {
    const checkboxes = page.getByRole('checkbox');
    const count = await checkboxes.count();
    
    if (count === 0) break;
    
    // Get the first item's container using the checkbox's data-testid
    const firstCheckbox = checkboxes.first();
    const container = firstCheckbox.locator('xpath=ancestor::div[@data-testid]');
    const swipeableDiv = container.locator('.touch-none');
    const box = await container.boundingBox();
    
    if (!box) break;
    
    // Calculate swipe coordinates
    const startX = box.x + box.width - 20;
    const centerY = box.y + box.height / 2;
    const endX = box.x + 20;
    
    // Dispatch mousedown on the swipeable element
    await swipeableDiv.dispatchEvent('mousedown', { 
      clientX: startX, 
      clientY: centerY,
      bubbles: true
    });
    
    // Simulate multiple mousemove events for smooth swipe
    const steps = SWIPE_CONFIG.STEPS;
    for (let i = 1; i <= steps; i++) {
      const currentX = startX + ((endX - startX) * i / steps);
      await swipeableDiv.dispatchEvent('mousemove', {
        clientX: currentX,
        clientY: centerY,
        bubbles: true
      });
      await page.waitForTimeout(10);
    }
    
    // Dispatch mouseup on window
    await page.evaluate(() => {
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
    
    // Wait for delete API call
    await page.waitForResponse(
      response => response.url().includes('/api/items') && response.request().method() === 'DELETE',
      { timeout: SWIPE_CONFIG.TIMEOUT }
    ).catch(() => null);
    
    await page.waitForTimeout(300);
    deletedCount++;
  }
  
  return deletedCount;
}

/**
 * Standard test item names used across tests.
 */
export const TEST_ITEMS = ['Bananas', 'Apples', 'Oranges'] as const;
