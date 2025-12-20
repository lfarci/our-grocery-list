import { test, expect } from '@playwright/test';

test.describe('Grocery List - Delete Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
  });

  test('should delete an item from the list', async ({ page }) => {
    // Add an item first
    await page.getByLabel('Item Name *').fill('Coffee');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Coffee')).toBeVisible();
    
    // Delete the item
    await page.getByRole('button', { name: 'Delete Coffee' }).click();
    
    // Verify item is removed
    await expect(page.getByText('Coffee')).not.toBeVisible();
    
    // Verify empty state message appears
    await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
  });

  test('should delete the correct item when multiple items exist', async ({ page }) => {
    // Add multiple items
    await page.getByLabel('Item Name *').fill('Tea');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Tea')).toBeVisible();
    
    await page.getByLabel('Item Name *').fill('Sugar');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Sugar')).toBeVisible();
    
    await page.getByLabel('Item Name *').fill('Honey');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Honey')).toBeVisible();
    
    // Delete the middle item
    await page.getByRole('button', { name: 'Delete Sugar' }).click();
    
    // Verify only Sugar is removed
    await expect(page.getByText('Tea')).toBeVisible();
    await expect(page.getByText('Sugar')).not.toBeVisible();
    await expect(page.getByText('Honey')).toBeVisible();
  });

  test('should delete items with notes', async ({ page }) => {
    // Add item with notes
    await page.getByLabel('Item Name *').fill('Cheese');
    await page.getByLabel('Quantity/Notes (optional)').fill('cheddar, 500g');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await expect(page.getByText('Cheese')).toBeVisible();
    await expect(page.getByText('cheddar, 500g')).toBeVisible();
    
    // Delete the item
    await page.getByRole('button', { name: 'Delete Cheese' }).click();
    
    // Verify item and notes are removed
    await expect(page.getByText('Cheese')).not.toBeVisible();
    await expect(page.getByText('cheddar, 500g')).not.toBeVisible();
  });

  test('should delete done items', async ({ page }) => {
    // Add an item
    await page.getByLabel('Item Name *').fill('Tomatoes');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Tomatoes')).toBeVisible();
    
    // Mark it as done
    await page.getByRole('checkbox', { name: 'Mark Tomatoes as done' }).check();
    
    // Delete the done item
    await page.getByRole('button', { name: 'Delete Tomatoes' }).click();
    
    // Verify item is removed
    await expect(page.getByText('Tomatoes')).not.toBeVisible();
    await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
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
    await expect(page.getByText('Item 1')).toBeVisible();
    await expect(page.getByText('Item 2')).toBeVisible();
    await expect(page.getByText('Item 3')).toBeVisible();
    
    // Delete all items one by one
    await page.getByRole('button', { name: 'Delete Item 1' }).click();
    await expect(page.getByText('Item 1')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Delete Item 2' }).click();
    await expect(page.getByText('Item 2')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Delete Item 3' }).click();
    await expect(page.getByText('Item 3')).not.toBeVisible();
    
    // Verify empty state
    await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
  });
});
