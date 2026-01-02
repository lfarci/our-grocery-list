---
goal: Align V1 specification with implementation and stabilize core UX (add, suggestions, swipe, sync, errors, PWA)
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'Deprecated'
tags: [feature, v1, stabilization, tests, pwa, realtime]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan was intentionally split into smaller, shippable plans to reduce risk and improve reviewability.

Split plans (source of truth going forward):

- plan/feature-v1-input-and-suggestions-1.md
- plan/feature-v1-error-handling-1.md
- plan/process-v1-test-stability-1.md
- plan/architecture-v1-offline-storage-1.md

## 1. Requirements & Constraints

- **REQ-001**: Single shared grocery list for all users; no accounts/rooms/multiple lists (docs/specifications/overview.md).
- **REQ-002**: Single main screen only: list title, add form, vertical list of items (repo instructions + V1 scope).
- **REQ-003**: Add item uses name-only input; Enter submits; empty names blocked with simple validation (docs/specifications/requirements.md + repo instructions).
- **REQ-004**: Autocomplete appears after 2+ characters; suggestions include active + archived; suggestions shown in two sections (“Recently Used (Archived)”, “Already in List”) (docs/specifications/requirements.md).
- **REQ-005**: Selecting archived suggestion restores it to active; active suggestions allow duplicates (docs/specifications/requirements.md).
- **REQ-006**: Item actions: toggle checked/active; swipe right archives; swipe left deletes (docs/specifications/behavior.md).
- **REQ-007**: Ordering: not-done first, then done; oldest-first within each group (docs/specifications/requirements.md).
- **REQ-008**: Multi-device real-time: changes eventually appear without reload; last-applied change wins and UI reflects stored state (docs/specifications/requirements.md).
- **REQ-009**: Error handling matches docs/specifications/error-handling.md (inline messages, retry affordances, offline indicator, eventual sync).
- **CON-001**: Do not introduce extra screens, accounts, categories, or edit modals beyond the V1 main screen (repo instructions).
- **CON-002**: Keep behavior deterministic and testable via Playwright tests in tests/.

### Spec Consistency Decisions (must be applied before feature work)

- **DEC-001**: Empty-name submission MUST display a simple validation message (align implementation + tests to docs/specifications/requirements.md; current tests currently expect no error).
- **DEC-002**: Autocomplete UI MUST render even when there are zero API suggestions (so the user can still choose “Add \"X\" as new item” via the suggestions popover when typing 2+ chars). This keeps UX consistent and simplifies tests.
- **DEC-003**: Notes/quantity are OUT OF SCOPE for V1 UI. If the backend still stores `notes`, the frontend should not display it.
- **DEC-004**: Categories and edit modal are OUT OF SCOPE for V1. Any related spec text is treated as “future optional”.

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Resolve spec ↔ tests ↔ implementation mismatches for V1 core UX.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Update empty-name behavior: in frontend/src/components/GroceryList.tsx `handleSubmit`, show validation message (e.g., “Please enter an item name”) instead of silently returning. Update tests/grocery-list.spec.ts “Adding items - Empty input does nothing” to expect the validation message and verify no POST is sent. |  |  |
| TASK-002 | Update suggestions visibility: in frontend/src/components/GroceryList.tsx, compute `showSuggestions` as `trimmedName.length >= 2` (not dependent on `suggestions.length > 0`). Ensure frontend/src/components/ItemSuggestions.tsx renders an “Add new” action when `searchQuery` exists even if `suggestions` is empty. Update tests/grocery-list.spec.ts “Autocomplete - Add new item when no exact match” to prefer the “Add new” action when present. |  |  |
| TASK-003 | Align active suggestion selection semantics: decide and implement one behavior: (A) selecting “Already in List” immediately adds a duplicate, or (B) selecting only fills input and requires submit. Update frontend/src/components/ItemSuggestions.tsx and tests accordingly. Use repo instructions “allow duplicates” as primary constraint. |  |  |
| TASK-004 | Remove notes display from item UI: in frontend/src/components/GroceryItem.tsx, remove rendering of `item.notes` to match name-only V1 UI. (Backend may retain the field for compatibility.) Add/adjust Playwright snapshots if needed. |  |  |

### Implementation Phase 2

- **GOAL-002**: Implement the V1 error-handling behaviors in a minimal, testable way.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-005 | Add-item network error behavior: in frontend/src/components/GroceryList.tsx, on create failure show inline error near the form, keep input filled, and auto-retry exactly once after 2000ms. If retry succeeds, clear error and input. Add Playwright coverage in tests/grocery-list.spec.ts using request routing to force first POST to fail and second to succeed. |  |  |
| TASK-006 | Update-item error behavior: in frontend/src/hooks/useGroceryList.ts `toggleChecked` and `archiveItem`, revert UI state on failure (do not leave optimistic state). Implement minimal “Tap to retry” affordance using existing ErrorMessage component or a small inline per-item retry control within the item row (no new screens). Add Playwright coverage for failed PATCH then retry. |  |  |
| TASK-007 | Delete error behavior: in frontend/src/hooks/useGroceryList.ts `removeItem`, on failure restore item in-place (undo optimistic removal) and provide a retry (e.g., message + retry control). Add Playwright coverage for failed DELETE then retry. |  |  |
| TASK-008 | SignalR/offline indicator: expose useSignalR connection state in UI (e.g., under title) as “Offline - changes will sync when reconnected” when disconnected/reconnecting and API calls fail. Use existing layout; no modal/toast required. Add a focused Playwright test that stubs negotiate to fail and checks the indicator. |  |  |

### Implementation Phase 3

- **GOAL-003**: Close architecture/doc gaps and improve resilience (without expanding UX scope).

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-009 | Backend validation parity: enforce `Name` max length 50 in api/Functions/ItemFunctions.cs CreateItem (return 400 with clear message). Keep frontend validation as first line. Add a unit/functional test if repo has a pattern; otherwise validate via Playwright routing and response assertion. |  |  |
| TASK-010 | Offline cache scaffolding: either (A) update docs/technical/architecture.md to reflect that offline IndexedDB is not implemented, OR (B) implement minimal IndexedDB storage module under frontend/src/storage/ (create frontend/src/storage/indexeddb.ts) and wire it into useGroceryList load path as a fallback when GET /items fails. Prefer the smallest change set that matches actual behavior. |  |  |
| TASK-011 | Test stability pass: adjust tests/test-utils.ts cleanup helpers to avoid flaky reliance on backend timing (e.g., prefer deleting all items before each suite when backend is available; guard for missing backend consistently). Ensure swipe tests do not fail due to leftover duplicates by making cleanup deterministic. |  |  |

## 3. Alternatives

- **ALT-001**: Keep current empty-name behavior (silent no-op) and treat the spec as outdated. Not chosen because docs/specifications/requirements.md and repo instructions explicitly require a validation message.
- **ALT-002**: Hide the suggestions popover unless API returns matches. Not chosen because it blocks the “Add new” CTA in the suggestions area and makes UX/test behavior inconsistent.
- **ALT-003**: Implement a full toast system for errors. Not chosen for V1 because it adds UI surface area; prefer minimal inline retry affordances.

## 4. Dependencies

- **DEP-001**: Playwright tests must run against a working local full-stack setup (SWA CLI + Functions). Use existing scripts in root/package.json and frontend/package.json.
- **DEP-002**: Azure SignalR may be unavailable in local dev; SignalR behavior must degrade gracefully and tests must stub/guard accordingly.

## 5. Files

- **FILE-001**: frontend/src/components/GroceryList.tsx (validation, suggestions visibility, add-item retry, offline indicator).
- **FILE-002**: frontend/src/components/ItemSuggestions.tsx (add-new rendering, active suggestion semantics).
- **FILE-003**: frontend/src/components/GroceryItem.tsx (remove notes display; per-item retry UI if needed).
- **FILE-004**: frontend/src/hooks/useGroceryList.ts (optimistic update rollback + retry hooks).
- **FILE-005**: api/Functions/ItemFunctions.cs (server-side name length validation).
- **FILE-006**: tests/grocery-list.spec.ts (update expectations; add retry/offline coverage).
- **FILE-007**: tests/swipe-gestures.spec.ts and tests/test-utils.ts (stability improvements).
- **FILE-008**: docs/technical/architecture.md (reconcile offline storage claims) and/or frontend/src/storage/indexeddb.ts (if implementing offline cache).

## 6. Testing

- **TEST-001**: Update Playwright: Empty-name submission shows validation and sends no POST (tests/grocery-list.spec.ts).
- **TEST-002**: Playwright: “Add new” CTA appears in suggestions popover for 2+ chars even when API returns zero suggestions.
- **TEST-003**: Playwright: Add-item retries exactly once after a forced network failure.
- **TEST-004**: Playwright: Failed PATCH/DELETE restores UI and allows retry.
- **TEST-005**: Playwright: SignalR negotiation failure shows offline indicator.
- **TEST-006**: Playwright: Swipe gestures remain stable after cleanup changes.

## 7. Risks & Assumptions

- **RISK-001**: Tight coupling between “SignalR broadcast as source of truth” and Playwright tests can cause flakiness if SignalR is unavailable; tests should not rely on SignalR for local correctness.
- **RISK-002**: Changing validation behavior will require updating existing tests and may affect user expectations; mitigated by using a minimal message.
- **RISK-003**: Implementing offline queuing correctly is non-trivial; if time-boxed, prefer doc reconciliation over partial/incorrect offline behavior.
- **ASSUMPTION-001**: The canonical V1 behavior is defined by docs/specifications/*.md plus repo instructions; tests should follow those documents, not the other way around.

## 8. Related Specifications / Further Reading

- docs/specifications/requirements.md
- docs/specifications/behavior.md
- docs/specifications/error-handling.md
- docs/specifications/data-model.md
- docs/specifications/overview.md
- docs/technical/architecture.md
