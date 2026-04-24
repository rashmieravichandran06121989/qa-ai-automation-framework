import { expect } from '@playwright/test';
import { When, Then } from '../../fixtures';
import { buildLeaveRequest } from '../../fixtures/data-factory';

When('User opens the Apply Leave form', async ({ orangeLeavePage }) => {
  await orangeLeavePage.openApplyForm();
});

When(
  'User applies for leave with generated data',
  async ({ orangeLeavePage }) => {
    await orangeLeavePage.applyFor(buildLeaveRequest());
  },
);

When(
  'User submits the leave form without filling any fields',
  async ({ orangeLeavePage }) => {
    await orangeLeavePage.submit();
  },
);

Then(
  'User sees an OrangeHRM leave success confirmation',
  async ({ orangeLeavePage }) => {
    await orangeLeavePage.expectSuccessToast();
  },
);

Then(
  'User sees at least {int} OrangeHRM leave validation error',
  async ({ orangeLeavePage }, min: number) => {
    const count = await orangeLeavePage.getFieldErrorCount();
    expect(count).toBeGreaterThanOrEqual(min);
  },
);
