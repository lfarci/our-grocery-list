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
      
      // Should have input field for notes
      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await expect(notesInput).toBeVisible();
      
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

  test('Adding items - Validate notes exceed 50 characters', async ({ page }) => {
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

  test('CRUD - Create item with name only', async ({ page }) => {
    const uniqueItemName = `Apples ${Date.now()}`;

    await test.step('Add item with name only', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);

      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
    });

    await test.step('Verify item appears in the list', async () => {
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });

    await test.step('Verify form is cleared after submission', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await expect(nameInput).toHaveValue('');
    });
  });

  test('CRUD - Create item with name and notes', async ({ page }) => {
    const uniqueItemName = `Bananas ${Date.now()}`;
    const itemNotes = '3 bunches, ripe';

    await test.step('Add item with name and notes', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);

      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await notesInput.fill(itemNotes);

      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
    });

    await test.step('Verify item appears with name and notes', async () => {
      await expect(page.getByText(uniqueItemName)).toBeVisible();
      await expect(page.getByText(itemNotes)).toBeVisible();
    });

    await test.step('Verify form is cleared after submission', async () => {
      const nameInput = page.getByLabel('Item Name *');
      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await expect(nameInput).toHaveValue('');
      await expect(notesInput).toHaveValue('');
    });
  });

  test('CRUD - Create item with Enter key', async ({ page }) => {
    const uniqueItemName = `Oranges ${Date.now()}`;

    await test.step('Add item using Enter key in name field', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);
      await nameInput.press('Enter');
    });

    await test.step('Verify item appears in the list', async () => {
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });
  });

  test('CRUD - Update item (toggle done status)', async ({ page }) => {
    const uniqueItemName = `Bread ${Date.now()}`;

    await test.step('Create a new item', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);
      await nameInput.press('Enter');
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });

    await test.step('Mark item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${uniqueItemName} as done`, 'i') });
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    });

    await test.step('Verify item is visually de-emphasized', async () => {
      const itemText = page.getByText(uniqueItemName);
      // Check that the item has line-through styling (indicates done state)
      await expect(itemText).toHaveClass(/line-through/);
    });

    await test.step('Mark item as not done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${uniqueItemName} as not done`, 'i') });
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });

    await test.step('Verify item is no longer de-emphasized', async () => {
      const itemText = page.getByText(uniqueItemName);
      // Check that the item no longer has line-through styling
      await expect(itemText).not.toHaveClass(/line-through/);
    });
  });

  test('CRUD - Delete item', async ({ page }) => {
    const uniqueItemName = `Milk ${Date.now()}`;

    await test.step('Create a new item', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);
      await nameInput.press('Enter');
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });

    await test.step('Delete the item', async () => {
      const deleteButton = page.getByRole('button', { name: new RegExp(`Delete ${uniqueItemName}`, 'i') });
      await deleteButton.click();
    });

    await test.step('Verify item is removed from the list', async () => {
      await expect(page.getByText(uniqueItemName)).not.toBeVisible();
    });
  });

  test('CRUD - Multiple operations on different items', async ({ page }) => {
    const item1 = `Eggs ${Date.now()}`;
    const item2 = `Cheese ${Date.now() + 1}`;
    const item3 = `Yogurt ${Date.now() + 2}`;

    await test.step('Create three items', async () => {
      const nameInput = page.getByLabel('Item Name *');
      
      // Add item 1
      await nameInput.fill(item1);
      await nameInput.press('Enter');
      await expect(page.getByText(item1)).toBeVisible();
      
      // Add item 2
      await nameInput.fill(item2);
      await nameInput.press('Enter');
      await expect(page.getByText(item2)).toBeVisible();
      
      // Add item 3
      await nameInput.fill(item3);
      await nameInput.press('Enter');
      await expect(page.getByText(item3)).toBeVisible();
    });

    await test.step('Mark second item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${item2} as done`, 'i') });
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    });

    await test.step('Delete first item', async () => {
      const deleteButton = page.getByRole('button', { name: new RegExp(`Delete ${item1}`, 'i') });
      await deleteButton.click();
      await expect(page.getByText(item1)).not.toBeVisible();
    });

    await test.step('Verify remaining items', async () => {
      // Item 1 should be deleted
      await expect(page.getByText(item1)).not.toBeVisible();
      
      // Item 2 should still be visible and marked as done
      await expect(page.getByText(item2)).toBeVisible();
      const checkbox2 = page.getByRole('checkbox', { name: new RegExp(`Mark ${item2} as not done`, 'i') });
      await expect(checkbox2).toBeChecked();
      
      // Item 3 should still be visible and not done
      await expect(page.getByText(item3)).toBeVisible();
      const checkbox3 = page.getByRole('checkbox', { name: new RegExp(`Mark ${item3} as done`, 'i') });
      await expect(checkbox3).not.toBeChecked();
    });
  });

  test('Item decoration - Display item properties correctly', async ({ page }) => {
    const itemName = `Tomatoes ${Date.now()}`;
    const itemNotes = '2 lbs, organic';

    await test.step('Create item with name and notes', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(itemName);
      
      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await notesInput.fill(itemNotes);
      
      await nameInput.press('Enter');
    });

    await test.step('Verify item has checkbox', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${itemName} as done`, 'i') });
      await expect(checkbox).toBeVisible();
      await expect(checkbox).not.toBeChecked();
    });

    await test.step('Verify item displays name prominently', async () => {
      const itemNameElement = page.getByText(itemName);
      await expect(itemNameElement).toBeVisible();
      // Check that name has appropriate styling (font-medium class)
      await expect(itemNameElement).toHaveClass(/font-medium/);
    });

    await test.step('Verify item displays notes', async () => {
      const notesElement = page.getByText(itemNotes);
      await expect(notesElement).toBeVisible();
      // Check that notes have smaller text styling
      await expect(notesElement).toHaveClass(/text-sm/);
    });

    await test.step('Verify item has delete button', async () => {
      const deleteButton = page.getByRole('button', { name: new RegExp(`Delete ${itemName}`, 'i') });
      await expect(deleteButton).toBeVisible();
    });

    await test.step('Verify done item styling', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${itemName} as done`, 'i') });
      await checkbox.check();
      
      // Name should have line-through and muted color
      const itemNameElement = page.getByText(itemName);
      await expect(itemNameElement).toHaveClass(/line-through/);
      await expect(itemNameElement).toHaveClass(/text-gray-500/);
      
      // Notes should also be muted
      const notesElement = page.getByText(itemNotes);
      await expect(notesElement).toHaveClass(/text-gray-400/);
    });
  });

  test('List ordering - Not-done items first, then done items', async ({ page }) => {
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
      await page.waitForTimeout(100);
      
      await nameInput.fill(item2);
      await nameInput.press('Enter');
      await page.waitForTimeout(100);
      
      await nameInput.fill(item3);
      await nameInput.press('Enter');
      await page.waitForTimeout(100);
    });

    await test.step('Mark second item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${item2} as done`, 'i') });
      await checkbox.check();
      await page.waitForTimeout(300);
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
      await page.waitForTimeout(300);
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

  test('List ordering - Oldest items stay on top within each group', async ({ page }) => {
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
      await page.waitForTimeout(100);
      
      await nameInput.fill(item2);
      await nameInput.press('Enter');
      await page.waitForTimeout(100);
      
      await nameInput.fill(item3);
      await nameInput.press('Enter');
      await page.waitForTimeout(100);
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
