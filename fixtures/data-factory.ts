import { faker } from '@faker-js/faker';
import type { CheckoutInfo } from '../pages/saucedemo/checkout-page';
import type { EmployeeInput } from '../pages/orangehrm/pim-page';
import type { LeaveRequest } from '../pages/orangehrm/leave-page';

// Every non-fixed value consumed by the suite goes through one of these
// builders. Keeps hardcoded PII and postal codes out of the feature files
// and gives every scenario realistic noise across runs.
//
// Builders take a Partial<T> override so a scenario can pin the field
// under test while letting the rest stay faked. Example:
//
//   buildCheckoutInfo({ postalCode: '' })
//
// pins postal to empty for the missing-postal edge case and leaves the
// name fields randomized, so the scenario fails for the right reason
// without sharing fixture data with other tests.
//
// Deterministic runs: call faker.seed(42) somewhere before the builders
// fire. Not on by default — flaky data catches environment-specific bugs
// that a pinned seed would hide.

export interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

export interface CreditCardInfo {
  number: string;
  cvv: string;
  expMonth: string;
  expYear: string;
  holder: string;
}

// ── Shared helpers ──────────────────────────────────────────────────────────

/** YYYY-DD-MM calendar format as expected by OrangeHRM's date widget. */
export function formatOrangeDate(date: Date): string {
  const yyyy = date.getFullYear();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${dd}-${mm}`;
}

// ── SauceDemo ───────────────────────────────────────────────────────────────

export function buildCheckoutInfo(
  overrides: Partial<CheckoutInfo> = {},
): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

// ── OrangeHRM — PIM ─────────────────────────────────────────────────────────

export function buildEmployee(
  overrides: Partial<EmployeeInput> = {},
): EmployeeInput {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    employeeId: faker.string.numeric(6),
    ...overrides,
  };
}

// ── OrangeHRM — Leave ───────────────────────────────────────────────────────

/**
 * A 2-day leave request starting ~14 days from today. Far enough out to
 * avoid colliding with OrangeHRM's default approved-leave fixtures.
 */
export function buildLeaveRequest(
  overrides: Partial<LeaveRequest> = {},
): LeaveRequest {
  const from = new Date();
  from.setDate(from.getDate() + 14);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  return {
    // "Vacation" as a partial match lands on whichever "* - Vacation"
    // leave type the OrangeHRM demo currently ships (the exact prefix
    // drifts between demo resets).
    leaveType: 'Vacation',
    fromDate: formatOrangeDate(from),
    toDate: formatOrangeDate(to),
    comment: `Auto-generated portfolio test — ${faker.word.adjective()} trip`,
    ...overrides,
  };
}

// ── Generic user / payment (for future API + UI reuse) ──────────────────────

export function buildUser(
  overrides: Partial<UserCredentials> = {},
): UserCredentials {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: faker.internet.password({ length: 14, memorable: false }),
    ...overrides,
  };
}

export function buildCreditCard(
  overrides: Partial<CreditCardInfo> = {},
): CreditCardInfo {
  return {
    number: faker.finance.creditCardNumber('visa'),
    cvv: faker.finance.creditCardCVV(),
    expMonth: String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0'),
    expYear: String(new Date().getFullYear() + 3),
    holder: faker.person.fullName(),
    ...overrides,
  };
}
