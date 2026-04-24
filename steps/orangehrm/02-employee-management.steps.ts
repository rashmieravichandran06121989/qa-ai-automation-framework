import { expect } from '@playwright/test';
import { When, Then } from '../../fixtures';
import { buildEmployee } from '../../fixtures/data-factory';

When('User clicks Add Employee', async ({ orangePIMPage }) => {
  await orangePIMPage.clickAddEmployee();
});

When(
  'User fills the employee form with generated data',
  async ({ orangePIMPage }) => {
    await orangePIMPage.addEmployee(buildEmployee());
  },
);

When('User goes to the Employee List', async ({ orangePIMPage }) => {
  await orangePIMPage.goToEmployeeList();
});

When(
  'User searches the employee list by name {string}',
  async ({ orangePIMPage }, name: string) => {
    await orangePIMPage.searchByName(name);
  },
);

Then(
  'User sees the Personal Details page for the new employee',
  async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Personal Details' }),
    ).toBeVisible({ timeout: 15_000 });
  },
);

Then(
  'the employee list shows at least {int} result',
  async ({ orangePIMPage }, min: number) => {
    await orangePIMPage.expectResultCountAtLeast(min);
  },
);

Then(
  'the OrangeHRM personal-details page matches the visual baseline',
  async ({ eyes }) => {
    await eyes.check('OrangeHRM — personal details after add employee');
  },
);
