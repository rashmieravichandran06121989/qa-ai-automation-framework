import { expect } from '@playwright/test';
import { When, Then } from '../fixtures';

When('I search for {string}', async ({ homePage }, term: string) => {
  await homePage.searchFor(term);
});

Then('at least one product should be displayed', async ({ homePage }) => {
  expect(await homePage.getProductCount()).toBeGreaterThan(0);
});

Then('the first result should be relevant to {string}', async ({ homePage }, term: string) => {
  const titles = homePage.productTitles;
  const firstTitle = (await titles.first().textContent()) ?? '';
  expect(firstTitle.toLowerCase()).toContain(term.toLowerCase());
});
