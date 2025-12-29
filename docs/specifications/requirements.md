# Functional Requirements (V1)

## Adding Items

- Entry via a single text input field for the item name.
- Name is required and is the only field needed to add an item.
- Pressing Enter in the name field submits and adds the item.
- Empty names are blocked with a simple validation message.
- As the user types, the input shows autocomplete suggestions from both active and archived items.
- Suggestions are displayed in two sections:
  - "Recently Used (Archived)": Shows archived items that match the search query
  - "Already in List": Shows active items that match the search query
- Selecting a suggestion:
  - Archived item: automatically unarchived and restored to the active list.
  - Active item: shown as already added; user can still add a duplicate by continuing to type and submitting.
- Creating a new item: user can type a name and submit to add it without any additional details.
- Autocomplete appears when typing 2 or more characters.
- Default state: Active.

## Viewing the List

- Items appear in a vertical list.
- Each item shows a done checkbox/toggle and item name.
- Notes/quantity details were removed for simplicity.
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
