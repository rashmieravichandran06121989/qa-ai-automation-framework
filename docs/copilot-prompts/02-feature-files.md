# 02 · Gherkin feature files

## SauceDemo login

```
Write a Gherkin feature file at features/saucedemo/01-login.feature for SauceDemo login.

- Actor is "User" — never "tester" or "I".
- Tag the feature @SauceDemo.
- Tag the happy-path scenario @visual — it fires an Applitools checkpoint in the step defs.
- Scenarios: standard_user → lands on inventory; locked_out_user → sees the locked-out
  error; invalid password → sees the generic match error; empty username → sees
  "Username is required".
- Use a Background step to open the login page.
- Error strings must be SauceDemo's verbatim output — don't paraphrase.
```

Four scenarios back on first acceptance. Copilot pulled the exact error strings because the SauceDemo login POM was already open in the context window, so it had the DOM content in scope.

Two things needed re-prompting. One scenario used "the tester" as the actor — I re-emphasized "**User** in every scenario" both in the prompt and the conventions file. The happy-path scenario initially shipped without the `@visual` tag. Re-prompting with the specific tag convention fixed both in a second pass.

## Cart + checkout — mixing angles deliberately

```
Write features/saucedemo/03-cart-checkout.feature. Three scenarios:

1. Add "Sauce Labs Backpack" to cart, remove it, assert cart badge: 0 → 1 → 0.
2. Happy-path checkout with generated customer info (the step def uses buildCheckoutInfo()).
   Assert the order-complete page. Fire an Applitools checkpoint.
3. Edge case: submit checkout with postal code "" (empty). Assert error
   "Error: Postal Code is required". Keep first name and last name populated so
   the test isolates postal code as the failing field.
```

All three scenarios on first acceptance. The key phrase was "**isolate** postal code as the failing field" — that produced the right scenario shape (filled first/last, empty postal) instead of a lazier "submit empty form" test.

## What I took away

Ask for edge cases by name. Copilot writes happy-path Gherkin by default. If you don't say "locked_out_user, invalid password, empty username," you get one scenario and a pat on the back. Every prompt in this library spells out exactly what should go wrong and how. That's what separates "it works" coverage from coverage a review will actually take seriously.
