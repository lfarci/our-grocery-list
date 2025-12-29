# Specifications Overview (V1)

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

## Platform and PWA

- Works on mobile and desktop browsers with touch-friendly controls.
- Installable as a PWA; when installed, it opens directly to the main grocery list screen.

## Out of Scope (V1)

- User accounts, authentication, or multi-room/list concepts.
- Editing item text after creation (delete + re-add is acceptable).
