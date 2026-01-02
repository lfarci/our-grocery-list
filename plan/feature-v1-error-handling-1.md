---
goal: Implement V1 error-handling behaviors (add/update/delete, offline indicator) with minimal UI
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'Planned'
tags: [feature, v1, reliability, error-handling, retry, offline]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan implements the V1 error-handling guidance in a minimal, testable way (inline messages + retry, plus an offline indicator), without adding new screens or complex UI.

## 1. Requirements & Constraints

- **REQ-001**: Fail gracefully and keep feedback clear (docs/specifications/error-handling.md).
- **REQ-002**: Add item error: inline error near add, keep input filled, auto-retry once after 2 seconds (docs/specifications/error-handling.md).
- **REQ-003**: Update item error: revert UI state and provide “Tap to retry” affordance (docs/specifications/error-handling.md).
- **REQ-004**: Delete item error: item reappears, message indicates retry (docs/specifications/error-handling.md).
- **REQ-005**: Real-time sync errors: show unobtrusive “Offline - changes will sync when reconnected” indicator (docs/specifications/error-handling.md).
- **CON-001**: No new screens/modals/toast framework; keep UX minimal (repo instructions).

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Add-item retry exactly once and expose failures clearly.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Add-item auto-retry: In frontend/src/components/GroceryList.tsx, on create failure, keep input value, show inline error text, schedule exactly one retry after 2000ms. If retry succeeds, clear error and clear input. If retry fails, keep error visible and do not loop. |  |  |
| TASK-002 | Ensure “retry once” is idempotent: if user changes input while retry timer is pending, cancel the retry for the old value. |  |  |

### Implementation Phase 2

- **GOAL-002**: Update/delete rollback + explicit retry affordances.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-003 | Toggle checked rollback: In frontend/src/hooks/useGroceryList.ts `toggleChecked`, perform optimistic update but store previous item state; on failure, revert to previous state. Provide a retry mechanism accessible from the item row (e.g., inline “Retry” button or clickable message). |  |  |
| TASK-004 | Archive rollback: In `archiveItem`, same rollback + retry affordance behavior. |  |  |
| TASK-005 | Delete rollback: In `removeItem`, restore the item into the list on failure (same ordering as before) and provide a retry affordance. |  |  |

### Implementation Phase 3

- **GOAL-003**: Offline indicator and SignalR degradation.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-006 | Offline indicator: Surface SignalR connection state and/or network failure state in the UI as an unobtrusive banner/label near the title (exact text: `Offline - changes will sync when reconnected`). Show when SignalR is disconnected/reconnecting OR when fetch calls fail due to network. |  |  |
| TASK-007 | Do not block usage: ensure CRUD operations still work via HTTP when SignalR is unavailable; do not require negotiate success for baseline functionality. |  |  |

## 3. Alternatives

- **ALT-001**: Implement global toast system. Rejected to keep V1 minimal.
- **ALT-002**: Disable UI entirely when offline. Rejected; spec says fail gracefully.

## 4. Dependencies

- **DEP-001**: Playwright request routing needed to simulate failures/retries.
- **DEP-002**: Existing components: frontend/src/components/ErrorMessage.tsx can be reused if it fits constraints.

## 5. Files

- **FILE-001**: frontend/src/components/GroceryList.tsx
- **FILE-002**: frontend/src/hooks/useGroceryList.ts
- **FILE-003**: frontend/src/components/GroceryItem.tsx (if retry affordance is per-item)
- **FILE-004**: frontend/src/hooks/useSignalR.ts (only if needing to expose state differently)
- **FILE-005**: tests/grocery-list.spec.ts

## 6. Testing

- **TEST-001**: Playwright: first POST fails, second succeeds after ~2s; verify input remains filled until success.
- **TEST-002**: Playwright: PATCH fails -> UI reverts; clicking retry triggers PATCH and updates.
- **TEST-003**: Playwright: DELETE fails -> item returns; retry deletes.
- **TEST-004**: Playwright: force SignalR negotiate failure and confirm offline indicator text is rendered.

## 7. Risks & Assumptions

- **RISK-001**: Timing in tests (2s retry) can be flaky; mitigate by asserting the second request occurs, not by sleeping.
- **ASSUMPTION-001**: Minimal inline retry controls are acceptable under “no extra screens”.

## 8. Related Specifications / Further Reading

- docs/specifications/error-handling.md
