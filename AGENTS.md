# Repository Agent Instructions

- Read `.github/copilot-instructions.md` before making decisions or proposing changes so that work stays aligned with the product requirements and behaviors documented there.
- When working with specific technologies, also consult the relevant custom instruction files under `.github/instructions/` (for example `csharp.instructions.md`, `react.instructions.md`, `typescript.instructions.md`, and `playwright.instructions.md`) so Copilot guidance stays consistent.
- The referenced instruction files currently exist under `.github/instructions/`; if you add a new technology, create and reference its instruction file to keep guidance complete.
- Keep the app scoped to the single shared grocery list experience; avoid inventing extra concepts like accounts, rooms, or multiple lists.
- Prefer minimal, touch-friendly flows and keep language concise and accessible.
- Check for directory-level `AGENTS.md` files for additional guidance that may override these repo-wide rules.
- For local runs, prefer `docker compose up --build` to start the full stack when working on app changes.
- After making changes, run Playwright against the containerized app with `BASE_URL=http://localhost:5173 npm test`.
