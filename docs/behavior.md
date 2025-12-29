# Grocery App – Copilot Behavioral Guide

This file defines the **expected behavior, state model, and design constraints** for the grocery app.
GitHub Copilot should follow this document when generating or suggesting code.

The primary goal of this app is **simplicity, speed, and low-friction interactions**.

---

## Core Principles

- Prefer **fewer states** over explicit modeling
- Avoid introducing new screens or modes
- Default to **implicit behavior**
- No confirmations unless destructive
- Optimize for one-handed, fast use
- No over-engineering

---

## Item States

Items exist in exactly **three** states:

### Active
- Appears in the main grocery list
- Needs to be purchased

### Checked
- Item has been placed in the shopping basket
- Temporary state

### Archived
- Item is not currently needed
- Not visible in the main list
- Still searchable and reusable

No other states should be introduced.

---

## Conceptual State Mapping

| Real-World Concept | App State |
|------------------|----------|
| In the kitchen | Archived |
| Almost out | Archived (future only) |
| We're out | Active |
| Buy it | Active |
| In the basket | Checked |

Copilot should **not** expose these conceptual states in the UI.

---

## State Transitions

### Active → Checked
- Triggered by tapping the checkbox

### Checked → Active
- Triggered by unchecking the checkbox

### Active → Archived
- Triggered by swiping right on a list item

### Archived → Active
- Triggered by selecting an archived item in search

### Active → Deleted
- Triggered by swiping left
- Destructive and irreversible

---

## Gestures

| Gesture | Behavior |
|------|--------|
| Tap item | Open edit modal |
| Swipe right | Archive item |
| Swipe left | Delete item |
| Tap checkbox | Toggle checked |

Gestures should not expose additional UI by default.

---

## Add Item Flow

- Entry via a single "Add Item" button
- Input field filters **both active and archived items**
- Results update live as the user types
- No separate archived section

### Selecting a Search Result
- Archived item → unarchive and add
- Active item → optionally mark checked or ignore duplicate

### Creating a New Item
- Pressing "+" creates a new item
- Default category = `Other` or last-used
- Default state = `Active`

---

## Edit Item Behavior

- Opens as a modal or bottom sheet
- Fields:
  - Item name
  - Category
- Actions:
  - Archive item
  - Delete item (destructive)
- Changes persist automatically on dismiss

---

## Categories

- Optional
- Used only for grouping
- No category is required to add an item
- Default category = `Other`

---

## Empty States

### Main List
- Show a friendly empty message
- Primary action: "Add Item"

### Add Item Search
- Show "No matches found"
- Allow creation of new item

---

## Data Model (Minimal)

Copilot should prefer this minimal structure:

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

**No additional fields unless explicitly requested.**

---

## What NOT to Implement

Copilot must NOT introduce:

- Inventory counts
- "Almost out" toggles
- Shopping modes
- Basket screens
- Notifications or reminders
- Predictive logic
- Multiple lists
- User accounts

These are intentionally out of scope.

---

## UX Constraints

- No required confirmations except delete
- No blocking modals
- No complex animations
- No onboarding flows
- No settings screen (for now)

---

## Guiding Rule

**If a feature increases cognitive load, it should not be implemented.**

Copilot should prioritize clarity and speed over flexibility.

---

## When in Doubt

- Choose the simplest implementation
- Prefer implicit behavior over explicit UI
- Avoid adding new concepts
- Follow this document strictly
