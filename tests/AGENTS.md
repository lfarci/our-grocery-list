# Tests Agent Instructions

- Reference `.github/copilot-instructions.md` to ensure test coverage aligns with the intended single shared grocery list behavior and flows.
- Follow the Playwright guidance in `.github/instructions/playwright.instructions.md` (and React/TypeScript instructions when applicable) so tests reflect project conventions.
- Focus tests on the core experience: one list view, add form interactions, item ordering, and simple touch-friendly actions.
- Avoid validating unsupported features like accounts, multiple lists, or complex editing beyond delete and re-add.
- Apply any more specific guidance from nested `AGENTS.md` files within the tests directory when present.
