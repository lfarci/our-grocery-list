# Preview Environment Setup Guide

This guide explains how to configure the required secrets for automatic preview environment configuration.

## Overview

The deployment workflow automatically configures preview environments (PR deployments) with different settings from production. Specifically, it sets `CosmosDbDatabaseId=Preview` for all preview environments to ensure they use a separate Cosmos DB database.

## Required GitHub Secrets

Before this feature can work, you need to configure two secrets in your GitHub repository:

### 1. AZURE_CREDENTIALS

Service principal credentials for Azure CLI authentication.

**Create the service principal:**

```bash
# Replace {subscription-id} with your actual Azure subscription ID
az ad sp create-for-rbac \
  --name "github-actions-our-grocery-list" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-app-prd-bc \
  --sdk-auth
```

**Expected output format:**
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "...",
  "resourceManagerEndpointUrl": "...",
  "activeDirectoryGraphResourceId": "...",
  "sqlManagementEndpointUrl": "...",
  "galleryEndpointUrl": "...",
  "managementEndpointUrl": "..."
}
```

**Add to GitHub:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_CREDENTIALS`
4. Value: Paste the entire JSON output from the command above
5. Click "Add secret"

### 2. AZURE_STATIC_WEB_APP_NAME

The name of your Azure Static Web App resource.

**Add to GitHub:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_STATIC_WEB_APP_NAME`
4. Value: `stapp-app-prd-bc` (or your actual resource name)
5. Click "Add secret"

## Verification

After configuring the secrets:

1. Create a test pull request
2. Wait for the deployment to complete
3. Check the workflow logs for:
   - "List Preview Environments" step to see all environment names
   - "Configure Preview Environment Variables" step
4. You should see: "Set CosmosDbDatabaseId=Preview for environment <name>"

**Note**: The environment name format may vary. Azure Static Web Apps may use either:
- `pull/<PR_NUMBER>` (e.g., `pull/14`)
- Just `<PR_NUMBER>` (e.g., `14`)

The workflow automatically tries both formats.

## Verifying Environment Names

To check what environment name format your Azure Static Web App uses:

```bash
az staticwebapp environment list \
  --name stapp-app-prd-bc \
  --resource-group rg-app-prd-bc
```

This will list all environments, including preview environments for active PRs.

## Troubleshooting

### "Azure CLI login failed"
- Verify AZURE_CREDENTIALS is correctly formatted JSON
- Ensure the service principal has contributor role on the resource group
- Check if the service principal credentials haven't expired

### "Resource not found"
- Verify AZURE_STATIC_WEB_APP_NAME matches your actual resource name
- Ensure the service principal has access to the resource

### "Configuration Failed: Could not set environment variable"
- Check the "List Preview Environments" step output to see actual environment names
- The environment name format may not match what the workflow expects
- Verify the preview environment was created successfully by the deployment

### Environment variable not set
- Check that both secrets are configured
- Verify the workflow ran successfully (check logs)
- Confirm you're testing with a pull request (not a push to main)

## Security Notes

- The service principal has contributor access to the resource group
- Credentials are stored as GitHub encrypted secrets
- The credentials are only used during workflow execution
- Consider rotating credentials periodically for security

## Additional Information

For more details, see:
- [docs/deployment.md](docs/deployment.md) - Full deployment guide
- [.github/workflows/azure-static-web-apps-deploy.yml](.github/workflows/azure-static-web-apps-deploy.yml) - Workflow implementation
