import { expect } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';

Given('User opens the OrangeHRM login page', async ({ orangeLoginPage }) => {
  await orangeLoginPage.open();
});

When(
  'User logs in to OrangeHRM as {string} with password {string}',
  async ({ orangeLoginPage }, username: string, password: string) => {
    await orangeLoginPage.loginAs(username, password);
  },
);

Then(
  'User lands on the OrangeHRM dashboard',
  async ({ orangeDashboardPage }) => {
    await orangeDashboardPage.expectLoaded();
  },
);

Then(
  'User sees the OrangeHRM login error {string}',
  async ({ orangeLoginPage }, expectedError: string) => {
    const actual = await orangeLoginPage.getErrorMessage();
    expect(actual).toBe(expectedError);
  },
);

Then(
  'User sees at least {int} OrangeHRM required-field errors',
  async ({ orangeLoginPage }, min: number) => {
    const count = await orangeLoginPage.getRequiredFieldErrorCount();
    expect(count).toBeGreaterThanOrEqual(min);
  },
);

Then(
  'the OrangeHRM dashboard matches the visual baseline',
  async ({ eyes }) => {
    await eyes.check('OrangeHRM — dashboard after login');
  },
);
