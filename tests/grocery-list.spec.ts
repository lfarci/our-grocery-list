import { test, expect } from '@playwright/test';

test.describe('Grocery List Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Smoke test - Application loads successfully', async ({ page }) => {
    await test.step('Verify page title', async () => {
      await expect(page).toHaveTitle('frontend');
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
  });

  test('Viewing the list - Empty state message', async ({ page }) => {
    await test.step('Verify empty state message when no items', async () => {
      // Should show a friendly empty state message
      await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
    });
  });
});
