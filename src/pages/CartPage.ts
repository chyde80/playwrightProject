import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly cartItemName: Locator;
  readonly cartItemPrice: Locator;
  readonly removeButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly cartHeaderLabel: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.cartItemName = page.locator('.inventory_item_name');
    this.cartItemPrice = page.locator('.inventory_item_price');
    this.removeButton = page.locator('[data-test^="remove"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartHeaderLabel = page.locator('.cart_quantity_label');
    this.subtotal = page.locator('.summary_subtotal_label');
    this.tax = page.locator('.summary_tax_label');
    this.total = page.locator('.summary_total_label');
  }

  async navigate() {
    await this.page.goto('/cart.html');
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return await this.cartItemName.allTextContents();
  }

  async removeItemFromCart(productName: string) {
    const item = this.page.locator(`.cart_item:has-text("${productName}")`);
    const removeBtn = item.locator('[data-test^="remove"]');
    await removeBtn.click();
  }

  async isCartEmpty(): Promise<boolean> {
    return (await this.cartItems.count()) === 0;
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async getSubtotal(): Promise<number> {
    // If summary subtotal label is present (checkout pages), use it
    if ((await this.subtotal.count()) > 0) {
      const text = await this.subtotal.textContent();
      const match = text?.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }

    // Otherwise calculate subtotal from cart item prices
    const prices = await this.page.locator('.cart_item .inventory_item_price').allTextContents();
    const sum = prices.reduce((acc, p) => {
      const num = parseFloat(p.replace('$', ''));
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    return sum;
  }

  async getTax(): Promise<number> {
    if ((await this.tax.count()) > 0) {
      const text = await this.tax.textContent();
      const match = text?.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  }

  async getTotal(): Promise<number> {
    if ((await this.total.count()) > 0) {
      const text = await this.total.textContent();
      const match = text?.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    const subtotal = await this.getSubtotal();
    const tax = await this.getTax();
    return subtotal + tax;
  }
}
