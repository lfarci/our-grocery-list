/**
 * Configuration constants for test utilities
 */

/**
 * Configuration for swipe operations
 */
export const SWIPE_CONFIG = {
  THRESHOLD: 100,  // pixels to trigger action (matches component)
  DISTANCE: 130,   // pixels to swipe (must exceed THRESHOLD)
  STEP_SIZE: 10,   // pixels per step for smooth animation
  STEPS: 10,       // animation steps for smooth movement
  STEP_DELAY: 10,  // delay between swipe steps in ms
  TIMEOUT: 5000,   // API response timeout
} as const;

/**
 * Navigation and wait timeouts
 */
export const TIMEOUTS = {
  API: 10000,
  NAVIGATION: 5000,
  VISIBILITY: 5000,
  ITEM_APPEAR: 10000,
} as const;

// ============================================================================
// Regex Patterns for Assertions
// ============================================================================

/**
 * Pattern to match relative time format for "Added" timestamps
 * Matches: "Added just now", "Added 5 minutes ago", etc.
 */
export const ADDED_TIME_PATTERN = /Added (just now|\d+ (second|minute|hour)s? ago)/;

/**
 * Pattern to match relative time format for "edited" timestamps
 */
export const EDITED_TIME_PATTERN = /edited (just now|\d+ (second|minute)s? ago)/;

/**
 * Standard test item names used across tests.
 */
export const TEST_ITEMS = ['Bananas', 'Apples', 'Oranges'] as const;
