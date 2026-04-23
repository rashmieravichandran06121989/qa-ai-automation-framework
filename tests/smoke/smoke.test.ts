import { test, expect } from '@playwright/test';
import { Eyes, Target } from '@applitools/eyes-playwright';
import { buildEyesConfig } from '../../applitools.config';
import { HomePage } from '../../pages/HomePage';

/**
 * SMOKE-01 — Visual regression baseline for the homepage.
 * Functional coverage (login, search, cart, product detail)
 * lives in the BDD layer. This test exists solely for Applitools
 * visual snapshots across Chrome, Firefox and Safari.
 * Visual steps are skipped when APPLITOOLS_API_KEY is absent.
 */

const VISUAL_ENABLED = !!process.env.APPLITOOLS_API_KEY;

test('SMOKE-01: Homepage loads and displays product catalogue', async ({ page }) => {
  const eyes = new Eyes();
  if (VISUAL_ENABLED) {
    eyes.setConfiguration(buildEyesConfig());
    await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-01: Homepage');
  }

  const homePage = new HomePage(page);
  await homePage.open();

  await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

  if (VISUAL_ENABLED) {
    await eyes.check('Homepage product catalogue', Target.window().fully());
    await eyes.close();
  }
});