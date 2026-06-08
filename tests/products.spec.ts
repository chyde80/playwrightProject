import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { PRODUCTS } from '../src/fixtures/testData';
import { CURRENT_USER, isProblemUser } from '../src/fixtures/currentUser';

test.describe('Products Page Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);

    // Login first using configurable current user
    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
    await productsPage.navigate();
  });

  test('should display all products', async () => {
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should display product details (name and price)', async () => {
    const productNames = await productsPage.getAllProductNames();
    const productPrices = await productsPage.getAllProductPrices();

    expect(productNames.length).toBeGreaterThan(0);
    expect(productPrices.length).toBeGreaterThan(0);
    expect(productNames.length).toBe(productPrices.length);

    // All prices should be positive numbers
    productPrices.forEach((price) => {
      expect(price).toBeGreaterThan(0);
    });
  });

  test('should add product to cart', async () => {
    const productName = PRODUCTS.SAUCE_LABS_BACKPACK;
    await productsPage.addProductToCart(productName);

    // Verify product is in cart
    const isInCart = await productsPage.isProductInCart(productName);
    expect(isInCart).toBeTruthy();

    // Verify cart badge shows 1
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(1);
  });

  test('should add multiple products to cart', async () => {
    const products = [
      PRODUCTS.SAUCE_LABS_BACKPACK,
      PRODUCTS.SAUCE_LABS_BIKE_LIGHT,
      PRODUCTS.SAUCE_LABS_BOLT_T_SHIRT,
    ];

    for (const product of products) {
      await productsPage.addProductToCart(product);
    }

    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(products.length);
  });

  test('should navigate to cart', async ({ page }) => {
    await productsPage.addProductToCart(PRODUCTS.SAUCE_LABS_BACKPACK);
    await productsPage.goToCart();

    await expect(page).toHaveURL(/cart/);
  });

  test('should sort products by name (A to Z)', async () => {
    await productsPage.sortBy('az');
    const productNames = await productsPage.getAllProductNames();
    const sortedNames = [...productNames].sort();

    expect(productNames).toEqual(sortedNames);
  });

  test('should sort products by name (Z to A)', async () => {
    await productsPage.sortBy('za');
    const productNames = await productsPage.getAllProductNames();
    const sortedNames = [...productNames].sort().reverse();

    expect(productNames).toEqual(sortedNames);
  });

  test('should sort products by price (low to high)', async () => {
    await productsPage.sortBy('lohi');
    const prices = await productsPage.getAllProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test('should sort products by price (high to low)', async () => {
    await productsPage.sortBy('hilo');
    const prices = await productsPage.getAllProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });
});

const problemUserTest = isProblemUser ? test : test.skip;

problemUserTest('should show broken product images for problem_user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
  await expect(page).toHaveURL(/inventory/);

  const brokenImages = await page.$$eval('.inventory_item_img img', (imgs) =>
    imgs
      .filter((img) => img.getAttribute('src')?.includes('sl-404'))
      .map((img) => img.getAttribute('src')),
  );

  expect(brokenImages.length).toBeGreaterThan(0);
  expect(brokenImages.length).toBe(
    await page.$$eval('.inventory_item_img img', (imgs) => imgs.length),
  );
});
