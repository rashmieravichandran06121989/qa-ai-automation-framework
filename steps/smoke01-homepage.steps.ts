import { expect } from '@playwright/test';
import { Then } from '../fixtures';
import { faker } from '@faker-js/faker';

Then('the page title should contain {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
});

Then('the product catalogue should display at least one product', async ({ homePage }) => {
  expect(await homePage.getProductCount()).toBeGreaterThan(0);




});
