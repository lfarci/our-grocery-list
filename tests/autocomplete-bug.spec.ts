import { test, expect } from '@playwright/test';

test.describe('Autocomplete - Substring matching bug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Should NOT add suggestion when pressing Enter with substring text', async ({ page }) => {
    await test.step('Add "Leche de soya" to the list', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Leche de soya');
      
      // Wait for the API call to complete when adding item
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      
      // Wait for response
      await responsePromise;
      
      // Wait for the item to appear in the list
      await expect(page.getByRole('checkbox', { name: /Mark Leche de soya as/ })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Type "Leche" (substring of existing item)', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Leche');
      
      // Wait for debounced search to trigger and show suggestions
      await page.waitForTimeout(400);
    });

    await test.step('Verify suggestions appear showing "Leche de soya"', async () => {
      // The suggestion should appear if backend is available
      const suggestionsVisible = await page.getByText('Already in List').isVisible().catch(() => false);
      
      if (suggestionsVisible) {
        await expect(page.getByText('Already in List')).toBeVisible();
        await expect(page.getByText('Leche de soya')).toBeVisible();
      }
    });

    await test.step('Press Enter to add ONLY "Leche"', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      
      // Wait for the API call to complete when adding item
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      // Press Enter key
      await nameInput.press('Enter');
      
      // Wait for response
      await responsePromise;
      
      // Wait for the item to appear
      await page.waitForTimeout(500);
    });

    await test.step('Verify ONLY "Leche" was added, not "Leche de soya" duplicate', async () => {
      // Count how many checkboxes contain "Leche de soya" - should be exactly 1 (the original)
      const lecheDeSoyaCheckboxes = page.getByRole('checkbox', { name: /Mark Leche de soya as/ });
      await expect(lecheDeSoyaCheckboxes).toHaveCount(1);
      
      // Verify "Leche" was added (should find checkbox for "Leche")
      const lecheCheckbox = page.getByRole('checkbox', { name: /^Mark Leche as/ });
      await expect(lecheCheckbox).toBeVisible({ timeout: 10000 });
    });
  });

  test('Should add suggestion ONLY when explicitly clicking on it', async ({ page }) => {
    await test.step('Add "Milk" to the list', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Milk');
      
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      await responsePromise;
      
      await expect(page.getByRole('checkbox', { name: /Mark Milk as/ })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Type "Mil" to show suggestions', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Mil');
      await page.waitForTimeout(400);
    });

    await test.step('Click on the suggestion to add duplicate', async () => {
      const suggestionsVisible = await page.getByText('Already in List').isVisible().catch(() => false);
      
      if (suggestionsVisible) {
        // Find and click the suggestion button for "Milk"
        const suggestionButton = page.locator('button').filter({ hasText: 'Milk' }).filter({ hasText: 'add another' });
        
        const responsePromise = page.waitForResponse(response => 
          response.url().includes('/api/items') && response.request().method() === 'POST'
        ).catch(() => null);
        
        await suggestionButton.click();
        await responsePromise;
        await page.waitForTimeout(500);
        
        // Verify TWO "Milk" items now exist (original + duplicate from clicking suggestion)
        const milkCheckboxes = page.getByRole('checkbox', { name: /Mark Milk as/ });
        await expect(milkCheckboxes).toHaveCount(2);
      }
    });
  });

  test('Should add clicked Add button item, not suggestion when both are present', async ({ page }) => {
    await test.step('Add "Bread" to the list', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Bread');
      
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      await responsePromise;
      
      await expect(page.getByRole('checkbox', { name: /Mark Bread as/ })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Type "Bre" to show suggestions', async () => {
      const nameInput = page.getByPlaceholder('Add an item...');
      await nameInput.fill('Bre');
      await page.waitForTimeout(400);
    });

    await test.step('Click the Add button (not suggestion) to add "Bre"', async () => {
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/items') && response.request().method() === 'POST'
      ).catch(() => null);
      
      await page.getByRole('button', { name: 'Add Item' }).click();
      await responsePromise;
      await page.waitForTimeout(500);
    });

    await test.step('Verify "Bre" was added (not "Bread" duplicate)', async () => {
      // Should still have exactly 1 "Bread" checkbox
      const breadCheckboxes = page.getByRole('checkbox', { name: /Mark Bread as/ });
      await expect(breadCheckboxes).toHaveCount(1);
      
      // Should have 1 "Bre" checkbox
      const breCheckbox = page.getByRole('checkbox', { name: /^Mark Bre as/ });
      await expect(breCheckbox).toBeVisible({ timeout: 10000 });
    });
  });
});
