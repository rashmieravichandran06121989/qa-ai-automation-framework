import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

// OrangeHRM dashboard — landing page after admin login.
export class OrangeDashboardPage extends BasePage {
  readonly header: Locator;
  readonly sidebarNav: Locator;
  readonly userDropdown: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', { name: 'Dashboard' });
    // OrangeHRM ships the sidebar as `.oxd-sidepanel` (no aria-label).
    this.sidebarNav = page.locator('.oxd-sidepanel');
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.header).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Non-throwing variant — returns true when the dashboard heading is
   * already visible. Used by the shared login step to short-circuit UI
   * login when storageState has us authenticated already.
   */
  async isLoaded(timeout = 5_000): Promise<boolean> {
    try {
      await this.header.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async navigateToModule(name: string): Promise<void> {
    // Cold storageState boots render the sidebar a tick after the
    // dashboard heading — wait for the sidebar first, then the item.
    await this.sidebarNav.waitFor({ state: 'visible', timeout: 15_000 });

    const menuItem = this.sidebarNav
      .locator('a.oxd-main-menu-item')
      .filter({ hasText: name });
    await menuItem.waitFor({ state: 'visible', timeout: 10_000 });

    // URL change is the only reliable cross-module completion marker.
    // Post-nav page headings differ per module (PIM → "Employee
    // Information", Leave → "Leave List", Admin → "User Management"),
    // and sidebar-active-class naming varies across OrangeHRM releases.
    // Clicking navigates away from /dashboard/index on every module —
    // wait on that.
    const startUrl = this.page.url();
    await menuItem.click();
    await this.page.waitForURL(
      (url) =>
        url.toString() !== startUrl &&
        !url.toString().endsWith('/dashboard/index'),
      { timeout: 15_000 },
    );
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.waitForVisible(this.logoutLink);
    await this.logoutLink.click();
  }
}
