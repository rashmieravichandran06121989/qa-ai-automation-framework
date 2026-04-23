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
  // Race cart row vs. empty-cart notice so we surface a clear failure
  // ("Cart rendered empty") instead of a generic 20s locator timeout when
  // the cart_id wasn't persisted or the checkout API call failed.
  await Promise.race([
    cartPage.cartItems.first().waitFor({ state: 'visible', timeout: 30_000 }),
    cartPage.emptyCartMessage.waitFor({ state: 'visible', timeout: 30_000 }),
  ]).catch(() => {
    // Both timed out — let the count assertion below produce the error.
  });

  if (await cartPage.emptyCartMessage.isVisible().catch(() => false)) {
    throw new Error(
      'Cart rendered empty on /checkout — the cart_id was likely not ' +
        'persisted in sessionStorage, or the GET /carts/{id} API call failed.',
    );
  }

  const count = await cartPage.getCartItemCount();
  expect(count).toBeGreaterThanOrEqual(n);
});
