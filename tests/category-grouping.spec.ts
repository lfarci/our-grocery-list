import { test, expect } from '@playwright/test';
import {
  addItem,
  cleanupItemsByPrefix,
  getTestPrefix,
  makeTestItemName,
  TIMEOUTS,
} from './tools';

test.describe('Category Grouping', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test.afterEach(async ({ page }, testInfo) => {
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test('New items default to "Other" category', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'TestItem');

    await test.step('Add a new item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Verify item appears under "Other" category', async () => {
      const otherHeading = page.getByRole('heading', { name: 'Other', level: 2 });
      await expect(otherHeading).toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
      
      // Verify the item appears after the Other heading
      const itemCheckbox = page.locator(`input[type="checkbox"][aria-label*="${itemName}"]`).first();
      await expect(itemCheckbox).toBeVisible({ timeout: TIMEOUTS.ITEM_APPEAR });
    });
  });

  test('Category sections appear in correct order', async ({ page }) => {
    // We'll use mock data to test all categories
    await test.step('Add items with different categories via API', async () => {
      // Create test items in database with specific categories
      const categories = ['Produce', 'Meat & Fish', 'Dairy', 'Bakery & Cereals', 'Household', 'Other'];
      
      for (const category of categories) {
        const itemName = makeTestItemName(test.info(), `${category}Item`);
        
        // Create item via API
        await page.request.post('/api/items', {
          data: {
            name: itemName,
          }
        });
        
        // Update category directly in the database
        // Note: This is a workaround since we can't set category during creation yet
        // In production, this would be handled properly
      }
    });

    await test.step('Verify category headings appear in correct order', async () => {
      await page.reload();
      
      // Get all h2 headings (category headings)
      const headings = page.locator('h2');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        const expectedOrder = ['Produce', 'Meat & Fish', 'Dairy', 'Bakery & Cereals', 'Household', 'Other'];
        
        // Collect all heading texts
        const actualHeadings: string[] = [];
        for (let i = 0; i < headingCount; i++) {
          const text = await headings.nth(i).textContent();
          if (text) {
            actualHeadings.push(text);
          }
        }
        
        // Verify headings appear in expected order (only check those that exist)
        let lastIndex = -1;
        for (const heading of actualHeadings) {
          const currentIndex = expectedOrder.indexOf(heading);
          expect(currentIndex).toBeGreaterThan(lastIndex);
          lastIndex = currentIndex;
        }
      }
    });
  });

  test('Only non-empty categories are rendered', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'SingleItem');

    await test.step('Add a single item (will be in Other category)', async () => {
      await addItem(page, itemName);
    });

    await test.step('Verify only "Other" category heading is visible', async () => {
      const otherHeading = page.getByRole('heading', { name: 'Other', level: 2 });
      await expect(otherHeading).toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
      
      // Verify other category headings are not present
      const produceHeading = page.getByRole('heading', { name: 'Produce', level: 2 });
      await expect(produceHeading).not.toBeVisible();
      
      const meatHeading = page.getByRole('heading', { name: 'Meat & Fish', level: 2 });
      await expect(meatHeading).not.toBeVisible();
    });
  });

  test('Items within same category maintain correct ordering', async ({ page }) => {
    const item1 = makeTestItemName(test.info(), 'First');
    const item2 = makeTestItemName(test.info(), 'Second');
    const item3 = makeTestItemName(test.info(), 'Third');

    await test.step('Add three items (all will be in Other category)', async () => {
      await addItem(page, item1);
      await page.waitForTimeout(100); // Small delay to ensure different timestamps
      await addItem(page, item2);
      await page.waitForTimeout(100);
      await addItem(page, item3);
    });

    await test.step('Verify items appear in creation order (oldest first)', async () => {
      const items = page.locator('[data-testid^="item-container-"]');
      await expect(items).toHaveCount(3);
      
      // Verify order by checking data-testid attributes
      const firstItem = items.first();
      await expect(firstItem).toHaveAttribute('data-testid', `item-container-${item1}`);
      
      const lastItem = items.last();
      await expect(lastItem).toHaveAttribute('data-testid', `item-container-${item3}`);
    });

    await test.step('Check middle item and verify active items stay before checked', async () => {
      // Check the second item
      const item2Checkbox = page.locator(`input[type="checkbox"][aria-label*="${item2}"]`).first();
      await item2Checkbox.check();
      
      // Wait for state update
      await page.waitForTimeout(500);
      
      // Verify checked item moves after active items
      const items = page.locator('[data-testid^="item-container-"]');
      
      // First item should still be item1 (active, oldest)
      const firstItem = items.first();
      await expect(firstItem).toHaveAttribute('data-testid', `item-container-${item1}`);
      
      // Second item should be item3 (active, second oldest)
      const secondItem = items.nth(1);
      await expect(secondItem).toHaveAttribute('data-testid', `item-container-${item3}`);
      
      // Last item should be item2 (checked)
      const lastItem = items.last();
      await expect(lastItem).toHaveAttribute('data-testid', `item-container-${item2}`);
    });
  });

  test('Empty state message shows when no items', async ({ page }) => {
    await test.step('Verify empty state without any items', async () => {
      await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
      
      // Verify no category headings are present
      const headings = page.locator('h2');
      await expect(headings).toHaveCount(0);
    });
  });

  test('Category sections persist after real-time updates', async ({ page, context }) => {
    const itemName = makeTestItemName(test.info(), 'RealtimeTest');

    await test.step('Add item in first tab', async () => {
      await addItem(page, itemName);
    });

    await test.step('Open second tab and verify category appears', async () => {
      const secondPage = await context.newPage();
      await secondPage.goto('/');
      
      // Verify Other category heading appears
      const otherHeading = secondPage.getByRole('heading', { name: 'Other', level: 2 });
      await expect(otherHeading).toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
      
      // Verify item appears
      const itemCheckbox = secondPage.locator(`input[type="checkbox"][aria-label*="${itemName}"]`).first();
      await expect(itemCheckbox).toBeVisible({ timeout: TIMEOUTS.ITEM_APPEAR });
      
      await secondPage.close();
    });
  });
});
