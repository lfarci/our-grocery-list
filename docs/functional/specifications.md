# Product Requirements and Behavior (V1)

This document merges functional requirements and behavioral guidance for Our Grocery List.

## Overview

- Single shared grocery list; no accounts, rooms, or multiple lists.
- Users land directly on the main list screen when opening the app.
- The primary goal is simplicity, speed, and low-friction interactions.

## Version 1 Scope

- Add items with required name and optional quantity/notes.
- View items in a vertical list with a done toggle, name, and notes.
- Mark items done or not done.
- Delete items.
- Basic error handling and retry affordances.
- PWA installability and mobile-friendly UI.

## Core Principles

- Prefer fewer states over explicit modeling.
- Avoid introducing new screens or modes.
- Default to implicit behavior.
- No confirmations unless destructive.
- Optimize for one-handed, fast use.
- No over-engineering.

## Item States

Items exist in exactly three states:

- Active: Appears in the main grocery list and needs to be purchased.
- Checked: Item has been placed in the shopping basket (temporary state).
- Archived: Item is not currently needed, not visible in the main list, still searchable and reusable.

Conceptual mapping (not exposed in UI):

| Real-World Concept | App State |
|------------------|----------|
| In the kitchen | Archived |
| Almost out | Archived (future only) |
| We're out | Active |
| Buy it | Active |
| In the basket | Checked |

## State Transitions

- Active → Checked: Tap the checkbox.
- Checked → Active: Uncheck the checkbox.
- Active → Archived: Swipe right on a list item.
- Archived → Active: Select an archived item in search.
- Active → Deleted: Swipe left (destructive, irreversible).

## Gestures

| Gesture | Behavior |
|------|--------|
| Tap item | Open edit modal (optional in V1) |
| Swipe right | Archive item |
| Swipe left | Delete item |
| Tap checkbox | Toggle checked |

## Adding Items

- Entry via a single "Add Item" button.
- Name is required; quantity/notes are optional.
- Pressing Enter in the name field also adds the item.
- Empty names are blocked with a simple validation message.
- Input filters both active and archived items; results update as the user types.
- Selecting a search result:
  - Archived item: unarchive and add.
  - Active item: optionally mark checked or ignore duplicate.
- Creating a new item: pressing "+" creates a new item.
- Default category: `Other` (or last-used).
- Default state: Active.

## Viewing the List

- Items appear in a vertical list.
- Each item shows a done checkbox/toggle, item name, and quantity/notes if present.
- Empty state: friendly message with a primary "Add Item" action.
- Layout should feel natural on both mobile and desktop.

## Updating Items

- Users can mark items done or not done via the toggle.
- Done items are visually de-emphasized (muted color or strikethrough).
- Items can be deleted from the list.
- Editing item text is optional in V1; delete + re-add is acceptable.

## List Order

- All not-done items first, followed by done items.
- Within each group, items stay in time-added order (oldest first).

## Categories

- Optional and used only for grouping.
- No category is required to add an item.
- Default category: `Other`.

## Edit Item Behavior (Optional)

- Opens as a modal or bottom sheet.
- Fields:
  - Item name (optional in V1)
  - Category
- Actions:
  - Archive item
  - Delete item (destructive)
- Changes persist automatically on dismiss.

## Shared Behavior and Concurrency

- Everyone sees and edits the same global list.
- Adds, done/undone changes, and deletions eventually appear for other users without a page reload.
- On conflicting changes, the last applied change wins; the UI must reflect the stored state.

## Data Model (Minimal)

```ts
Item {
  id: string
  name: string
  category: string
  completed: boolean
  archived: boolean
  createdAt: Date
}
```

No additional fields unless explicitly requested.

## Error Handling

Principles:
- Fail gracefully; never block the user from continuing.
- Be subtle unless user action is required.
- Recover automatically when appropriate.
- Keep feedback clear.

Network errors:
- Adding an item: inline error near add button, keep input filled, auto-retry once after 2 seconds.
- Updating an item: revert UI state with subtle shake; toast "Couldn't update. Tap to retry.".
- Deleting an item: item reappears with subtle flash; message "Delete failed. Swipe again to retry.".
- Archiving an item: item returns to list; message "Couldn't archive. Swipe to retry.".

Real-time sync errors:
- Show unobtrusive indicator: "Offline - changes will sync when reconnected".
- Queue operations locally and sync when connection is restored.

Initial load error:
- Show a simple error message and offer a retry.

## Platform and PWA

- Works on mobile and desktop browsers with touch-friendly controls.
- Installable as a PWA; when installed, it opens directly to the main grocery list screen.

## Out of Scope (V1)

- User accounts, authentication, or multi-room/list concepts.
- Editing item text after creation (delete + re-add is acceptable).
