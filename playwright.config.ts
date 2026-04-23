import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import * as dotenv from 'dotenv';
dotenv.config();

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // CI runners are resource-constrained and the demo backend is shared,
  // so give tests more headroom when running in CI to avoid flaky timeouts.
  timeout: isCI ? 90_000 : 60_000,
  expect: { timeout: isCI ? 20_000 : 10_000 },
  fullyParallel: true,
  retries: isCI ? 2 : 1,
  // 5 workers saturates a 2-vCPU GitHub runner and slows every render,
  // which is what was timing out the cart tests. Stay parallel but modest.
  workers: isCI ? 2 : 5,
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
