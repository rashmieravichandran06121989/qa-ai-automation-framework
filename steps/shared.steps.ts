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
  if (count < n) {
    // Dump diagnostics so CI logs contain enough to debug without needing
    // the trace.zip artifact. This is the hardest fail-mode to diagnose
    // because neither the rows nor the empty-cart banner are visible.
    const diag = await page.evaluate(() => {
      const pick = (sel: string) =>
        Array.from(document.querySelectorAll(sel))
          .map((el) => (el as HTMLElement).innerText?.trim().slice(0, 80))
          .filter(Boolean);
      return {
        url: location.href,
        sessionStorage: { ...window.sessionStorage },
        localStorage: { ...window.localStorage },
        productTitles: pick('[data-test="product-title"]'),
        rowCount: document.querySelectorAll('tr').length,
        anyDataTests: Array.from(
          new Set(
            Array.from(document.querySelectorAll('[data-test]')).map((e) =>
              e.getAttribute('data-test'),
            ),
          ),
        ).sort(),
        bodyPreview: document.body?.innerText?.slice(0, 600),
      };
    }).catch((e) => ({ error: String(e) }));

    throw new Error(
      `Cart contained ${count} items, expected >= ${n}. ` +
        `Diagnostic:\n${JSON.stringify(diag, null, 2)}`,
    );
  }
  expect(count).toBeGreaterThanOrEqual(n);
});
