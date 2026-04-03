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
    await this.loginButton.click();
    await this.page.waitForLoadState('load');
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return (await this.errorMessage.textContent()) ?? '';
  }
}
