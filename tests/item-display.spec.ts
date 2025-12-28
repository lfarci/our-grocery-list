import { test, expect } from '@playwright/test';

test.describe('Grocery List Application - Item Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Display item properties correctly', async ({ page }) => {
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
});
