import { test, expect, Page } from '@playwright/test';

/**
 * Helper function to get the item container element
 */
async function getItemContainer(page: Page, itemName: string) {
  return page.getByTestId(`item-container-${itemName}`);
}

/**
 * Helper function to delete an item using swipe gesture
 */
async function deleteItemBySwipe(page: Page, itemName: string) {
  const itemContainer = await getItemContainer(page, itemName);
  const box = await itemContainer.boundingBox();
  
  if (box) {
    // Perform swipe left gesture (swipe from right to left)
    const startX = box.x + box.width - 20;
    const startY = box.y + box.height / 2;
    const endX = box.x + 20;
    const endY = startY;
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
    
    // Wait for delete to complete
    await page.waitForTimeout(500);
  }
}

test.describe('Swipe Gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Swipe left to delete item', async ({ page }) => {
    await test.step('Add an item to the list', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Bananas');
      
      // Wait for the API call to complete when adding item
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      
      // Wait for response or timeout
      await responsePromise;
      
      // Wait for the item to appear in the list
      await expect(page.getByRole('checkbox', { name: /Mark Bananas as/ })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Swipe left on the item to reveal delete action', async () => {
      // Find the item container
      const itemContainer = await getItemContainer(page, 'Bananas');
      
      // Get the bounding box to calculate swipe coordinates
      const box = await itemContainer.boundingBox();
      if (!box) throw new Error('Item not found');
      
      // Perform swipe left gesture (swipe from right to left)
      const startX = box.x + box.width - 20;
      const startY = box.y + box.height / 2;
      const endX = box.x + 20; // Swipe more than threshold (100px)
      const endY = startY;
      
      // Simulate touch/mouse swipe
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      
      // Verify delete hint is visible during swipe
      await expect(page.getByText('Delete')).toBeVisible();
      
      await page.mouse.up();
      
      // Wait for delete API call
      const deleteResponse = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'DELETE'
      ).catch(() => null);
      
      await deleteResponse;
    });

    await test.step('Verify item is deleted from the list', async () => {
      // Item should be removed from the list
      await expect(page.getByRole('checkbox', { name: /Mark Bananas as/ })).not.toBeVisible({ timeout: 5000 });
    });
    
    // No cleanup needed - item was deleted as part of the test
  });

  test('Swipe right to archive item', async ({ page }) => {
    await test.step('Add an item to the list', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Apples');
      
      // Wait for the API call to complete when adding item
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      
      // Wait for response or timeout
      await responsePromise;
      
      // Wait for the item to appear in the list
      await expect(page.getByRole('checkbox', { name: /Mark Apples as/ })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Swipe right on the item to reveal archive action', async () => {
      // Find the item container
      const itemContainer = await getItemContainer(page, 'Apples');
      
      // Get the bounding box to calculate swipe coordinates
      const box = await itemContainer.boundingBox();
      if (!box) throw new Error('Item not found');
      
      // Perform swipe right gesture (swipe from left to right)
      const startX = box.x + 20;
      const startY = box.y + box.height / 2;
      const endX = box.x + box.width - 20; // Swipe more than threshold (100px)
      const endY = startY;
      
      // Simulate touch/mouse swipe
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      
      // Verify archive hint is visible during swipe
      await expect(page.getByText('Archive')).toBeVisible();
      
      await page.mouse.up();
      
      // Wait for archive API call (PATCH request)
      const archiveResponse = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'PATCH'
      ).catch(() => null);
      
      await archiveResponse;
    });

    await test.step('Verify item is archived (removed from visible list)', async () => {
      // Item should be removed from the visible list (archived items are filtered out)
      await expect(page.getByRole('checkbox', { name: /Mark Apples as/ })).not.toBeVisible({ timeout: 5000 });
    });
    
    // No cleanup needed - item was archived as part of the test
  });

  test('Short swipe does not trigger action', async ({ page }) => {
    let itemCreated = false;
    
    await test.step('Add an item to the list', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Oranges');
      
      // Wait for the API call to complete when adding item
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      
      // Wait for response or timeout
      await responsePromise;
      
      // Wait for the item to appear in the list
      await expect(page.getByRole('checkbox', { name: /Mark Oranges as/ })).toBeVisible({ timeout: 10000 });
      itemCreated = true;
    });

    await test.step('Perform short swipe that does not exceed threshold', async () => {
      // Find the item container
      const itemContainer = await getItemContainer(page, 'Oranges');
      
      // Get the bounding box to calculate swipe coordinates
      const box = await itemContainer.boundingBox();
      if (!box) throw new Error('Item not found');
      
      // Perform short swipe (less than 100px threshold)
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      const endX = startX + 50; // Only 50px, less than threshold
      const endY = startY;
      
      // Simulate touch/mouse swipe
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 5 });
      await page.mouse.up();
      
      // Wait a moment for any potential action
      await page.waitForTimeout(500);
    });

    await test.step('Verify item is still in the list', async () => {
      // Item should still be visible
      await expect(page.getByRole('checkbox', { name: /Mark Oranges as/ })).toBeVisible();
    });
    
    // Clean up: Delete the test item
    if (itemCreated) {
      await test.step('Clean up test data', async () => {
        try {
          await deleteItemBySwipe(page, 'Oranges');
          // Verify cleanup
          await expect(page.getByRole('checkbox', { name: /Mark Oranges as/ })).not.toBeVisible({ timeout: 5000 });
        } catch (error) {
          console.error('Failed to clean up test item:', error);
        }
      });
    }
  });
});
