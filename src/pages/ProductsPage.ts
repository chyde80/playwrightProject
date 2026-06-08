import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly productsList: Locator;
  readonly productItem: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsList = page.locator('.inventory_list');
    this.productItem = page.locator('.inventory_item');
    this.productName = page.locator('.inventory_item_name');
    this.productPrice = page.locator('.inventory_item_price');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async navigate() {
    await this.page.goto('/inventory.html');
  }

  async getProductCount(): Promise<number> {
    return await this.productItem.count();
  }

  async getProductByName(productName: string): Promise<Locator> {
    return this.page.locator(`.inventory_item:has-text("${productName}")`);
  }

  async addProductToCart(productName: string) {
    const product = await this.getProductByName(productName);
    const addButton = product.locator('[data-test^="add-to-cart"]');
    await addButton.click();
  }

  async isProductInCart(productName: string): Promise<boolean> {
    const product = await this.getProductByName(productName);
    const removeButton = product.locator('[data-test^="remove"]');
    return await removeButton.isVisible();
  }

  async getCartItemCount(): Promise<number> {
    const badge = await this.cartBadge.count();
    if (badge === 0) return 0;
    return parseInt((await this.cartBadge.textContent()) || '0');
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async sortBy(sortOption: string) {
    await this.sortDropdown.selectOption(sortOption);
  }

  async getAllProductNames(): Promise<string[]> {
    return await this.productName.allTextContents();
  }

  async getAllProductPrices(): Promise<number[]> {
    const priceTexts = await this.productPrice.allTextContents();
    return priceTexts.map((price) => parseFloat(price.replace('$', '')));
  }
}
