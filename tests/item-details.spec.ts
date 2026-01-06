import { test, expect } from '@playwright/test';
import {
  addItem,
  getItemCheckbox,
  cleanupItemsByPrefix,
  getTestPrefix,
  makeTestItemName,
  archiveItemBySwipe,
  navigateToItemDetails,
  navigateBackToList,
  verifyOnMainList,
  verifyDetailsPageContent,
  toggleItemCheckbox,
  expectItemChecked,
  waitForPatchResponse,
  ADDED_TIME_PATTERN,
  EDITED_TIME_PATTERN,
  TIMEOUTS,
  getItemDetailsTitle,
} from './tools';

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
      await navigateToItemDetails(page, itemName);
    });

    await test.step('Verify details page shows correct item name', async () => {
      await expect(getItemDetailsTitle(page, itemName)).toHaveText(itemName);
    });

    await test.step('Verify details page shows status badge', async () => {
      await expect(page.getByText(/^active$/i)).toBeVisible();
    });

    await test.step('Verify details page shows creation date in relative format', async () => {
      await expect(page.getByText(ADDED_TIME_PATTERN)).toBeVisible();
    });

    await test.step('Verify notes section is present', async () => {
      await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
    });
  });

  test('Back button returns to main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'BackTest');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      await navigateToItemDetails(page, itemName);
    });

    await test.step('Click back button', async () => {
      await navigateBackToList(page);
    });

    await test.step('Verify returned to main list', async () => {
      await verifyOnMainList(page, itemName);
    });
  });

  test('Browser back button returns to main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'BrowserBack');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      await navigateToItemDetails(page, itemName);
    });

    await test.step('Use browser back button', async () => {
      await page.goBack();
    });

    await test.step('Verify returned to main list', async () => {
      await verifyOnMainList(page, itemName);
    });
  });

  test('Deep-link to item details works correctly', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'DeepLink');
    let itemId: string;

    await test.step('Add an item and navigate to get its ID', async () => {
      await addItem(page, itemName);
      itemId = await navigateToItemDetails(page, itemName);
      expect(itemId).toBeTruthy();
    });

    await test.step('Navigate directly to item via deep link', async () => {
      // Navigate back to list first
      await page.goto('/');
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
      
      // Now directly navigate to the details page using the item ID
      await page.goto(`/items/${itemId}`);
    });

    await test.step('Verify details page loads correctly', async () => {
      await verifyDetailsPageContent(page, itemName);
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
      await navigateBackToList(page);
    });
  });

  test('Swipe gestures still work on main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'SwipeTest');

    await test.step('Add an item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Archive item via swipe', async () => {
      await archiveItemBySwipe(page, itemName);
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
    });
  });

  test('Checkbox toggle still works on main list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'CheckboxTest');

    await test.step('Add an item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Toggle checkbox to checked', async () => {
      await expectItemChecked(page, itemName, false);
      await toggleItemCheckbox(page, itemName);
      await expectItemChecked(page, itemName, true);
    });

    await test.step('Toggle checkbox back to unchecked', async () => {
      await toggleItemCheckbox(page, itemName);
      await expectItemChecked(page, itemName, false);
    });
  });

  test('Clicking checkbox does not navigate to details page', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'CheckboxClick');

    await test.step('Add an item', async () => {
      await addItem(page, itemName);
    });

    await test.step('Click checkbox', async () => {
      await toggleItemCheckbox(page, itemName);
    });

    await test.step('Verify still on main list page', async () => {
      await verifyOnMainList(page);
    });
  });

  test('Refresh on details page maintains the view', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'RefreshTest');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      await navigateToItemDetails(page, itemName);
    });

    await test.step('Refresh the page', async () => {
      await page.reload();
    });

    await test.step('Verify details page still shows correct content', async () => {
      await verifyDetailsPageContent(page, itemName);
    });
  });

  test('Editing item name updates the item', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'EditName');
    const newName = makeTestItemName(test.info(), 'EditedName');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      await navigateToItemDetails(page, itemName);
    });

    await test.step('Click on item name to edit', async () => {
      await getItemDetailsTitle(page, itemName).click();
    });

    await test.step('Edit the name and save', async () => {
      const input = page.locator('input[type="text"]');
      await expect(input).toBeVisible();
      await input.fill(newName);
      
      const patchPromise = waitForPatchResponse(page);
      await input.press('Enter');
      await patchPromise;
    });

    await test.step('Verify name was updated', async () => {
      await expect(getItemDetailsTitle(page, newName)).toHaveText(newName);
    });

    await test.step('Verify edited timestamp appears', async () => {
      await expect(page.getByText(EDITED_TIME_PATTERN)).toBeVisible();
    });
  });

  test('Adding notes to an item', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'AddNotes');
    const notes = 'These are test notes for the item';

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      await navigateToItemDetails(page, itemName);
    });

    await test.step('Verify notes section shows placeholder', async () => {
      await expect(page.getByRole('heading', { name: 'Notes', level: 2 })).toBeVisible();
      await expect(page.getByText('Add notes...')).toBeVisible();
    });

    await test.step('Click on notes area to edit', async () => {
      await page.getByText('Add notes...').click();
    });

    await test.step('Add notes and save', async () => {
      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible();
      await textarea.fill(notes);
      
      const patchPromise = waitForPatchResponse(page);
      // Click outside to blur and trigger save
      await page.locator('header').click();
      await patchPromise;
    });

    await test.step('Verify notes were saved', async () => {
      await expect(page.getByText(notes)).toBeVisible();
    });
  });

  test('Quantity and unit can be edited and shown on list', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'QuantityUnit');

    await test.step('Add an item and navigate to details', async () => {
      await addItem(page, itemName);
      await navigateToItemDetails(page, itemName);
    });

    const quantityInput = page.locator('#details-quantity');
    const unitSelect = page.locator('#details-quantity-unit');

    await test.step('Quantity inputs are visible', async () => {
      await expect(quantityInput).toBeVisible();
      await expect(unitSelect).toBeVisible();
    });

    await test.step('Set quantity value', async () => {
      await quantityInput.fill('2.5');
      const patchPromise = waitForPatchResponse(page);
      await page.locator('header').click();
      await patchPromise;
      await expect(quantityInput).toHaveValue('2.5');
    });

    await test.step('Select unit and save', async () => {
      const patchPromise = waitForPatchResponse(page);
      await unitSelect.selectOption('kg');
      await patchPromise;
      await expect(unitSelect).toHaveValue('kg');
    });

    await test.step('Verify quantity and unit persist on details page', async () => {
      await expect(quantityInput).toHaveValue('2.5');
      await expect(unitSelect).toHaveValue('kg');
    });

    await test.step('Verify quantity and unit show on the main list', async () => {
      await navigateBackToList(page);
      const itemRow = page.getByRole('listitem').filter({ hasText: itemName }).first();
      await expect(itemRow).toContainText('2.5 kg');
    });
  });
});
