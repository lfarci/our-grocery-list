# our-grocery-list – Version 1 Functional Requirements

## Overview

- Single shared grocery list; no accounts, rooms, or multiple lists.
- Users land directly on the main list screen when opening the app.

## Main screen

- Shows the list title, inputs to add a new item, and the current list of items.
- Layout should feel natural on both mobile and desktop.

## Adding items

- Inputs: required item name plus optional quantity/notes, and an Add button.
- Pressing Enter in the name field also adds the item.
- Empty names are blocked with a simple validation message and no item is created.

## Viewing the list

- Items appear in a vertical list.
- Each item shows a done checkbox/toggle, item name, and quantity/notes if present.
- Empty state: show a friendly message such as “Your list is empty. Add something above.”

## Updating items

- Users can mark items done or not done via the toggle.
- Done items are visually de-emphasized (for example, muted color or strikethrough).
- Items can be deleted from the list.
- Item text (name and quantity/notes) does not need to be editable after creation; users can delete and re-add instead.

## List order

- All not-done items first, followed by done items.
- Within each group, items stay in time-added order (oldest first).

## Shared behaviour and concurrency

- Everyone sees and edits the same global list.
- Adds, done/undone changes, and deletions eventually appear for other users without a page reload.
- On conflicting changes, the last applied change wins; the UI must reflect the stored state.

## Basic error handling

- If loading the list fails, show a simple error message and offer a retry.
- If adding, updating, or deleting fails, show a brief message or indicator that something went wrong.

## Platform and PWA

- Works on mobile and desktop browsers with touch-friendly controls.
- Installable as a PWA; when installed, it should open directly to the main grocery list screen.

## Out of scope for Version 1

- User accounts, authentication, or multi-room/list concepts.
- Editing item text after creation; use delete + re-add instead.