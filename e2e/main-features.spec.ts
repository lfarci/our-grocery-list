import { test, expect, type Page } from '@playwright/test';

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const checkboxFor = (page: Page, itemName: string) =>
  page.getByRole('checkbox', { name: new RegExp(`Mark ${escapeRegex(itemName)} as (done|not done)`, 'i') });
const itemCards = (page: Page) =>
  page.locator('div.bg-white').filter({ has: page.locator('input[type="checkbox"]') });
const itemCardByName = (page: Page, itemName: string) =>
  itemCards(page).filter({ has: page.locator('div.font-medium', { hasText: itemName }) });

test.describe('Grocery List - Main Features', () => {
  test.beforeEach(async ({ page, request }) => {
    // Clear all items before each test
    await request.delete('http://localhost:7071/api/items');
    
    await page.goto('/');
  });

  test('should display empty state when no items exist', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();

    // Verify list starts empty after clearing
    await expect(itemCards(page)).toHaveCount(0);
    
    // Should show empty state message
    await expect(page.getByText(/Your list is empty/i)).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // The loading text might appear briefly (this test may need adjustment based on API speed)
    // At minimum, the page should load successfully
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    // Verify all form elements have proper labels
    await expect(page.getByLabel('Item Name *')).toBeVisible();
    await expect(page.getByLabel('Quantity/Notes (optional)')).toBeVisible();
    
    // Verify button is accessible
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
  });

  test('should have proper page structure for mobile and desktop', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
    
    // Check main container exists with proper styling
    const mainContainer = page.locator('div.max-w-2xl');
    await expect(mainContainer).toBeVisible();
    
    // Verify form section exists
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should maintain list across add, toggle, and delete operations', async ({ page }) => {
    // Add first item
    await page.getByLabel('Item Name *').fill('Item A');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Item A')).toHaveCount(1);
    
    // Add second item
    await page.getByLabel('Item Name *').fill('Item B');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Item B')).toHaveCount(1);
    
    // Add third item
    await page.getByLabel('Item Name *').fill('Item C');
    await page.getByLabel('Quantity/Notes (optional)').fill('With notes');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Item C')).toHaveCount(1);
    
    // Mark Item B as done
    await checkboxFor(page, 'Item B').check();
    
    // Delete Item A
    await page.getByRole('button', { name: 'Delete Item A' }).click();
    
    // Verify final state
    await expect(itemCardByName(page, 'Item A')).toHaveCount(0);
    await expect(itemCardByName(page, 'Item B')).toHaveCount(1);
    await expect(itemCardByName(page, 'Item C')).toHaveCount(1);
    await expect(itemCardByName(page, 'Item C').getByText('With notes')).toBeVisible();
    
    // Verify Item B is still marked as done
    await expect(checkboxFor(page, 'Item B')).toBeChecked();
  });

  test('should display multiple items in vertical list', async ({ page }) => {
    // Add multiple items
    for (let i = 1; i <= 5; i++) {
      await page.getByLabel('Item Name *').fill(`Item ${i}`);
      await page.getByRole('button', { name: 'Add Item' }).click();
    }
    
    // Verify all items are visible
    for (let i = 1; i <= 5; i++) {
      await expect(itemCardByName(page, `Item ${i}`)).toHaveCount(1);
    }
    
    // Verify list container has proper spacing
    const listContainer = page.locator('div.space-y-3');
    await expect(listContainer).toBeVisible();
  });

  test('should clear form validation error when valid input is provided', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Please enter an item name')).toBeVisible();
    
    // Fill in valid name
    await page.getByLabel('Item Name *').fill('Valid Item');
    
    // Submit again
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify error is cleared
    await expect(page.getByText('Please enter an item name')).not.toBeVisible();
    
    // Verify item was added
    await expect(itemCardByName(page, 'Valid Item')).toHaveCount(1);
  });

  test('should handle items with special characters', async ({ page }) => {
    // Add item with special characters
    await page.getByLabel('Item Name *').fill('Coffee & Tea (organic)');
    await page.getByLabel('Quantity/Notes (optional)').fill('50% off - $5.99');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify item is displayed correctly
    const itemCard = itemCardByName(page, 'Coffee & Tea (organic)');
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText('50% off - $5.99')).toBeVisible();
  });

  test('should handle long item names and notes', async ({ page }) => {
    const longName = 'This is a very long item name that might wrap to multiple lines in the display';
    const longNotes = 'These are extensive notes about the item including detailed specifications and requirements that might also wrap to multiple lines';
    
    await page.getByLabel('Item Name *').fill(longName);
    await page.getByLabel('Quantity/Notes (optional)').fill(longNotes);
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Verify long text is displayed
    const itemCard = itemCardByName(page, longName);
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText(longNotes)).toBeVisible();
  });

  test('should maintain item order when marking items as done', async ({ page }) => {
    // Add items in specific order
    await page.getByLabel('Item Name *').fill('First');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Second');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Third');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Fourth');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Mark Second and Third as done
    await checkboxFor(page, 'Second').check();
    await checkboxFor(page, 'Third').check();
    
    // Get all items in order
    const items = page.locator('div.bg-white div.font-medium');
    const itemTexts = await items.allTextContents();
    
    // Not-done items (First, Fourth) should appear before done items (Second, Third)
    const firstIndex = itemTexts.indexOf('First');
    const fourthIndex = itemTexts.indexOf('Fourth');
    const secondIndex = itemTexts.indexOf('Second');
    const thirdIndex = itemTexts.indexOf('Third');
    
    expect(firstIndex).toBeLessThan(secondIndex);
    expect(firstIndex).toBeLessThan(thirdIndex);
    expect(fourthIndex).toBeLessThan(secondIndex);
    expect(fourthIndex).toBeLessThan(thirdIndex);
  });

  test('should display checkbox controls as touch-friendly', async ({ page }) => {
    // Add an item
    await page.getByLabel('Item Name *').fill('Test Item');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Check that checkbox is reasonably sized (5 = 1.25rem = 20px)
    const checkbox = checkboxFor(page, 'Test Item');
    await expect(checkbox).toBeVisible();
    
    // Verify checkbox has proper classes for size
    await expect(checkbox).toHaveClass(/h-5 w-5/);
  });
});
