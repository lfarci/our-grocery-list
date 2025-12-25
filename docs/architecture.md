# Architecture Overview

This document describes the technical architecture of the Our Grocery List application.

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **PWA Support**: vite-plugin-pwa with Workbox
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Local Storage**: IndexedDB for offline caching

### Backend
- **Runtime**: Azure Functions v4 (.NET 10 isolated worker)
- **Language**: C#
- **HTTP Framework**: ASP.NET Core
- **Planned Database**: Azure Cosmos DB
- **Planned Real-time**: Azure SignalR Service

### Infrastructure
- **Hosting**: Azure Static Web Apps
- **Local Development**: Azure Static Web Apps CLI (SWA CLI)
- **CI/CD**: (Planned for future iteration)

## Project Structure

```
our-grocery-list/
├── frontend/                    # React PWA application
│   ├── src/
│   │   ├── api/                # API client functions
│   │   │   ├── index.ts
│   │   │   └── items.ts        # CRUD operations for items
│   │   ├── components/         # React components
│   │   │   ├── index.ts
│   │   │   └── GroceryList.tsx # Main list component
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── index.ts
│   │   │   └── useGroceryList.ts # Hook for item management
│   │   ├── pwa/                # PWA service worker registration
│   │   │   ├── index.ts
│   │   │   └── register.ts
│   │   ├── storage/            # IndexedDB cache layer
│   │   │   ├── index.ts
│   │   │   └── indexeddb.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── index.ts
│   │   │   └── item.ts         # GroceryItem interface
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   └── icon-*.png          # App icons (placeholders)
│   ├── .env.example            # Environment variables template
│   ├── vite.config.ts          # Vite and PWA configuration
│   └── package.json
├── api/                        # Azure Functions backend
│   ├── Functions/              # HTTP trigger functions
│   │   ├── ItemFunctions.cs    # CRUD endpoints for items
│   │   └── SignalRFunctions.cs # SignalR negotiate endpoint (planned)
│   ├── Models/                 # Data models
│   │   └── GroceryItem.cs      # Item model and DTOs
│   ├── Repositories/           # Data access layer
│   │   ├── IItemRepository.cs       # Repository interface
│   │   └── CosmosDbItemRepository.cs # Cosmos DB implementation
│   ├── Program.cs              # Functions host configuration
│   ├── host.json               # Functions runtime config
│   ├── local.settings.json.example # Settings template
│   └── api.csproj
├── docs/                       # Documentation
│   ├── architecture.md         # Architecture overview
│   ├── requirements.md         # Functional requirements
│   ├── development.md          # Development setup guide
│   ├── deployment.md           # Deployment guide
│   └── cosmosdb-setup.md       # Cosmos DB setup guide
├── swa-cli.config.json         # Static Web Apps CLI config
├── package.json                # Root workspace configuration
└── README.md
```

## Data Model

### GroceryItem

The core data model representing a grocery list item:

**TypeScript (Frontend)**:
```typescript
interface GroceryItem {
  id: string;                    // Unique identifier (GUID)
  name: string;                  // Item name (required)
  notes?: string;                // Optional quantity/notes
  isDone: boolean;               // Completion status
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**C# (Backend)**:
```csharp
public class GroceryItem
{
    public string Id { get; set; }              // Unique identifier (GUID)
    public string ListId { get; set; }          // List identifier (defaults to "default")
    public string PartitionKey { get; set; }    // Partition key for Cosmos DB (uses listId value)
    public string Name { get; set; }            // Item name (required)
    public string? Notes { get; set; }          // Optional quantity/notes
    public bool IsDone { get; set; }            // Completion status
    public DateTime CreatedAt { get; set; }     // UTC timestamp
    public DateTime UpdatedAt { get; set; }     // UTC timestamp
}
```

**Note**: The `ListId` property identifies which list an item belongs to (currently defaults to "default" for the single shared list). The `PartitionKey` uses the same value as `ListId` for Cosmos DB partitioning. These properties are not exposed to the frontend.

### Request/Response Contracts

**CreateItemRequest**:
- `name` (required): Item name
- `notes` (optional): Quantity or notes

**UpdateItemRequest**:
- `isDone` (optional): Completion status

## API Endpoints

All endpoints are prefixed with `/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /items | Get all grocery items |
| POST | /items | Create a new item |
| PATCH | /items/{id} | Update an item (toggle done status) |
| DELETE | /items/{id} | Delete an item |
| GET/POST | /negotiate | SignalR negotiation endpoint |

## Frontend Architecture

### Component Structure
- **App.tsx**: Root component (currently a placeholder)
- **GroceryList.tsx**: Displays the list with sorting and actions

### State Management
- **useGroceryList**: Custom hook managing item state and API calls
- Local state with React hooks
- Future: SignalR integration for real-time updates

### Offline Support
- **IndexedDB**: Local cache for items
- **Service Worker**: Automatic caching via Workbox
- **Network-first strategy**: Try API, fallback to cache

### PWA Features
- Installable app with manifest.json
- Service worker for offline functionality
- App icons (currently placeholders)
- Standalone display mode

## Backend Architecture

### Azure Functions
- **Isolated worker model**: Runs in separate process
- **HTTP triggers**: RESTful API endpoints
- **Authorization**: Anonymous (to be enhanced with auth later)
- **Repository pattern**: Abstraction for data access

### Data Layer
- **Storage**: Azure Cosmos DB with **NoSQL API** (formerly SQL API)
  - **Cosmos DB Emulator**: For local development (localhost:8081)
  - **Azure Cosmos DB**: For production
- **Repository interface**: IItemRepository for abstraction
- **Cosmos DB NoSQL API specifics**:
  - Document database with JSON documents for items
  - SQL-like query syntax (NoSQL API query language)
  - Partition key: Uses `listId` property (defaults to "default" for single shared list)
  - Future-ready for multi-list support by using different listId values
  - Consistency: Strong consistency for operations
  - Connection: Configured via connection string
  - Database: GroceryListDb (configurable)
  - Container: Items (configurable)
  - SDK: Microsoft.Azure.Cosmos (NoSQL API SDK)
  - Emulator connection string: Well-known key for local development

### Real-time Updates (Planned)
- **Azure SignalR Service**: Push updates to all clients
- **Hub method**: Broadcast item changes
- **Client reconnection**: Automatic retry logic

## Local Development Workflow

See [frontend/README.md](../frontend/README.md) for detailed local development instructions.

**Quick start:**
- Full stack: `npm start` (from root, uses SWA CLI)
- Frontend only: `cd frontend && npm run dev`
- Backend only: `cd api && func start`

## Environment Configuration

### Frontend (.env)
- `VITE_API_BASE_URL`: API endpoint (default: `/api`)
- `VITE_SIGNALR_HUB_URL`: SignalR hub URL (default: `/api/negotiate`)

### Backend (local.settings.json)
- `AzureWebJobsStorage`: Storage connection (development)
- `FUNCTIONS_WORKER_RUNTIME`: dotnet-isolated
- `CosmosDbConnectionString`: Cosmos DB connection string
  - Local: Cosmos DB Emulator (localhost:8081)
  - Production: Azure Cosmos DB connection string
- `CosmosDbDatabaseId`: Database name (default: "GroceryListDb")
- `CosmosDbContainerId`: Container name (default: "Items")
- `AzureSignalRConnectionString`: SignalR connection (future)

For detailed Cosmos DB setup including the emulator, see [cosmosdb-setup.md](cosmosdb-setup.md).

## Build and Deployment

### Build Commands
```bash
# Frontend
cd frontend && npm run build

# Backend
cd api && dotnet build

# Both
npm run build
```

### Output
- Frontend: `frontend/dist/` (static files)
- Backend: `api/bin/` (.NET assemblies)

### Deployment (Planned)
- GitHub Actions workflow
- Automatic deployment to Azure Static Web Apps
- Environment-specific configurations

## Future Enhancements

1. **Database Integration**: Connect to Cosmos DB
2. **Real-time Updates**: Implement SignalR broadcasting
3. **Authentication**: Add Azure AD B2C (if needed)
4. **Monitoring**: Application Insights integration
5. **Testing**: Unit tests, integration tests, E2E tests
6. **CI/CD**: GitHub Actions workflows
7. **Infrastructure**: Bicep/Terraform templates

## Development Guidelines

- Keep the single global list concept (no multi-tenancy)
- Maintain offline-first approach
- Ensure mobile-friendly UI
- Follow TypeScript strict mode
- Use C# nullable reference types
- Keep API responses minimal and efficient