import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { TEST_USERS } from '../src/fixtures/testData';
import { CURRENT_USER, isLockedOutUser } from '../src/fixtures/currentUser';

test.describe('Login Page Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should display login form elements', async () => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    test.skip(isLockedOutUser, 'locked_out_user cannot successfully login');

    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('should reject login with invalid credentials', async () => {
    await loginPage.login(TEST_USERS.INVALID_USER.username, TEST_USERS.INVALID_USER.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('do not match any user');
  });

  test('should show error for locked out user', async ({ page }) => {
    await loginPage.login(TEST_USERS.LOCKED_USER.username, TEST_USERS.LOCKED_USER.password);

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();

    // Verify the error message contains "locked out"
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('locked out');

    // Verify user is NOT redirected to inventory page
    await expect(page).not.toHaveURL(/inventory/);
    await expect(page).toHaveURL(/\/$/);

    // Verify login form is still visible
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Verify input fields still contain the credentials
    await expect(loginPage.usernameInput).toHaveValue(TEST_USERS.LOCKED_USER.username);
    await expect(loginPage.passwordInput).toHaveValue(TEST_USERS.LOCKED_USER.password);
  });

  test('should show error when username is empty', async () => {
    await loginPage.passwordInput.fill(CURRENT_USER.password);
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username is required');
  });

  test('should show error when password is empty', async () => {
    await loginPage.usernameInput.fill(CURRENT_USER.username);
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Password is required');
  });

  test('should persist error message until form is resubmitted', async () => {
    await loginPage.login(TEST_USERS.INVALID_USER.username, TEST_USERS.INVALID_USER.password);
    await expect(loginPage.errorMessage).toBeVisible();

    const errorText1 = await loginPage.getErrorMessage();
    expect(errorText1).toContain('do not match any user');

    // Change the username
    await loginPage.usernameInput.fill('');
    await loginPage.usernameInput.fill(TEST_USERS.STANDARD_USER.username);

    // Error message should still be visible (persists until form resubmitted)
    await expect(loginPage.errorMessage).toBeVisible();

    // Submit form again with valid credentials
    await loginPage.passwordInput.fill(TEST_USERS.STANDARD_USER.password);
    await loginPage.loginButton.click();

    // Should now successfully login
    await expect(loginPage.page).toHaveURL(/inventory/);
  });
});
