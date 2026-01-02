---
goal: Align V1 add-item validation and autocomplete/suggestions behavior with the specification
version: 1
date_created: 2026-01-02
last_updated: 2026-01-02
owner: our-grocery-list
status: 'Planned'
tags: [feature, v1, ux, autocomplete, validation]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan aligns the add-item flow and suggestion UX with V1 specs, and updates Playwright tests accordingly.

## 1. Requirements & Constraints

- **REQ-001**: Add item uses name-only input; Enter submits; block empty names with a simple validation message (docs/specifications/requirements.md).
- **REQ-002**: Autocomplete appears when typing 2+ characters (docs/specifications/requirements.md).
- **REQ-003**: Suggestions show two sections when applicable: “Recently Used (Archived)” and “Already in List” (docs/specifications/requirements.md).
- **REQ-004**: Selecting archived suggestion restores it to active (docs/specifications/requirements.md).
- **REQ-005**: Active suggestions allow duplicates (docs/specifications/requirements.md).
- **CON-001**: No new screens/modals; keep single main screen UX (repo instructions).
- **CON-002**: Use current components and design tokens; do not add new themes (repo instructions).
- **TEST-REQ-001**: Playwright tests must use role/label/placeholder locators where possible (playwright.instructions.md).

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Correct validation and “Add new” suggestion behaviors.

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Frontend validation: Update frontend/src/components/GroceryList.tsx `handleSubmit` to show a validation message for empty `name` (exact string: `Please enter an item name`). Ensure the input remains unchanged after validation. |  |  |
| TASK-002 | Suggestions popover visibility: Update frontend/src/components/GroceryList.tsx so the popover can render when `trimmedName.length >= 2` even if API returns 0 suggestions. Keep API call debounce behavior unchanged. |  |  |
| TASK-003 | Popover rendering: Update frontend/src/components/ItemSuggestions.tsx so when `searchQuery` exists (2+ chars) it can render the “Add \"X\" as new item” action even if `suggestions.length === 0`. |  |  |
| TASK-004 | Active/archived selection semantics: Ensure selecting an archived suggestion restores it to active (PATCH state=active). Ensure selecting an active suggestion preserves “duplicates allowed” by either (A) immediately adding a duplicate, or (B) leaving input unchanged but still allowing submit to add duplicate. Choose one behavior and update both UI + tests to match. |  |  |
| TASK-005 | Max length parity: Keep frontend max length check at 50 (already present). Add backend enforcement in api/Functions/ItemFunctions.cs CreateItem (reject >50 with 400) OR document backend max length as future work; decide and implement consistently. |  |  |

## 3. Alternatives

- **ALT-001**: Keep empty-name as silent no-op. Rejected because spec explicitly requires validation.
- **ALT-002**: Render suggestions only if API returns matches. Rejected because it hides a stable “Add new” CTA and complicates UX/testing.

## 4. Dependencies

- **DEP-001**: Backend search endpoint `/api/items/search?q=...` must be available for suggestion results; tests must remain robust if backend is unavailable.

## 5. Files

- **FILE-001**: frontend/src/components/GroceryList.tsx
- **FILE-002**: frontend/src/components/ItemSuggestions.tsx
- **FILE-003**: tests/grocery-list.spec.ts
- **FILE-004**: api/Functions/ItemFunctions.cs (only if implementing TASK-005 backend validation here)

## 6. Testing

- **TEST-001**: Update tests/grocery-list.spec.ts “Adding items - Empty input does nothing” to assert the validation message appears and no empty item is created.
- **TEST-002**: Add/adjust test asserting the “Add \"X\" as new item” CTA appears after typing 2+ characters even when there are 0 suggestions.
- **TEST-003**: Verify archived selection triggers restore behavior and item appears in visible list.

## 7. Risks & Assumptions

- **RISK-001**: If SignalR is unavailable locally, UI may rely on HTTP responses; tests must not require SignalR to observe creation.
- **ASSUMPTION-001**: Item name max length is 50 as implied by existing code/tests; spec does not contradict.

## 8. Related Specifications / Further Reading

- docs/specifications/requirements.md
- docs/specifications/behavior.md
