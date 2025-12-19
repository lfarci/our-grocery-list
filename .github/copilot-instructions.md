# GitHub Copilot Instructions for our-grocery-list

This project is a simple shared grocery list web app with one global list.

## Core rules for Copilot

- Single shared list for everyone; no accounts, rooms, or multiple lists.
- One main screen: list title, add form, and vertical list of items; keep flows simple and touch-friendly.
- Add item: required name, optional quantity/notes; Enter should submit; block empty names with simple validation.
- Item display and actions: show done toggle, name, and optional notes; items can be marked done/undone or deleted. Text editing after creation is out of scope for Version 1 (delete and re-add instead).
- Ordering: not-done items first, done items after; within each group, keep oldest items on top.
- Multi-device behavior: changes should eventually appear for all users without reload; if changes conflict, last applied change wins and the UI should reflect the stored state.
- PWA-friendly: installed app should open directly to the list and remain usable on mobile and desktop.

## How to use these instructions

- Treat [docs/requirements.md](../docs/requirements.md) as the source of truth; align suggestions and code to it.
- When uncertain, pick the simplest behavior that satisfies the requirements; avoid inventing features (auth, multiple lists, categories, text editing).
- Keep UI and copy concise and accessible; prefer clear, obvious interactions over complexity.