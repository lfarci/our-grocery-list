---
goal: Stabilize Playwright tests for V1 (reduce flakes, remove hidden assumptions, enforce resilient locators)
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'Planned'
tags: [process, testing, playwright, stability, v1]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan makes the Playwright suite reliable by removing timing assumptions, making cleanup deterministic (especially with duplicates), and aligning assertions with the V1 UX.

## 1. Requirements & Constraints

- **REQ-001**: Prefer role/label/text locators (playwright.instructions.md).
- **REQ-002**: Prefer web-first assertions; avoid hard-coded waits unless unavoidable (playwright.instructions.md).
- **REQ-003**: Tests must pass consistently on `npx playwright test --project=chromium` (repo testing guidance).
- **CON-001**: Do not rewrite tests unrelated to V1 core flows; focus only on flakiness and spec alignment.

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Make setup/cleanup deterministic.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | In tests/test-utils.ts, change cleanup strategy to delete all occurrences of each test item name reliably even if duplicates exist. Do not rely on a single swipe deleting the intended instance. |  |  |
| TASK-002 | Replace any fixed `waitForTimeout` used as “backend debounce wait” with assertions that wait for observable UI or network events (e.g., `waitForResponse` or `expect(...).toHaveText`). Keep small timeouts only where required for gesture simulation. |  |  |

### Implementation Phase 2

- **GOAL-002**: Remove environment coupling.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-003 | Ensure each test that requires backend behavior explicitly waits for the relevant HTTP response, and gracefully skips only the specific assertion if the backend is not available (do not silently pass entire test). |  |  |
| TASK-004 | Ensure SignalR is never required for observing item creation/update/delete in tests; tests must rely on HTTP response + UI update. |  |  |

### Implementation Phase 3

- **GOAL-003**: Tighten locators and assertions.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-005 | Replace brittle CSS locators (e.g., `.absolute.z-10.w-full`) with role/text-based locators, or add stable `aria-*`/`data-testid` attributes in the UI where needed and use those in tests. |  |  |
| TASK-006 | Add `test.step()` groupings to complex tests (already used in many places) and ensure failures point to clear steps. |  |  |

## 3. Alternatives

- **ALT-001**: Increase timeouts globally. Rejected; it hides flakes and slows CI.

## 4. Dependencies

- **DEP-001**: Any UI attribute changes (e.g., adding `data-testid`) must be coordinated with feature plans to avoid conflicts.

## 5. Files

- **FILE-001**: tests/test-utils.ts
- **FILE-002**: tests/grocery-list.spec.ts
- **FILE-003**: tests/swipe-gestures.spec.ts
- **FILE-004**: tests/pwa-configuration.spec.ts (only if flakiness is observed there)

## 6. Testing

- **TEST-001**: Run `npx playwright test --project=chromium` locally; verify stability across 3 consecutive runs.
- **TEST-002**: Verify no strict-mode locator violations.

## 7. Risks & Assumptions

- **RISK-001**: Some waits are unavoidable for gesture simulation; keep them minimal and isolated.
- **ASSUMPTION-001**: The app under test is served at `/` via existing SWA CLI/dev scripts.

## 8. Related Specifications / Further Reading

- .github/instructions/playwright.instructions.md
