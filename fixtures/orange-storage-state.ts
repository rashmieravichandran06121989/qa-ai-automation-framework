import { chromium, type FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env';
import { credentials } from '../config/credentials';

// Runs once per CI job via globalSetup. Every BDD project's context is
// seeded from the file we write here (see `test.use({ storageState })`
// in playwright.config.ts), so every scenario starts pre-authenticated
// instead of re-burning 15s on UI login.
//
// Playwright throws at context creation if `storageState` points to a
// missing file, so globalSetup ALWAYS writes something — an empty state
// if login fails, a real state if login succeeds. That way a down demo
// doesn't take the whole suite with it; scenarios just fall through to
// UI login via the shared step's guard.

export const ORANGE_STORAGE_STATE = resolve('.auth/orangehrm.json');

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });

export default async function globalSetup(_: FullConfig): Promise<void> {
  mkdirSync(dirname(ORANGE_STORAGE_STATE), { recursive: true });

  // Pre-seed with an empty state so the file always exists. Real state
  // overwrites this on success.
  if (!existsSync(ORANGE_STORAGE_STATE)) {
    writeFileSync(ORANGE_STORAGE_STATE, EMPTY_STATE);
  }

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${env.ORANGEHRM_BASE_URL}/web/index.php/auth/login`, {
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
    // Demo unreachable / session-setup failed. Leave the empty state on
    // disk so contexts still construct, scenarios fall through to UI
    // login. Using stderr so CI log parsers can pick it up.
    process.stderr.write(
      `[globalSetup] OrangeHRM storageState failed, using empty state: ${(err as Error).message ?? err}\n`,
    );
  }
}
