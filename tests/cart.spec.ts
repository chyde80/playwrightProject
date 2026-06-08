import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { PRODUCTS } from '../src/fixtures/testData';
import { CURRENT_USER, isProblemUser, isLockedOutUser } from '../src/fixtures/currentUser';

test.describe('Cart Page Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    test.skip(
      isProblemUser || isLockedOutUser,
      'General cart tests are only applicable for standard_user and performance_glitch_user',
    );

    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);

    // Login and navigate to products using configurable current user
    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
    await productsPage.navigate();
  });

  test('should display the cart header when no items are in the cart', async () => {
    await cartPage.navigate();
    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBeTruthy();
    await expect(cartPage.cartHeaderLabel).toBeVisible();
  });

  test('should display added items in cart', async () => {
    const productName = PRODUCTS.SAUCE_LABS_BACKPACK;
    await productsPage.addProductToCart(productName);
    await productsPage.goToCart();

    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(1);

    const cartItemNames = await cartPage.getCartItemNames();
    expect(cartItemNames).toContain(productName);
  });

  test('should display multiple items in cart', async () => {
    const products = [
      PRODUCTS.SAUCE_LABS_BACKPACK,
      PRODUCTS.SAUCE_LABS_BIKE_LIGHT,
      PRODUCTS.SAUCE_LABS_BOLT_T_SHIRT,
    ];

    for (const product of products) {
      await productsPage.addProductToCart(product);
    }

    await productsPage.goToCart();
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(products.length);
  });

  test('should remove item from cart', async () => {
    const productName = PRODUCTS.SAUCE_LABS_BACKPACK;
    await productsPage.addProductToCart(productName);
    await productsPage.goToCart();

    let cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(1);

    await cartPage.removeItemFromCart(productName);

    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBeTruthy();
  });

  test('should continue shopping from cart', async ({ page }) => {
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();

    await cartPage.continueShopping();
    await expect(page).toHaveURL(/inventory/);
  });

  test('should display cart totals correctly', async () => {
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();

    const subtotal = await cartPage.getSubtotal();
    const tax = await cartPage.getTax();
    const total = await cartPage.getTotal();

    expect(subtotal).toBeGreaterThan(0);
    expect(tax).toBeGreaterThanOrEqual(0);
    expect(total).toBe(subtotal + tax);
  });

  test('should proceed to checkout from cart', async ({ page }) => {
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('should remove multiple items from cart', async () => {
    const products = [PRODUCTS.SAUCE_LABS_BACKPACK, PRODUCTS.SAUCE_LABS_BIKE_LIGHT];

    for (const product of products) {
      await productsPage.addProductToCart(product);
    }

    await productsPage.goToCart();

    for (const product of products) {
      await cartPage.removeItemFromCart(product);
    }

    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBeTruthy();
  });
});
