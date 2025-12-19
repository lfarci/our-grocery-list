# Frontend - Our Grocery List

React + TypeScript PWA built with Vite and Tailwind CSS.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **PWA**: vite-plugin-pwa with Workbox
- **State Management**: React hooks
- **Offline Storage**: IndexedDB

## Project Structure

```
src/
├── api/          # API client functions
├── components/   # React components
├── hooks/        # Custom React hooks
├── pwa/          # Service worker registration
├── storage/      # IndexedDB cache layer
└── types/        # TypeScript type definitions
```

## Local Development

### Running the Frontend Only

```bash
npm run dev
```

This starts the Vite dev server on port 5173 with hot reload.

### Running with Full Stack (Recommended)

From the root directory:

```bash
npm start
```

This uses the SWA CLI to run:
- Vite dev server on port 5173
- Azure Functions on port 7071
- SWA emulator on port 4280 (proxies both)

### Other Commands

```bash
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_BASE_URL` - API endpoint (default: `/api`)
- `VITE_SIGNALR_HUB_URL` - SignalR hub URL (default: `/api/negotiate`)

## PWA Features

- Installable app with web manifest
- Service worker for offline functionality
- Automatic asset caching with Workbox
- Network-first strategy for API calls

## Development Guidelines

- Use Tailwind utility classes for styling
- Follow existing component patterns
- Keep components simple and focused
- Use type-only imports for TypeScript types
- Format code before committing (`npm run format`)

