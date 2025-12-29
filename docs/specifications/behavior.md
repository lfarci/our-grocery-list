# Behavioral Model

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
