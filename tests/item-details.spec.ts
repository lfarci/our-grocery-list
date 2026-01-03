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

    await test.step('Verify details page shows status badge', async () => {
      // Check for status badge - should show "Active" for new items
      await expect(page.getByText('Active', { exact: true })).toBeVisible();
    });

    await test.step('Verify details page shows creation date in relative format', async () => {
      // Check for relative time format like "Added just now" or "Added 5 minutes ago"
      await expect(page.getByText(/Added (just now|\d+ (second|minute|hour)s? ago)/)).toBeVisible();
    });

    await test.step('Verify notes section is present', async () => {
      // Check for the "Notes" heading
      await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
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
      await expect(page.getByText(/Added (just now|\d+ (second|minute|hour)s? ago)/)).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
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
      await expect(page.getByText(/Added (just now|\d+ (second|minute|hour)s? ago)/)).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
    });
  });

  test('Editing item name updates the item', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'EditName');
    const newName = makeTestItemName(test.info(), 'EditedName');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Click on item name to edit', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await heading.click();
    });

    await test.step('Edit the name and save', async () => {
      // Wait for input to appear
      const input = page.locator('input[type="text"]');
      await expect(input).toBeVisible();
      
      // Clear and type new name
      await input.fill(newName);
      
      // Wait for PATCH request to complete when blurring
      const patchPromise = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: 5000 }
      );
      
      // Press Enter to save
      await input.press('Enter');
      await patchPromise;
    });

    await test.step('Verify name was updated', async () => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText(newName);
    });

    await test.step('Verify edited timestamp appears', async () => {
      // Should now show both "Added" and "edited" times
      await expect(page.getByText(/edited (just now|\d+ (second|minute)s? ago)/)).toBeVisible();
    });
  });

  test('Adding notes to an item', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'AddNotes');
    const notes = 'These are test notes for the item';

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      const container = getItemContainer(page, itemName).first();
      const swipeableDiv = container.locator('.touch-none');
      await swipeableDiv.click({ position: { x: 100, y: 10 } });
      await page.waitForURL(`**/items/*`, { timeout: 5000 });
    });

    await test.step('Verify notes section shows placeholder', async () => {
      await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
      await expect(page.getByText('Add notes...')).toBeVisible();
    });

    await test.step('Click on notes area to edit', async () => {
      const notesArea = page.getByText('Add notes...');
      await notesArea.click();
    });

    await test.step('Add notes and save', async () => {
      // Wait for textarea to appear
      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible();
      
      // Type notes
      await textarea.fill(notes);
      
      // Wait for PATCH request to complete when blurring
      const patchPromise = page.waitForResponse(
        response => response.url().includes('/api/items') && response.request().method() === 'PATCH',
        { timeout: 5000 }
      );
      
      // Press Cmd+Enter to save (or blur the textarea)
      await textarea.press('Escape'); // Cancel to blur
      await textarea.click(); // Click again to edit
      await textarea.fill(notes);
      await page.locator('header').click(); // Click outside to blur and save
      await patchPromise;
    });

    await test.step('Verify notes were saved', async () => {
      await expect(page.getByText(notes)).toBeVisible();
    });
  });
});
