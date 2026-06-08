import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { TEST_DATA, PRODUCTS } from '../src/fixtures/testData';
import { CURRENT_USER } from '../src/fixtures/currentUser';

test.describe('Checkout Page Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    // Login using configurable current user
    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
  });

  test('should display checkout info form on step one', async () => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.firstNameInput).toBeVisible();
    await expect(checkoutPage.lastNameInput).toBeVisible();
    await expect(checkoutPage.postalCodeInput).toBeVisible();
    await expect(checkoutPage.continueButton).toBeVisible();
  });

  test('should show error when first name is empty', async () => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.lastNameInput.fill(TEST_DATA.VALID_CHECKOUT_INFO.lastName);
    await checkoutPage.postalCodeInput.fill(TEST_DATA.VALID_CHECKOUT_INFO.postalCode);
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toBeVisible();
    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).toContain('First Name is required');
  });

  test('should show error when last name is empty', async () => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.firstNameInput.fill(TEST_DATA.VALID_CHECKOUT_INFO.firstName);
    await checkoutPage.postalCodeInput.fill(TEST_DATA.VALID_CHECKOUT_INFO.postalCode);
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toBeVisible();
    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).toContain('Last Name is required');
  });

  test('should show error when postal code is empty', async () => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.firstNameInput.fill(TEST_DATA.VALID_CHECKOUT_INFO.firstName);
    await checkoutPage.lastNameInput.fill(TEST_DATA.VALID_CHECKOUT_INFO.lastName);
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toBeVisible();
    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).toContain('Postal Code is required');
  });

  test('should proceed to step two with valid info', async ({ page }) => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillCheckoutInfo(
      TEST_DATA.VALID_CHECKOUT_INFO.firstName,
      TEST_DATA.VALID_CHECKOUT_INFO.lastName,
      TEST_DATA.VALID_CHECKOUT_INFO.postalCode,
    );
    await checkoutPage.continueToNextStep();

    await expect(page).toHaveURL(/checkout-step-two/);
  });

  test('should display checkout summary on step two', async () => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillCheckoutInfo(
      TEST_DATA.VALID_CHECKOUT_INFO.firstName,
      TEST_DATA.VALID_CHECKOUT_INFO.lastName,
      TEST_DATA.VALID_CHECKOUT_INFO.postalCode,
    );
    await checkoutPage.continueToNextStep();

    await expect(checkoutPage.cartItems).toHaveCount(1);
  });

  test('should complete order with items', async ({ page }) => {
    // Add item to cart
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();

    // Proceed through checkout
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInfo(
      TEST_DATA.VALID_CHECKOUT_INFO.firstName,
      TEST_DATA.VALID_CHECKOUT_INFO.lastName,
      TEST_DATA.VALID_CHECKOUT_INFO.postalCode,
    );
    await checkoutPage.continueToNextStep();

    // Complete order
    await checkoutPage.completeOrder();

    await expect(page).toHaveURL(/checkout-complete/);
    const completeMessage = await checkoutPage.getOrderCompleteMessage();
    expect(completeMessage).toContain('Thank you');
  });

  test('should cancel checkout and return to cart', async ({ page }) => {
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.cancelCheckout();
    await expect(page).toHaveURL(/cart/);
  });

  test('should calculate totals correctly on checkout step two', async () => {
    // Add item to cart
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();

    // Get cart totals
    const cartSubtotal = await cartPage.getSubtotal();
    const cartTax = await cartPage.getTax();
    const cartTotal = await cartPage.getTotal();

    // Proceed to checkout step 2
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInfo(
      TEST_DATA.VALID_CHECKOUT_INFO.firstName,
      TEST_DATA.VALID_CHECKOUT_INFO.lastName,
      TEST_DATA.VALID_CHECKOUT_INFO.postalCode,
    );
    await checkoutPage.continueToNextStep();

    // Verify totals match
    const checkoutSubtotal = await checkoutPage.getSubtotal();
    const checkoutTax = await checkoutPage.getTax();
    const checkoutTotal = await checkoutPage.getTotal();

    expect(checkoutSubtotal).toBe(cartSubtotal);
    // If cart page doesn't display tax, cartTax will be 0 — validate totals accordingly
    if (cartTax === 0) {
      expect(checkoutTotal).toBeCloseTo(checkoutSubtotal + checkoutTax, 2);
    } else {
      expect(checkoutTax).toBe(cartTax);
      expect(checkoutTotal).toBe(cartTotal);
    }
  });
});
