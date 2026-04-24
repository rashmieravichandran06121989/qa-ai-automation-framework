import { expect } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';

Given('User opens the SauceDemo login page', async ({ sauceLoginPage }) => {
  await sauceLoginPage.open();
});

When(
  'User logs in as {string} with password {string}',
  async ({ sauceLoginPage }, username: string, password: string) => {
    await sauceLoginPage.loginAs(username, password);
  },
);

Then(
  'User lands on the SauceDemo inventory page',
  async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.expectLoaded();
  },
);

Then(
  'User sees the SauceDemo login error {string}',
  async ({ sauceLoginPage }, expectedError: string) => {
    const actual = await sauceLoginPage.getErrorMessage();
    expect(actual).toBe(expectedError);
  },
);

Then(
  'the SauceDemo login page matches the visual baseline',
  async ({ eyes }) => {
    await eyes.check('SauceDemo — inventory after login');
  },
);
