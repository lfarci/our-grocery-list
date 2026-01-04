/**
 * API response helpers for waiting on specific request types
 */
import { Page } from '@playwright/test';
import { TIMEOUTS } from './config';

/**
 * Checks if a URL is an items list request
 */
export function isItemsListRequest(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.endsWith('/api/items');
  } catch {
    return url.includes('/api/items');
  }
}

/**
 * Wait for a search API response for a specific query
 */
export function waitForSearch(page: Page, query: string) {
  return page.waitForResponse(response => {
    if (response.request().method() !== 'GET') return false;
    try {
      const url = new URL(response.url());
      return url.pathname.endsWith('/api/items/search') && url.searchParams.get('q') === query;
    } catch {
      return response.url().includes('/api/items/search') && response.url().includes(`q=${encodeURIComponent(query)}`);
    }
  }, { timeout: TIMEOUTS.API });
}

/**
 * Wait for a PATCH API response (used for updates, archiving, toggling)
 */
export function waitForPatchResponse(page: Page) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      const method = response.request().method();
      // Match /api/items/{id} pattern for PATCH requests
      return method === 'PATCH' && /\/api\/items\/[^/]+/.test(url);
    },
    { timeout: TIMEOUTS.API }
  );
}

/**
 * Wait for a POST API response (used for creating items)
 */
export function waitForPostResponse(page: Page) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      const method = response.request().method();
      // Match POST to /api/items but not /api/items/search or /api/items/{id}
      return method === 'POST' && (url.endsWith('/api/items') || !!url.match(/\/api\/items$/));
    },
    { timeout: TIMEOUTS.API }
  );
}

/**
 * Wait for a DELETE API response (used for deleting items)
 */
export function waitForDeleteResponse(page: Page) {
  return page.waitForResponse(
    response => response.url().includes('/api/items') && response.request().method() === 'DELETE',
    { timeout: TIMEOUTS.API }
  );
}
