import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

// Central config. Every `process.env.*` access in the codebase goes
// through here so mis-set env vars fail loud at boot, not inside a
// retry loop four minutes into a CI run.
//
// The schema is deliberately strict on URL shape — it's caught bad
// BASE_URL values that would otherwise silently navigate to about:blank.
// APPLITOOLS_API_KEY stays optional; the framework degrades cleanly
// when it's missing. The regex rejects `.env.example`'s placeholder
// so a fresh clone doesn't crash the SDK with "apiKey must be
// alphanumeric" on the first run.
const Schema = z.object({
  APPLITOOLS_API_KEY: z
    .string()
    .regex(/^[A-Za-z0-9]+$/, 'Applitools keys are alphanumeric only')
    .optional()
    .refine((v) => v !== 'your-applitools-api-key-here', {
      message: 'Replace the .env.example placeholder value',
    }),
  BASE_URL: z.string().url().default('https://www.saucedemo.com'),
  ORANGEHRM_BASE_URL: z
    .string()
    .url()
    .default('https://opensource-demo.orangehrmlive.com'),
  API_BASE_URL: z
    .string()
    .url()
    .default('https://jsonplaceholder.typicode.com'),
  CI: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => v === 'true' || v === '1'),
});

// safeParse so we can print a useful error instead of Zod's stack trace.
const parsed = Schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '[config] env validation failed:\n',
    JSON.stringify(parsed.error.format(), null, 2),
  );
  // Exit non-zero so CI turns red at "setup" stage — cheaper and more
  // legible than a 4-minute test run failing on a null baseURL.
  process.exit(1);
}

export const env = Object.freeze(parsed.data);

export const visualEnabled = Boolean(env.APPLITOOLS_API_KEY);
