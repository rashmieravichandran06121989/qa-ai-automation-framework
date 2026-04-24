import { Page, Locator } from '@playwright/test';

// Shared base for every POM. Pulls the three patterns every OrangeHRM
// page was re-implementing (label-group input scoping, select-wrapper
// scoping) up one level, and wraps actions in Allure-aware steps so
// the HTML report reads as a narrative instead of a function-name dump.
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
   * lands outside the handler's hit area under load — spent real time
   * on that one. Always click the wrapper.
   */
  protected selectWrapperInGroup(labelText: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: labelText })
      .locator('.oxd-select-wrapper')
      .first();
  }

  /**
   * Wrap an action so it shows up in the Allure report as a named step.
   * Kept dynamic-import so POMs remain usable in tests that don't load
   * Allure (unit tests, standalone smoke runs).
   *
   * Important: the try/catch guards ONLY the import. If body() throws,
   * we let it bubble — an earlier version of this wrapper caught body
   * errors and re-ran the body, which caused a real double-execution
   * flake when a scenario half-completed (creating two employees on
   * the add-employee flow, for instance).
   */
  protected async step<T>(name: string, body: () => Promise<T>): Promise<T> {
    let allureStep:
      | ((n: string, b: () => Promise<T>) => Promise<T>)
      | undefined;
    try {
      const mod = await import('allure-playwright');
      // `allure.step` is typed as generic; cast to the narrowed form.
      allureStep = (mod as { allure: { step: typeof allureStep } }).allure
        .step as typeof allureStep;
    } catch {
      // Allure not available — run body unwrapped.
    }
    if (allureStep) {
      return allureStep(name, body);
    }
    return body();
  }
}
