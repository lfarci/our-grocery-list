# Preview Environment Setup Guide

This guide explains how to configure the required secrets for automatic preview environment configuration using federated credentials (OIDC).

## Overview

The deployment workflow automatically configures preview environments (PR deployments) with different settings from production. Specifically, it sets `CosmosDbDatabaseId=Preview` for all preview environments to ensure they use a separate Cosmos DB database.

The workflow uses **OpenID Connect (OIDC) federated credentials** for secure, token-based authentication without storing client secrets.

## Required GitHub Secrets

Before this feature can work, you need to configure four secrets in your GitHub repository:

### 1. AZURE_CLIENT_ID

The application (client) ID of your Azure AD app registration.

**Steps to get the client ID:**

1. Create an app registration in Azure AD:
   ```bash
   az ad app create --display-name "github-actions-our-grocery-list"
   ```
   
2. Note the `appId` from the output - this is your client ID.

**Add to GitHub:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_CLIENT_ID`
4. Value: Paste the appId
5. Click "Add secret"

### 2. AZURE_TENANT_ID

Your Azure AD tenant ID.

**Find your tenant ID:**
```bash
az account show --query tenantId -o tsv
```

**Add to GitHub:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_TENANT_ID`
4. Value: Paste the tenant ID
5. Click "Add secret"

### 3. AZURE_SUBSCRIPTION_ID

Your Azure subscription ID.

**Find your subscription ID:**
```bash
az account show --query id -o tsv
```

**Add to GitHub:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_SUBSCRIPTION_ID`
4. Value: Paste the subscription ID
5. Click "Add secret"

### 4. AZURE_STATIC_WEB_APP_NAME

The name of your Azure Static Web App resource.

**Add to GitHub:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_STATIC_WEB_APP_NAME`
4. Value: `stapp-app-prd-bc` (or your actual resource name)
5. Click "Add secret"

## Setting Up Federated Credentials

After creating the app registration, you need to:

### 1. Create a Service Principal

```bash
az ad sp create --id <APP_ID>
```

Note the `objectId` from the output.

### 2. Assign Contributor Role

```bash
az role assignment create \
  --role contributor \
  --subscription <SUBSCRIPTION_ID> \
  --assignee-object-id <SERVICE_PRINCIPAL_OBJECT_ID> \
  --assignee-principal-type ServicePrincipal \
  --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-app-prd-bc
```

### 3. Add Federated Credential for Pull Requests

```bash
az ad app federated-credential create \
  --id <APP_ID> \
  --parameters '{
    "name": "github-pr-federated-credential",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:lfarci/our-grocery-list:pull_request",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**Subject Formats:**
- For all pull requests: `repo:OWNER/REPO:pull_request`
- For specific branch: `repo:OWNER/REPO:ref:refs/heads/BRANCH`
- For specific environment: `repo:OWNER/REPO:environment:ENV_NAME`

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

### "Azure CLI login failed" or "OIDC token exchange failed"
- Verify all three secrets are configured: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- Ensure the federated credential was added correctly to the app registration
- Check that the subject in the federated credential matches: `repo:lfarci/our-grocery-list:pull_request`
- Verify the service principal has contributor role on the resource group
- Ensure the workflow has `id-token: write` permission (already configured)

### "Resource not found"
- Verify `AZURE_STATIC_WEB_APP_NAME` matches your actual resource name
- Ensure the service principal has access to the resource
- Check that the role assignment scope includes the resource group

### "Configuration Failed: Could not set environment variable"
- Check the "List Preview Environments" step output to see actual environment names
- The environment name format may not match what the workflow expects
- Verify the preview environment was created successfully by the deployment

### Environment variable not set
- Check that all four secrets are configured
- Verify the workflow ran successfully (check logs)
- Confirm you're testing with a pull request (not a push to main)

### "Federated credential does not match"
- Verify the subject in your federated credential exactly matches the GitHub repo and pull_request pattern
- You may need separate credentials for different subjects (pull requests vs. specific branches)

## Security Notes

- **No client secrets**: Uses short-lived OIDC tokens instead of long-lived credentials
- **Improved security**: Tokens are automatically rotated and scoped to workflow runs
- **Audit trail**: All authentications are logged in Azure AD
- The service principal has contributor access to the resource group
- IDs are stored as GitHub encrypted secrets (not sensitive like client secrets)
- Consider using environment-specific credentials for production deployments

## Benefits of Federated Credentials

- **No secret rotation**: No client secrets to manage or rotate
- **Better security**: Short-lived tokens with automatic expiration
- **Simplified management**: No need to update secrets when they expire
- **Improved compliance**: Meets security requirements that prohibit long-lived credentials

## Additional Information

For more details, see:
- [docs/deployment.md](docs/deployment.md) - Full deployment guide
- [.github/workflows/azure-static-web-apps-deploy.yml](.github/workflows/azure-static-web-apps-deploy.yml) - Workflow implementation
- [Azure OIDC documentation](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect) - Official Azure guide
