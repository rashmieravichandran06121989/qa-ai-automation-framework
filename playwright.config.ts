import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import * as dotenv from 'dotenv';
dotenv.config();

const isCI = !!process.env.CI;
// Allow overriding the base URL so CI can point at a locally-hosted copy
// of the demo app (avoiding the Cloudflare bot challenge that blocks
// GitHub Actions IPs on the public site).
const BASE_URL = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
const API_BASE_URL =
  process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com';

export default defineConfig({
  testDir: './tests',
  // CI runners are resource-constrained and the demo backend is shared,
  // so give tests substantially more headroom in CI to avoid timeouts
  // when the demo site is slow from GitHub's network.
  timeout: isCI ? 180_000 : 60_000,
  expect: { timeout: isCI ? 30_000 : 10_000 },
  fullyParallel: true,
  // Two retries in CI. The practicesoftwaretesting.com demo backend is
  // shared infrastructure and transiently drops requests; a second retry
  // meaningfully reduces false-red runs without adding too much wall time
  // (workers=1 caps the blast radius of any one retry).
  retries: isCI ? 2 : 1,
  // Serial in CI: parallel workers all compete for the shared demo backend
  // (practicesoftwaretesting.com). When two cart tests hit it at once the
  // API can take 60+s, stranding /checkout mid-render. Serial costs ~30s
  // extra wall-clock but eliminates that contention entirely.
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
    // Give individual actions and page.goto more time in CI where the demo
    // site can take a long time to respond.
    actionTimeout: isCI ? 30_000 : 15_000,
    navigationTimeout: isCI ? 60_000 : 30_000,
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
        baseURL: API_BASE_URL,
      },
    },
  ],
});
