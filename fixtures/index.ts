import { test as base, createBdd } from 'playwright-bdd';
import {
  Eyes,
  VisualGridRunner,
  Target,
  type CheckSettings,
} from '@applitools/eyes-playwright';
import type { Page, TestInfo } from '@playwright/test';

import { SauceLoginPage } from '../pages/saucedemo/login-page';
import { SauceInventoryPage } from '../pages/saucedemo/inventory-page';
import { SauceCartPage } from '../pages/saucedemo/cart-page';
import { SauceCheckoutPage } from '../pages/saucedemo/checkout-page';

import { OrangeLoginPage } from '../pages/orangehrm/login-page';
import { OrangeDashboardPage } from '../pages/orangehrm/dashboard-page';
import { OrangePIMPage } from '../pages/orangehrm/pim-page';
import { OrangeAdminUsersPage } from '../pages/orangehrm/admin-users-page';
import { OrangeLeavePage } from '../pages/orangehrm/leave-page';

import { buildEyesConfig, visualEnabled } from '../applitools.config';

// Applitools wrapper injected into every scenario. `.check()` is a no-op
// when APPLITOOLS_API_KEY is missing so the suite still runs cleanly
// without it. Per-test Eyes session with lazy open — a scenario that
// never calls check() never opens a session, so the Applitools dashboard
// doesn't fill with empty tests.
export interface VisualEyes {
  check(name: string, target?: CheckSettings): Promise<void>;
}

async function openEyes(page: Page, testTitle: string): Promise<Eyes> {
  const runner = new VisualGridRunner({ testConcurrency: 5 });
  const eyes = new Eyes(runner);
  eyes.setConfiguration(buildEyesConfig());
  await eyes.open(page, 'qa-ai-automation-framework', testTitle);
  return eyes;
}

type PageObjects = {
  // SauceDemo
  sauceLoginPage: SauceLoginPage;
  sauceInventoryPage: SauceInventoryPage;
  sauceCartPage: SauceCartPage;
  sauceCheckoutPage: SauceCheckoutPage;
  // OrangeHRM
  orangeLoginPage: OrangeLoginPage;
  orangeDashboardPage: OrangeDashboardPage;
  orangePIMPage: OrangePIMPage;
  orangeAdminUsersPage: OrangeAdminUsersPage;
  orangeLeavePage: OrangeLeavePage;
  // Applitools
  eyes: VisualEyes;
};

export const test = base.extend<PageObjects>({
  sauceLoginPage: async ({ page }, use) => {
    await use(new SauceLoginPage(page));
  },
  sauceInventoryPage: async ({ page }, use) => {
    await use(new SauceInventoryPage(page));
  },
  sauceCartPage: async ({ page }, use) => {
    await use(new SauceCartPage(page));
  },
  sauceCheckoutPage: async ({ page }, use) => {
    await use(new SauceCheckoutPage(page));
  },
  orangeLoginPage: async ({ page }, use) => {
    await use(new OrangeLoginPage(page));
  },
  orangeDashboardPage: async ({ page }, use) => {
    await use(new OrangeDashboardPage(page));
  },
  orangePIMPage: async ({ page }, use) => {
    await use(new OrangePIMPage(page));
  },
  orangeAdminUsersPage: async ({ page }, use) => {
    await use(new OrangeAdminUsersPage(page));
  },
  orangeLeavePage: async ({ page }, use) => {
    await use(new OrangeLeavePage(page));
  },

  eyes: async ({ page }, use, testInfo: TestInfo) => {
    // Holder object so TS can narrow `state.eyes` across the closure.
    // A plain `let eyes: Eyes | null` loses the type narrowing when
    // mutated from inside `wrapper.check`.
    const state: { eyes: Eyes | null } = { eyes: null };

    const wrapper: VisualEyes = {
      async check(name, target) {
        if (!visualEnabled) return;
        if (!state.eyes) state.eyes = await openEyes(page, testInfo.title);
        await state.eyes.check(name, target ?? Target.window().fully());
      },
    };

    await use(wrapper);

    // close(false) returns results without throwing on diff — unresolved
    // diffs land in the Applitools dashboard, not the scenario.
    if (state.eyes) {
      await state.eyes.close(false).catch(() => undefined);
    }
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
