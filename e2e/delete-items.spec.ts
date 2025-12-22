import { test, expect, type Page } from '@playwright/test';

const itemCards = (page: Page) =>
  page.locator('div.bg-white').filter({ has: page.locator('input[type="checkbox"]') });
const itemCardByName = (page: Page, itemName: string) =>
  itemCards(page).filter({ has: page.locator('div.font-medium', { hasText: itemName }) });

test.describe('Grocery List - Delete Items', () => {
  test.beforeEach(async ({ page, request }) => {
    // Clear all items before each test
    await request.delete('http://localhost:7071/api/items');
    
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
  });

  test('should delete an item from the list', async ({ page }) => {
    // Add an item first
    await page.getByLabel('Item Name *').fill('Coffee');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Coffee')).toHaveCount(1);
    
    // Delete the item
    await page.getByRole('button', { name: 'Delete Coffee' }).click();
    
    // Verify item is removed
    await expect(itemCardByName(page, 'Coffee')).toHaveCount(0);
  });

  test('should delete the correct item when multiple items exist', async ({ page }) => {
    // Add multiple items
    await page.getByLabel('Item Name *').fill('Tea');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Tea')).toHaveCount(1);
    
    await page.getByLabel('Item Name *').fill('Sugar');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Sugar')).toHaveCount(1);
    
    await page.getByLabel('Item Name *').fill('Honey');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Honey')).toHaveCount(1);
    
    // Delete the middle item
    await page.getByRole('button', { name: 'Delete Sugar' }).click();
    
    // Verify only Sugar is removed
    await expect(itemCardByName(page, 'Tea')).toHaveCount(1);
    await expect(itemCardByName(page, 'Sugar')).toHaveCount(0);
    await expect(itemCardByName(page, 'Honey')).toHaveCount(1);
  });

  test('should delete items with notes', async ({ page }) => {
    // Add item with notes
    await page.getByLabel('Item Name *').fill('Cheese');
    await page.getByLabel('Quantity/Notes (optional)').fill('cheddar, 500g');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    const itemCard = itemCardByName(page, 'Cheese');
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText('cheddar, 500g')).toBeVisible();
    
    // Delete the item
    await page.getByRole('button', { name: 'Delete Cheese' }).click();
    
    // Verify item and notes are removed
    await expect(itemCardByName(page, 'Cheese')).toHaveCount(0);
  });

  test('should delete done items', async ({ page }) => {
    // Add an item
    await page.getByLabel('Item Name *').fill('Tomatoes');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Tomatoes')).toHaveCount(1);
    
    // Mark it as done
    await page.getByRole('checkbox', { name: 'Mark Tomatoes as done' }).check();
    
    // Delete the done item
    await page.getByRole('button', { name: 'Delete Tomatoes' }).click();
    
    // Verify item is removed
    await expect(itemCardByName(page, 'Tomatoes')).toHaveCount(0);
  });

  test('should handle deleting all items sequentially', async ({ page }) => {
    // Add three items
    await page.getByLabel('Item Name *').fill('Item 1');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Item 2');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Item 3');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify all are visible
    await expect(itemCardByName(page, 'Item 1')).toHaveCount(1);
    await expect(itemCardByName(page, 'Item 2')).toHaveCount(1);
    await expect(itemCardByName(page, 'Item 3')).toHaveCount(1);
    
    // Delete all items one by one
    await page.getByRole('button', { name: 'Delete Item 1' }).click();
    await expect(itemCardByName(page, 'Item 1')).toHaveCount(0);
    
    await page.getByRole('button', { name: 'Delete Item 2' }).click();
    await expect(itemCardByName(page, 'Item 2')).toHaveCount(0);
    
    await page.getByRole('button', { name: 'Delete Item 3' }).click();
    await expect(itemCardByName(page, 'Item 3')).toHaveCount(0);
    
    // Verify no items remain
    await expect(itemCards(page)).toHaveCount(0);
  });
});
