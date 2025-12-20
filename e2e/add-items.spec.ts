import { test, expect } from '@playwright/test';

test.describe('Grocery List - Add Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
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
    await expect(page.getByText('Milk')).toBeVisible();
    
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
    await expect(page.getByText('Bread')).toBeVisible();
    await expect(page.getByText('2 loaves, whole wheat')).toBeVisible();
    
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
    await expect(page.getByText('Eggs')).toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    // Try to submit with empty name
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Please enter an item name')).toBeVisible();
    
    // Verify no item was added to the list
    await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
  });

  test('should not add item with only whitespace in name', async ({ page }) => {
    // Fill in only whitespace
    await page.getByLabel('Item Name *').fill('   ');
    
    // Click the Add button
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Please enter an item name')).toBeVisible();
    
    // Verify no item was added
    await expect(page.getByText('Your list is empty. Add something above.')).toBeVisible();
  });

  test('should add multiple items sequentially', async ({ page }) => {
    // Add first item
    await page.getByLabel('Item Name *').fill('Apples');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Apples')).toBeVisible();
    
    // Add second item
    await page.getByLabel('Item Name *').fill('Oranges');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Oranges')).toBeVisible();
    
    // Add third item
    await page.getByLabel('Item Name *').fill('Bananas');
    await page.getByLabel('Quantity/Notes (optional)').fill('1 bunch');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Bananas')).toBeVisible();
    await expect(page.getByText('1 bunch')).toBeVisible();
    
    // Verify all items are visible
    await expect(page.getByText('Apples')).toBeVisible();
    await expect(page.getByText('Oranges')).toBeVisible();
    await expect(page.getByText('Bananas')).toBeVisible();
  });

  test('should trim whitespace from item name and notes', async ({ page }) => {
    // Fill with leading/trailing whitespace
    await page.getByLabel('Item Name *').fill('  Butter  ');
    await page.getByLabel('Quantity/Notes (optional)').fill('  unsalted  ');
    
    // Submit
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify trimmed values are stored
    await expect(page.getByText('Butter')).toBeVisible();
    await expect(page.getByText('unsalted')).toBeVisible();
  });
});
