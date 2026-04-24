import { expect } from '@playwright/test';
import { When, Then } from '../../fixtures';
import type { SortOption } from '../../pages/saucedemo/inventory-page';

When(
  'User sorts the inventory by {string}',
  async ({ sauceInventoryPage }, sortCode: string) => {
    await sauceInventoryPage.sortBy(sortCode as SortOption);
  },
);

Then(
  'the inventory grid shows {int} items',
  async ({ sauceInventoryPage }, expected: number) => {
    expect(await sauceInventoryPage.getItemCount()).toBe(expected);
  },
);

Then(
  'the inventory order matches {string}',
  async ({ sauceInventoryPage }, sortCode: string) => {
    if (sortCode === 'az' || sortCode === 'za') {
      const names = await sauceInventoryPage.getItemNamesInOrder();
      const sorted = [...names].sort();
      expect(names).toEqual(sortCode === 'az' ? sorted : sorted.reverse());
      return;
    }

    const prices = await sauceInventoryPage.getItemPricesInOrder();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortCode === 'lohi' ? sorted : sorted.reverse());
  },
);

Then(
  'the SauceDemo inventory page matches the visual baseline',
  async ({ eyes }) => {
    await eyes.check('SauceDemo — inventory grid');
  },
);
