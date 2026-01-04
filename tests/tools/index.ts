/**
 * Test utilities barrel export
 * 
 * This module re-exports all test utilities for convenient importing.
 * 
 * Usage:
 *   import { addItem, getItemCheckbox, TIMEOUTS } from './tools';
 * 
 * Module structure:
 *   - config.ts      - Constants, timeouts, and regex patterns
 *   - test-naming.ts - Test name generation utilities
 *   - api.ts         - API response helpers
 *   - locators.ts    - Element locator helpers
 *   - actions.ts     - Item action helpers (add, swipe, toggle)
 *   - navigation.ts  - Page navigation helpers
 *   - cleanup.ts     - Test cleanup utilities
 */

// Configuration and constants
export {
  SWIPE_CONFIG,
  TIMEOUTS,
  ADDED_TIME_PATTERN,
  EDITED_TIME_PATTERN,
  TEST_ITEMS,
} from './config';

// Test naming utilities
export {
  getTestPrefix,
  makeTestItemName,
} from './test-naming';

// API response helpers
export {
  isItemsListRequest,
  waitForSearch,
  waitForPatchResponse,
  waitForPostResponse,
  waitForDeleteResponse,
} from './api';

// Element locators
export {
  getItemCheckbox,
  getItemContainer,
  getSwipeableElement,
  getAddItemInput,
  getAddItemButton,
  getMainHeading,
  getBackButton,
  getItemDetailsTitle,
} from './locators';

// Item actions
export {
  addItem,
  swipeItem,
  deleteItemBySwipe,
  archiveItemBySwipe,
  toggleItemCheckbox,
  expectItemChecked,
} from './actions';

// Navigation helpers
export {
  navigateToItemDetails,
  navigateBackToList,
  verifyOnMainList,
  verifyDetailsPageContent,
} from './navigation';

// Cleanup utilities
export {
  cleanupItemsByPrefix,
  cleanupTestItems,
  deleteAllItems,
} from './cleanup';
