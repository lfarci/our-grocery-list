# Cosmos DB Migration Checklist

Quick checklist for provisioning Azure resources and testing the Cosmos DB integration.

## Prerequisites
- [ ] Azure CLI installed and logged in
- [ ] Access to Azure subscription (`a11f964d-5b7d-4d99-a65d-193c11bc3901`)
- [ ] .NET 8.0 SDK installed
- [ ] Azure Functions Core Tools v4 installed

## Step 1: Provision Azure Cosmos DB Resources

### 1.1 Create Resource Group (if needed)
```bash
az group create \
  --name rg-app-prd-bc \
  --location centralus
```
- [ ] Resource group created

### 1.2 Create Cosmos DB Account
```bash
az cosmosdb create \
  --name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --locations regionName=centralus failoverPriority=0 \
  --default-consistency-level Strong \
  --enable-free-tier false
```
**Note**: This may take 5-10 minutes. Use `--enable-free-tier true` if you want the free tier (1000 RU/s).

- [ ] Cosmos DB account created

### 1.3 Create Database
```bash
az cosmosdb sql database create \
  --account-name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --name GroceryListDb
```
- [ ] Database created

### 1.4 Create Container
```bash
az cosmosdb sql container create \
  --account-name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --database-name GroceryListDb \
  --name Items \
  --partition-key-path "/partitionKey" \
  --throughput 400
```
- [ ] Container created with partition key `/partitionKey`

### 1.5 Get Connection String
```bash
az cosmosdb keys list \
  --name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" \
  --output tsv
```
- [ ] Connection string retrieved and saved securely

## Step 2: Configure Local Development

### 2.1 Update local.settings.json
Edit `api/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "CosmosDbConnectionString": "YOUR_CONNECTION_STRING_HERE",
    "CosmosDbDatabaseId": "GroceryListDb",
    "CosmosDbContainerId": "Items"
  },
  "Host": {
    "CORS": "http://localhost:5173,http://127.0.0.1:5173"
  }
}
```
- [ ] `local.settings.json` updated with connection string

## Step 3: Test Locally

### 3.1 Start the API
```bash
cd api
func start
```
Expected output should include:
```
Application started with storage provider: CosmosDb
CosmosDbItemRepository initialized with database: GroceryListDb, container: Items
```
- [ ] API started successfully
- [ ] Cosmos DB logs appear in console

### 3.2 Test GET All Items
```bash
curl http://localhost:7071/api/items
```
Expected: Empty array `[]` (no items yet)
- [ ] GET returns empty array

### 3.3 Test POST Create Item
```bash
curl -X POST http://localhost:7071/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","notes":"Testing Cosmos DB"}'
```
Expected: Returns created item with ID
- [ ] POST creates item successfully

### 3.4 Test GET All Items Again
```bash
curl http://localhost:7071/api/items
```
Expected: Array with one item
- [ ] GET returns created item

### 3.5 Test PATCH Update Item
```bash
# Replace {id} with the actual ID from step 3.3
curl -X PATCH http://localhost:7071/api/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"isDone":true}'
```
Expected: Returns updated item with `isDone: true`
- [ ] PATCH updates item successfully

### 3.6 Test DELETE Item
```bash
# Replace {id} with the actual ID
curl -X DELETE http://localhost:7071/api/items/{id}
```
Expected: HTTP 204 No Content
- [ ] DELETE removes item successfully

### 3.7 Verify Persistence
1. Stop the API (Ctrl+C)
2. Start it again: `func start`
3. GET all items: `curl http://localhost:7071/api/items`

Expected: Items persist across restarts
- [ ] Data persists after API restart

## Step 4: Test with Frontend

### 4.1 Start Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
- [ ] Frontend started at http://localhost:5173

### 4.2 Manual UI Testing
1. Open http://localhost:5173
2. Add a new item
3. Mark item as done/undone
4. Delete an item
5. Refresh the page
6. Verify items persist

- [ ] Add item works
- [ ] Toggle done/undone works
- [ ] Delete item works
- [ ] Data persists after page refresh

### 4.3 Run Playwright Tests
From the root directory:
```bash
npm test
```
- [ ] All Playwright tests pass

## Step 5: Configure Azure Deployment

### 5.1 Update Azure Application Settings
```bash
az staticwebapp appsettings set \
  --name stapp-app-prd-bc \
  --resource-group rg-app-prd-bc \
  --setting-names \
    CosmosDbConnectionString="YOUR_CONNECTION_STRING_HERE" \
    CosmosDbDatabaseId=GroceryListDb \
    CosmosDbContainerId=Items
```
- [ ] Azure application settings configured

### 5.2 Deploy to Azure
Push to main branch or manually trigger deployment:
```bash
git push origin main
```
- [ ] Deployment triggered
- [ ] Deployment succeeded

### 5.3 Verify Production Deployment
1. Open the deployed app URL
2. Test CRUD operations
3. Verify data persists
4. Check Azure Portal logs for Cosmos DB operations

- [ ] Production app works with Cosmos DB
- [ ] Logs show Cosmos DB operations

## Step 6: Verify in Azure Portal

### 6.1 Check Cosmos DB Data
1. Go to Azure Portal
2. Navigate to the Cosmos DB account
3. Open Data Explorer
4. Browse to `GroceryListDb` > `Items`
5. View documents

- [ ] Items visible in Data Explorer
- [ ] Partition key is "global" for all items

### 6.2 Monitor Metrics
1. Navigate to Metrics in Cosmos DB account
2. Check:
   - Total Requests
   - Total Request Units consumed
   - Data & Index Usage

- [ ] Metrics show activity
- [ ] RU consumption is reasonable

## Troubleshooting

### API won't start
- Check connection string is valid
- Verify database and container names match
- Ensure network connectivity to `*.documents.azure.com`

### Items not persisting
- Check API logs for Cosmos DB errors
- Verify partition key is set correctly ("global")
- Check Cosmos DB firewall rules

### High latency
- Check RU consumption in Azure Portal
- Consider increasing throughput if consistently throttled
- Verify using Direct connection mode (default in this implementation)

## Rollback Options

If you encounter issues with Cosmos DB, the emulator can be stopped and data will be preserved for troubleshooting. The application requires Cosmos DB (emulator or cloud) to function.

## Cost Monitoring

### Check Current Costs
```bash
# View current throughput
az cosmosdb sql container throughput show \
  --account-name grocerylist-cosmos-db \
  --resource-group rg-app-prd-bc \
  --database-name GroceryListDb \
  --name Items
```

### Expected Costs
- **Free Tier**: $0 (first 1000 RU/s, 25 GB)
- **400 RU/s Manual**: ~$24/month
- **Autoscale (400-4000 RU/s)**: Pay for what you use

## Success Criteria

- [x] All Cosmos DB resources provisioned
- [ ] Local development works with Cosmos DB
- [ ] Data persists across API restarts
- [ ] Frontend works with Cosmos DB backend
- [ ] All tests pass
- [ ] Production deployment uses Cosmos DB
- [ ] Data visible in Azure Portal
- [ ] Monitoring shows reasonable RU consumption

## Additional Resources

- [Cosmos DB Setup Guide](cosmosdb-setup.md) - Detailed setup instructions
- [Implementation Summary](cosmosdb-integration-summary.md) - Technical details
- [Architecture Documentation](architecture.md) - System architecture

## Notes

- The partition key is always "global" for this app (single shared list)
- Strong consistency is used for all operations
- Connection mode is Direct for best performance
- All operations are logged for troubleshooting
