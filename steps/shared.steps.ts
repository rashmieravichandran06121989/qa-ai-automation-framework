import { Given } from '../fixtures';
import { credentials } from '../config/credentials';

// High-level steps shared across both targets. Anything specific to
// one target lives under steps/saucedemo/ or steps/orangehrm/.

const ORANGEHRM_BASE_URL =
  process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';

Given(
  'User is logged in to SauceDemo as {string}',
  async ({ sauceLoginPage, sauceInventoryPage }, username: string) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAs(username, credentials.sauceDemo.password);
    await sauceInventoryPage.expectLoaded();
  },
);

Given(
  'User is on the SauceDemo inventory page',
  async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.expectLoaded();
  },
);

Given(
  'User is logged in to OrangeHRM as {string}',
  async ({ page, orangeLoginPage, orangeDashboardPage }, username: string) => {
    // Fast path — storageState (wired at project level) seeds Admin's
    // cookies. Hit /dashboard/index and skip UI login if the session
    // is still valid. Saves ~15s per scenario.
    const isAdmin = username === credentials.orangeHRM.admin.username;
    if (isAdmin) {
      await page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/dashboard/index`);
      if (await orangeDashboardPage.isLoaded(8_000)) return;
    }

    // Cookie jar missing or session rotated — fall through to UI login.
    await orangeLoginPage.open();
    const password = isAdmin ? credentials.orangeHRM.admin.password : '';
    await orangeLoginPage.loginAs(username, password);
    await orangeDashboardPage.expectLoaded();
  },
);

Given(
  'User navigates to the {string} module',
  async ({ orangeDashboardPage }, moduleName: string) => {
    await orangeDashboardPage.navigateToModule(moduleName);
  },
);
