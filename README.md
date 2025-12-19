# our-grocery-list

Simple shared grocery list PWA with one global list that works on phones and desktops.

## What the app does

- One **global list**; no accounts, rooms, or multiple lists.
- Single screen with title, add form (name required, notes optional, Enter submits, block blanks), and the vertical list.
- Items show a done toggle, name, optional notes, and delete; editing text is out of scope for Version 1.
- Ordering: not-done first, then done; oldest items stay on top within each group.
- Changes sync across devices eventually without reload.

## Local Development

### Prerequisites

- Node.js 20+
- .NET 8.0 SDK
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/lfarci/our-grocery-list.git
   cd our-grocery-list
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   
   Frontend:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   
   API:
   ```bash
   cp api/local.settings.json.example api/local.settings.json
   ```

4. **Run the application locally**
   
   Using Static Web Apps CLI (recommended):
   ```bash
   npm start
   ```
   
   Or run frontend and API separately:
   ```bash
   # Terminal 1 - Frontend dev server
   npm run dev
   
   # Terminal 2 - Azure Functions API
   cd api && dotnet run
   ```

5. **Access the application**
   - SWA CLI: http://localhost:4280
   - Frontend only: http://localhost:5173
   - API only: http://localhost:7071

### Project Structure

```
our-grocery-list/
├── frontend/           # Vite React+TS PWA
│   ├── src/
│   │   ├── api/        # API client functions
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pwa/        # PWA service worker registration
│   │   ├── storage/    # IndexedDB cache
│   │   └── types/      # TypeScript type definitions
│   └── public/         # Static assets and PWA manifest
├── api/                # .NET Azure Functions
│   ├── Functions/      # HTTP trigger endpoints
│   └── Models/         # Data models and contracts
└── docs/               # Documentation
```

### Available Scripts

- `npm start` - Start the app with SWA CLI (frontend + API)
- `npm run dev` - Start frontend dev server only
- `npm run build` - Build both frontend and API
- `npm run build:frontend` - Build frontend only
- `npm run build:api` - Build API only

## Working on the project

- Treat the requirements as the source of truth for behavior and scope; avoid adding new features without updating the requirements first.
- Keep interactions simple and touch-friendly for both mobile and desktop; PWA install should open straight to the list.
- When in doubt about edge cases, prefer the simplest behavior that still matches the requirements.

## Reference documents

- [docs/requirements.md](docs/requirements.md) — detailed Version 1 functional requirements.
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — guidance for using Copilot effectively on this project.