import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import { resolve } from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config();

// Env-overridable base URLs so Docker / CI / local all read from the
// same config. Defaults point at the public demo sites.
const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const ORANGEHRM_BASE_URL =
  process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';
const API_BASE_URL =
  process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

const isCI = !!process.env.CI;

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
  ],
  use: {
    baseURL: BASE_URL,
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
        baseURL: API_BASE_URL,
        storageState: undefined,
      },
    },
  ],
});

export { ORANGEHRM_BASE_URL };
