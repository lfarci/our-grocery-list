import { test, expect } from '@playwright/test';
import {
  addItem,
  getItemCheckbox,
  getItemContainer,
  cleanupItemsByPrefix,
  getTestPrefix,
  makeTestItemName,
  archiveItemBySwipe,
  SWIPE_CONFIG,
} from './test-utils';

test.describe('Item Details Page', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test.afterEach(async ({ page }, testInfo) => {
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test('Clicking an item opens details page with correct content', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'TestItem');

    await test.step('Add an item to the list', async () => {
      await addItem(page, itemName);
    });

    await test.step('Click on the item to open details', async () => {
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      
      // Click on the item content area (not on the checkbox)
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      
      // Wait for navigation to details page
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Verify details page shows correct item name', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText(itemName);
    });

    await test.step('Verify details page shows created date', async () => {
      // Check for the "Created" label
      await expect(page.getByText('Created')).toBeVisible();
      
      // Verify there's a date displayed (should contain month/day/year)
      const datePattern = /\w+\s+\d{1,2},\s+\d{4}/; // e.g., "January 3, 2026"
      const dateText = page.locator('dd').first();
      await expect(dateText).toBeVisible();
      const dateValue = await dateText.textContent();
      expect(dateValue).toMatch(datePattern);
    });
  });

  test('Back button returns to main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'BackTest');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Click back button', async () => {
      const backButton = page.getByRole('button', { name: /back to list/i });
      await expect(backButton).toBeVisible();
      await backButton.click();
    });

    await test.step('Verify returned to main list', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: /Our Grocery List/i })).toBeVisible();
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
    });
  });

  test('Browser back button returns to main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'BrowserBack');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Use browser back button', async () => {
      await page.goBack();
    });

    await test.step('Verify returned to main list', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: /Our Grocery List/i })).toBeVisible();
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
    });
  });

  test('Deep-link to item details works correctly', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'DeepLink');

    await test.step('Add an item to get its ID', async () => {
      await addItem(page, itemName);
    });

    await test.step('Get item ID from the page', async () => {
      // Navigate via click to get the URL with the ID
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Get the item ID from current URL', async () => {
      const currentUrl = page.url();
      const itemId = currentUrl.split('/items/')[1];
      expect(itemId).toBeTruthy();
      
      // Navigate back to list
      await page.goto('/');
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
      
      // Now directly navigate to the details page using the item ID
      await page.goto(`/items/${itemId}`);
    });

    await test.step('Verify details page loads correctly', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText(itemName);
      await expect(page.getByText('Created')).toBeVisible();
    });
  });

  test('Navigating to non-existent item shows not-found state', async ({ page }) => {
    await test.step('Navigate to invalid item ID', async () => {
      await page.goto('/items/non-existent-item-id-12345');
    });

    await test.step('Verify not-found message appears', async () => {
      await expect(page.getByRole('heading', { name: /Item Not Found/i })).toBeVisible();
      await expect(page.getByText(/doesn't exist or may have been deleted/i)).toBeVisible();
    });

    await test.step('Verify back button works from not-found state', async () => {
      const backButton = page.getByRole('button', { name: /back to list/i });
      await expect(backButton).toBeVisible();
      await backButton.click();
      await expect(page).toHaveURL('/');
    });
  });

  test('Swipe gestures still work on main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'SwipeTest');

    await test.step('Add an item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Archive item via swipe', async () => {
      await archiveItemBySwipe(page, itemName);
      
      // Wait for item to be removed from the list
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible({ timeout: 5000 });
    });
  });

  test('Checkbox toggle still works on main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'CheckboxTest');

    await test.step('Add an item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Toggle checkbox to checked', async () => {
      const checkbox = getItemCheckbox(page, itemName).first();
      await expect(checkbox).not.toBeChecked();
      
      // Wait for the PATCH request to complete
      const patchPromise = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: SWIPE_CONFIG.TIMEOUT }
      );
      
      await checkbox.click();
      await patchPromise;
      
      await expect(checkbox).toBeChecked();
    });

    await test.step('Toggle checkbox back to unchecked', async () => {
      const checkbox = getItemCheckbox(page, itemName).first();
      
      const patchPromise = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: SWIPE_CONFIG.TIMEOUT }
      );
      
      await checkbox.click();
      await patchPromise;
      
      await expect(checkbox).not.toBeChecked();
    });
  });

  test('Clicking checkbox does not navigate to details page', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'CheckboxClick');

    await test.step('Add an item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Click checkbox', async () => {
      const checkbox = getItemCheckbox(page, itemName).first();
      
      const patchPromise = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: SWIPE_CONFIG.TIMEOUT }
      );
      
      await checkbox.click();
      await patchPromise;
    });

    await test.step('Verify still on main list page', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: /Our Grocery List/i })).toBeVisible();
    });
  });

  test('Refresh on details page maintains the view', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'RefreshTest');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Refresh the page', async () => {
      await page.reload();
    });

    await test.step('Verify details page still shows correct content', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText(itemName);
      await expect(page.getByText('Created')).toBeVisible();
    });
  });

  test('Edit item name from details page', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'EditTest');
    const newName = makeTestItemName(test.info(), 'EditedName');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Click Edit button', async () => {
      const editButton = page.getByRole('button', { name: /edit item name/i });
      await expect(editButton).toBeVisible();
      await editButton.click();
    });

    await test.step('Verify edit mode is active', async () => {
      const nameInput = page.getByRole('textbox', { name: /item name/i });
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveValue(itemName);
      await expect(page.getByRole('button', { name: /^save$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    await test.step('Change the name and save', async () => {
      const nameInput = page.getByRole('textbox', { name: /item name/i });
      await nameInput.fill(newName);

      const patchPromise = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: SWIPE_CONFIG.TIMEOUT }
      );

      await page.getByRole('button', { name: /^save$/i }).click();
      await patchPromise;
    });

    await test.step('Verify view mode shows updated name', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText(newName);
      await expect(page.getByRole('button', { name: /edit item name/i })).toBeVisible();
    });

    await test.step('Verify updated name appears in main list', async () => {
      await page.goto('/');
      await expect(getItemCheckbox(page, newName).first()).toBeVisible();
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible();
    });
  });

  test('Cancel editing item name', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'CancelEdit');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Start editing and change the name', async () => {
      await page.getByRole('button', { name: /edit item name/i }).click();
      const nameInput = page.getByRole('textbox', { name: /item name/i });
      await nameInput.fill('This should not be saved');
    });

    await test.step('Click Cancel button', async () => {
      await page.getByRole('button', { name: /cancel/i }).click();
    });

    await test.step('Verify original name is still displayed', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText(itemName);
      await expect(page.getByRole('button', { name: /edit item name/i })).toBeVisible();
    });
  });

  test('Validate empty item name', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'EmptyValidation');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Try to save empty name', async () => {
      await page.getByRole('button', { name: /edit item name/i }).click();
      const nameInput = page.getByRole('textbox', { name: /item name/i });
      await nameInput.fill('   ');
      await page.getByRole('button', { name: /^save$/i }).click();
    });

    await test.step('Verify error message is shown', async () => {
      await expect(page.getByRole('alert')).toContainText(/cannot be empty/i);
      // Should still be in edit mode
      await expect(page.getByRole('textbox', { name: /item name/i })).toBeVisible();
    });
  });

  test('Validate item name length', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'LengthValidation');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Try to save name longer than 50 characters', async () => {
      await page.getByRole('button', { name: /edit item name/i }).click();
      const nameInput = page.getByRole('textbox', { name: /item name/i });
      await nameInput.fill('A'.repeat(51));
      await page.getByRole('button', { name: /^save$/i }).click();
    });

    await test.step('Verify error message is shown', async () => {
      await expect(page.getByRole('alert')).toContainText(/50 characters or less/i);
      // Should still be in edit mode
      await expect(page.getByRole('textbox', { name: /item name/i })).toBeVisible();
    });
  });
});
