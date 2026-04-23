import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage models the sign-in page of practicesoftwaretesting.com.
 * URL: https://practicesoftwaretesting.com/auth/login
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput        = page.locator('[data-test="email"]');
    this.passwordInput     = page.locator('[data-test="password"]');
    this.loginButton       = page.locator('[data-test="login-submit"]');
    this.errorMessage      = page.locator('[data-test="login-error"]');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot your Password?' });
  }

  async open(): Promise<void> {
    await this.navigate('/auth/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Wait for the POST /users/login response in addition to the URL/error
    // race. The demo backend can take 20+ seconds in CI, and without this
    // the Angular route change may happen after our URL check has already
    // given up. 30s matches the CI expect timeout.
    const loginResponsePromise = this.page
      .waitForResponse(
        (res) => /\/users\/login/.test(res.url()) && res.request().method() === 'POST',
        { timeout: 30_000 },
      )
      .catch(() => null);

    await this.loginButton.click();
    await loginResponsePromise;

    // The app is an Angular SPA, so `waitForLoadState('load')` doesn't fire
    // on client-side navigation. Race the successful URL change against
    // the appearance of a login error banner so we can surface a clear
    // failure immediately (e.g. "Account locked") instead of a generic
    // URL-timeout further down the chain.
    await Promise.race([
      this.page.waitForURL((url) => !/\/auth\/login/.test(url.toString()), { timeout: 30_000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 30_000 }),
    ]).catch(() => {
      // Swallow the race rejection; the checks below produce a clearer error.
    });

    if (await this.errorMessage.isVisible().catch(() => false)) {
      const msg = (await this.errorMessage.textContent())?.trim() ?? 'Unknown login error';
      throw new Error(`Login failed: ${msg}`);
    }
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return (await this.errorMessage.textContent()) ?? '';
  }
}
