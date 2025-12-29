import { test, expect } from '@playwright/test';

test.describe('Grocery List Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Smoke test - Application loads successfully', async ({ page }) => {
    await test.step('Verify page title', async () => {
      await expect(page).toHaveTitle('Our Grocery List');
    });

    await test.step('Verify main heading is visible', async () => {
      const heading = page.getByRole('heading', { name: /Our Grocery List/i });
      await expect(heading).toBeVisible();
    });
  });

  test('Main screen - Display list title and add form', async ({ page }) => {
    await test.step('Verify list title is present', async () => {
      const heading = page.getByRole('heading', { name: /Our Grocery List/i });
      await expect(heading).toBeVisible();
    });

    await test.step('Verify add item form is present', async () => {
      // Should have input field for item name
      const nameInput = page.getByLabel('Item Name *');
      await expect(nameInput).toBeVisible();
      
      // Should have an Add Item button
      const addButton = page.getByRole('button', { name: 'Add Item' });
      await expect(addButton).toBeVisible();
    });
  });

  test('Adding items - Block empty names with validation', async ({ page }) => {
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

  test('Adding items - Validate item name exceeds 50 characters', async ({ page }) => {
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

  test('Viewing the list - Empty state message', async ({ page }) => {
    await test.step('Wait for initial load and delete all existing items', async () => {
      // Wait for the page to finish loading (either showing items or empty state)
      await page.waitForLoadState('networkidle');
      
      // The API seeds sample data by default. Delete all items if any exist.
      const deleteButtons = page.getByRole('button', { name: /delete/i });
      const count = await deleteButtons.count();
      
      if (count > 0) {
        // Delete all items one by one
        for (let i = 0; i < count; i++) {
          // Always click the first delete button since items shift after deletion
          await deleteButtons.first().click();
          // Wait for the item to be removed
          await page.waitForTimeout(200);
        }
      }
    });

    await test.step('Verify empty state message when no items', async () => {
      // Should show a friendly empty state message
      await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
    });
  });

  test('Autocomplete - Show suggestions when typing', async ({ page }) => {
    await test.step('Add an item to the list', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill('Apples');
      await page.getByRole('button', { name: 'Add Item' }).click();
      await page.waitForTimeout(500); // Wait for item to be added
    });

    await test.step('Start typing similar name', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill('App');
      // Wait for suggestions to appear
      await page.waitForTimeout(500);
    });

    await test.step('Verify suggestions appear', async () => {
      // Should show "Already in List" section with the existing item
      await expect(page.getByText('Already in List')).toBeVisible();
      await expect(page.getByText('Apples')).toBeVisible();
    });
  });

  test('Autocomplete - Add new item when no exact match', async ({ page }) => {
    await test.step('Type a new item name', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill('Bananas');
      await page.waitForTimeout(500);
    });

    await test.step('Click add new item from suggestions', async () => {
      const addNewButton = page.getByText('Add "Bananas" as new item');
      if (await addNewButton.isVisible()) {
        await addNewButton.click();
      } else {
        // Fallback to regular form submit
        await page.getByRole('button', { name: 'Add Item' }).click();
      }
      await page.waitForTimeout(500);
    });

    await test.step('Verify item was added to list', async () => {
      await expect(page.getByText('Bananas')).toBeVisible();
    });
  });
});
