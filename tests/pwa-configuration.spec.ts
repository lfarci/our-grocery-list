import { test, expect } from '@playwright/test';

test.describe('PWA Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Manifest is properly configured', async ({ page }) => {
    await test.step('Verify manifest link is present', async () => {
      const manifestLink = page.locator('link[rel="manifest"]');
      await expect(manifestLink).toHaveCount(1);
      const href = await manifestLink.getAttribute('href');
      expect(href).toBe('/manifest.webmanifest');
    });

    await test.step('Verify manifest is accessible', async () => {
      const response = await page.request.get('/manifest.webmanifest');
      expect(response.ok()).toBeTruthy();
      const manifest = await response.json();
      
      // Verify manifest content
      expect(manifest.name).toBe('Our Grocery List');
      expect(manifest.short_name).toBe('Grocery List');
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#ffcc00');
      expect(manifest.background_color).toBe('#ffcc00');
      expect(manifest.icons).toHaveLength(2);
    });
  });

  test('Favicon links are configured', async ({ page }) => {
    await test.step('Verify multiple favicon sizes are present', async () => {
      const faviconLinks = page.locator('link[rel="icon"]');
      const count = await faviconLinks.count();
      expect(count).toBeGreaterThanOrEqual(3); // At least 32, 64, 192
    });

    await test.step('Verify favicon icons are accessible', async () => {
      const favicon32 = await page.request.get('/icon-no-background-32.png');
      expect(favicon32.ok()).toBeTruthy();
      expect(favicon32.headers()['content-type']).toBe('image/png');
    });
  });

  test('Theme color meta tag is configured', async ({ page }) => {
    await test.step('Verify theme-color meta tag', async () => {
      const themeColorMeta = page.locator('meta[name="theme-color"]');
      await expect(themeColorMeta).toHaveCount(1);
      const content = await themeColorMeta.getAttribute('content');
      expect(content).toBe('#ffcc00');
    });
  });

  test('Apple touch icon is configured', async ({ page }) => {
    await test.step('Verify apple-touch-icon link', async () => {
      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
      await expect(appleTouchIcon).toHaveCount(1);
      const href = await appleTouchIcon.getAttribute('href');
      expect(href).toBe('/icon-yellow-background-180.png');
    });

    await test.step('Verify apple touch icon is accessible', async () => {
      const icon = await page.request.get('/icon-yellow-background-180.png');
      expect(icon.ok()).toBeTruthy();
      expect(icon.headers()['content-type']).toBe('image/png');
    });

    await test.step('Verify Apple PWA meta tags', async () => {
      const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]');
      await expect(appleMeta).toHaveCount(1);
      const content = await appleMeta.getAttribute('content');
      expect(content).toBe('yes');
      
      // Verify modern mobile-web-app-capable meta tag is present
      const mobileMeta = page.locator('meta[name="mobile-web-app-capable"]');
      await expect(mobileMeta).toHaveCount(1);
      const mobileContent = await mobileMeta.getAttribute('content');
      expect(mobileContent).toBe('yes');
    });
  });

  test('PWA icons are accessible', async ({ page }) => {
    await test.step('Verify 192x192 yellow icon is accessible', async () => {
      const icon192 = await page.request.get('/icon-yellow-background-192.png');
      expect(icon192.ok()).toBeTruthy();
      expect(icon192.headers()['content-type']).toBe('image/png');
    });

    await test.step('Verify 512x512 yellow icon is accessible', async () => {
      const icon512 = await page.request.get('/icon-yellow-background-512.png');
      expect(icon512.ok()).toBeTruthy();
      expect(icon512.headers()['content-type']).toBe('image/png');
    });
  });
});
