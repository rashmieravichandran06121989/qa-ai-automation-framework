import { BatchInfo, Configuration, BrowserType, ScreenOrientation } from '@applitools/eyes-playwright';

// Applitools Eyes configuration shared across all tests
export const applitoolsBatch = new BatchInfo({
  name: 'PracticeSoftwareTesting Smoke Tests',
});

export function buildEyesConfig(): Configuration {
  const config = new Configuration();

  // API key is read from the APPLITOOLS_API_KEY environment variable.
  // You can also set it explicitly: config.setApiKey('YOUR_API_KEY');
  // Only set the key when the variable is present – passing an empty string
  // throws an IllegalArgument error and prevents any tests from loading.
  const apiKey = process.env.APPLITOOLS_API_KEY;
  if (apiKey) {
    config.setApiKey(apiKey);
  }

  config.setBatch(applitoolsBatch);

  // Test against multiple browsers / viewports in the Ultrafast Grid
  config.addBrowser({ width: 1280, height: 720, name: BrowserType.CHROME });
  config.addBrowser({ width: 1280, height: 720, name: BrowserType.FIREFOX });
  config.addBrowser({ width: 375, height: 812, name: BrowserType.SAFARI, screenOrientation: ScreenOrientation.PORTRAIT });

  // Set the app and batch names
  config.setAppName('PracticeSoftwareTesting');

  return config;
}
