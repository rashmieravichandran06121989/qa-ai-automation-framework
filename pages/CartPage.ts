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
      // Inject cart_id into sessionStorage before navigating.
      // The Angular app reads cart_id from sessionStorage to know which
      // cart to fetch on /checkout. In CI (headless + cold context) the
      // app's own setItem can race with the navigation, so we set it
      // explicitly to guarantee the cart_id is present before /checkout
      // boots up.
      await this.page.evaluate((id) => {
        try {
          window.sessionStorage.setItem('cart_id', id);
        } catch {
          // Ignore storage errors on about:blank — the subsequent navigation
          // will still work because the app sets cart_id itself on addToCart.
        }
      }, cartId);
    }

    // Race navigation with the cart-detail API response so we know the
    // cart has finished loading before callers assert on its contents.
    // Falls back to domcontentloaded if the API call never fires (e.g. an
    // empty cart short-circuits the request).
    const cartApiResponse = this.page
      .waitForResponse(
        (res) =>
          /\/carts\//.test(res.url()) && res.request().method() === 'GET',
        { timeout: 30_000 },
      )
      .catch(() => null);

    await this.navigate('/checkout');
    await this.page.waitForLoadState('domcontentloaded');
    await cartApiResponse;
  }

  async getCartItemCount(): Promise<number> {
    // Cart items are fetched from the API after Angular bootstraps.
    // Race the first cart row against the empty-cart notice so we can
    // return 0 immediately when the cart is legitimately empty instead
    // of burning the full timeout waiting for a row that will never appear.
    await Promise.race([
      this.cartItems.first().waitFor({ state: 'visible', timeout: 30_000 }),
      this.emptyCartMessage.waitFor({ state: 'visible', timeout: 30_000 }),
    ]).catch(() => {
      // Both locators timed out — fall through and let count() return 0 so
      // the caller can assert and produce a descriptive failure.
    });

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
