# our-grocery-list

Simple shared grocery list PWA with one global list that works on phones and desktops.

## What the app does

- One **global list**; no accounts, rooms, or multiple lists.
- Single screen with title, add form (name required, notes optional, Enter submits, block blanks), and the vertical list.
- Items show a done toggle, name, optional notes, and delete; editing text is out of scope for Version 1.
- Ordering: not-done first, then done; oldest items stay on top within each group.
- Changes sync across devices eventually without reload.

## Quick Start

### Prerequisites
- Node.js 18.x, 20.x, or 22.x (⚠️ Node.js 24+ not supported by Azure Functions v4)
- .NET 10 SDK
- Azure Functions Core Tools v4

### Installation

```bash
# Install all dependencies
npm install

# Start frontend (Terminal 1)
cd frontend && npm run dev

# Start API (Terminal 2)
cd api && func start
```

Visit `http://localhost:5173` to see the app.

📖 **Full setup guide**: See [docs/development.md](docs/development.md) for detailed instructions.

## Testing

The project includes comprehensive end-to-end tests using Playwright.

```bash
# Run all e2e tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

📖 **Test documentation**: See [e2e/README.md](e2e/README.md) for full testing guide.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Vite + PWA
- **Backend**: .NET 10 Azure Functions (isolated worker)
- **Storage**: In-memory (ConcurrentDictionary)
- **Deployment**: Azure Static Web Apps (planned)

## Project Structure

```
our-grocery-list/
├── frontend/               # React PWA application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   └── storage/       # Local storage utilities
├── api/                   # Azure Functions backend
│   ├── Functions/         # HTTP endpoints
│   ├── Models/            # Data models
│   └── Program.cs         # App configuration
├── e2e/                   # Playwright end-to-end tests
└── docs/                  # Documentation
```

## Working on the project

- Treat the requirements as the source of truth for behavior and scope; avoid adding new features without updating the requirements first.
- Keep interactions simple and touch-friendly for both mobile and desktop; PWA install should open straight to the list.
- When in doubt about edge cases, prefer the simplest behavior that still matches the requirements.

## Reference documents

- [docs/development.md](docs/development.md) — complete development setup guide.
- [docs/requirements.md](docs/requirements.md) — detailed Version 1 functional requirements.
- [docs/architecture.md](docs/architecture.md) — technical architecture overview.
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — guidance for using Copilot effectively on this project.

## License

MIT