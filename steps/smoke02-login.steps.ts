import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.open();
});

When('I log in with email {string} and password {string}', async ({ loginPage }, email: string, password: string) => {
  await loginPage.login(email, password);
});

Then('I should be redirected away from the login page', async ({ page }) => {
  await expect(page).not.toHaveURL(/\/auth\/login/);

});
