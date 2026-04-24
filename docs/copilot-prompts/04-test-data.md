# 04 · Test data factory

## The prompt

```
Write fixtures/data-factory.ts with Faker-backed builders:

- buildCheckoutInfo(overrides?: Partial<CheckoutInfo>) → { firstName, lastName, postalCode }
- buildEmployee(overrides?: Partial<EmployeeInput>) → { firstName, lastName, employeeId }
  employeeId is a 6-digit numeric string.
- buildLeaveRequest(overrides?: Partial<LeaveRequest>) → { leaveType, fromDate, toDate, comment }
  Dates are a 2-day window starting ~14 days from today, formatted YYYY-DD-MM
  for OrangeHRM's calendar widget.
- buildUser(overrides?: Partial<UserCredentials>) → username + email + password.
- buildCreditCard(overrides?: Partial<CreditCardInfo>) → number, cvv, expiry, holder.

Every builder accepts a Partial<T> override so callers pin the field under test:

  buildCheckoutInfo({ postalCode: '' })  // empty postal, everything else faked

Export every type alongside its builder. Use the Faker v10 API.
```

Six builders, all using the `{ ...faked, ...overrides }` spread pattern I asked for. Copilot factored out `formatOrangeDate(date)` on its own when it saw the date formatting repeated across leave-request scenarios. Correct v10 names throughout: `faker.person.firstName()`, `faker.location.zipCode('#####')`, `faker.finance.creditCardNumber('visa')`.

Two things needed re-prompting. First draft used Faker v8's `faker.name.firstName()` — fixed by naming "Faker v10" explicitly. First draft also skipped the override support entirely. Adding the concrete example (`buildCheckoutInfo({ postalCode: '' })`) to the prompt got it right on the retry.

## Why override support is the whole point

Without it, a scenario has to either hardcode fixture data (brittle, identical every run) or re-fake every field manually (verbose). With it, the scenario says "fake a valid checkout except postal code is empty" in a single call:

```typescript
await sauceCheckoutPage.fillCustomerInfo(buildCheckoutInfo({ postalCode: '' }));
```

Every run picks new noise for the non-test fields, so the suite catches environment-specific issues that only surface under certain inputs. The field under test stays pinned, so the scenario fails for the right reason.

## What I took away

Copilot writes builder patterns well when you show it the override usage you want. Describing the pattern in prose produces less-complete output. Show the exact call site you expect (`buildCheckoutInfo({ postalCode: '' })`) and ask Copilot to make that work — the builder shape falls out correctly on the first try.
