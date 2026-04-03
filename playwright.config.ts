import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  workers: 5,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    // ── UI smoke tests ──────────────────────────────────────────────────────
    {
      name: 'chromium',
      testDir: './tests/smoke',
      use: { ...devices['Desktop Chrome'] },
    },
    // ── BDD scenarios ────────────────────────────────────────────────────────
    {
      ...defineBddProject({
        name: 'bdd:chromium',
        features: 'features/**/*.feature',
        steps: ['fixtures/index.ts', 'steps/**/*.ts'],
      }),
      use: { ...devices['Desktop Chrome'] },
    },
    // ── API tests (no browser) ───────────────────────────────────────────────
    {
      name: 'api',
      testDir: './tests/APITests',
      use: {
        baseURL: 'https://api.practicesoftwaretesting.com',
      },
    },
  ],
});
