# Our Grocery List - Development Guide

This guide provides instructions for setting up and running the application locally.

## Prerequisites

- **Node.js** 18 or higher
- **.NET 10 SDK**
- **Azure Functions Core Tools** v4 (for running the API locally)
- **Azure Static Web Apps CLI** (optional, for integrated development)

To install required tools:
```bash
# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Azure Static Web Apps CLI (optional)
npm install -g @azure/static-web-apps-cli
```

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

Create your local environment file:

```bash
cp frontend/.env.example frontend/.env
```

The default configuration in `.env` is set for running services separately:
```
VITE_API_BASE_URL=http://localhost:7071/api
```

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

The API uses `api/local.settings.json` for local configuration. This file is already set up with:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
  },
  "Host": {
    "CORS": "http://localhost:5173,http://localhost:4280"
  }
}
```

If you need to recreate it, use `api/local.settings.json.example` as a template.

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

If you see CORS errors in the browser console:

1. Check `api/local.settings.json` has your frontend URL in CORS
2. Verify API is running on port 7071
3. Restart the API after changing CORS settings

### SWA CLI not starting

If `npm run dev` fails:

1. Ensure SWA CLI is installed globally:
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

2. Check that ports 4280, 5173, and 7071 are available
3. Try running services separately to isolate the issue

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
