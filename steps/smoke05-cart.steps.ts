import { expect } from '@playwright/test';
import { Then } from '../fixtures';

Then('the cart total should be displayed', async ({ cartPage }) => {
  expect((await cartPage.getCartTotal()).trim().length).toBeGreaterThan(0);
});

Then('the proceed to checkout button should be visible', async ({ cartPage }) => {
  await expect(cartPage.proceedToCheckoutButton).toBeVisible();
});
