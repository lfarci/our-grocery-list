# Cosmos DB Setup Guide

This guide explains how to set up Azure Cosmos DB for the Our Grocery List application.

## Overview

The application supports two storage providers:
- **InMemory**: Default for local development, uses ConcurrentDictionary (no persistence)
- **CosmosDb**: Production-ready persistent storage with Azure Cosmos DB

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- .NET 8.0 SDK
- Azure Functions Core Tools v4

## Azure Resources Setup

### 1. Create Resource Group (if not exists)

```bash
az group create \
  --name rg-app-prd-bc \
  --location centralus
```

### 2. Create Cosmos DB Account

```bash
az cosmosdb create \
  --name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --locations regionName=centralus failoverPriority=0 \
  --default-consistency-level Strong \
  --enable-free-tier false
```

**Note**: Free tier can only be enabled on one Cosmos DB account per subscription. Remove `--enable-free-tier false` if you want to use the free tier.

### 3. Create Database

```bash
az cosmosdb sql database create \
  --account-name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --name GroceryListDb
```

### 4. Create Container

```bash
az cosmosdb sql container create \
  --account-name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --database-name GroceryListDb \
  --name Items \
  --partition-key-path "/partitionKey" \
  --throughput 400
```

**Container Configuration**:
- **Partition Key**: `/partitionKey` (fixed value of "global" for single shared list)
- **Throughput**: 400 RU/s (minimum for manual throughput)
- **Consistency**: Strong (set at account level)

### 5. Get Connection String

```bash
az cosmosdb keys list \
  --name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" \
  --output tsv
```

Copy the connection string for configuration in the next section.

## Local Development Configuration

### 1. Update local.settings.json

Create or update `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "StorageProvider": "CosmosDb",
    "CosmosDbConnectionString": "YOUR_COSMOS_DB_CONNECTION_STRING",
    "CosmosDbDatabaseId": "GroceryListDb",
    "CosmosDbContainerId": "Items"
  },
  "Host": {
    "CORS": "http://localhost:5173,http://127.0.0.1:5173"
  }
}
```

**Configuration Options**:
- `StorageProvider`: Set to "CosmosDb" to use Cosmos DB, or "InMemory" for in-memory storage
- `CosmosDbConnectionString`: Your Cosmos DB connection string from step 5
- `CosmosDbDatabaseId`: Database name (default: "GroceryListDb")
- `CosmosDbContainerId`: Container name (default: "Items")

### 2. Test Locally

```bash
cd api
func start
```

You should see logs indicating:
```
Application started with storage provider: CosmosDb
CosmosDbItemRepository initialized with database: GroceryListDb, container: Items
```

### 3. Seed Initial Data (Optional)

If you want to add sample data, you can use the Azure Portal or programmatically via the API:

```bash
# Create sample items via API
curl -X POST http://localhost:7071/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Milk","notes":"2 gallons"}'
```

## Azure Deployment Configuration

### 1. Configure Application Settings

Add the following settings to your Azure Static Web App or Function App:

```bash
# Using Azure CLI
az functionapp config appsettings set \
  --name your-function-app-name \
  --resource-group rg-app-prd-bc \
  --settings \
    "StorageProvider=CosmosDb" \
    "CosmosDbConnectionString=YOUR_COSMOS_DB_CONNECTION_STRING" \
    "CosmosDbDatabaseId=GroceryListDb" \
    "CosmosDbContainerId=Items"
```

Or in the Azure Portal:
1. Navigate to your Function App or Static Web App
2. Go to **Configuration** > **Application settings**
3. Add the settings listed above
4. Click **Save**

### 2. Verify Deployment

After deployment, check the application logs to ensure Cosmos DB is initialized correctly:

```bash
# View function app logs
az functionapp log tail \
  --name your-function-app-name \
  --resource-group rg-app-prd-bc
```

## Data Model

### GroceryItem Document Structure

```json
{
  "id": "guid-string",
  "partitionKey": "global",
  "name": "Milk",
  "notes": "2 gallons",
  "isDone": false,
  "createdAt": "2025-12-24T09:00:00.000Z",
  "updatedAt": "2025-12-24T09:00:00.000Z"
}
```

**Key Properties**:
- `id`: Unique identifier (GUID)
- `partitionKey`: Fixed value "global" for single shared list
- `name`: Item name (required)
- `notes`: Optional quantity/notes
- `isDone`: Completion status
- `createdAt`: UTC timestamp when item was created
- `updatedAt`: UTC timestamp when item was last modified

## Cost Optimization

### Free Tier
- 1000 RU/s throughput
- 25 GB storage
- Perfect for development and small production workloads

### Manual Throughput
- Minimum: 400 RU/s (~$24/month)
- Recommended for predictable workloads

### Autoscale Throughput
- Scales between 400-4000 RU/s automatically
- Pay only for what you use
- Recommended for production with variable load

### Cost Monitoring

```bash
# Check current throughput
az cosmosdb sql container throughput show \
  --account-name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --database-name GroceryListDb \
  --name Items
```

## Troubleshooting

### Connection Issues

**Problem**: "CosmosDbConnectionString is required when StorageProvider is set to CosmosDb"

**Solution**: Ensure `CosmosDbConnectionString` is set in `local.settings.json` or Azure application settings.

**Problem**: "The SSL connection could not be established"

**Solution**: Ensure your network allows HTTPS connections to `*.documents.azure.com` on port 443.

### Performance Issues

**Problem**: High latency or throttling

**Solution**: 
- Check RU consumption in Azure Portal
- Increase throughput if consistently hitting limits
- Ensure proper partition key usage (should always be "global" for this app)

### Data Not Appearing

**Problem**: Items not showing up after creation

**Solution**:
- Check application logs for errors
- Verify database and container names match configuration
- Ensure strong consistency is set (default for this app)

## Monitoring

### Azure Portal

1. Navigate to your Cosmos DB account
2. View **Metrics** for:
   - Total Requests
   - Total Request Units
   - Data & Index Usage
   - Throttled Requests

### Application Insights

The application logs all Cosmos DB operations with structured logging:
- `CosmosDbItemRepository initialized`
- `Retrieved {Count} items from Cosmos DB`
- `Created item {ItemId} in Cosmos DB`
- `Updated item {ItemId} in Cosmos DB`
- `Deleted item {ItemId} from Cosmos DB`

## Backup and Restore

Cosmos DB automatically provides continuous backups. To restore:

1. Navigate to your Cosmos DB account in Azure Portal
2. Go to **Backup & Restore**
3. Select the restore point
4. Create a new account with restored data

## Migration from In-Memory to Cosmos DB

1. Export existing data (if any) before switching
2. Update `local.settings.json` to use Cosmos DB
3. Restart the API
4. Verify data is persisting correctly
5. Update Azure application settings for production

## Additional Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Cosmos DB SDK for .NET](https://docs.microsoft.com/azure/cosmos-db/sql/sql-api-sdk-dotnet-standard)
- [Partition Key Selection](https://docs.microsoft.com/azure/cosmos-db/partitioning-overview)
- [Request Units](https://docs.microsoft.com/azure/cosmos-db/request-units)
