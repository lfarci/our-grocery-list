# Error Handling

## Principles

- Fail gracefully; never block the user from continuing.
- Be subtle unless user action is required.
- Recover automatically when appropriate.
- Keep feedback clear.

## Network Errors

- Adding an item: inline error near add button, keep input filled, auto-retry once after 2 seconds.
- Updating an item: revert UI state with subtle shake; toast "Couldn't update. Tap to retry.".
- Deleting an item: item reappears with subtle flash; message "Delete failed. Swipe again to retry.".
- Archiving an item: item returns to list; message "Couldn't archive. Swipe to retry.".

## Real-Time Sync Errors

- Show unobtrusive indicator: "Offline - changes will sync when reconnected".
- Queue operations locally and sync when connection is restored.

## Initial Load Error

- Show a simple error message and offer a retry.
