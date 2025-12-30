# Autocomplete Enter Key Bug Fix

## Problem Description

When typing a substring of an existing item in the autocomplete field (e.g., typing "Leche" when "Leche de soya" already exists in the list), pressing the Enter key would incorrectly add **both** the typed text ("Leche") AND create a duplicate of the suggested item ("Leche de soya").

### Expected Behavior
- Pressing Enter or clicking the "Add Item" button should **only** add what the user typed in the input field
- Suggestions should **only** be added when the user explicitly clicks on them
- The form submission should be completely independent from the suggestions dropdown

### Actual Behavior (Bug)
- When suggestions were displayed and the user pressed Enter, both the typed text and the first suggestion were added to the list

## Root Cause

The bug was caused by missing `type="button"` attributes on the suggestion buttons in the `ItemSuggestions.tsx` component.

In HTML, when a `<button>` element is inside a `<form>` and doesn't have an explicit `type` attribute, it defaults to `type="submit"`. This means:
1. The browser treats these buttons as form submit buttons
2. When the user presses Enter in the input field, the browser may trigger the first button it finds
3. This caused the suggestion's `onClick` handler to fire in addition to the form's `onSubmit` handler

## Solution

Added `type="button"` to all three types of suggestion buttons in `ItemSuggestions.tsx`:

1. **Archived item suggestions** - buttons that restore archived items
2. **Active item suggestions** - buttons that add duplicates of existing items
3. **"Add new item" button** - button in the suggestions dropdown to add the typed text

### Code Changes

```tsx
// Before (incorrect)
<button
  key={item.id}
  onClick={() => onSelect(item)}
  className="..."
>
  {/* button content */}
</button>

// After (correct)
<button
  key={item.id}
  type="button"  // ← Added this
  onClick={() => onSelect(item)}
  className="..."
>
  {/* button content */}
</button>
```

## Files Modified

- `frontend/src/components/ItemSuggestions.tsx` - Added `type="button"` to all suggestion buttons
- `tests/autocomplete-bug.spec.ts` - Added comprehensive tests to validate the fix

## Testing

Created three test scenarios in `tests/autocomplete-bug.spec.ts`:

1. **Test: Should NOT add suggestion when pressing Enter with substring text**
   - Verifies that pressing Enter only adds the typed text, not suggestions
   
2. **Test: Should add suggestion ONLY when explicitly clicking on it**
   - Verifies that suggestions are only added when clicked directly
   
3. **Test: Should add clicked Add button item, not suggestion when both are present**
   - Verifies that clicking the form's Add button ignores suggestions

## Prevention

To prevent similar issues in the future:

1. **Always specify button types explicitly** - Use `type="button"`, `type="submit"`, or `type="reset"` on all buttons
2. **Default assumption** - Remember that buttons inside forms default to `type="submit"`
3. **Code review checklist** - Check that non-submit buttons have `type="button"` specified

## References

- MDN: [The Button element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
- HTML Spec: Default button type is "submit" when inside a form
