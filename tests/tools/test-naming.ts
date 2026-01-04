/**
 * Test naming utilities for generating unique test item names
 */
import type { TestInfo } from '@playwright/test';

// Stable for the duration of a single Playwright run to avoid accumulating
// duplicates across reruns while still keeping per-run uniqueness.
const RUN_ID = Date.now().toString(36);

/**
 * Generate a unique prefix for test items based on test title or TestInfo
 */
export function getTestPrefix(testInfo: TestInfo | string): string {
  const titlePath = typeof testInfo === 'string'
    ? [testInfo]
    : (Array.isArray((testInfo as any).titlePath) ? (testInfo as any).titlePath : [testInfo.title]);
  const title = titlePath.join('-');

  // Shorten to 15 chars to keep total name under 50 char limit (e.g., "t-abc-w0r0i0-item-Suffix" = ~35 chars)
  const sanitized = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 15);

  // Stable per test run, but unique across workers/retries
  const suffix = typeof testInfo === 'string'
    ? `run-${RUN_ID}`
    : `w${testInfo.workerIndex}r${testInfo.retry}i${testInfo.repeatEachIndex}-${RUN_ID}`;

  return `t-${sanitized}-${suffix}`;
}

const MAX_ITEM_NAME_LENGTH = 50;

/**
 * Generate a unique test item name
 */
export function makeTestItemName(testInfoOrPrefix: TestInfo | string, suffix?: string): string {
  const prefix = typeof testInfoOrPrefix === 'string' ? testInfoOrPrefix : getTestPrefix(testInfoOrPrefix);
  const base = `${prefix}-item`;
  const name = suffix ? `${base}-${suffix}` : base;

  if (name.length <= MAX_ITEM_NAME_LENGTH) {
    return name;
  }

  if (suffix) {
    const maxSuffixLength = MAX_ITEM_NAME_LENGTH - (base.length + 1);
    if (maxSuffixLength > 0) {
      return `${base}-${suffix.slice(0, maxSuffixLength)}`;
    }
  }

  return base.slice(0, MAX_ITEM_NAME_LENGTH);
}
