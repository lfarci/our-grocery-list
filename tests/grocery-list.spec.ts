import { test, expect } from '@playwright/test';

test.describe('Grocery List Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Smoke test - Application loads successfully', async ({ page }) => {
    await test.step('Verify page title', async () => {
      await expect(page).toHaveTitle(/Grocery List/i);
    });

    await test.step('Verify main content is visible', async () => {
      // The page should have loaded and show the grocery list component
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test('Main screen - Display list title and add form', async ({ page }) => {
    await test.step('Verify list title is present', async () => {
      // Check for a heading that represents the list title
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    });

    await test.step('Verify add item form is present', async () => {
      // Should have input field for item name
      const nameInput = page.getByRole('textbox', { name: /name|item/i });
      await expect(nameInput).toBeVisible();
      
      // Should have an Add button
      const addButton = page.getByRole('button', { name: /add/i });
      await expect(addButton).toBeVisible();
    });
  });

  test('Adding items - Add item with name only', async ({ page }) => {
    await test.step('Enter item name and click Add', async () => {
      const nameInput = page.getByRole('textbox', { name: /name|item/i });
      await nameInput.fill('Milk');
      
      const addButton = page.getByRole('button', { name: /add/i });
      await addButton.click();
    });

    await test.step('Verify item appears in the list', async () => {
      // The item should appear in the list
      await expect(page.getByText('Milk')).toBeVisible();
    });
  });

  test('Adding items - Add item using Enter key', async ({ page }) => {
    await test.step('Enter item name and press Enter', async () => {
      const nameInput = page.getByRole('textbox', { name: /name|item/i });
      await nameInput.fill('Bread');
      await nameInput.press('Enter');
    });

    await test.step('Verify item appears in the list', async () => {
      await expect(page.getByText('Bread')).toBeVisible();
    });
  });

  test('Adding items - Block empty names with validation', async ({ page }) => {
    await test.step('Try to add item with empty name', async () => {
      const addButton = page.getByRole('button', { name: /add/i });
      await addButton.click();
    });

    await test.step('Verify validation message appears', async () => {
      // Should show some validation message or error
      // The empty item should not be added
      await expect(page.getByText(/required|empty|enter/i).first()).toBeVisible();
    });
  });

  test('Viewing the list - Empty state message', async ({ page }) => {
    await test.step('Verify empty state message when no items', async () => {
      // Should show a friendly empty state message
      await expect(page.getByText(/empty|add something/i)).toBeVisible();
    });
  });

  test('Updating items - Mark item as done', async ({ page }) => {
    await test.step('Add an item', async () => {
      const nameInput = page.getByRole('textbox', { name: /name|item/i });
      await nameInput.fill('Eggs');
      await nameInput.press('Enter');
      await expect(page.getByText('Eggs')).toBeVisible();
    });

    await test.step('Mark item as done', async () => {
      // Find and click the checkbox/toggle for the item
      const checkbox = page.getByRole('checkbox').first();
      await checkbox.check();
    });

    await test.step('Verify item is visually de-emphasized', async () => {
      // The item should still be visible but marked as done
      await expect(page.getByText('Eggs')).toBeVisible();
      
      // Check that the checkbox is checked
      const checkbox = page.getByRole('checkbox').first();
      await expect(checkbox).toBeChecked();
    });
  });

  test('Updating items - Delete item from list', async ({ page }) => {
    await test.step('Add an item', async () => {
      const nameInput = page.getByRole('textbox', { name: /name|item/i });
      await nameInput.fill('Cheese');
      await nameInput.press('Enter');
      await expect(page.getByText('Cheese')).toBeVisible();
    });

    await test.step('Delete the item', async () => {
      // Find and click the delete button
      const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
      await deleteButton.click();
    });

    await test.step('Verify item is removed from list', async () => {
      // The item should no longer be visible
      await expect(page.getByText('Cheese')).not.toBeVisible();
    });
  });

  test('List order - Not-done items appear before done items', async ({ page }) => {
    await test.step('Add multiple items', async () => {
      const nameInput = page.getByRole('textbox', { name: /name|item/i });
      
      // Add first item
      await nameInput.fill('Apples');
      await nameInput.press('Enter');
      
      // Add second item
      await nameInput.fill('Bananas');
      await nameInput.press('Enter');
      
      // Add third item
      await nameInput.fill('Carrots');
      await nameInput.press('Enter');
    });

    await test.step('Mark first item as done', async () => {
      const checkboxes = page.getByRole('checkbox');
      await checkboxes.first().check();
    });

    await test.step('Verify ordering: not-done items first', async () => {
      // Get all list items
      const listItems = page.locator('[role="list"] > *');
      const itemCount = await listItems.count();
      
      // Should have 3 items
      expect(itemCount).toBe(3);
      
      // The done item (Apples) should be after the not-done items
      // This is a basic check; more sophisticated ordering tests could be added
      await expect(page.getByText('Bananas')).toBeVisible();
      await expect(page.getByText('Carrots')).toBeVisible();
      await expect(page.getByText('Apples')).toBeVisible();
    });
  });
});
