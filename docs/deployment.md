# Deployment Guide

This document describes how to deploy the Our Grocery List application to Azure Static Web Apps.

## Overview

The application is deployed to Azure Static Web Apps using GitHub Actions. The deployment workflow is triggered automatically on pushes to the `main` branch and on pull requests.

## Azure Resource Details

- **Resource Name**: `stapp-app-prd-bc`
- **Resource Group**: `rg-app-prd-bc`
- **Subscription**: Our Grocery List (`a11f964d-5b7d-4d99-a65d-193c11bc3901`)
- **Location**: Central US
- **SKU**: Free tier

To get the deployment URL, you can:
- Check the workflow run logs after deployment (outputs "Deployment URL" in the deploy step)
- View it in Azure Portal under the Static Web App Overview
- Use Azure CLI: `az staticwebapp show --name stapp-app-prd-bc --resource-group rg-app-prd-bc --query defaultHostname -o tsv`

## Setup Instructions

### 1. Configure Deployment Token

The deployment workflow requires a deployment token to authenticate with Azure Static Web Apps. This token needs to be configured as a GitHub repository secret.

#### Retrieve the Deployment Token

You can retrieve the deployment token using Azure CLI:

```bash
az staticwebapp secrets list \
  --name stapp-app-prd-bc \
  --resource-group rg-app-prd-bc \
  --query properties.apiKey \
  --output tsv
```

Alternatively, you can find it in the Azure Portal:
1. Navigate to the Azure Portal
2. Go to your Static Web App resource (`stapp-app-prd-bc`)
3. Click on "Manage deployment token" in the Overview section
4. Copy the deployment token

#### Add the Secret to GitHub

1. Go to your GitHub repository settings
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the deployment token from Azure
6. Click **Add secret**

#### Additional Required Secrets

For preview environment configuration using federated credentials (OIDC), you need:

1. **AZURE_CLIENT_ID**: The application (client) ID of your Azure AD app registration
   - Found in Azure Portal → Azure AD → App registrations → Your app → Overview
   
2. **AZURE_TENANT_ID**: Your Azure AD tenant ID
   - Found in Azure Portal → Azure AD → Overview
   
3. **AZURE_SUBSCRIPTION_ID**: Your Azure subscription ID
   - Found in Azure Portal → Subscriptions

**Note**: The Static Web App name is automatically extracted from the deployment URL, so you don't need to configure it as a secret.

**Setting up federated credentials:**

1. Create or use an existing app registration in Azure AD:
   ```bash
   az ad app create --display-name "github-actions-our-grocery-list"
   ```

2. Create a service principal for the app:
   ```bash
   az ad sp create --id <APP_ID>
   ```

3. Assign the Contributor role to the service principal:
   ```bash
   az role assignment create \
     --role contributor \
     --subscription <SUBSCRIPTION_ID> \
     --assignee-object-id <SERVICE_PRINCIPAL_OBJECT_ID> \
     --assignee-principal-type ServicePrincipal \
     --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-app-prd-bc
   ```

4. Add a federated credential for GitHub Actions:
   ```bash
   az ad app federated-credential create \
     --id <APP_ID> \
     --parameters '{
       "name": "github-actions-federated-credential",
       "issuer": "https://token.actions.githubusercontent.com",
       "subject": "repo:lfarci/our-grocery-list:pull_request",
       "audiences": ["api://AzureADTokenExchange"]
     }'
   ```

For more details, see the [Azure federated credentials setup section](#setting-up-federated-credentials) below.

### 2. Workflow Configuration

The deployment workflow is located at `.github/workflows/azure-static-web-apps-deploy.yml`.

#### Workflow Triggers

The workflow runs on:
- **Push to main branch**: Deploys the production version
- **Pull requests**: Creates preview deployments for testing
- **Manual trigger**: Can be triggered manually via workflow_dispatch

#### Build Process

The workflow performs the following steps:

1. **Checkout code**: Retrieves the repository code
2. **Setup Node.js**: Installs Node.js 20.x with npm caching
3. **Setup .NET**: Installs .NET 8.0.x SDK for Azure Functions
4. **Install dependencies**: Runs `npm ci` to install all dependencies
5. **Build frontend**: Compiles the React application using Vite
6. **Deploy**: Uploads the application to Azure Static Web Apps
   - Frontend: Uses pre-built artifacts from step 5
   - API: Built by Azure's Oryx build system using .NET 8.0

#### Deployment Configuration

- **App Location**: `/frontend` - Location of the React application
- **API Location**: `/api` - Location of the Azure Functions API
- **Output Location**: `dist` - Build output directory for the frontend
- **Build Strategy**:
  - Frontend build is performed in the workflow for full control
  - API build is handled by Azure Static Web Apps for .NET isolated worker compatibility

### 3. Environment Protection

The workflow uses GitHub Environments to protect the production deployment:

- **Environment Name**: `production`

The deployment URL is dynamically provided by Azure Static Web Apps after each deployment. You can find it in:
- The workflow run logs (look for "Deployment URL" notice)
- Azure Portal under your Static Web App resource
- Pull request comments (for preview deployments)

You can configure environment protection rules in GitHub:
1. Go to **Settings** > **Environments**
2. Select or create the `production` environment
3. Configure protection rules (e.g., required reviewers, wait timer)

### 4. Pull Request Deployments

When you create a pull request targeting the `main` branch:
- A preview deployment is automatically created
- The preview URL is posted as a comment on the pull request
- **Automated Playwright tests** run immediately after successful deployment
- The preview deployment is deleted when the pull request is closed

#### Preview Environment Configuration

Preview environments are automatically configured with different settings from production:

- **CosmosDbDatabaseId**: Set to `Preview` (production uses `Production` or `GroceryListDb`)
  - This ensures preview deployments use a separate Cosmos DB database
  - Configured automatically by the deployment workflow
  - Environment name: Uses the PR number directly (e.g., `14` for PR #14)

The workflow automatically sets environment variables for preview environments after deployment using Azure CLI with federated credentials (OIDC). This ensures that preview deployments are isolated from production data.

**Required Secrets for Preview Environment Configuration**:
- `AZURE_CLIENT_ID`: Application (client) ID from Azure AD app registration
- `AZURE_TENANT_ID`: Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID

**Note**: The Static Web App name is automatically extracted from the deployment URL.

**Setting up Federated Credentials**:

The workflow uses OpenID Connect (OIDC) for secure, token-based authentication without storing secrets.

1. Create an app registration in Azure AD:
   ```bash
   az ad app create --display-name "github-actions-our-grocery-list"
   # Note the appId from the output
   ```

2. Create a service principal:
   ```bash
   az ad sp create --id <APP_ID>
   # Note the objectId from the output
   ```

3. Assign Contributor role:
   ```bash
   az role assignment create \
     --role contributor \
     --subscription <SUBSCRIPTION_ID> \
     --assignee-object-id <SERVICE_PRINCIPAL_OBJECT_ID> \
     --assignee-principal-type ServicePrincipal \
     --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-app-prd-bc
   ```

4. Add federated credential for pull requests:
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

5. Add the IDs as GitHub secrets:
   - `AZURE_CLIENT_ID`: The appId from step 1
   - `AZURE_TENANT_ID`: Your tenant ID
   - `AZURE_SUBSCRIPTION_ID`: Your subscription ID

**Benefits of Federated Credentials**:
- No client secrets to manage or rotate
- Short-lived tokens for enhanced security
- Automatic token exchange via OIDC
- Better audit trail

**Environment Names**:
Preview environments in Azure Static Web Apps use the PR number as the environment name (e.g., PR #14 creates environment `14`).

### 5. Playwright Tests on Pull Requests

The repository includes automated end-to-end (E2E) tests using Playwright that run on every pull request.

#### How It Works

The Playwright test workflow is implemented as a reusable workflow that can be:
1. **Automatically invoked** by the deployment workflow after successful PR preview deployment
2. **Manually triggered** for ad-hoc testing against any URL

When a PR is opened or updated:
1. The deployment workflow builds and deploys a preview version
2. Upon successful deployment, the test workflow is automatically invoked
3. The deployment URL is passed directly to the test workflow
4. Playwright tests run against the live preview deployment
5. Test results and traces are uploaded as artifacts for review

#### Manual Test Runs

You can manually trigger Playwright tests against any URL:

1. Go to the **Actions** tab in your GitHub repository
2. Select the "Playwright Tests" workflow
3. Click **Run workflow**
4. Enter the deployment URL to test
5. Click **Run workflow**

#### Viewing Test Results

After tests complete:
- Check the workflow run summary for pass/fail status
- Download test artifacts:
  - `playwright-report`: HTML report with detailed test results
  - `playwright-traces`: Test execution traces for debugging failures

### 6. Manual Deployment

You can manually trigger a deployment:

1. Go to the **Actions** tab in your GitHub repository
2. Select the "Azure Static Web Apps - Deploy" workflow
3. Click **Run workflow**
4. Select the branch to deploy
5. Click **Run workflow**

## Monitoring and Troubleshooting

### View Deployment Logs

1. Go to the **Actions** tab in your GitHub repository
2. Select the workflow run you want to inspect
3. Click on the job to view detailed logs

### Common Issues

#### Deployment Token Expired

If you see authentication errors:
1. Regenerate the deployment token in Azure Portal
2. Update the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub

#### Build Failures

If the build fails:
1. Check the workflow logs for specific error messages
2. Ensure all dependencies are correctly specified in `package.json` and `api.csproj`
3. Test the build locally using `npm run build`

#### API Not Working

If the API endpoints are not accessible after deployment:
1. Verify the API location is correctly set to `/api`
2. Check that the Azure Functions are using the isolated worker model
3. Review the API logs in Azure Portal under the Static Web App resource

## Local Development vs. Production

### Local Development
- Frontend runs on `http://localhost:5173`
- API runs on `http://localhost:7071`
- Uses local settings from `local.settings.json`

### Production
- Frontend and API are served from the Azure Static Web Apps default hostname (check workflow logs or Azure Portal for the URL)
- API endpoints are available at `/api/*`
- Environment variables are configured in Azure Portal

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli)
