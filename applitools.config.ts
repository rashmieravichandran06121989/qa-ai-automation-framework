import {
  BatchInfo,
  Configuration,
  BrowserType,
  ScreenOrientation,
} from '@applitools/eyes-playwright';
import { env, visualEnabled } from './config/env';

// Shared Applitools config. One batch per suite run so SauceDemo and
// OrangeHRM checkpoints group under a single review in the dashboard.
// When APPLITOOLS_API_KEY is missing we skip visual checks cleanly — the
// functional assertions still run, so local dev and forked PRs aren't
// blocked on not having a key. Ultrafast Grid fans one DOM snapshot out
// to three browsers server-side, so we pay the cost of one local run for
// three browser results.

export const applitoolsBatch = new BatchInfo({
  name: 'SauceDemo + OrangeHRM AI-Augmented Suite',
});

export function buildEyesConfig(): Configuration {
  const config = new Configuration();

  if (visualEnabled && env.APPLITOOLS_API_KEY) {
    config.setApiKey(env.APPLITOOLS_API_KEY);
  }

  config.setBatch(applitoolsBatch);

  config.addBrowser({ width: 1280, height: 720, name: BrowserType.CHROME });
  config.addBrowser({ width: 1280, height: 720, name: BrowserType.FIREFOX });
  config.addBrowser({
    width: 375,
    height: 812,
    name: BrowserType.SAFARI,
    screenOrientation: ScreenOrientation.PORTRAIT,
  });

  config.setAppName('qa-ai-automation-framework');

  return config;
}

// Re-export so existing callers (fixtures/index.ts) don't have to change
// their import path.
export { visualEnabled };
