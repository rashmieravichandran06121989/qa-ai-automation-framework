import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import { resolve } from 'node:path';
import { env } from './config/env';

// Env-overridable base URLs all go through the typed Config so a bad
// value fails at boot instead of mid-test. See config/env.ts.

const isCI = env.CI;

// Wired at project level so every BDD context boots pre-authenticated.
// globalSetup writes this file (even an empty shell if login fails) so
// Playwright's context constructor always has something to read.
const ORANGE_STORAGE_STATE = resolve('.auth/orangehrm.json');

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./fixtures/orange-storage-state.ts'),
  timeout: isCI ? 180_000 : 60_000,
  expect: { timeout: isCI ? 30_000 : 10_000 },
  fullyParallel: true,
  retries: isCI ? 2 : 1,
  // Serial in CI. OrangeHRM's demo throttles parallel sessions hard
  // enough that workers=5 costs more time than it saves.
  workers: isCI ? 1 : 5,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: env.BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: isCI ? 30_000 : 15_000,
    navigationTimeout: isCI ? 60_000 : 30_000,
  },
  projects: [
    {
      ...defineBddProject({
        name: 'bdd:chromium',
        features: 'features/**/*.feature',
        steps: ['fixtures/index.ts', 'steps/**/*.ts'],
      }),
      use: {
        ...devices['Desktop Chrome'],
        // Seed every browser context with the cached OrangeHRM cookie
        // jar. SauceDemo scenarios don't care (different domain).
        // Login-feature scenarios call /auth/logout on open() so they
        // still exercise the login form.
        storageState: ORANGE_STORAGE_STATE,
      },
    },
    {
      ...defineBddProject({
        name: 'bdd:firefox',
        features: 'features/**/*.feature',
        steps: ['fixtures/index.ts', 'steps/**/*.ts'],
      }),
      use: {
        ...devices['Desktop Firefox'],
        storageState: ORANGE_STORAGE_STATE,
      },
    },
    {
      ...defineBddProject({
        name: 'bdd:webkit',
        features: 'features/**/*.feature',
        steps: ['fixtures/index.ts', 'steps/**/*.ts'],
      }),
      use: {
        ...devices['Desktop Safari'],
        storageState: ORANGE_STORAGE_STATE,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.API_BASE_URL,
        // API tests don't need the browser storageState. Explicit
        // `undefined` overrides the project defaults so the API
        // context stays clean.
        storageState: undefined,
      },
    },
  ],
});

// Re-exported so POMs that aren't bound to the project's baseURL
// (OrangeHRM POMs — BDD project baseURL is SauceDemo) can still
// reach the right host without another dotenv.config() pass.
export const ORANGEHRM_BASE_URL = env.ORANGEHRM_BASE_URL;
