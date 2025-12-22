import { test, expect, type Page } from '@playwright/test';

const itemCards = (page: Page) =>
  page.locator('div.bg-white').filter({ has: page.locator('input[type="checkbox"]') });
const itemCardByName = (page: Page, itemName: string) =>
  itemCards(page).filter({ has: page.locator('div.font-medium', { hasText: itemName }) });

test.describe('Grocery List - Add Items', () => {
  test.beforeEach(async ({ page, request }) => {
    // Clear all items before each test
    await request.delete('http://localhost:7071/api/items');
    
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
    
    // Wait for the initial load to complete and verify list is empty
    await expect(itemCards(page)).toHaveCount(0, { timeout: 10000 });
  });

  test('should display the main page with title and form', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
    
    // Check form inputs are present
    await expect(page.getByLabel('Item Name *')).toBeVisible();
    await expect(page.getByLabel('Quantity/Notes (optional)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
  });

  test('should add an item with name only', async ({ page }) => {
    // Fill in the item name
    await page.getByLabel('Item Name *').fill('Milk');
    
    // Click the Add button
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify item appears in the list
    await expect(itemCardByName(page, 'Milk')).toHaveCount(1);
    
    // Verify form is cleared
    await expect(page.getByLabel('Item Name *')).toHaveValue('');
  });

  test('should add an item with name and notes', async ({ page }) => {
    // Fill in both fields
    await page.getByLabel('Item Name *').fill('Bread');
    await page.getByLabel('Quantity/Notes (optional)').fill('2 loaves, whole wheat');
    
    // Click the Add button
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify item and notes appear in the list
    const itemCard = itemCardByName(page, 'Bread');
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText('2 loaves, whole wheat')).toBeVisible();
    
    // Verify form is cleared
    await expect(page.getByLabel('Item Name *')).toHaveValue('');
    await expect(page.getByLabel('Quantity/Notes (optional)')).toHaveValue('');
  });

  test('should add item by pressing Enter in name field', async ({ page }) => {
    // Fill in the item name
    await page.getByLabel('Item Name *').fill('Eggs');
    
    // Press Enter
    await page.getByLabel('Item Name *').press('Enter');
    
    // Verify item appears in the list
    await expect(itemCardByName(page, 'Eggs')).toHaveCount(1);
  });

  test('should show validation error for empty name', async ({ page }) => {
    const initialCount = await itemCards(page).count();

    // Try to submit with empty name
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Please enter an item name')).toBeVisible();

    // Verify no item was added to the list
    await expect(itemCards(page)).toHaveCount(initialCount);
  });

  test('should not add item with only whitespace in name', async ({ page }) => {
    const initialCount = await itemCards(page).count();

    // Fill in only whitespace
    await page.getByLabel('Item Name *').fill('   ');
    
    // Click the Add button
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Please enter an item name')).toBeVisible();
    
    // Verify no item was added
    await expect(itemCards(page)).toHaveCount(initialCount);
  });

  test('should add multiple items sequentially', async ({ page }) => {
    // Add first item
    await page.getByLabel('Item Name *').fill('Apples');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Apples')).toHaveCount(1);
    
    // Add second item
    await page.getByLabel('Item Name *').fill('Oranges');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForTimeout(500); // Give React time to update
    await expect(itemCardByName(page, 'Oranges')).toHaveCount(1);
    
    // Add third item
    await page.getByLabel('Item Name *').fill('Bananas');
    await page.getByLabel('Quantity/Notes (optional)').fill('1 bunch');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForTimeout(500); // Give React time to update
    await expect(itemCardByName(page, 'Bananas')).toHaveCount(1);
    await expect(itemCardByName(page, 'Bananas').getByText('1 bunch')).toBeVisible();
    
    // Verify all items are visible
    await expect(itemCardByName(page, 'Apples')).toHaveCount(1);
    await expect(itemCardByName(page, 'Oranges')).toHaveCount(1);
    await expect(itemCardByName(page, 'Bananas')).toHaveCount(1);
  });

  test('should trim whitespace from item name and notes', async ({ page }) => {
    // Fill with leading/trailing whitespace
    await page.getByLabel('Item Name *').fill('  Butter  ');
    await page.getByLabel('Quantity/Notes (optional)').fill('  unsalted  ');
    
    // Submit
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify trimmed values are stored
    const itemCard = itemCardByName(page, 'Butter');
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText('unsalted')).toBeVisible();
  });
});
