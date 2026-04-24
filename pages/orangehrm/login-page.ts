import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base-page';
import { ORANGEHRM_BASE_URL } from '../../playwright.config';

// OrangeHRM login. Demo creds: Admin / admin123. Selectors lean on
// role/placeholder because OrangeHRM only exposes generated class names
// that drift between deploys — ARIA is the one stable contract the app
// publishes.
export class OrangeLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly requiredFieldError: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.requiredFieldError = page.locator('.oxd-input-field-error-message');
  }

  async open(): Promise<void> {
    await this.page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/login`);
    await this.page.waitForLoadState('load');

    // storageState seeds the context with an Admin cookie jar. If we're
    // opening the login page as part of a login-feature scenario, that
    // cookie bounces us to /dashboard/index. Force a logout so login
    // scenarios actually test login instead of redirect.
    if (!this.page.url().includes('/auth/login')) {
      await this.page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/logout`);
      await this.page.waitForLoadState('load');
    }

    await this.waitForVisible(this.loginButton);
  }

  async loginAs(username: string, password: string): Promise<void> {
    // fill('') on an already-empty input doesn't fire OrangeHRM's
    // "touched" validation state, so skipping the fill when empty is
    // what actually exercises the required-field error path.
    if (username) await this.usernameInput.fill(username);
    if (password) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorAlert);
    return (await this.errorAlert.textContent())?.trim() ?? '';
  }

  async getRequiredFieldErrorCount(): Promise<number> {
    // OrangeHRM renders validation messages a tick after Login click.
    // Wait for at least one to appear, with a short timeout that still
    // returns 0 if validation never fires.
    await this.requiredFieldError
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
    return this.requiredFieldError.count();
  }
}
