# E2E Tests

This directory contains end-to-end tests for the Our Grocery List application using Playwright.

## Test Coverage

The test suite covers the main features of the application:

### 1. Add Items (`add-items.spec.ts`)
- Display main page with title and form
- Add items with name only
- Add items with name and notes
- Add items by pressing Enter
- Form validation for empty names
- Validation for whitespace-only names
- Add multiple items sequentially
- Trim whitespace from inputs

### 2. Delete Items (`delete-items.spec.ts`)
- Delete single items
- Delete correct item when multiple exist
- Delete items with notes
- Delete done items
- Delete all items sequentially

### 3. Toggle Done Status (`toggle-done.spec.ts`)
- Mark items as done
- Unmark done items
- Toggle status multiple times
- Maintain independent status for multiple items
- Apply done styling to items with notes
- Order done items after not-done items
- Preserve item data when toggling

### 4. Main Features (`main-features.spec.ts`)
- Empty list state
- Accessible form labels
- Responsive page structure
- Complex workflows (add, toggle, delete)
- Display multiple items in vertical list
- Clear validation errors
- Handle special characters
- Handle long item names and notes
- Maintain proper item ordering
- Touch-friendly controls

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js 18.x, 20.x, or 22.x** installed
2. **.NET 10 SDK** installed
3. **Azure Functions Core Tools v4** installed globally:
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### View test report
```bash
npm run test:e2e:report
```

## How Tests Work

1. **Web Server**: Tests automatically start the development server using `npm run dev` which launches both the frontend (Vite) and backend (Azure Functions) via the Azure Static Web Apps CLI.

2. **Base URL**: Tests run against `http://localhost:4280` which is the default port for Azure Static Web Apps CLI.

3. **Test Isolation**: Each test starts with a fresh page load. The application uses in-memory storage, so data is cleared between server restarts.

4. **Parallelization**: Tests run in parallel in local development and sequentially in CI for reliability.

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project:

- **Test Directory**: `./e2e`
- **Browser**: Chromium (Desktop Chrome)
- **Timeout**: 120 seconds for server startup
- **Retries**: 2 retries in CI, 0 in local development
- **Trace**: Enabled on first retry for debugging

## Debugging Tests

### View traces
When tests fail, Playwright generates traces. View them with:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Run specific test file
```bash
npx playwright test e2e/add-items.spec.ts
```

### Run specific test
```bash
npx playwright test -g "should add an item with name only"
```

### Debug with Playwright Inspector
```bash
npx playwright test --debug
```

## CI/CD

The tests are configured to run in CI environments:
- More conservative retry strategy (2 retries)
- Sequential execution for stability
- Automatic test report generation

## Troubleshooting

### Port already in use
If port 4280 is already in use, stop other instances:
```bash
pkill -f "swa start"
```

### Azure Functions Core Tools not found
Install it globally:
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Or on macOS with Homebrew:
```bash
brew tap azure/functions
brew install azure-functions-core-tools@4
```

### Tests failing intermittently
- Check if the backend is running properly
- Increase timeout values if needed
- Run tests sequentially with `--workers=1`

## Writing New Tests

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Use descriptive test names that explain the expected behavior
3. Use accessible locators (roles, labels) instead of CSS selectors
4. Clean up state if needed between tests
5. Add appropriate assertions to verify both UI state and data changes
6. Test both success and error cases

## Best Practices

- **Use semantic locators**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
- **Wait for elements**: Use `await expect().toBeVisible()` instead of arbitrary waits
- **Test user behavior**: Write tests from the user's perspective
- **Keep tests isolated**: Each test should be independent
- **Use before hooks**: Set up common state in `beforeEach`
- **Descriptive assertions**: Make assertions clear about what they're checking
