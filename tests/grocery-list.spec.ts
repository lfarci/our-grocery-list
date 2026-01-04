import { test, expect } from '@playwright/test';
import { MAX_ITEM_NAME_LENGTH } from '../frontend/src/constants';
import {
  addItem,
  getItemCheckbox,
  archiveItemBySwipe,
  cleanupItemsByPrefix,
  getTestPrefix,
  makeTestItemName,
  isItemsListRequest,
  waitForSearch,
  waitForPostResponse,
  waitForPatchResponse,
  getAddItemInput,
  getAddItemButton,
  getMainHeading,
  TIMEOUTS,
} from './tools';

test.describe('Grocery List Application', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.title.includes('Empty state message')) {
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        if (request.method() === 'GET' && isItemsListRequest(request.url())) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
          return;
        }
        await route.fallback();
      });
    }

    await page.goto('/');
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test.afterEach(async ({ page }, testInfo) => {
    await cleanupItemsByPrefix(page, getTestPrefix(testInfo));
  });

  test('Smoke test - Application loads successfully', async ({ page }) => {
    await test.step('Verify page title', async () => {
      await expect(page).toHaveTitle('Our Grocery List');
    });

    await test.step('Verify main heading is visible', async () => {
      await expect(getMainHeading(page)).toBeVisible();
    });
  });

  test('Main screen - Display list title and add form', async ({ page }) => {
    await test.step('Verify list title is present', async () => {
      await expect(getMainHeading(page)).toBeVisible();
    });

    await test.step('Verify add item form is present', async () => {
      await expect(getAddItemInput(page)).toBeVisible();
      await expect(getAddItemButton(page)).toBeVisible();
    });
  });

  test('Adding items - Empty input does nothing', async ({ page }) => {
    await test.step('Try to add item with empty name', async () => {
      await getAddItemButton(page).click();
    });

    await test.step('Verify validation error message appears', async () => {
      await expect(page.getByText('Please enter an item name')).toBeVisible();
    });

    await test.step('Verify no item with empty name was created', async () => {
      // Verify list structure remains valid (no empty items)
      const items = page.locator('[data-testid^="item-container-"]');
      const count = await items.count();
      
      for (let i = 0; i < count; i++) {
        const testId = await items.nth(i).getAttribute('data-testid');
        // Test ID format is item-container-{name}, so name should not be empty
        expect(testId).not.toBe('item-container-');
      }
    });
  });

  test(`Adding items - Validate item name exceeds ${MAX_ITEM_NAME_LENGTH} characters`, async ({ page }) => {
    const longItemName = 'A'.repeat(MAX_ITEM_NAME_LENGTH + 1);
    const expectedError = `Item name must be ${MAX_ITEM_NAME_LENGTH} characters or less`;

    await test.step('Try to add item with name > 50 characters', async () => {
      await getAddItemInput(page).fill(longItemName);
      await getAddItemButton(page).click();
    });

    await test.step('Verify validation error message appears', async () => {
      await expect(page.getByText(expectedError)).toBeVisible();
    });

    await test.step('Verify validation prevents form submission', async () => {
      await expect(page.getByText(expectedError)).toBeVisible();
      await expect(getAddItemInput(page)).toHaveValue(longItemName);
    });
  });

  test('Viewing the list - Empty state message', async ({ page }) => {
    await test.step('Verify empty state message when no items', async () => {
      await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
    });
  });

  test('Autocomplete - Show suggestions when typing', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Apples');

    await test.step('Add an item to the list', async () => {
      await addItem(page, itemName);
    });

    await test.step('Start typing similar name', async () => {
      const query = 'App';
      const responsePromise = waitForSearch(page, query);
      await getAddItemInput(page).fill(query);
      await responsePromise;
    });

    await test.step('Verify suggestions appear', async () => {
      await expect(page.getByText('Already in List')).toBeVisible();
      await expect(page.getByRole('button', { name: itemName })).toBeVisible();
    });
  });

  test('Autocomplete - Add new item when no exact match', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Bananas');

    await test.step('Type a new item name', async () => {
      const responsePromise = waitForSearch(page, itemName);
      await getAddItemInput(page).fill(itemName);
      await responsePromise;
    });

    await test.step('Add item from suggestions CTA', async () => {
      const addNewButton = page.getByRole('button', { name: `Add "${itemName}" as new item` });
      const responsePromise = waitForPostResponse(page);
      await addNewButton.click();
      await responsePromise;
    });

    await test.step('Verify item was added to list', async () => {
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible({ timeout: TIMEOUTS.ITEM_APPEAR });
    });
  });

  test('Autocomplete - Add new item CTA appears even with 0 suggestions', async ({ page }) => {
    // Use a unique string that won't match any existing items
    const uniqueItemName = makeTestItemName(test.info(), 'NoSuggestions');
    
    await test.step('Type a unique item name that has no suggestions', async () => {
      const responsePromise = waitForSearch(page, uniqueItemName);
      await getAddItemInput(page).fill(uniqueItemName);
      await responsePromise;
    });

    await test.step('Verify "Add new item" button appears', async () => {
      await expect(page.getByRole('button', { name: `Add "${uniqueItemName}" as new item` })).toBeVisible();
    });
  });

  test('Autocomplete - Close suggestions and clear input on outside click', async ({ page }) => {
    const query = makeTestItemName(test.info(), 'OutsideClick');

    await test.step('Type in the input to show suggestions', async () => {
      const responsePromise = waitForSearch(page, query);
      await getAddItemInput(page).fill(query);
      await responsePromise;

      await expect(page.getByRole('button', { name: `Add "${query}" as new item` })).toBeVisible();
    });

    await test.step('Verify input has text', async () => {
      await expect(getAddItemInput(page)).toHaveValue(query);
    });

    await test.step('Click outside the form area', async () => {
      await getMainHeading(page).click();
    });

    await test.step('Verify input is cleared and suggestions are closed', async () => {
      await expect(getAddItemInput(page)).toHaveValue('');

      await expect(page.getByRole('button', { name: `Add "${query}" as new item` })).toHaveCount(0);
    });
  });

  test('Autocomplete - Restore archived item via suggestion', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Grapes');
    
    await test.step('Add item to the list', async () => {
      await addItem(page, itemName);
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible();
    });

    await test.step('Archive the item', async () => {
      await archiveItemBySwipe(page, itemName);
      await expect(getItemCheckbox(page, itemName)).not.toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
    });

    await test.step('Type item name to see archived suggestion', async () => {
      const responsePromise = waitForSearch(page, itemName);
      await getAddItemInput(page).fill(itemName);
      await responsePromise;
    });

    await test.step('Verify "Recently Used (Archived)" section appears', async () => {
      await expect(page.getByText('Recently Used (Archived)')).toBeVisible();
      await expect(page.getByRole('button', { name: itemName })).toBeVisible();
    });

    await test.step('Select archived suggestion to restore', async () => {
      const restoreResponse = waitForPatchResponse(page);
      await page.getByRole('button', { name: itemName }).click();
      await restoreResponse;
    });

    await test.step('Verify item is restored to active list', async () => {
      await expect(getItemCheckbox(page, itemName).first()).toBeVisible({ timeout: TIMEOUTS.VISIBILITY });
    });
  });

  test('Autocomplete - Active duplicates are allowed', async ({ page }) => {
    const itemName = makeTestItemName(test.info(), 'Milk');

    await test.step('Add an active item', async () => {
      await addItem(page, itemName);
      await expect(getItemCheckbox(page, itemName)).toHaveCount(1);
    });

    await test.step('Type exact name and use "Add another" CTA', async () => {
      const responsePromise = waitForSearch(page, itemName);
      await getAddItemInput(page).fill(itemName);
      await responsePromise;

      const addAnother = page.getByRole('button', { name: `Add another "${itemName}"` });
      await expect(addAnother).toBeVisible();

      const postResponse = waitForPostResponse(page);
      await addAnother.click();
      await postResponse;
    });

    await test.step('Verify duplicate item was added', async () => {
      await expect(getItemCheckbox(page, itemName)).toHaveCount(2);
    });
  });
});
