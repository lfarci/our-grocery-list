#!/usr/bin/env bash
set -euo pipefail

settings_path="/home/site/wwwroot/local.settings.json"

: "${AzureWebJobsStorage:=}"
: "${CosmosDbConnectionString:=}"
: "${CosmosDbDatabaseId:=GroceryListDb}"
: "${CosmosDbContainerId:=Items}"
: "${AzureSignalRConnectionString:=}"
: "${CORS_ALLOWED_ORIGINS:=http://localhost:5173,http://127.0.0.1:5173}"

cat > "$settings_path" <<EOF_SETTINGS
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "${AzureWebJobsStorage}",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "CosmosDbConnectionString": "${CosmosDbConnectionString}",
    "CosmosDbDatabaseId": "${CosmosDbDatabaseId}",
    "CosmosDbContainerId": "${CosmosDbContainerId}",
    "AzureSignalRConnectionString": "${AzureSignalRConnectionString}"
  },
  "Host": {
    "CORS": "${CORS_ALLOWED_ORIGINS}"
  }
}
EOF_SETTINGS

exec /opt/startup/start_nonappservice.sh
