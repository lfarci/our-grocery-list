---
goal: Reconcile offline storage expectations (docs vs implementation) with the smallest correct change
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'Planned'
tags: [architecture, docs, offline, indexeddb, v1]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

The architecture docs currently state IndexedDB offline caching exists, but the frontend storage module is a placeholder. This plan chooses one correct path and makes the repo consistent.

## 1. Requirements & Constraints

- **REQ-001**: Be accurate: docs must reflect real behavior, or behavior must match docs.
- **REQ-002**: Do not expand UX scope beyond the main screen (repo instructions).
- **REQ-003**: Prefer the smallest change set that results in correctness.
- **CON-001**: If implementing offline caching, it must not break online behavior and must degrade gracefully when storage is unavailable.

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Choose approach and implement with deterministic acceptance criteria.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Decide approach: **A (Docs-first)** update docs/technical/architecture.md to state IndexedDB caching is not yet implemented and is planned; OR **B (Implement-minimal)** implement a minimal IndexedDB cache used only as a fallback for initial load when GET /items fails. Record the chosen approach in this file by marking the other as not chosen. |  |  |
| TASK-002A | If **A**: Update docs/technical/architecture.md sections “Local Storage: IndexedDB for offline caching” and “Offline Support” to accurately describe current behavior (no IndexedDB; network-first only; no queue). Ensure no other docs claim offline cache exists. |  |  |
| TASK-002B | If **B**: Add frontend/src/storage/indexeddb.ts implementing `getCachedItems(): Promise<GroceryItem[]>` and `setCachedItems(items: GroceryItem[]): Promise<void>` using IndexedDB (database name `our-grocery-list`, store name `items`, keyPath `id`). Wire into frontend/src/hooks/useGroceryList.ts: on successful GET /items cache items; on GET failure, load from cache and show a subtle offline indicator (handled by feature-v1-error-handling-1). |  |  |
| TASK-003 | Add a minimal test: if **A**, no tests required; if **B**, add a Playwright test that blocks GET /items and verifies the UI loads cached items after a prior successful run in the same browser context. |  |  |

## 3. Alternatives

- **ALT-001**: Implement full offline operation queue and conflict resolution. Rejected for V1 due to complexity.

## 4. Dependencies

- **DEP-001**: For approach B, requires stable `GroceryItem` type shape in frontend/src/types.

## 5. Files

- **FILE-001**: docs/technical/architecture.md
- **FILE-002**: frontend/src/storage/index.ts
- **FILE-003**: frontend/src/storage/indexeddb.ts (only if approach B)
- **FILE-004**: frontend/src/hooks/useGroceryList.ts (only if approach B)
- **FILE-005**: tests/* (only if approach B)

## 6. Testing

- **TEST-001**: If approach B: run Playwright Chromium suite and confirm cached-load test is stable.

## 7. Risks & Assumptions

- **RISK-001**: IndexedDB is not available in some contexts (private browsing); code must fail gracefully.
- **ASSUMPTION-001**: “Offline caching” for V1 is acceptable as “read-only fallback” rather than full offline CRUD.

## 8. Related Specifications / Further Reading

- docs/technical/architecture.md
- docs/specifications/error-handling.md
