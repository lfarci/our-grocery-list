import { test, expect, type Page } from '@playwright/test';

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const checkboxFor = (page: Page, itemName: string) =>
  page.getByRole('checkbox', { name: new RegExp(`Mark ${escapeRegex(itemName)} as (done|not done)`, 'i') });
const itemCards = (page: Page) =>
  page.locator('div.bg-white').filter({ has: page.locator('input[type="checkbox"]') });
const itemCardByName = (page: Page, itemName: string) =>
  itemCards(page).filter({ has: page.locator('div.font-medium', { hasText: itemName }) });

test.describe('Grocery List - Toggle Done Status', () => {
  test.beforeEach(async ({ page, request }) => {
    // Clear all items before each test
    await request.delete('http://localhost:7071/api/items');
    
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Our Grocery List' })).toBeVisible();
  });

  test('should mark an item as done', async ({ page }) => {
    // Add an item
    await page.getByLabel('Item Name *').fill('Pasta');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Pasta')).toHaveCount(1);
    
    // Get the checkbox and verify it's not checked
    const checkbox = checkboxFor(page, 'Pasta');
    await expect(checkbox).not.toBeChecked();
    
    // Mark as done
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Verify visual styling changes (opacity and strikethrough)
    const itemContainer = page.locator('div.bg-white').filter({ hasText: 'Pasta' });
    await expect(itemContainer).toHaveClass(/opacity-60/);
    
    const itemName = itemContainer.locator('div.font-medium');
    await expect(itemName).toHaveClass(/line-through/);
  });

  test('should unmark a done item', async ({ page }) => {
    // Add an item
    await page.getByLabel('Item Name *').fill('Rice');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(itemCardByName(page, 'Rice')).toHaveCount(1);
    
    const checkbox = checkboxFor(page, 'Rice');
    
    // Mark as done
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Unmark as done
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    
    // Verify visual styling is restored
    const itemContainer = page.locator('div.bg-white').filter({ hasText: 'Rice' });
    await expect(itemContainer).not.toHaveClass(/opacity-60/);
    
    const itemName = itemContainer.locator('div.font-medium');
    await expect(itemName).not.toHaveClass(/line-through/);
  });

  test('should toggle item status multiple times', async ({ page }) => {
    // Add an item
    await page.getByLabel('Item Name *').fill('Chicken');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    const checkbox = checkboxFor(page, 'Chicken');
    
    // Toggle multiple times
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should maintain done status independently for multiple items', async ({ page }) => {
    // Add multiple items
    await page.getByLabel('Item Name *').fill('Carrots');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Onions');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Potatoes');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Mark only the middle item as done
    const onionsCheckbox = checkboxFor(page, 'Onions');
    await onionsCheckbox.check();
    
    // Verify states
    await expect(checkboxFor(page, 'Carrots')).not.toBeChecked();
    await expect(onionsCheckbox).toBeChecked();
    await expect(checkboxFor(page, 'Potatoes')).not.toBeChecked();
  });

  test('should apply done styling to items with notes', async ({ page }) => {
    // Add item with notes
    await page.getByLabel('Item Name *').fill('Yogurt');
    await page.getByLabel('Quantity/Notes (optional)').fill('Greek, plain');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    const itemCard = itemCardByName(page, 'Yogurt');
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText('Greek, plain')).toBeVisible();
    
    // Mark as done
    const checkbox = checkboxFor(page, 'Yogurt');
    await checkbox.check();
    
    // Verify both name and notes have styling
    const itemContainer = page.locator('div.bg-white').filter({ hasText: 'Yogurt' });
    await expect(itemContainer).toHaveClass(/opacity-60/);
    
    const itemName = itemContainer.locator('div.font-medium');
    await expect(itemName).toHaveClass(/line-through/);
  });

  test('should order done items after not-done items', async ({ page }) => {
    // Add three items
    await page.getByLabel('Item Name *').fill('First Item');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Second Item');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    await page.getByLabel('Item Name *').fill('Third Item');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Mark the first item as done
    await checkboxFor(page, 'First Item').check();
    
    // Get all item names in order
    const items = page.locator('div.bg-white div.font-medium');
    const itemTexts = await items.allTextContents();
    
    // Done items should appear after not-done items
    // Second Item and Third Item should come before First Item
    expect(itemTexts.indexOf('Second Item')).toBeLessThan(itemTexts.indexOf('First Item'));
    expect(itemTexts.indexOf('Third Item')).toBeLessThan(itemTexts.indexOf('First Item'));
  });

  test('should preserve item data when toggling done status', async ({ page }) => {
    // Add item with notes
    await page.getByLabel('Item Name *').fill('Special Item');
    await page.getByLabel('Quantity/Notes (optional)').fill('Important notes here');
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Toggle done status
    const checkbox = checkboxFor(page, 'Special Item');
    await checkbox.check();
    await checkbox.uncheck();
    await checkbox.check();
    
    // Verify data is still intact
    const itemCard = itemCardByName(page, 'Special Item');
    await expect(itemCard).toHaveCount(1);
    await expect(itemCard.getByText('Important notes here')).toBeVisible();
  });
});
