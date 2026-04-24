import { expect } from '@playwright/test';
import { When, Then } from '../../fixtures';
import { buildCheckoutInfo } from '../../fixtures/data-factory';

When(
  'User adds {string} to the cart',
  async ({ sauceInventoryPage }, productName: string) => {
    await sauceInventoryPage.addItemToCartByName(productName);
  },
);

When(
  'User removes {string} from the cart',
  async ({ sauceInventoryPage }, productName: string) => {
    await sauceInventoryPage.removeItemFromCartByName(productName);
  },
);

When('User opens the cart', async ({ sauceInventoryPage, sauceCartPage }) => {
  await sauceInventoryPage.openCart();
  await sauceCartPage.expectLoaded();
});

When('User proceeds to checkout', async ({ sauceCartPage }) => {
  await sauceCartPage.proceedToCheckout();
});

When(
  'User fills the checkout form with generated personal information',
  async ({ sauceCheckoutPage }) => {
    await sauceCheckoutPage.fillCustomerInfo(buildCheckoutInfo());
  },
);

When(
  'User fills the checkout form with first name {string}, last name {string}, postal code {string}',
  async (
    { sauceCheckoutPage },
    firstName: string,
    lastName: string,
    postalCode: string,
  ) => {
    await sauceCheckoutPage.fillCustomerInfo({
      firstName,
      lastName,
      postalCode,
    });
  },
);

When('User continues to the order overview', async ({ sauceCheckoutPage }) => {
  await sauceCheckoutPage.continueToOverview();
});

When('User finishes the order', async ({ sauceCheckoutPage }) => {
  await sauceCheckoutPage.finishOrder();
});

Then(
  'the cart badge shows {int}',
  async ({ sauceInventoryPage }, expected: number) => {
    expect(await sauceInventoryPage.getCartBadgeCount()).toBe(expected);
  },
);

Then('the cart badge is empty', async ({ sauceInventoryPage }) => {
  expect(await sauceInventoryPage.getCartBadgeCount()).toBe(0);
});

Then(
  'User sees the SauceDemo order-complete confirmation',
  async ({ sauceCheckoutPage }) => {
    await sauceCheckoutPage.expectOrderComplete();
  },
);

Then(
  'the SauceDemo order-complete page matches the visual baseline',
  async ({ eyes }) => {
    await eyes.check('SauceDemo — order complete');
  },
);

Then(
  'User sees the SauceDemo checkout error {string}',
  async ({ sauceCheckoutPage }, expectedError: string) => {
    const actual = await sauceCheckoutPage.getErrorMessage();
    expect(actual).toBe(expectedError);
  },
);
