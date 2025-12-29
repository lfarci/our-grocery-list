# GitHub Copilot Workspace Setup Guide

This guide provides instructions for working with this project in GitHub Copilot Workspace.

## Overview

GitHub Copilot Workspace is a cloud-based development environment that allows you to work on GitHub projects directly in your browser. This project is fully compatible with Copilot Workspace, including running Playwright tests.

## Prerequisites

No special prerequisites are needed for Copilot Workspace - the environment comes pre-configured with Node.js, .NET, and other required tools.

## Initial Setup

When you first open the project in Copilot Workspace:

### Automated Setup (Recommended)

The project includes a GitHub Actions workflow (`.github/workflows/copilot-setup.yml`) that automatically runs when you create a Copilot Workspace session. This workflow:
- Installs all dependencies
- Sets up environment files
- Builds the project
- Verifies Playwright installation
- Runs smoke tests

You can also trigger this workflow manually from the Actions tab.

### Manual Setup

If you prefer manual setup or the workflow hasn't run:

#### 1. Install Dependencies

```bash
npm install
```

This will:
- Install root dependencies (Azure Static Web Apps CLI, Playwright)
- Install frontend dependencies (React, Vite, Tailwind, etc.)
- Restore .NET API dependencies
- **Automatically install Playwright browsers** for testing

#### 2. Verify Playwright Installation

The `postinstall` script now detects Copilot Workspace and automatically installs Playwright browsers. You can verify the installation:

```bash
npx playwright --version
```

If browsers were not installed for any reason, you can manually install them:

```bash
npm run playwright:install
```

### Using VS Code Tasks

The project includes preconfigured VS Code tasks (`.vscode/tasks.json`) for common operations:

- **Copilot Workspace: Quick Start** - Default task that installs dependencies and sets up environment files
- **Install Dependencies** - Run `npm install`
- **Install Playwright Browsers** - Manually install Playwright browsers
- **Start Frontend Dev Server** - Start the Vite dev server
- **Start API Server** - Start the Azure Functions API
- **Run All Tests** - Execute all Playwright tests
- **Run Tests (UI Mode)** - Open Playwright's interactive test UI
- **Build Frontend** - Build the React application
- **Build API** - Build the .NET API

Access these tasks via:
- Command Palette: `Ctrl+Shift+P` → "Tasks: Run Task"
- Or use the default build task: `Ctrl+Shift+B`

## Running the Application

### Start the Development Server

```bash
# Option 1: Start frontend only (for testing)
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Testing API Endpoints

The API requires a Cosmos DB connection. For full local development with the API:

1. Set up environment configuration (see [development.md](development.md))
2. Start the API in a separate terminal:
   ```bash
   cd api
   func start
   ```

## Running Tests

### Running Playwright Tests

From the root directory:

```bash
# Run all tests (starts dev server automatically)
npm test

# Run tests in UI mode (interactive browser)
npm run test:ui

# Run tests in debug mode (step through with debugger)
npm run test:debug

# View the HTML test report
npm run test:report
```

### How Tests Work in Copilot Workspace

The Playwright configuration (`playwright.config.ts`) automatically:
1. Starts the frontend dev server on `http://localhost:5173`
2. Waits for the server to be ready (up to 120 seconds)
3. Runs tests against the local development server
4. Generates HTML reports in `playwright-report/`

### Understanding Test Results

- **Passing tests**: Green checkmarks indicate successful tests
- **Failing tests**: Red X marks show failures with detailed error messages
- **Traces**: On test failures, Playwright captures traces (screenshots, network logs) in `test-results/`
- **Reports**: View detailed HTML reports with `npm run test:report`

## Troubleshooting

### Playwright Browsers Not Installed

If you see `Error: Executable doesn't exist` when running tests:

```bash
npm run playwright:install
```

This manually installs the Chromium browser needed for testing.

### Tests Timeout or Fail to Start

If tests timeout waiting for the dev server:

1. Check if port 5173 is already in use:
   ```bash
   lsof -i :5173
   ```

2. Manually start the frontend first:
   ```bash
   cd frontend
   npm run dev
   ```

3. In another terminal, run tests:
   ```bash
   npm test
   ```

### Browser Launch Fails

If you see browser launch errors:

1. Verify Playwright installation:
   ```bash
   npx playwright --version
   ls -la ~/.cache/ms-playwright/
   ```

2. Reinstall browsers with system dependencies:
   ```bash
   npx playwright install chromium --with-deps
   ```

## Environment Variables

Copilot Workspace sets several environment variables automatically:

- `CI=true`: Indicates a CI-like environment
- `COPILOT_AGENT_ACTION`: Indicates Copilot Workspace is active
- `GITHUB_WORKSPACE`: Points to the repository root

The `postinstall` script detects these and installs Playwright browsers appropriately.

## Key Differences from Local Development

| Aspect | Local Development | Copilot Workspace |
|--------|-------------------|-------------------|
| Playwright Installation | Automatic via postinstall | Automatic via postinstall (with Copilot detection) |
| Browser | Uses system-installed browsers | Uses downloaded Chromium in ~/.cache |
| Environment | Your machine | Cloud-based container |
| Port Access | Direct access | Through forwarded ports |

## Recommended VS Code Extensions

The project includes recommended VS Code extensions (`.vscode/extensions.json`) that enhance the development experience:

- **Playwright Test for VSCode** - Run and debug Playwright tests
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS class autocomplete
- **C# DevKit** - C# language support
- **Azure Functions** - Azure Functions development tools
- **GitHub Copilot** - AI-powered code suggestions

VS Code will prompt you to install these extensions when you open the workspace.

## Tips for Effective Testing

1. **Use UI Mode for Debugging**: `npm run test:ui` provides an interactive interface to debug tests
2. **Check Traces**: Failed tests automatically capture traces - use `npm run test:report` to view them
3. **Run Specific Tests**: Use `npx playwright test tests/grocery-list.spec.ts` to run a single test file
4. **Watch Mode**: Run tests in watch mode with `npx playwright test --ui` for rapid iteration
5. **Use VS Code Tasks**: Press `Ctrl+Shift+B` for quick access to build and test tasks

## Next Steps

- See [development.md](development.md) for complete development setup
- See [playwright.instructions.md](../.github/instructions/playwright.instructions.md) for test writing guidelines
- See [requirements.md](requirements.md) for application requirements and user flows

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [GitHub Copilot Workspace Documentation](https://githubnext.com/projects/copilot-workspace)
- [5 Tips for Using GitHub Copilot Workspace](https://github.blog/ai-and-ml/github-copilot/5-tips-and-tricks-when-using-github-copilot-workspace/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
