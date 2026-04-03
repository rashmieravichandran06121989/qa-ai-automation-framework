import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

Given('I navigate to the homepage', async ({ homePage }) => {
  await homePage.open();
});

When('I click on product number {int}', async ({ homePage }, index: number) => {
  await homePage.clickProductByIndex(index - 1);
});

When('I add the product to the cart', async ({ productPage }) => {
  await productPage.addToCart();
});

When('I navigate to the cart page', async ({ cartPage }) => {
  await cartPage.open();
});

Then('the cart should contain at least {int} item', async ({ cartPage }, n: number) => {
  const count = await cartPage.getCartItemCount();
  expect(count).toBeGreaterThanOrEqual(n);
});
