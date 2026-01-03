---
goal: Review PR #30 (Input and Suggestions) for V1 spec compliance and define deterministic follow-up tasks
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'In progress'
tags: [process, pr-review, v1, input, autocomplete, validation, playwright]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan defines an executable review workflow for PR #30 (https://github.com/lfarci/our-grocery-list/pull/30) and any required follow-up changes to meet V1 requirements and Playwright stability guidelines.

## 1. Requirements & Constraints

- **REQ-001**: Add item uses name-only input; Enter submits; empty names are blocked with a simple validation message.
- **REQ-002**: Autocomplete appears when typing 2+ characters.
- **REQ-003**: Suggestions show two sections when applicable: “Recently Used (Archived)” and “Already in List”.
- **REQ-004**: Selecting an archived suggestion restores it to the active list.
- **REQ-005**: Selecting an active suggestion must not prevent adding a duplicate (user can still add a duplicate by continuing to type and submitting).
- **REQ-006**: Item name max length is enforced consistently across frontend and backend (50 characters).

- **CON-001**: Single main screen; no new modals/pages.
- **CON-002**: Use existing components and design tokens only.

- **TEST-REQ-001**: Playwright tests prioritize role/label/text locators; avoid brittle selectors.
- **TEST-REQ-002**: Playwright tests must not use hard waits (`waitForTimeout`) for correctness; use auto-waiting assertions and event-based waits.

- **DEPLOY-001**: PR #30 is deployed to a preview environment; manual verification must use the preview URL (no local stack required).
- **SAF-001**: Do not run destructive E2E flows against any shared environment (the app has one global list). Only run Playwright against preview if the preview uses an isolated data store OR tests are updated to only create/clean up uniquely-named items.

- **ENV-001**: PR #30 preview URL is `https://happy-ground-08c1ce310-30.centralus.6.azurestaticapps.net`.

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Acquire PR branch locally and enumerate file-level deltas.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Fetch PR #30 locally using `git fetch origin pull/30/head:pr-30` from repo root. | Yes | 2026-01-02 |
| TASK-002 | Checkout branch with `git checkout pr-30`. | Yes | 2026-01-02 |
| TASK-003 | Capture a file list diff using `git diff --name-only main...HEAD` and confirm it includes: `frontend/src/components/GroceryList.tsx`, `frontend/src/components/ItemSuggestions.tsx`, `api/Functions/ItemFunctions.cs`, `tests/grocery-list.spec.ts`, and `package-lock.json`. | Yes | 2026-01-02 |
| TASK-004 | Capture a semantic diff summary using `git diff main...HEAD -- frontend/src/components/GroceryList.tsx frontend/src/components/ItemSuggestions.tsx api/Functions/ItemFunctions.cs tests/grocery-list.spec.ts` and store notes in the PR review comment. | Yes | 2026-01-02 |

**Completion criteria**: PR branch is checked out and the exact changed-file set is confirmed.

### Implementation Phase 2

- **GOAL-002**: Validate V1 UX behaviors using the deployed PR preview URL (no local stack required).

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-005 | Open the PR #30 preview URL `https://happy-ground-08c1ce310-30.centralus.6.azurestaticapps.net` in a browser and confirm the title is `Our Grocery List`. |  |  |
| TASK-006 | Validate **empty submit**: click “Add Item” with empty/whitespace input; confirm exact message `Please enter an item name` is shown and no item is created. |  |  |
| TASK-007 | Validate **popover shows at 2+ chars with 0 results**: type a unique string ≥2 chars; confirm the suggestions UI renders and includes an “Add \"X\" as new item” action even when there are no matches. |  |  |
| TASK-008 | Validate **archived restore**: create item `Grapes`, archive it, type `Grapes` (≥2 chars); confirm “Recently Used (Archived)” appears and selecting it restores the item to active list. |  |  |
| TASK-009 | Validate **active duplicates allowed**: ensure an active item exists with name `Milk`; type `Milk`, observe “Already in List”, then continue to submit so that a duplicate item is created (do not block duplicates). |  |  |
| TASK-010 | Validate **max length**: attempt to add a 51-character name; confirm the user sees `Item name must be 50 characters or less` and the input retains the value. |  |  |

**Completion criteria**: All V1 behaviors above are verified locally, or each failure is recorded as a concrete follow-up defect with reproduction steps.

### Implementation Phase 3

- **GOAL-003**: Validate Playwright coverage without requiring local stack; only run against preview when it is safe.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-011 | Confirm PR checks show Playwright passing (the repo Playwright config starts a local dev server automatically when `BASE_URL` is not set). Record failing test names if any. |  |  |
| TASK-012 | If Playwright is failing/flaky in PR checks, stabilize `tests/grocery-list.spec.ts` by removing `waitForTimeout` and making assertions event-driven (UI assertions and/or specific request `waitForResponse`) per .github/instructions/playwright.instructions.md. | Yes | 2026-01-02 |
| TASK-013 | Remove conditional “skip-like” logic in tests (logging and continuing when backend search API is unavailable). Tests must be deterministic; select exactly one approach: (A) require backend APIs for this suite, OR (B) mock `/api/items/search` in Playwright for the relevant tests. | Yes | 2026-01-02 |
| TASK-014 | Safety gate for running Playwright against preview: do not execute any test that deletes non-test data. This requires either (A) an isolated preview data store, OR (B) updating tests to generate unique item names (e.g., `E2E-${Date.now()}-...`) and only clean up those. | Yes | 2026-01-02 |
| TASK-015 | Optional (only if SAF-001 is satisfied): run against preview using `BASE_URL=https://happy-ground-08c1ce310-30.centralus.6.azurestaticapps.net npx playwright test --project=chromium tests/grocery-list.spec.ts` and require 2/2 consecutive passes. | Yes | 2026-01-02 |

**Completion criteria**: No `waitForTimeout` remains in the modified tests; the suite passes 2 consecutive runs in Chromium.

### Implementation Phase 4

- **GOAL-004**: Ensure backend/frontend consistency for max-length enforcement and error messages.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-016 | Confirm backend max-length validation exists in `api/Functions/ItemFunctions.cs` CreateItem and returns status 400 for `Name.Length > 50`. | Yes | 2026-01-02 |
| TASK-017 | Confirm frontend has a 50-char max length constraint and that backend 400 error message (currently `Item name must be 50 characters or less`) is either surfaced or mapped to the app’s standard error UI without breaking flows. | Yes | 2026-01-02 |
| TASK-018 | Add/adjust a Playwright test for the >50 length case only if the app already has a stable user-visible error pattern for API validation errors; otherwise, document as a follow-up story. | Yes | 2026-01-02 |

**Completion criteria**: A single, consistent UX exists for over-length names (either frontend-prevented or backend-rejected with a user-visible message).

### Implementation Phase 5

- **GOAL-005**: Clean up ancillary changes and align planning artifacts.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-019 | Review `package-lock.json` changes: confirm they are intentional (tooling update) and do not introduce dependency drift beyond the PR’s scope. If unintentional, revert lockfile-only noise by regenerating with the repo-standard npm version. |  |  |
| TASK-020 | Update plan/feature-v1-input-and-suggestions-1.md to reflect PR outcomes: mark applicable tasks complete and set status to `In progress` (during PR iteration) or `Completed` (on merge). |  |  |

**Completion criteria**: Lockfile change rationale is documented, and the feature plan reflects the actual implementation state.

## 3. Alternatives

- **ALT-001**: Keep Playwright timeouts (`waitForTimeout`) to avoid flakes. Rejected due to stability guidelines; timeouts produce slow, flaky tests.
- **ALT-002**: Keep conditional “skip” logic when backend APIs are down. Rejected because tests must be deterministic; suite should either require a running backend or explicitly mock it.

## 4. Dependencies

- **DEP-001**: PR #30 preview environment URL must be accessible to the reviewer: `https://happy-ground-08c1ce310-30.centralus.6.azurestaticapps.net`.
- **DEP-002**: Search endpoint `/api/items/search` must be available if tests validate archived suggestions without mocking.

## 5. Files

- **FILE-001**: frontend/src/components/GroceryList.tsx
- **FILE-002**: frontend/src/components/ItemSuggestions.tsx
- **FILE-003**: api/Functions/ItemFunctions.cs
- **FILE-004**: tests/grocery-list.spec.ts
- **FILE-005**: package-lock.json
- **FILE-006**: plan/feature-v1-input-and-suggestions-1.md

## 6. Testing

- **TEST-001**: PR checks: Playwright must pass for PR #30.
- **TEST-002**: Optional (only if SAF-001 is satisfied): Playwright against preview via `BASE_URL=https://happy-ground-08c1ce310-30.centralus.6.azurestaticapps.net npx playwright test --project=chromium tests/grocery-list.spec.ts` (2 consecutive passes required).

## 7. Risks & Assumptions

- **RISK-001**: Running Playwright against preview can delete real user data because the app uses one global list.
- **RISK-002**: If the test environment does not start the backend (or does not mock it deterministically), tests validating search/archiving can become non-deterministic.
- **RISK-003**: Lockfile noise may complicate reviews and future merges.
- **ASSUMPTION-001**: The UI already exposes an archive action reachable by Playwright via accessible roles/names.
- **ASSUMPTION-002**: The canonical empty-name validation string is `Please enter an item name` and should remain stable.

## 8. Related Specifications / Further Reading

- docs/specifications/requirements.md
- docs/specifications/behavior.md
- plan/feature-v1-input-and-suggestions-1.md
- .github/instructions/playwright.instructions.md
