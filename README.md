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
- .NET 8.0 SDK
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

End-to-end tests are written with Playwright and TypeScript.

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

Tests are located in the `tests/` directory and validate the core user flows including:
- Application loads and displays correctly
- Add item form is present and functional
- Validation prevents empty item names
- Empty state message displays when list is empty

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Vite + PWA
- **Backend**: .NET 8.0 Azure Functions (isolated worker)
- **Storage**: Azure Cosmos DB with NoSQL API
  - Cosmos DB Emulator for local development (see [Cosmos DB setup guide](docs/cosmosdb-setup.md))
  - Azure Cosmos DB for production
- **Real-time Updates**: Azure SignalR Service (optional for local development)
- **Deployment**: Azure Static Web Apps

## Project Structure

```
our-grocery-list/
├── frontend/               # React PWA application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   │   ├── useGroceryList.ts  # Item management with real-time updates
│   │   │   └── useSignalR.ts      # SignalR connection management
│   │   ├── types/         # TypeScript types
│   │   └── storage/       # Local storage utilities
├── api/                   # Azure Functions backend
│   ├── Functions/         # HTTP endpoints with Azure SignalR broadcasting
│   ├── Models/            # Data models
│   ├── Repositories/      # Data access layer (repository pattern)
│   ├── SignalRConstants.cs # SignalR hub name and method constants
│   └── Program.cs         # App configuration
└── docs/                  # Documentation
    ├── cosmosdb-setup.md  # Cosmos DB setup guide
    └── ...
```

## Working on the project

- Treat the requirements as the source of truth for behavior and scope; avoid adding new features without updating the requirements first.
- Keep interactions simple and touch-friendly for both mobile and desktop; PWA install should open straight to the list.
- When in doubt about edge cases, prefer the simplest behavior that still matches the requirements.

## Deployment

The app is deployed to Azure Static Web Apps (`stapp-app-prd-bc`) with automatic deployments on every push to `main` and preview deployments for pull requests.

🚀 **Live app**: Check the [Actions tab](../../actions) for the deployment URL, or find it in the Azure Portal under the Static Web App resource.

📖 **Deployment guide**: See [docs/deployment.md](docs/deployment.md) for deployment setup and troubleshooting.

## Reference documents

- [docs/development.md](docs/development.md) — complete development setup guide.
- [docs/requirements.md](docs/requirements.md) — detailed Version 1 functional requirements.
- [docs/behavior.md](docs/behavior.md) — behavioral guide for expected app behavior and state model.
- [docs/architecture.md](docs/architecture.md) — technical architecture overview.
- [docs/deployment.md](docs/deployment.md) — deployment setup and configuration guide.
- [docs/cosmosdb-setup.md](docs/cosmosdb-setup.md) — Cosmos DB setup and configuration guide.
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — guidance for using Copilot effectively on this project.

## License

MIT