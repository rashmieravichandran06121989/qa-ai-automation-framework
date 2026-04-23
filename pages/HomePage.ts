import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage models the landing page of practicesoftwaretesting.com.
 * URL: https://practicesoftwaretesting.com/
 */
export class HomePage extends BasePage {
  // Navigation
  readonly navHome: Locator;
  readonly navSignIn: Locator;
  readonly navCart: Locator;
  readonly navCategories: Locator;

  // Search
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Product grid
  readonly productCards: Locator;
  readonly productTitles: Locator;

  // Sort / filter
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.navHome       = page.getByRole('link', { name: 'Home' });
    this.navSignIn     = page.getByRole('link', { name: 'Sign in' });
    this.navCart       = page.locator('[data-test="nav-cart"]');
    this.navCategories = page.locator('[data-test="nav-categories"]');

    this.searchInput  = page.locator('[data-test="search-query"]');
    this.searchButton = page.locator('[data-test="search-submit"]');

    // Cards use data-test="product-{id}" (dynamic), so target by href pattern
    this.productCards  = page.locator('a[href^="/product/"]');
    this.productTitles = page.locator('[data-test="product-name"]');

    this.sortDropdown = page.locator('[data-test="sort"]');
  }

  async open(): Promise<void> {
    await this.navigate('/');
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForLoadState('load');
  }

  async getProductCount(): Promise<number> {
    // Wait for at least one card to appear before counting (products load async)
    await this.productCards.first().waitFor({ state: 'visible', timeout: 15_000 });
    return this.productCards.count();
  }

  async clickProductByIndex(index: number): Promise<void> {
    // Products load async after the page loads. Wait for the target card
    // to actually exist before clicking — otherwise a slow grid render
    // (common in CI) causes nth(index) to time out looking for a card
    // that hasn't arrived yet.
    await this.productCards.nth(index).waitFor({ state: 'visible', timeout: 30_000 });
    await this.productCards.nth(index).click();
    await this.page.waitForLoadState('load');
  }

  async sortBy(value: string): Promise<void> {
    await this.sortDropdown.selectOption(value);
    await this.page.waitForLoadState('networkidle');
  }
}
