import { test, expect } from '@playwright/test';

test.describe('Item Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Block empty item names with validation', async ({ page }) => {
    await test.step('Try to add item with empty name', async () => {
      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
    });

    await test.step('Verify validation message appears', async () => {
      // Should show validation message for empty name
      await expect(page.getByText('Please enter an item name')).toBeVisible();
    });

    await test.step('Verify no item was created', async () => {
      // Wait for any potential item to be added (it shouldn't be)
      await page.waitForTimeout(500);
      
      // Check that the list still shows empty state or doesn't have an item with empty name
      const emptyMessage = page.getByText('Your list is empty. Add something above.');
      const itemsExist = await emptyMessage.isVisible().catch(() => false);
      
      // If list is not empty (has seeded data), verify no item has empty name
      if (!itemsExist) {
        const items = page.locator('.bg-white.p-4.rounded-lg.shadow');
        const count = await items.count();
        for (let i = 0; i < count; i++) {
          const itemText = await items.nth(i).textContent();
          expect(itemText).not.toBe('');
        }
      }
    });
  });

  test('Validate item name exceeds 50 characters', async ({ page }) => {
    const longItemName = 'A'.repeat(51); // 51 characters

    await test.step('Try to add item with name > 50 characters', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(longItemName);
      
      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
    });

    await test.step('Verify validation error message appears', async () => {
      await expect(page.getByText('Item name must be 50 characters or less')).toBeVisible();
    });

    await test.step('Verify validation prevents form submission', async () => {
      // The error message should still be visible, indicating form wasn't submitted
      await expect(page.getByText('Item name must be 50 characters or less')).toBeVisible();
      // Input should still contain the invalid value
      const nameInput = page.getByLabel('Item Name *');
      await expect(nameInput).toHaveValue(longItemName);
    });
  });

  test('Validate notes exceed 50 characters', async ({ page }) => {
    const testItemName = `Test Item ${Date.now()}`;
    const longNotes = 'B'.repeat(51); // 51 characters

    await test.step('Try to add item with notes > 50 characters', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(testItemName);
      
      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await notesInput.fill(longNotes);
      
      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
    });

    await test.step('Verify validation error message appears', async () => {
      await expect(page.getByText('Notes must be 50 characters or less')).toBeVisible();
    });

    await test.step('Verify validation prevents form submission', async () => {
      // The error message should still be visible
      await expect(page.getByText('Notes must be 50 characters or less')).toBeVisible();
      // Inputs should still contain their values
      const nameInput = page.getByLabel('Item Name *');
      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await expect(nameInput).toHaveValue(testItemName);
      await expect(notesInput).toHaveValue(longNotes);
    });
  });
});
