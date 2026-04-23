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

  async open(cartId?: string): Promise<void> {
    if (cartId) {
      // Inject cart_id via addInitScript so it runs BEFORE Angular boots
      // on /checkout — eliminates the race where Angular reads
      // sessionStorage before our evaluate() call lands. This is the key
      // fix for CI, where a cold /checkout load can otherwise race the
      // cart_id write and leave the page stuck loading forever.
      await this.page.addInitScript((id) => {
        try {
          window.sessionStorage.setItem('cart_id', id);
        } catch {
          // Storage access failures are non-fatal — the app also sets
          // cart_id on its own during addToCart.
        }
      }, cartId);
    }

    await this.navigate('/checkout');

    // Single wait budget: either the first cart row becomes visible, or
    // the empty-cart banner does. Whichever arrives first resolves the
    // race and lets callers assert without stacking extra timeouts.
    await Promise.race([
      this.cartItems.first().waitFor({ state: 'visible', timeout: 45_000 }),
      this.emptyCartMessage.waitFor({ state: 'visible', timeout: 45_000 }),
    ]).catch(() => {
      // Neither arrived — callers will surface a descriptive failure.
    });
  }

  async getCartItemCount(): Promise<number> {
    // Cheap check: open() has already waited for the cart to settle, so
    // here we just report the current state without additional waiting.
    if (await this.emptyCartMessage.isVisible().catch(() => false)) {
      return 0;
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
