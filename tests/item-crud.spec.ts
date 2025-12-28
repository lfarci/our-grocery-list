import { test, expect } from '@playwright/test';

test.describe('Item CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Create item with name only', async ({ page }) => {
    const uniqueItemName = `Apples ${Date.now()}`;

    await test.step('Add item with name only', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);

      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
      
      // Wait for the item to be added
      await page.waitForTimeout(500);
    });

    await test.step('Verify item appears in the list', async () => {
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });

    await test.step('Verify form is cleared after submission', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await expect(nameInput).toHaveValue('');
    });
  });

  test('Create item with name and notes', async ({ page }) => {
    const uniqueItemName = `Bananas ${Date.now()}`;
    const itemNotes = '3 bunches, ripe';

    await test.step('Add item with name and notes', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);

      const notesInput = page.getByLabel('Quantity/Notes (optional)');
      await notesInput.fill(itemNotes);

      const addButton = page.getByRole('button', { name: 'Add Item' });
      await addButton.click();
      
      // Wait for the item to be added
      await page.waitForTimeout(500);
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

  test('Create item with Enter key', async ({ page }) => {
    const uniqueItemName = `Oranges ${Date.now()}`;

    await test.step('Add item using Enter key in name field', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);
      await nameInput.press('Enter');
      
      // Wait for the item to be added
      await page.waitForTimeout(500);
    });

    await test.step('Verify item appears in the list', async () => {
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });
  });

  test('Update item (toggle done status)', async ({ page }) => {
    const uniqueItemName = `Bread ${Date.now()}`;

    await test.step('Create a new item', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);
      await nameInput.press('Enter');
      
      // Wait for the item to be added
      await page.waitForTimeout(500);
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });

    await test.step('Mark item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${uniqueItemName} as done`, 'i') });
      await checkbox.check();
      
      // Wait for the update to complete
      await page.waitForTimeout(300);
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
      
      // Wait for the update to complete
      await page.waitForTimeout(300);
      await expect(checkbox).not.toBeChecked();
    });

    await test.step('Verify item is no longer de-emphasized', async () => {
      const itemText = page.getByText(uniqueItemName);
      // Check that the item no longer has line-through styling
      await expect(itemText).not.toHaveClass(/line-through/);
    });
  });

  test('Delete item', async ({ page }) => {
    const uniqueItemName = `Milk ${Date.now()}`;

    await test.step('Create a new item', async () => {
      const nameInput = page.getByLabel('Item Name *');
      await nameInput.fill(uniqueItemName);
      await nameInput.press('Enter');
      
      // Wait for the item to be added
      await page.waitForTimeout(500);
      await expect(page.getByText(uniqueItemName)).toBeVisible();
    });

    await test.step('Delete the item', async () => {
      const deleteButton = page.getByRole('button', { name: new RegExp(`Delete ${uniqueItemName}`, 'i') });
      await deleteButton.click();
      
      // Wait for the deletion to complete
      await page.waitForTimeout(300);
    });

    await test.step('Verify item is removed from the list', async () => {
      await expect(page.getByText(uniqueItemName)).not.toBeVisible();
    });
  });

  test('Multiple operations on different items', async ({ page }) => {
    const item1 = `Eggs ${Date.now()}`;
    const item2 = `Cheese ${Date.now() + 1}`;
    const item3 = `Yogurt ${Date.now() + 2}`;

    await test.step('Create three items', async () => {
      const nameInput = page.getByLabel('Item Name *');
      
      // Add item 1
      await nameInput.fill(item1);
      await nameInput.press('Enter');
      await page.waitForTimeout(300);
      await expect(page.getByText(item1)).toBeVisible();
      
      // Add item 2
      await nameInput.fill(item2);
      await nameInput.press('Enter');
      await page.waitForTimeout(300);
      await expect(page.getByText(item2)).toBeVisible();
      
      // Add item 3
      await nameInput.fill(item3);
      await nameInput.press('Enter');
      await page.waitForTimeout(300);
      await expect(page.getByText(item3)).toBeVisible();
    });

    await test.step('Mark second item as done', async () => {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${item2} as done`, 'i') });
      await checkbox.check();
      await page.waitForTimeout(300);
      await expect(checkbox).toBeChecked();
    });

    await test.step('Delete first item', async () => {
      const deleteButton = page.getByRole('button', { name: new RegExp(`Delete ${item1}`, 'i') });
      await deleteButton.click();
      await page.waitForTimeout(300);
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
});
