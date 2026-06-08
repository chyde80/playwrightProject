import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { TEST_DATA, PRODUCTS } from '../src/fixtures/testData';
import { CURRENT_USER, isProblemUser, isLockedOutUser } from '../src/fixtures/currentUser';

test.describe('E2E - Complete Purchase Flow', () => {
  test.beforeEach(() => {
    test.skip(
      isProblemUser || isLockedOutUser,
      'General E2E tests are only applicable for standard_user and performance_glitch_user',
    );
  });

  test('should complete a full purchase from login to order confirmation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Login
    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
    await expect(page).toHaveURL(/inventory/);

    // Step 2: Add products to cart
    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BIKE_LIGHT);

    let cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(2);

    // Step 3: Go to cart
    await productsPage.goToCart();
    await expect(page).toHaveURL(/cart/);

    const cartItems = await cartPage.getCartItemNames();
    expect(cartItems).toContain(PRODUCTS.SAUCE_LABS_BACKPACK);
    expect(cartItems).toContain(PRODUCTS.SAUCE_LABS_BIKE_LIGHT);

    // Step 4: Proceed to checkout
    const cartSubtotal = await cartPage.getSubtotal();
    const cartTax = await cartPage.getTax();
    const cartTotal = await cartPage.getTotal();

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout-step-one/);

    // Step 5: Fill checkout information
    await checkoutPage.fillCheckoutInfo(
      TEST_DATA.VALID_CHECKOUT_INFO.firstName,
      TEST_DATA.VALID_CHECKOUT_INFO.lastName,
      TEST_DATA.VALID_CHECKOUT_INFO.postalCode,
    );
    await checkoutPage.continueToNextStep();
    await expect(page).toHaveURL(/checkout-step-two/);

    // Step 6: Verify order summary
    const checkoutSubtotal = await checkoutPage.getSubtotal();
    const checkoutTax = await checkoutPage.getTax();
    const checkoutTotal = await checkoutPage.getTotal();

    expect(checkoutSubtotal).toBe(cartSubtotal);
    if (cartTax === 0) {
      expect(checkoutTotal).toBeCloseTo(checkoutSubtotal + checkoutTax, 2);
    } else {
      expect(checkoutTax).toBe(cartTax);
      expect(checkoutTotal).toBe(cartTotal);
    }

    const checkoutItems = await checkoutPage.getCartItemCount();
    expect(checkoutItems).toBe(2);

    // Step 7: Complete the order
    await checkoutPage.completeOrder();
    await expect(page).toHaveURL(/checkout-complete/);

    const completeMessage = await checkoutPage.getOrderCompleteMessage();
    expect(completeMessage).toContain('Thank you');
  });

  test('should handle adding, removing, and re-adding items in cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);

    // Add items
    await productsPage.navigate();
    const product1 = PRODUCTS.SAUCE_LABS_BACKPACK;
    const product2 = PRODUCTS.SAUCE_LABS_BIKE_LIGHT;

    await productsPage.addProductToCart(product1);
    await productsPage.addProductToCart(product2);

    let cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(2);

    // Go to cart and remove one item
    await productsPage.goToCart();
    await cartPage.removeItemFromCart(product1);

    let cartItems = await cartPage.getCartItemNames();
    expect(cartItems).not.toContain(product1);
    expect(cartItems).toContain(product2);

    // Continue shopping and add the removed item back
    await cartPage.continueShopping();
    await productsPage.addProductToCart(product1);

    cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(2);
  });

  test('should support purchasing with different user accounts', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Login using configured current user for this scenario
    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);

    await productsPage.navigate();
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_ONESIE);
    await productsPage.goToCart();

    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInfo(
      TEST_DATA.ANOTHER_USER.firstName,
      TEST_DATA.ANOTHER_USER.lastName,
      TEST_DATA.ANOTHER_USER.postalCode,
    );
    await checkoutPage.continueToNextStep();

    await checkoutPage.completeOrder();
    await expect(page).toHaveURL(/checkout-complete/);
  });

  test('should properly calculate totals for multiple items', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);

    await productsPage.navigate();

    // Add 3 different products
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BIKE_LIGHT);
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BOLT_T_SHIRT);

    await productsPage.goToCart();

    const subtotal = await cartPage.getSubtotal();
    const tax = await cartPage.getTax();
    const total = await cartPage.getTotal();

    // Verify all values are positive
    expect(subtotal).toBeGreaterThan(0);
    expect(tax).toBeGreaterThanOrEqual(0);
    expect(total).toBeGreaterThan(0);

    // Verify total = subtotal + tax
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // Verify 3 items in cart
    const cartItems = await cartPage.getCartItemCount();
    expect(cartItems).toBe(3);
  });
});
