import { chromium, type FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { credentials } from '../config/credentials';

// Runs once per CI job via globalSetup. Every BDD context is seeded
// from this file (see `test.use({ storageState })` in playwright.config),
// so scenarios start pre-authenticated instead of re-burning 15s on UI
// login. Playwright throws at context creation if storageState points
// to a missing file, so globalSetup ALWAYS writes something — empty
// state if login fails, real state if login succeeds.

export const ORANGE_STORAGE_STATE = resolve('.auth/orangehrm.json');

const ORANGEHRM_BASE_URL =
  process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });

export default async function globalSetup(_: FullConfig): Promise<void> {
  mkdirSync(dirname(ORANGE_STORAGE_STATE), { recursive: true });

  if (!existsSync(ORANGE_STORAGE_STATE)) {
    writeFileSync(ORANGE_STORAGE_STATE, EMPTY_STATE);
  }

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/login`, {
      timeout: 30_000,
    });
    await page
      .getByPlaceholder('Username')
      .fill(credentials.orangeHRM.admin.username);
    await page
      .getByPlaceholder('Password')
      .fill(credentials.orangeHRM.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page
      .getByRole('heading', { name: 'Dashboard' })
      .waitFor({ timeout: 30_000 });

    await context.storageState({ path: ORANGE_STORAGE_STATE });
    await browser.close();

    // eslint-disable-next-line no-console
    console.log(
      `[globalSetup] OrangeHRM storageState cached → ${ORANGE_STORAGE_STATE}`,
    );
  } catch (err) {
    process.stderr.write(
      `[globalSetup] OrangeHRM storageState failed, using empty state: ${(err as Error).message ?? err}\n`,
    );
  }
}
