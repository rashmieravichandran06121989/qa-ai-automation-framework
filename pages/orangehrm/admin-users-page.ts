import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

// OrangeHRM Admin → User Management.
export type UserRole = 'Admin' | 'ESS';
export type UserStatus = 'Enabled' | 'Disabled';

export class OrangeAdminUsersPage extends BasePage {
  readonly header: Locator;
  readonly usernameInput: Locator;
  readonly userRoleDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly resultsRows: Locator;
  readonly noRecordsFound: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', { name: 'User Management' });
    this.usernameInput = this.inputInGroup('Username');
    this.userRoleDropdown = this.selectWrapperInGroup('User Role');
    this.statusDropdown = this.selectWrapperInGroup('Status');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.resultsRows = page.locator('.oxd-table-card');
    this.noRecordsFound = page.getByText('No Records Found');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.header).toBeVisible({ timeout: 15_000 });
  }

  async filterByRole(role: UserRole): Promise<void> {
    await this.userRoleDropdown.click({ force: true, timeout: 10_000 });
    await this.page
      .locator('.oxd-select-option')
      .filter({ hasText: role })
      .first()
      .click();
  }

  async filterByStatus(status: UserStatus): Promise<void> {
    await this.statusDropdown.click({ force: true, timeout: 10_000 });
    await this.page
      .locator('.oxd-select-option')
      .filter({ hasText: status })
      .first()
      .click();
  }

  async search(): Promise<void> {
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for either results or the no-results message before moving on.
    await this.page
      .locator('.oxd-table-card, :text("No Records Found")')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page
      .locator('.oxd-table-card, :text("No Records Found")')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  async getResultsRowCount(): Promise<number> {
    return this.resultsRows.count();
  }

  async expectResultCountAtLeast(min: number): Promise<void> {
    const count = await this.getResultsRowCount();
    expect(count).toBeGreaterThanOrEqual(min);
  }
}
