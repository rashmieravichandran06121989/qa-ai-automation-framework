import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ProductPage models an individual product detail page.
 * URL: https://practicesoftwaretesting.com/product/{id}
 */
export class ProductPage extends BasePage {
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly categoryBreadcrumb: Locator;
  readonly relatedProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.productName        = page.locator('[data-test="product-name"]');
    this.productPrice       = page.locator('[data-test="unit-price"]');
    this.productDescription = page.locator('[data-test="product-description"]');
    this.addToCartButton    = page.locator('[data-test="add-to-cart"]');
    this.quantityInput      = page.locator('[data-test="quantity"]');
    this.categoryBreadcrumb = page.locator('.breadcrumb');
    this.relatedProducts    = page.locator('[data-test="related-product"]');
  }

  async addToCart(quantity = 1): Promise<string> {
    // Wait for the button to be enabled – it is disabled for out-of-stock items
    await this.addToCartButton.waitFor({ state: 'visible' });
    await expect(this.addToCartButton).toBeEnabled({ timeout: 10_000 });

    if (quantity > 1) {
      await this.quantityInput.fill(String(quantity));
    }

    // Intercept POST /carts to capture cart_id before clicking.
    // The app stores cart_id in sessionStorage — which Playwright does not
    // persist between navigations. We capture it here and inject it manually
    // in CartPage.open() so /checkout loads the correct cart in CI.
    const [cartResponse] = await Promise.all([
      this.page.waitForResponse(
        res => res.url().includes('/carts') && res.request().method() === 'POST',
        { timeout: 30_000 }
      ),
      this.addToCartButton.click(),
    ]);

    const cartBody = await cartResponse.json();
    const cartId: string = cartBody.id ?? cartBody.cart_id ?? '';

    await this.page.locator('[data-test="cart-quantity"]').waitFor({
      state: 'visible',
      timeout: 30_000,
    });

    return cartId;
  }
  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) ?? '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent()) ?? '';
  }
}
