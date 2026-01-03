import { test, expect } from '@playwright/test';
import {
  addItem,
  deleteItemBySwipe,
  swipeItem,
  getItemCheckbox,
  getItemContainer,
  cleanupItemsByPrefix,
  getTestPrefix,
  makeTestItemName,
  SWIPE_CONFIG,
} from './test-utils';

test.describe('Swipe Gestures', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test.afterEach(async ({ page }, testInfo) => {
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test('Swipe left to delete item', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Bananas');
    
    await test.step('Add item to the list', async () => {
      await addItem(page, itemName);
    });

    await test.step('Swipe left to delete item', async () => {
      const container = getItemContainer(page, itemName).first();
      
      // Set up response listener before starting swipe
      const deleteResponse = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'DELETE',
        { timeout: SWIPE_CONFIG.TIMEOUT }
      );
      
      // Perform the swipe
      await swipeItem(page, itemName, 'left');
      
      // Wait for delete to complete
      await deleteResponse;
    });

    await test.step('Verify item is deleted from the list', async () => {
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible({ timeout: 5000 });
    });
  });

  test('Swipe right to archive item', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Apples');
    
    await test.step('Add item to the list', async () => {
      await addItem(page, itemName);
    });

    await test.step('Swipe right to archive item', async () => {
      const container = getItemContainer(page, itemName).first();
      
      // Set up response listener before starting swipe
      const archiveResponse = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: SWIPE_CONFIG.TIMEOUT }
      );
      
      // Perform the swipe
      await swipeItem(page, itemName, 'right');
      
      // Wait for archive to complete
      await archiveResponse;
    });

    await test.step('Verify item is archived (removed from visible list)', async () => {
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible({ timeout: 5000 });
    });
  });

  test('Short swipe does not trigger action', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Oranges');
    
    await test.step('Add item to the list', async () => {
      await addItem(page, itemName);
    });

    await test.step('Perform short swipe that does not exceed threshold', async () => {
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      const box = await container.boundingBox();
      expect(box).not.toBeNull();
      
      const centerX = box!.x + box!.width / 2;
      const centerY = box!.y + box!.height / 2;
      // Only swipe 50px, less than the 100px threshold
      const endX = centerX + 50;
      
      // Use dispatch events for consistency with other tests
      await swipeableDiv.dispatchEvent('mousedown', { 
        clientX: centerX, 
        clientY: centerY,
        bubbles: true
      });
      
      // Simulate short swipe
      for (let i = 1; i <= 5; i++) {
        const currentX = centerX + ((endX - centerX) * i / 5);
        await swipeableDiv.dispatchEvent('mousemove', {
          clientX: currentX,
          clientY: centerY,
          bubbles: true
        });
        await page.waitForTimeout(10);
      }
      
      // Complete the swipe
      await page.evaluate(() => {
        window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });
    });

    await test.step('Verify item is still in the list', async () => {
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
    });
    
    await test.step('Clean up test data', async () => {
      await deleteItemBySwipe(page, itemName);
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible({ timeout: 5000 });
    });
  });
});
