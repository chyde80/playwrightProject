# SauceDemo Playwright Testing Framework

A comprehensive TypeScript-based testing framework for the SauceDemo website using Playwright.

## Project Structure

```
├── src/
│   ├── pages/              # Page Object Models
│   │   ├── LoginPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   └── fixtures/           # Test data and fixtures
│       └── testData.ts
├── tests/                  # Test suites
│   ├── login.spec.ts
│   ├── products.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── problem-user.spec.ts
│   └── e2e.spec.ts
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json          # TypeScript configuration
```

## Features

- **Page Object Model Pattern**: Clean separation between page elements and test logic
- **TypeScript Support**: Full type safety for tests
- **Multiple Browsers**: Tests run against Chromium, Firefox, and WebKit
- **Mobile Testing**: Mobile Chrome and Safari viewport configurations
- **UI Issue Detection**: Tests that verify visual/rendering bugs
- **Comprehensive Test Suites**:
  - Login validation (including locked out users)
  - Product browsing and filtering
  - Shopping cart operations
  - Checkout process
  - UI/visual bug detection
  - End-to-end purchase flows

## Assignment Compliance

This project is designed to satisfy the Foundation Health QA Automation Tech Test requirements:

- **Framework**: Playwright
- **Language**: TypeScript
- **Test URL**: https://www.saucedemo.com
- **Login flow**: Automated in `tests/login.spec.ts`
- **Additional critical coverage**:
  - Product browsing, sorting, and details validation
  - Cart operations, totals calculation, and remove/continue shopping behavior
  - Checkout form validation, order summary, and completion flow
  - End-to-end purchase flow from login to order confirmation
- **Meaningful assertions**: Validates URLs, element visibility, item and cart counts, total values, error messages, and order completion text
- **Documentation**: This `README.md` includes setup, run instructions, and a `To Do` section

## User-Specific Coverage

- `standard_user`: full workflow coverage for shopping, checkout, and order completion
- `performance_glitch_user`: same end-to-end coverage plus dedicated slow-load detection
- `problem_user`: UI and visual bug detection without forcing misleading workflow failures
- `locked_out_user`: locked-out login handling and error validation

## Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run tests with debugging
```bash
npm run test:debug
```

### Run tests for specific browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run tests for mobile viewports
```bash
npm run test:mobile
```

### Run tests for specific test suite
```bash
npm test tests/login.spec.ts          # Login tests
npm test tests/products.spec.ts       # Product browsing tests
npm test tests/cart.spec.ts           # Shopping cart tests
npm test tests/checkout.spec.ts       # Checkout process tests
npm test tests/problem-user.spec.ts   # Problem user UI issues detection
npm test tests/e2e.spec.ts            # End-to-end purchase flows
```

### Run tests with a specific SauceDemo user
```bash
TEST_USER=standard_user npm test -- --project=chromium
TEST_USER=performance_glitch_user npm test -- --project=chromium
TEST_USER=problem_user npm test -- --project=chromium
TEST_USER=locked_out_user npm test -- --project=chromium
```

### View test report
```bash
npm run test:report
```

## Test Users

The SauceDemo website provides the following test accounts:

| Username | Password | Notes |
|----------|----------|-------|
| `standard_user` | `secret_sauce` | Standard account |
| `locked_out_user` | `secret_sauce` | Account is locked |
| `problem_user` | `secret_sauce` | Account with UI issues |
| `performance_glitch_user` | `secret_sauce` | Slow page loads |

## Test Coverage Summary

- **Total Tests**: 39 individual tests
- **Browser Coverage**: Chromium, Firefox, WebKit
- **Mobile Testing**: Chrome Mobile (Pixel 5), Safari Mobile (iPhone 12)
- **Features Tested**:
  - User authentication scenarios
  - Product discovery and filtering
  - Shopping cart management
  - Checkout validation
  - End-to-end purchase flows
  - Multi-user account testing
  - Order totals calculation
  - **UI/Visual Bug Detection** (problem_user)

## Known Bugs Detected by Tests

The framework successfully detects issues with the `problem_user` account:

1. **Cart Badge Display Bug** - Item count badge fails to update correctly
   - Expected 3 items, but badge shows 2
   - Items are actually in cart (functionality works)
   - Visual/display-only issue

2. **Image Loading Issues** - Product images may fail to render properly

3. **UI Rendering Glitches** - Visual elements display incorrectly despite working functionality

## Test Suites

### Login Tests (`tests/login.spec.ts`)
- Form element visibility
- Successful login with valid credentials
- Login rejection with invalid credentials
- Locked out user handling with comprehensive validation
- Empty field validation
- Error message persistence and retry behavior

### Product Tests (`tests/products.spec.ts`)
- Display all products
- Product details visibility
- Add single product to cart
- Add multiple products to cart
- Navigation to cart
- Sorting by name (A-Z, Z-A)
- Sorting by price (Low-High, High-Low)

### Cart Tests (`tests/cart.spec.ts`)
- Empty cart display
- Display added items
- Remove items from cart
- Continue shopping functionality
- Total calculations (subtotal, tax, total)
- Proceed to checkout

### Checkout Tests (`tests/checkout.spec.ts`)
- Checkout form validation
- Missing field validation
- Proceed to step two
- Order completion
- Checkout cancellation
- Total verification between cart and checkout

### Problem User Tests (`tests/problem-user.spec.ts`)
- Detect UI issues with problem_user account
- Verify cart badge display bugs
- Confirm functionality works despite visual issues
- Document image rendering problems
- Test that data integrity is maintained despite UI glitches
- Validate checkout still works with visual bugs

### Performance Glitch User Tests (`tests/performance.spec.ts`)
- Detect slow inventory page loads for performance_glitch_user
- Keep normal test timeouts unchanged for standard_user
- Isolate slow-load detection to a dedicated test

### E2E Tests (`tests/e2e.spec.ts`)
- Complete purchase flow from login to confirmation
- Add, remove, and re-add items
- Multiple user account support
- Total calculations for multiple items

## Page Object Models

### LoginPage
- `navigate()` - Go to login page
- `login(username, password)` - Perform login
- `getErrorMessage()` - Get error message text
- `isErrorMessageVisible()` - Check error visibility

### ProductsPage
- `navigate()` - Go to products page
- `getProductCount()` - Get number of products
- `getProductByName(productName)` - Find product by name
- `addProductToCart(productName)` - Add product to cart
- `isProductInCart(productName)` - Check if product is in cart
- `getCartItemCount()` - Get cart item count
- `goToCart()` - Navigate to cart
- `sortBy(sortOption)` - Sort products
- `getAllProductNames()` - Get all product names
- `getAllProductPrices()` - Get all product prices

### CartPage
- `navigate()` - Go to cart page
- `getCartItemCount()` - Get number of items
- `getCartItemNames()` - Get item names
- `removeItemFromCart(productName)` - Remove item from cart
- `isCartEmpty()` - Check if cart is empty
- `continueShoppingClicked()` - Continue shopping button
- `proceedToCheckout()` - Go to checkout
- `getSubtotal()` - Get subtotal amount
- `getTax()` - Get tax amount
- `getTotal()` - Get total amount

### CheckoutPage
- `navigateToCheckoutOne()` - Go to checkout step 1
- `navigateToCheckoutTwo()` - Go to checkout step 2
- `fillCheckoutInfo(firstName, lastName, postalCode)` - Fill checkout form
- `continueToNextStep()` - Proceed to step 2
- `completeOrder()` - Complete the order
- `getErrorMessage()` - Get error message
- `isErrorMessageVisible()` - Check error visibility
- `cancelCheckout()` - Cancel checkout
- `getSubtotal()`, `getTax()`, `getTotal()` - Get totals

## Configuration

### Playwright Config (`playwright.config.ts`)
- **Base URL**: https://www.saucedemo.com
- **Test Directory**: ./tests
- **Reporter**: HTML
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Trace**: Captured on first retry

### TypeScript Config (`tsconfig.json`)
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Output Directory**: ./dist

## Debugging

### Using VS Code Debugger
1. Set breakpoints in test files
2. Run: `npm run test:debug`
3. Step through the code

### Using Playwright Inspector
```bash
npm run test:debug
```

## To Do

Below are suggested upgrades and maintenance items to make the framework more robust, maintainable, and CI-ready. Items are grouped by priority with short implementation notes.

High priority
- Add CI matrix & artifact publishing: expand `.github/workflows/ci.yml` to run a browser matrix (chromium/firefox/webkit), upload HTML report + traces/videos/screenshots as job artifacts, and run on PRs.
- Add pre-commit hooks (`husky` + `lint-staged`) to run `npm run lint:fix` and `npm run format` on staged files.
- Add automated dependency updates: enable Dependabot or Renovate to keep Playwright/TypeScript/devDeps current.

Medium priority
- Harden flaky-test handling: collect flakiness metrics, tune retries and timeouts, and add a dedicated flaky-test triage job to mark/track unstable tests.
- Add a Dockerfile and `docker-compose` snippet to run tests reproducibly in CI or locally (use `npx playwright install --with-deps`).
- Add visual regression testing (Playwright snapshots, Percy, or Chromatic) focused on `problem_user` image/badge bugs.
- Add accessibility checks (axe-playwright) to run basic a11y checks during CI on key pages (login, cart, checkout).

Low priority / Nice to have
- Add performance and synthetic monitoring tests (Lighthouse or Playwright timings) for `performance_glitch_user` scenarios and baseline comparisons.
- Add structured test data management: centralize fixtures, support multiple locales, and add factories (faker) for randomized scenarios.
- Add richer reporting: integrate with TestRail/Jira, generate JUnit/Allure reports, or push results to a dashboard.
- Add security and license scanning to CI (npm audit, snyk) and a dependency policy for production-grade repos.

Repository hygiene
- Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and a PR template to document expectations for contributors.
- Add badge(s) at the top of this README for CI status and test report link(s).
- Remove any remaining unused code (example: earlier unused CheckoutPage helpers were removed) and keep `npx tsc --noEmit` in CI to catch type regressions.

Developer ergonomics
- Add `npm` scripts for common tasks (already present: `lint`, `lint:fix`, `format`, `clean`, `build`) and document them in this README.
- Add a short troubleshooting section for common test failures (flaky selectors, timeouts, CI browser binaries).

If you want, I can implement the high-priority items now (CI matrix + artifact upload, husky + lint-staged hooks, Dependabot config) and open a branch with the changes.

### Viewing Test Reports
```bash
npm run test:report
```
Opens HTML report showing test results, screenshots, and videos.

## Best Practices

1. **Use Page Objects**: Always interact with pages through Page Object Models
2. **Clear Test Names**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Wait for Elements**: Playwright automatically waits for elements, but use explicit waits if needed
5. **Test Data**: Use test data from `testData.ts` for consistency

## Continuous Integration

The framework is configured for CI/CD with:
- Retry support (2 retries in CI)
- Single worker execution in CI
- Screenshot and video capture on failure
- Trace collection for debugging

## Troubleshooting

### Browser binaries not found
```bash
npx playwright install
npx playwright install-deps
```

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check SauceDemo website availability

### Selector not found
- Verify the website hasn't changed
- Use `npm run test:headed` to see what's happening
- Update selectors in page objects if needed

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [SauceDemo Website](https://www.saucedemo.com)
