import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

// Cart ID captured from POST /carts response after addToCart.
// Needed to inject into sessionStorage before /checkout loads —
// the app reads cart_id from sessionStorage which Playwright
// does not persist between page navigations.
let capturedCartId = '';

Given('I navigate to the homepage', async ({ homePage }) => {
  await homePage.open();
});

When('I click on product number {int}', async ({ homePage }, index: number) => {
  await homePage.clickProductByIndex(index - 1);
});

When('I add the product to the cart', async ({ productPage }) => {
  capturedCartId = await productPage.addToCart();
});

When('I navigate to the cart page', async ({ cartPage }) => {
  await cartPage.open(capturedCartId);
});

Then('the cart should contain at least {int} item', async ({ cartPage }, n: number) => {
  await cartPage.cartItems.first().waitFor({ state: 'visible', timeout: 20_000 });
  const count = await cartPage.getCartItemCount();
  expect(count).toBeGreaterThanOrEqual(n);
});
