# Functional Requirements (V1)

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
