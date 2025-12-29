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

## Error Handling

### Principles

- **Fail gracefully**: Never block the user from continuing to use the app
- **Be subtle**: Errors should be non-intrusive unless they require user action
- **Recover automatically**: Retry failed operations when appropriate
- **Clear feedback**: Users should understand what went wrong and what to do next

### Network Errors

#### Adding an Item
- **Failure**: Show brief inline error message near the add button
- **Behavior**: Keep the input filled so user can retry
- **Recovery**: Auto-retry once after 2 seconds, then allow manual retry

#### Updating an Item (Check/Uncheck)
- **Failure**: Revert the UI state immediately with a subtle shake animation
- **Message**: Brief toast: "Couldn't update. Tap to retry."
- **Recovery**: Allow instant retry by tapping the checkbox again

#### Deleting an Item
- **Failure**: Item reappears with a subtle flash and error message
- **Message**: "Delete failed. Swipe again to retry."
- **Recovery**: User must repeat the swipe gesture

#### Archiving an Item
- **Failure**: Item returns to list with subtle animation
- **Message**: Brief toast: "Couldn't archive. Swipe to retry."
- **Recovery**: User must repeat the swipe gesture

### Real-time Sync Errors

- **Connection Lost**: Show unobtrusive indicator at top of screen
- **Message**: "Offline - changes will sync when reconnected"
- **Behavior**: Queue all operations locally and sync when connection restored
- **No blocking**: User can continue using the app normally

### Data Load Errors

#### Initial Load Failure
- **Display**: Empty state with error message
- **Message**: "Couldn't load your list"
- **Action**: Large "Try Again" button
- **Recovery**: Retry immediately on button press

#### Refresh Failure
- **Behavior**: Keep showing stale data
- **Message**: Small banner at top: "Using offline data. Tap to refresh."
- **Recovery**: Allow manual refresh attempt

### Gesture Edge Cases

#### Ambiguous Swipe
- **Threshold**: Swipe must travel >40% of item width to trigger
- **Below threshold**: Item snaps back to original position with spring animation
- **No error message**: Gesture simply didn't complete

#### Simultaneous Operations
- **Scenario**: User swipes while another operation is pending
- **Behavior**: Complete first operation, ignore second
- **Visual feedback**: Briefly dim item to show it's processing

### Validation Errors

#### Empty Item Name
- **Prevention**: Disable submit button when name is empty
- **If bypassed**: Show inline error: "Item name is required"
- **Focus**: Keep cursor in name field

#### Duplicate Item (Same name, active)
- **Behavior**: Show existing item with highlight animation
- **Message**: "Already on your list"
- **Option**: Offer to check the existing item instead

### Rate Limiting

- **Scenario**: Too many requests in short time
- **Behavior**: Queue operations locally
- **Message**: None (invisible to user)
- **Processing**: Execute operations with 100ms debounce

### Conflict Resolution

- **Scenario**: Two users modify the same item simultaneously
- **Rule**: Last write wins (server timestamp)
- **Behavior**: UI reflects server state after sync
- **No prompt**: Changes silently reconcile

### Fatal Errors

- **Rare scenarios**: Unexpected server errors, data corruption
- **Display**: Full-screen error with support message
- **Message**: "Something went wrong. Try refreshing the page."
- **Action**: "Refresh" button
- **Fallback**: Browser refresh if button fails

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
