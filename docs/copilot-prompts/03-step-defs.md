# 03 · Step definitions

## SauceDemo login steps

```
Write step defs for features/saucedemo/01-login.feature at steps/saucedemo/01-login.steps.ts.

- Import Given/When/Then from `../../fixtures` — never directly from playwright-bdd.
- Page objects (sauceLoginPage, sauceInventoryPage) arrive via fixture destructuring.
  Never `new SauceLoginPage(page)` inside a step.
- The visual-baseline step calls eyes.check('SauceDemo — inventory after login')
  from the injected eyes fixture. No guard needed — the fixture no-ops when
  APPLITOOLS_API_KEY is missing.
- Assert with expect() from @playwright/test. Use toBe() for exact-match error
  strings, not toContain() — the scenario lists the exact text.
```

Imports came back correct on the first draft because the conventions file pins the import path. Fixture destructuring landed right. The visual step used the "SauceDemo — ..." checkpoint naming convention pulled from the conventions file.

One thing I stripped: the first draft added `await sauceLoginPage.expectOnLoginPage()` inside the login step even though the feature file didn't ask for it. Took it out. Step defs should do exactly what the Gherkin says — nothing more, nothing less. Helper calls hiding in step bodies are how suites drift away from what the `.feature` file claims to test.

## Checkout steps with parameterized patterns

```
Write step defs for features/saucedemo/03-cart-checkout.feature. Use parameterized
step patterns:

- 'User adds {string} to the cart' — productName as a positional string arg.
- 'User fills the checkout form with first name {string}, last name {string},
  postal code {string}' — three string args in order.
- 'the cart badge shows {int}' — integer arg.

Use buildCheckoutInfo() from fixtures/data-factory in the "generated personal
information" step.
```

playwright-bdd positional-arg signatures came back correct (fixture destructure first, then positional args in order). `buildCheckoutInfo()` import landed without prompting because the factory was already open in the editor.

## What I took away

Step defs are glue code. Copilot writes glue well when the prompt lists the import paths, the fixture shape, and the exact step signatures. Leave those unspecified and it reaches for `@cucumber/cucumber` imports, inlined `new PageObject(page)` calls, and generic `toContain()` assertions — all wrong for this codebase. The conventions file does most of this work; the prompt pins what's left.
