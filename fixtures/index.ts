import { test as base, createBdd } from 'playwright-bdd';
import {
  Eyes,
  VisualGridRunner,
  Target,
  type CheckSettings,
} from '@applitools/eyes-playwright';
import type { TestInfo } from '@playwright/test';

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
// without it.
export interface VisualEyes {
  check(name: string, target?: CheckSettings): Promise<void>;
}

// Per-scenario Eyes session, driven by a runner that lives at worker
// scope (see `eyesRunner` below). Sharing the runner across scenarios
// is what actually unlocks Ultrafast Grid's batched rendering — a fresh
// runner per scenario loses the batching entirely.
class EyesSession implements VisualEyes {
  // Single nullable — null means "never opened." TypeScript narrows
  // naturally through the null-check, so the old `opened` boolean and
  // its unreachable-branch guard both drop out.
  private eyes: Eyes | null = null;

  constructor(
    private readonly runner: VisualGridRunner,
    private readonly page: import('@playwright/test').Page,
    private readonly testTitle: string,
  ) {}

  async check(name: string, target?: CheckSettings): Promise<void> {
    if (!visualEnabled) return;

    if (!this.eyes) {
      this.eyes = new Eyes(this.runner);
      this.eyes.setConfiguration(buildEyesConfig());
      await this.eyes.open(
        this.page,
        'qa-ai-automation-framework',
        this.testTitle,
      );
    }

    await this.eyes.check(name, target ?? Target.window().fully());
  }

  /**
   * Close this scenario's Eyes session. Runs via the fixture boundary
   * after `await use()`, so it fires whether the scenario passed or
   * failed. `close(false)` returns results without throwing on diff —
   * the CI-level Applitools gate is what fails the PR at batch scope.
   */
  async close(testInfo: TestInfo): Promise<void> {
    if (!this.eyes) return;
    try {
      await this.eyes.close(false);
    } catch (err) {
      // Attach to testInfo so the error shows up in the HTML report
      // without failing the scenario. Network blips here shouldn't
      // turn an otherwise-green run red — the diff state lives in
      // the Applitools dashboard regardless.
      testInfo.annotations.push({
        type: 'applitools-close-failed',
        description: (err as Error).message ?? String(err),
      });
    }
  }
}

type WorkerFixtures = {
  eyesRunner: VisualGridRunner;
};

type TestFixtures = {
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

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped runner: one VisualGridRunner shared by every scenario
  // this worker runs. Ultrafast Grid batches render jobs across scenarios
  // for free once the runner is shared — the per-scenario construction
  // we had before leaked N runners and lost all batching.
  eyesRunner: [
    async ({}, use) => {
      const runner = new VisualGridRunner({ testConcurrency: 5 });
      await use(runner);
      // Flush any pending render jobs at worker teardown. `false` so we
      // don't throw on unresolved diffs — those belong to the CI gate.
      await runner.getAllTestResults(false).catch(() => undefined);
    },
    { scope: 'worker' },
  ],

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

  eyes: async ({ page, eyesRunner }, use, testInfo: TestInfo) => {
    const session = new EyesSession(eyesRunner, page, testInfo.title);
    await use(session);
    await session.close(testInfo);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
