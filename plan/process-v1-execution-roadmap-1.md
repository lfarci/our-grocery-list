---
goal: Execute V1 requirements first, then improve test stability
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'Planned'
tags: [process, roadmap, v1]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This roadmap sequences the existing split plans to prioritize meeting V1 product requirements first, and only then invest in Playwright stability improvements.

## 1. Requirements & Constraints

- **REQ-001**: Prioritize user-facing V1 behaviors from docs/specifications/*.md over internal cleanup.
- **REQ-002**: Keep scope to a single shared list and a single main screen (repo instructions).
- **REQ-003**: Each step must be shippable as an isolated PR with clear acceptance criteria.
- **CON-001**: Test stability work must not block implementing missing V1 behaviors (unless tests become impossible to run).

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Meet V1 core UX requirements (add, suggestions, gestures, ordering) with spec-aligned tests.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Execute plan/feature-v1-input-and-suggestions-1.md end-to-end. Acceptance: empty-name validation matches spec; suggestions popover works with 2+ chars; archived restore + duplicates allowed; Playwright updated accordingly. |  |  |
| TASK-002 | Execute the *non-controversial* parts of plan/feature-v1-error-handling-1.md that are explicitly specified and easy to verify: add-item inline error, keep input filled, retry once. Acceptance: Playwright covers forced failure then success without flaky sleeps. |  |  |
| TASK-003 | Confirm swipe gestures and ordering satisfy docs/specifications/behavior.md + requirements.md. If gaps exist, fix within feature scope (no new screens). Acceptance: manual verification + existing swipe tests updated if necessary. |  |  |

### Implementation Phase 2

- **GOAL-002**: Close remaining V1 reliability requirements (rollback + retry, offline indicator) without expanding UX.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-004 | Execute the remaining plan/feature-v1-error-handling-1.md tasks (update/delete rollback + retry affordance; offline indicator). Acceptance: UI state reverts on failure; retry works; offline indicator appears under simulated SignalR/network failure. |  |  |
| TASK-005 | Decide and execute plan/architecture-v1-offline-storage-1.md approach. Preferred V1 choice: **Docs-first** unless offline caching is a hard V1 requirement. Acceptance: docs match behavior; no misleading “IndexedDB implemented” claims remain. |  |  |

### Implementation Phase 3

- **GOAL-003**: Improve Playwright stability after V1 behaviors are correct.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-006 | Execute plan/process-v1-test-stability-1.md end-to-end. Acceptance: `npx playwright test --project=chromium` passes 3 consecutive runs locally with no test code changes between runs. |  |  |

## 3. Alternatives

- **ALT-001**: Stabilize tests first. Rejected because missing V1 behaviors would be treated as “stable failures” and slow feature delivery.
- **ALT-002**: Implement IndexedDB offline caching before V1 UX alignment. Rejected because it adds risk and isn’t clearly required by V1 specs; doc reconciliation is usually sufficient.

## 4. Dependencies

- **DEP-001**: Local full-stack dev flow (SWA CLI + Functions) available for feature verification.
- **DEP-002**: If backend is intermittently unavailable, tests must be explicit about what they require and what they skip.

## 5. Files

- **FILE-001**: plan/feature-v1-input-and-suggestions-1.md
- **FILE-002**: plan/feature-v1-error-handling-1.md
- **FILE-003**: plan/architecture-v1-offline-storage-1.md
- **FILE-004**: plan/process-v1-test-stability-1.md

## 6. Testing

- **TEST-001**: After Phase 1: run Playwright Chromium suite once and confirm “core UX” tests pass.
- **TEST-002**: After Phase 2: run Chromium suite once and confirm new error/offline tests pass.
- **TEST-003**: After Phase 3: run Chromium suite 3 times for stability.

## 7. Risks & Assumptions

- **RISK-001**: Some existing tests may encode non-spec behavior; Phase 1 may require updating expectations.
- **ASSUMPTION-001**: V1 requirements are defined primarily by docs/specifications/requirements.md + behavior.md + repo instructions.

## 8. Related Specifications / Further Reading

- docs/specifications/requirements.md
- docs/specifications/behavior.md
- docs/specifications/error-handling.md
