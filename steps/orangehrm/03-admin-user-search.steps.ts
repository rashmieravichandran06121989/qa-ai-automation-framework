import { When, Then } from '../../fixtures';
import type {
  UserRole,
  UserStatus,
} from '../../pages/orangehrm/admin-users-page';

When(
  'User filters OrangeHRM users by role {string}',
  async ({ orangeAdminUsersPage }, role: string) => {
    await orangeAdminUsersPage.expectLoaded();
    await orangeAdminUsersPage.filterByRole(role as UserRole);
  },
);

When(
  'User filters OrangeHRM users by status {string}',
  async ({ orangeAdminUsersPage }, status: string) => {
    await orangeAdminUsersPage.expectLoaded();
    await orangeAdminUsersPage.filterByStatus(status as UserStatus);
  },
);

When(
  'User runs the OrangeHRM user search',
  async ({ orangeAdminUsersPage }) => {
    await orangeAdminUsersPage.search();
  },
);

When(
  'User resets the OrangeHRM user search',
  async ({ orangeAdminUsersPage }) => {
    await orangeAdminUsersPage.reset();
  },
);

Then(
  'the OrangeHRM user list shows at least {int} result',
  async ({ orangeAdminUsersPage }, min: number) => {
    await orangeAdminUsersPage.expectResultCountAtLeast(min);
  },
);
