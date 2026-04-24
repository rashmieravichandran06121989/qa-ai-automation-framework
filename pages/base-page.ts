import { Page, Locator } from '@playwright/test';

// Shared base for every POM. Pulls the label-group selector patterns
// up one level so OrangeHRM POMs stop reinventing them.
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
    // 'load' is enough — 'networkidle' hangs on pages with long-lived
    // connections (OAuth, WebSockets, analytics beacons).
    await this.page.waitForLoadState('load');
  }

  async waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * OrangeHRM puts labels in a sibling wrapper of the input, so the
   * naive `label:has-text(x) >> input` pattern doesn't resolve. This
   * scopes to the `.oxd-input-group` container (the real parent of
   * both label and input) and filters by label text. SauceDemo POMs
   * don't need this helper — they get stable `data-test` attributes.
   */
  protected inputInGroup(labelText: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: labelText })
      .locator('input')
      .first();
  }

  /**
   * OrangeHRM's Vue select bound its click handler to `.oxd-select-wrapper`
   * rather than the inner `.oxd-select-text` div. Clicking the text div
   * lands outside the handler's hit area under load.
   */
  protected selectWrapperInGroup(labelText: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: labelText })
      .locator('.oxd-select-wrapper')
      .first();
  }
}
