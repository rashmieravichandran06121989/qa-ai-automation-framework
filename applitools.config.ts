import {
  BatchInfo,
  Configuration,
  BrowserType,
  ScreenOrientation,
} from '@applitools/eyes-playwright';

// One batch per suite run groups SauceDemo + OrangeHRM checkpoints under
// a single review in the dashboard. When APPLITOOLS_API_KEY is missing
// visual checks skip cleanly — functional assertions still run, so local
// dev and forked PRs aren't blocked on not having a key. Ultrafast Grid
// fans one DOM snapshot out to three browsers server-side.

export const applitoolsBatch = new BatchInfo({
  name: 'SauceDemo + OrangeHRM AI-Augmented Suite',
});

// True only when we have a real key. The placeholder in .env.example has
// hyphens; real Applitools keys are alphanumeric, so a cheap regex
// catches the "fresh clone, forgot to update .env" case.
const apiKey = process.env.APPLITOOLS_API_KEY;
export const visualEnabled =
  !!apiKey &&
  apiKey !== 'your-applitools-api-key-here' &&
  /^[A-Za-z0-9]+$/.test(apiKey);

export function buildEyesConfig(): Configuration {
  const config = new Configuration();

  if (visualEnabled && apiKey) {
    config.setApiKey(apiKey);
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
