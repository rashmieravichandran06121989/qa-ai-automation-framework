import { expect } from '@playwright/test';
import { Then } from '../fixtures';

Then('the product name should not be empty', async ({ productPage }) => {
  expect((await productPage.getProductName()).length).toBeGreaterThan(0);
});

Then('the product price should not be empty', async ({ productPage }) => {
  expect((await productPage.getProductPrice()).length).toBeGreaterThan(0);
});
