# our-grocery-list

Simple shared grocery list PWA with one global list that works on phones and desktops.

## What the app does

- One **global list**; no accounts, rooms, or multiple lists.
- Single screen with title, add form (name required, notes optional, Enter submits, block blanks), and the vertical list.
- Items show a done toggle, name, optional notes, and delete; editing text is out of scope for Version 1.
- Ordering: not-done first, then done; oldest items stay on top within each group.
- Changes sync across devices eventually without reload.

## Working on the project

- Treat the requirements as the source of truth for behavior and scope; avoid adding new features without updating the requirements first.
- Keep interactions simple and touch-friendly for both mobile and desktop; PWA install should open straight to the list.
- When in doubt about edge cases, prefer the simplest behavior that still matches the requirements.

## Reference documents

- [docs/requirements.md](docs/requirements.md) — detailed Version 1 functional requirements.
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — guidance for using Copilot effectively on this project.