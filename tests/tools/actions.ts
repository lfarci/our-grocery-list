/**
 * Item action helpers for common operations
 */
import { Page, expect } from '@playwright/test';
import { SWIPE_CONFIG, TIMEOUTS } from './config';
import { waitForPostResponse, waitForPatchResponse, waitForDeleteResponse } from './api';
import { getItemContainer, getAddItemInput, getAddItemButton, getSwipeableElement, getItemCheckbox } from './locators';

/**
 * Add a new item to the grocery list
 */
export async function addItem(page: Page, itemName: string): Promise<void> {
  const input = getAddItemInput(page);
  await input.fill(itemName);
  const [response] = await Promise.all([
    waitForPostResponse(page),
    input.press('Enter'),
  ]);
  expect(response.ok()).toBe(true);

  // Input should clear after a successful add, but don't fail the test if it lags.
  await expect.soft(input).toHaveValue('', { timeout: TIMEOUTS.ITEM_APPEAR });
  
  // Wait for item to appear in the list
  const checkbox = getItemCheckbox(page, itemName);
  await expect(checkbox.first()).toBeVisible({ timeout: TIMEOUTS.ITEM_APPEAR });
}

/**
 * Perform a swipe gesture on an item
 */
export async function swipeItem(
  page: Page,
  itemName: string,
  direction: 'left' | 'right'
): Promise<void> {
  console.log(`[swipeItem] Finding item: ${itemName}, direction: ${direction}`);
  const itemContainer = getItemContainer(page, itemName).first();
  const swipeableElement = getSwipeableElement(itemContainer);
  
  await expect(swipeableElement).toBeVisible({ timeout: TIMEOUTS.ELEMENT });
  console.log(`[swipeItem] Swipeable element found`);
  
  // Ensure element is in the viewport before calculating coordinates
  await swipeableElement.scrollIntoViewIfNeeded();
  
  const box = await swipeableElement.boundingBox();
  if (!box) throw new Error(`Could not get bounding box for item: ${itemName}`);
  
  console.log(`[swipeItem] Box: ${JSON.stringify(box)}`);
  // Start swipes away from the checkbox so the gesture isn't eaten by the input
  const startX = direction === 'left'
    ? box.x + box.width * 0.8
    : box.x + box.width * 0.6;
  const endX = direction === 'left' 
    ? startX - SWIPE_CONFIG.DISTANCE 
    : startX + SWIPE_CONFIG.DISTANCE;
  const y = box.y + box.height / 2;
  
  console.log(`[swipeItem] Swipe from ${startX} to ${endX} at y=${y}, distance=${SWIPE_CONFIG.DISTANCE}`);
  
  await swipeableElement.dispatchEvent('mousedown', { 
    clientX: startX, 
    clientY: y,
    button: 0,
    buttons: 1,
    bubbles: true 
  });
  
  const steps = Math.ceil(SWIPE_CONFIG.DISTANCE / SWIPE_CONFIG.STEP_SIZE);
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    await swipeableElement.dispatchEvent('mousemove', {
      clientX: currentX,
      clientY: y,
      buttons: 1,
      bubbles: true
    });
    await page.waitForTimeout(SWIPE_CONFIG.STEP_DELAY);
  }
  
  console.log(`[swipeItem] Completing swipe with window mouseup`);
  await page.evaluate(() => {
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
  console.log(`[swipeItem] Swipe complete`);
}

/**
 * Archive an item by swiping right (non-destructive)
 */
export async function archiveItemBySwipe(page: Page, itemName: string): Promise<void> {
  console.log(`[archiveItemBySwipe] Starting swipe for item: ${itemName}`);
  const [response] = await Promise.all([
    waitForPatchResponse(page),
    swipeItem(page, itemName, 'right')
  ]);
  console.log(`[archiveItemBySwipe] Response received: ${response.status()}`);
  expect(response.ok()).toBe(true);
}

/**
 * Delete an item by swiping left (destructive)
 */
export async function deleteItemBySwipe(page: Page, itemName: string): Promise<void> {
  const [response] = await Promise.all([
    waitForDeleteResponse(page),
    swipeItem(page, itemName, 'left')
  ]);
  expect(response.ok()).toBe(true);
}

/**
 * Toggle an item's checkbox state
 */
export async function toggleItemCheckbox(page: Page, itemName: string): Promise<void> {
  const checkbox = getItemCheckbox(page, itemName);
  await expect(checkbox).toBeVisible({ timeout: TIMEOUTS.ELEMENT });
  
  const [response] = await Promise.all([
    waitForPatchResponse(page),
    checkbox.click()
  ]);
  
  expect(response.ok()).toBe(true);
}

/**
 * Assert an item's checked state
 */
export async function expectItemChecked(page: Page, itemName: string, checked: boolean): Promise<void> {
  const checkbox = getItemCheckbox(page, itemName);
  if (checked) {
    await expect(checkbox).toBeChecked({ timeout: TIMEOUTS.ELEMENT });
  } else {
    await expect(checkbox).not.toBeChecked({ timeout: TIMEOUTS.ELEMENT });
  }
}
