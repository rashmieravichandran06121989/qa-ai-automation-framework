import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base-page';

// SauceDemo login page. Test users (password: secret_sauce for all):
// standard_user, locked_out_user, problem_user, performance_glitch_user,
// error_user, visual_user. problem_user and visual_user are the ones
// Applitools catches — they ship with broken images and layout drifts.
export class SauceLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorDismissButton: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorDismissButton = page.locator('[data-test="error-button"]');
    this.loginLogo = page.locator('.login_logo');
  }

  async open(): Promise<void> {
    await this.navigate('/');
    await this.waitForVisible(this.loginButton);
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return (await this.errorMessage.textContent())?.trim() ?? '';
  }
}
