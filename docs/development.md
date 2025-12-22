# Our Grocery List - Development Guide

This guide provides instructions for setting up and running the application locally.

## Prerequisites

- **Node.js** 18.x, 20.x, or 22.x (LTS versions)
  - ⚠️ **Important**: Node.js 24+ is NOT compatible with Azure Functions Core Tools v4
  - Recommended: Node.js 20.x LTS
  - Check your version: `node --version`
  - Download from: https://nodejs.org/
- **.NET 10 SDK**
  - Download from: https://dotnet.microsoft.com/download/dotnet/10.0
- **Azure Functions Core Tools** v4 (for running the API locally)
- **Azure Static Web Apps CLI** (optional, for integrated development)

To install required tools:
```bash
# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Azure Static Web Apps CLI (optional)
npm install -g @azure/static-web-apps-cli
```

### Node.js Version Compatibility

Azure Functions Core Tools v4 requires Node.js LTS versions (18.x, 20.x, or 22.x). If you have Node.js 24 or newer:

1. **Use nvm (Node Version Manager)** to switch versions:
   ```bash
   # Install nvm: https://github.com/nvm-sh/nvm
   nvm install 20
   nvm use 20
   ```

2. **Or download Node.js 20 LTS** from https://nodejs.org/

See https://aka.ms/functions-node-versions for more details on Azure Functions Node.js compatibility.

## Project Structure

```
our-grocery-list/
├── frontend/          # React 19 + TypeScript + Tailwind CSS PWA
├── api/              # .NET 10 Azure Functions (isolated worker)
├── package.json      # Root workspace configuration
└── swa-cli.config.json  # Azure Static Web Apps CLI config
```

## Quick Start

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will:
- Install root dependencies (SWA CLI)
- Install frontend dependencies (React, Vite, Tailwind, etc.)
- Restore .NET API dependencies

### 2. Configure Environment

**Frontend configuration:**

```bash
cp frontend/.env.example frontend/.env
```

The default configuration in `.env` is set for running services separately:
```
VITE_API_BASE_URL=http://localhost:7071/api
```

**API configuration (REQUIRED for separate services):**

```bash
cp api/local.settings.json.example api/local.settings.json
```

This file configures CORS and is required to avoid CORS errors. It's git-ignored, so you must create it locally.

### 3. Start Development Servers

You have two options for running the application locally:

#### Option A: Azure Static Web Apps CLI (Recommended)

The SWA CLI provides an integrated development experience with automatic proxy setup.

```bash
npm run dev
```

This command:
- Starts the frontend dev server on port 5173
- Starts the Azure Functions API on port 7071
- Sets up automatic proxying from frontend to API
- Provides a unified development experience

**Access the app at:** `http://localhost:4280`

**Note:** When using SWA CLI, update your `frontend/.env`:
```
VITE_API_BASE_URL=/api
```

The SWA CLI automatically proxies `/api` requests to the Azure Functions backend.

#### Option B: Run Services Separately

For more control and easier debugging, run services in separate terminals.

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`

**Terminal 2 - API:**
```bash
cd api
func start
```
API will be available at `http://localhost:7071`

**Access the app at:** `http://localhost:5173`

**Note:** Ensure your `frontend/.env` has:
```
VITE_API_BASE_URL=http://localhost:7071/api
```

## Local Configuration

### Frontend Environment Variables

Create `frontend/.env` from the example file:

```bash
cp frontend/.env.example frontend/.env
```

**Configuration options:**

| Variable | Value for Separate Services | Value for SWA CLI |
|----------|----------------------------|-------------------|
| `VITE_API_BASE_URL` | `http://localhost:7071/api` | `/api` |

**Example `frontend/.env` for separate services:**
```
VITE_API_BASE_URL=http://localhost:7071/api
```

**Example `frontend/.env` for SWA CLI:**
```
VITE_API_BASE_URL=/api
```

> **Important:** Restart the frontend dev server after changing environment variables.

### Backend Configuration

### Backend Configuration

The API requires `api/local.settings.json` for local configuration.

**Create the file from the example:**

```bash
cp api/local.settings.json.example api/local.settings.json
```

This file configures CORS and is already set up with the correct settings:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
  },
  "Host": {
    "CORS": "http://localhost:5173,http://127.0.0.1:5173"
  }
}
```

> **Important:** The `local.settings.json` file is git-ignored and must be created locally. Without it, you'll encounter CORS errors when running services separately.

## Available Scripts

### Root Directory

- `npm install` - Install all dependencies (frontend, API, and root)
- `npm run dev` - Start both frontend and API with SWA CLI
- `npm run build` - Build both frontend and API
- `npm run build:frontend` - Build frontend only
- `npm run build:api` - Build API only

### Frontend Directory (`frontend/`)

- `npm run dev` - Start frontend dev server (Vite)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint frontend code

### API Directory (`api/`)

- `func start` - Start Azure Functions locally
- `dotnet build` - Build the API
- `dotnet restore` - Restore NuGet packages

## Testing

The application uses **Playwright** for end-to-end testing.

### Prerequisites

Playwright browsers are installed automatically when you run `npm install` in the root directory. If you need to install them manually:

```bash
npx playwright install chromium
```

### Running Tests

From the root directory:

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View the test report
npm run test:report
```

### Test Configuration

Tests are configured to:
- Run against `http://localhost:5173` (automatically starts the frontend dev server)
- Use Chromium browser by default
- Retry failed tests 2 times on CI
- Generate HTML reports in `playwright-report/`

The Playwright configuration file is located at `playwright.config.ts` in the root directory.

### Writing Tests

Tests are located in the `tests/` directory. Follow these guidelines:

- Use role-based locators (`getByRole`, `getByLabel`, etc.) for resilience
- Group related tests with `test.describe()`
- Use `test.step()` to organize test actions
- Follow the naming convention: `<feature-or-page>.spec.ts`

See `.github/instructions/playwright.instructions.md` for detailed testing guidelines.

## Features

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **PWA Support** with service worker and manifest
- **Responsive Design** - works on mobile and desktop
- **Offline-First** architecture (via PWA)

### Backend
- **.NET 10** Azure Functions (isolated worker model)
- **In-Memory Storage** using ConcurrentDictionary
- **Pre-seeded Data** with 5 sample grocery items
- **CORS Enabled** for local development
- **camelCase JSON** serialization

### API Endpoints

All endpoints are prefixed with `/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all grocery items |
| POST | `/api/items` | Create a new item |
| PATCH | `/api/items/{id}` | Update an item (toggle done status) |
| DELETE | `/api/items/{id}` | Delete an item |

## Data Model

### GroceryItem

```typescript
interface GroceryItem {
  id: string;           // GUID
  name: string;         // Required
  notes?: string;       // Optional quantity/notes
  isDone: boolean;      // Completion status
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

## Development Notes

### In-Memory Storage

The API uses `ConcurrentDictionary<string, GroceryItem>` for in-memory storage. This means:
- Data persists only while the API is running
- Restarting the API resets data to the pre-seeded state
- No external database is required for local development

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (frontend dev server)
- `http://localhost:4280` (SWA CLI)

If you change ports, update `api/local.settings.json`:

```json
{
  "Host": {
    "CORS": "http://localhost:YOUR_FRONTEND_PORT,http://localhost:4280"
  }
}
```

### PWA Features

The app includes:
- **Manifest** (auto-generated by Vite PWA plugin)
- **Service Worker** (auto-generated by Workbox via Vite PWA plugin)
- **App Icon** (using `vite.svg` as placeholder)

To test PWA installation:
1. Build the frontend: `cd frontend && npm run build`
2. Serve the build: `npm run preview`
3. Open in Chrome and use "Install App" from the address bar menu

## Troubleshooting

### Frontend not connecting to API

**Check your configuration:**

1. Verify `.env` file exists in `frontend/` directory
2. Check that `VITE_API_BASE_URL` matches your setup:
   - Separate services: `http://localhost:7071/api`
   - SWA CLI: `/api`
3. Restart the frontend dev server after changing `.env`

**Verify services are running:**

```bash
# Check if API is running
curl http://localhost:7071/api/items

# Check if frontend is running
curl http://localhost:5173
```

### CORS errors

**Most common cause:** Missing `api/local.settings.json` file.

If you see CORS errors in the browser console when running services separately:

1. **Create `api/local.settings.json`** (if not already present):
   ```bash
   cp api/local.settings.json.example api/local.settings.json
   ```

2. **Verify CORS configuration** in `api/local.settings.json`:
   ```json
   {
     "Host": {
       "CORS": "http://localhost:5173,http://localhost:4280",
       "CORSCredentials": false
     }
   }
   ```

3. **Restart the API** after creating or modifying the file:
   ```bash
   cd api
   func start
   ```

4. **Check browser console** - you should see successful API requests without CORS errors

> **Note:** The `local.settings.json` file is git-ignored and must be created on each machine. This is the #1 cause of CORS issues in local development.

### SWA CLI not starting

If `npm run dev` fails:

1. Ensure SWA CLI is installed globally:
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

2. Check that ports 4280, 5173, and 7071 are available
3. Try running services separately to isolate the issue

### Node.js version incompatibility

If you see this error when running SWA CLI:

```
✖ Found Azure Functions Core Tools v4 which is incompatible with your current Node.js v24.x.x.
✖ See https://aka.ms/functions-node-versions for more information.
```

**Solution:** Azure Functions Core Tools v4 only supports Node.js LTS versions (18.x, 20.x, or 22.x). Node.js 24+ is not yet supported.

**Fix using nvm (recommended):**
```bash
# Install Node.js 20 LTS
nvm install 20
nvm use 20

# Verify the version
node --version  # Should show v20.x.x

# Try running again
npm run dev
```

**Alternative:** Download and install Node.js 20 LTS from https://nodejs.org/

> **Note:** You can check Node.js compatibility for Azure Functions at https://aka.ms/functions-node-versions

### TypeScript errors in frontend

Run a build to see all TypeScript errors:
```bash
cd frontend
npm run build
```

### Tailwind CSS not working

If styles aren't applying:

1. Verify `frontend/src/index.css` has:
   ```css
   @import "tailwindcss";
   ```

2. Check that `tailwindcss` and `@tailwindcss/postcss` are installed:
   ```bash
   cd frontend
   npm list tailwindcss @tailwindcss/postcss
   ```

3. Restart the dev server

## Production Deployment

This application is designed to be deployed to **Azure Static Web Apps**. The configuration is already set up in `swa-cli.config.json`.

For deployment instructions, see the root `README.md`.

## License

MIT
