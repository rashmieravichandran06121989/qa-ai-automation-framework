import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CartPage models the shopping cart page.
 * URL: https://practicesoftwaretesting.com/checkout
 */
export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly cartTotal: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly removeItemButtons: Locator;
  readonly quantityInputs: Locator;

  constructor(page: Page) {
    super(page);
    // Each cart row has one product-title; count those to get item count
    this.cartItems               = page.locator('[data-test="product-title"]');
    this.cartTotal               = page.locator('[data-test="cart-total"]');
    this.proceedToCheckoutButton = page.locator('[data-test="proceed-1"]');
    this.emptyCartMessage        = page.locator('[data-test="cart-empty-notice"]');
    // Delete buttons have no data-test; target by Bootstrap danger class
    this.removeItemButtons       = page.locator('button.btn-danger');
    this.quantityInputs          = page.locator('[data-test="product-quantity"]');
  }

  async open(): Promise<void> {
    await this.navigate('/checkout');
  }

  async getCartItemCount(): Promise<number> {
    // Cart items are fetched from the API after Angular bootstraps.
    // Wait for the first item to appear; if none arrive within the timeout
    // the cart is genuinely empty and we return 0.
    try {
      await this.cartItems.first().waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      // Genuine empty cart – fall through and return 0
    }
    return this.cartItems.count();
  }

  async getCartTotal(): Promise<string> {
    return (await this.cartTotal.textContent()) ?? '';
  }

  async removeItem(index: number): Promise<void> {
    await this.removeItemButtons.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async isCartEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
