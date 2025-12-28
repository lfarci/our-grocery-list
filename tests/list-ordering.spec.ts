import { test, expect } from '@playwright/test';

test.describe('List Ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Not-done items appear first, then done items', async ({ page }) => {
    await test.step('Clear existing items', async () => {
      await page.waitForLoadState('networkidle');
      const deleteButtons = page.getByRole('button', { name: /delete/i });
      const count = await deleteButtons.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          await deleteButtons.first().click();
          await page.waitForTimeout(200);
        }
      }
    });

    const item1 = `First Item ${Date.now()}`;
    const item2 = `Second Item ${Date.now() + 1}`;
    const item3 = `Third Item ${Date.now() + 2}`;

    await test.step('Create three items', async () => {
      const nameInput = page.getByLabel('Item Name *');
      
      await nameInput.fill(item1);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
      
      await nameInput.fill(item2);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
      
      await nameInput.fill(item3);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    });

    await test.step('Mark second item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${item2} as done`, 'i') });
      await checkbox.check();
      await page.waitForTimeout(500);
    });

    await test.step('Verify ordering: not-done items first', async () => {
      // Get all item containers
      const items = page.locator('.bg-white.p-4.rounded-lg.shadow');
      
      // Get text content of each item
      const itemTexts = await items.allTextContents();
      
      // Find indices
      const index1 = itemTexts.findIndex(text => text.includes(item1));
      const index2 = itemTexts.findIndex(text => text.includes(item2));
      const index3 = itemTexts.findIndex(text => text.includes(item3));
      
      // item1 and item3 (not done) should come before item2 (done)
      expect(index1).toBeLessThan(index2);
      expect(index3).toBeLessThan(index2);
    });

    await test.step('Mark first item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${item1} as done`, 'i') });
      await checkbox.check();
      await page.waitForTimeout(500);
    });

    await test.step('Verify updated ordering', async () => {
      const items = page.locator('.bg-white.p-4.rounded-lg.shadow');
      const itemTexts = await items.allTextContents();
      
      const index1 = itemTexts.findIndex(text => text.includes(item1));
      const index2 = itemTexts.findIndex(text => text.includes(item2));
      const index3 = itemTexts.findIndex(text => text.includes(item3));
      
      // Only item3 is not done, so it should be first
      expect(index3).toBeLessThan(index1);
      expect(index3).toBeLessThan(index2);
      
      // Done items maintain their order (item1 done after item2, so item2 comes first among done)
      expect(index2).toBeLessThan(index1);
    });
  });

  test('Oldest items stay on top within each group', async ({ page }) => {
    await test.step('Clear existing items', async () => {
      await page.waitForLoadState('networkidle');
      const deleteButtons = page.getByRole('button', { name: /delete/i });
      const count = await deleteButtons.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          await deleteButtons.first().click();
          await page.waitForTimeout(200);
        }
      }
    });

    const item1 = `Oldest ${Date.now()}`;
    const item2 = `Middle ${Date.now() + 1}`;
    const item3 = `Newest ${Date.now() + 2}`;

    await test.step('Create three items in sequence', async () => {
      const nameInput = page.getByLabel('Item Name *');
      
      await nameInput.fill(item1);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
      
      await nameInput.fill(item2);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
      
      await nameInput.fill(item3);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    });

    await test.step('Verify items are in creation order (oldest first)', async () => {
      const items = page.locator('.bg-white.p-4.rounded-lg.shadow');
      const itemTexts = await items.allTextContents();
      
      const index1 = itemTexts.findIndex(text => text.includes(item1));
      const index2 = itemTexts.findIndex(text => text.includes(item2));
      const index3 = itemTexts.findIndex(text => text.includes(item3));
      
      // Items should be in creation order
      expect(index1).toBeLessThan(index2);
      expect(index2).toBeLessThan(index3);
    });
  });
});
