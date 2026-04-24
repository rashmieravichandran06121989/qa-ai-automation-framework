import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

// SauceDemo inventory grid — the page you land on after login.
// Sort dropdown values: az (Name A-Z), za (Z-A), lohi (price asc),
// hilo (price desc). Those are the exact strings SauceDemo ships.
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class SauceInventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async addItemToCartByName(productName: string): Promise<void> {
    const slug = this.slugify(productName);
    await this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
  }

  async removeItemFromCartByName(productName: string): Promise<void> {
    const slug = this.slugify(productName);
    await this.page.locator(`[data-test="remove-${slug}"]`).click();
  }

  async getCartBadgeCount(): Promise<number> {
    if ((await this.shoppingCartBadge.count()) === 0) return 0;
    const text = (await this.shoppingCartBadge.textContent())?.trim() ?? '0';
    return Number(text);
  }

  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getItemNamesInOrder(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((t) => t.trim());
  }

  async getItemPricesInOrder(): Promise<number[]> {
    const raw = await this.itemPrices.allTextContents();
    return raw.map((p) => Number(p.replace('$', '').trim()));
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.waitForVisible(this.logoutLink);
    await this.logoutLink.click();
  }

  /**
   * SauceDemo builds `data-test="add-to-cart-<slug>"` by lowercasing the
   * product name and replacing whitespace with hyphens.
   */
  private slugify(productName: string): string {
    return productName.toLowerCase().replace(/\s+/g, '-');
  }
}
