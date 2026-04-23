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

Then('the cart should contain at least {int} item', async ({ cartPage, page }, n: number) => {
  // CartPage.open() has already waited for either the first row or the
  // empty-cart banner. Here we just classify the outcome and assert.
  if (await cartPage.emptyCartMessage.isVisible().catch(() => false)) {
    throw new Error(
      `Cart rendered empty on /checkout (URL: ${page.url()}). The cart_id ` +
        'was likely not persisted in sessionStorage, or the GET /carts/{id} ' +
        'API call failed.',
    );
  }

  const count = await cartPage.getCartItemCount();
  expect(count).toBeGreaterThanOrEqual(n);
});
