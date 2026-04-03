# GitHub Copilot — Framework Engineering Showcase

This file serves two purposes:
1. **Context for Copilot** — tells GitHub Copilot the conventions of this project so generated code fits in immediately.
2. **Engineering story** — documents exactly how Copilot was used as a pair programmer to build every layer of this framework.

---

## How Copilot accelerated this framework

### Layer 1 — Page Object Models

The entire POM layer (`pages/`) was scaffolded with Copilot.

**Prompt used:**
```
Write a TypeScript Page Object Model for the login page of practicesoftwaretesting.com.
Extend BasePage. Declare all locators as readonly class properties using data-test attributes.
Methods: open(), login(email, password), getErrorMessage(). Use async/await throughout.
```

**What Copilot generated:**
- `LoginPage.ts`, `HomePage.ts`, `ProductPage.ts`, `CartPage.ts` — all five POMs in under a minute
- Correct `data-test` selector strategy without manual DOM inspection
- Consistent constructor pattern (`super(page)` + locator assignments) across all classes

**Copilot then suggested** adding `waitForVisible()` and `scrollToElement()` to `BasePage` after seeing repeated patterns across the generated POMs — a refactor that happened in a single Accept.

---

### Layer 2 — Smoke Tests with Applitools Eyes

**Prompt used:**
```
Write a Playwright smoke test file for a shopping site. Import Eyes and VisualGridRunner from
@applitools/eyes-playwright. Guard every visual checkpoint with if (VISUAL_ENABLED).
Use a shared runner and eyesConfig at file scope. Test IDs: SMOKE-01 through SMOKE-05.
Cover: homepage load, login, search, product detail + add to cart, cart summary.
```

**What Copilot generated:**
- Complete `smoke.test.ts` with all 5 tests
- The `VISUAL_ENABLED` guard pattern (graceful skip when no API key is set)
- Correct `eyes.open()` → `eyes.check()` → `eyes.close()` lifecycle in every test
- `runner.getAllTestResults()` in the `afterAll` teardown block

**Engineering decision accelerated by Copilot:** Copilot suggested using a single `VisualGridRunner` at file scope rather than one per test — the correct pattern for batching Applitools results.

---

### Layer 3 — Applitools Configuration

**Prompt used:**
```
Write an Applitools Eyes configuration file in TypeScript. Export a buildEyesConfig() function
that returns a Configuration object. Add Chrome 1280x720, Firefox 1280x720, and mobile Safari
375x812 portrait to the Ultrafast Grid. Read the API key from process.env.APPLITOOLS_API_KEY
and only set it when present (passing an empty string throws).
```

**What Copilot generated:**
- `applitools.config.ts` with all three browser targets
- The `if (apiKey)` guard that prevents an `IllegalArgument` error in keyless CI environments
- `BatchInfo` setup for grouping results in the Applitools dashboard

---

### Layer 4 — BDD Feature Files + Step Definitions

**Prompt used:**
```
Convert the smoke test scenarios into Gherkin feature files. One file per scenario, named
smokeNN-<topic>.feature. Then generate matching step definition files in steps/ that import
Given, When, Then from the fixtures index (not directly from playwright-bdd). Page objects
are injected via fixtures — do not instantiate them inside steps.
```

**What Copilot generated:**
- 5 `.feature` files with user-story preamble (`As a … I want … So that …`)
- 5 step definition files, each importing from `../fixtures`
- Shared steps (title assertion, product count) extracted into `shared.steps.ts` without being asked
- BDD fixture wiring in `fixtures/index.ts` — extending `base` with all four page objects

---

### Layer 5 — API Client and API Tests

**Prompt used:**
```
Write a typed ApiClient class in TypeScript that uses Playwright's APIRequestContext.
Mirror the Page Object pattern. Cover endpoints: auth/login, products (list/search/by-id/related),
categories (list/tree/search), brands (list/by-id/search), carts (create/add/update/remove/delete).
Include TypeScript interfaces for all response shapes.
```

**What Copilot generated:**
- `api-client.ts` with 18 typed methods and full response interfaces (`Product`, `Cart`, `Brand`, etc.)
- `auth.api.test.ts` including the JWT structure assertion (three Base64-URL segments)
- `products.api.test.ts`, `brands.api.test.ts`, `categories.api.test.ts`, `cart.api.test.ts`
- `test.describe` blocks grouped by resource, with `beforeEach` token injection

---

### Layer 6 — CI/CD Pipeline

**Prompt used:**
```
Write a GitHub Actions workflow that runs on push and pull_request to main.
Steps: checkout, Node 20 setup with npm cache, npm ci, install Playwright chromium,
run smoke tests, run BDD tests, run API tests. Pass APPLITOOLS_API_KEY from secrets.
Upload the playwright-report/ folder as an artifact with 14-day retention.
```

**What Copilot generated:**
- `.github/workflows/playwright.yml` — complete, first try
- Correct `secrets.APPLITOOLS_API_KEY` reference
- `if: always()` on the artifact upload step so the report is available even after failures

---

### Layer 7 — This instructions file

Copilot was given the project structure and asked to document its own conventions so that future Copilot sessions on this repo would generate consistent code. Meta, but it works.

---

## Conventions Copilot must follow in this project

### Page Object Models (`pages/`)
- Extend `BasePage` — every new page lives in its own file
- Locators are `readonly` class properties — `data-test` attributes first, then ARIA roles
- `open()` calls `this.navigate(path)` — never `page.goto()` directly
- Action methods return `Promise<void>`; getter methods return `Promise<string | number>`

### Smoke tests (`tests/smoke/smoke.test.ts`)
- Guard every visual checkpoint: `if (VISUAL_ENABLED) { ... }`
- Use the file-scope `runner` and `eyesConfig` — never instantiate new ones per test
- Test IDs: `SMOKE-NN: Description`
- Always close Eyes in the same test or in `afterAll`

### API tests (`tests/APITests/`)
- All HTTP calls go through `ApiClient` — add new endpoints there, not inline in tests
- Group with `test.describe` by API resource
- Assert both status code and response body shape

### BDD (`features/` + `steps/`)
- Feature files: `smokeNN-<topic>.feature`
- Step files mirror the feature filename
- Import `Given`, `When`, `Then` from `../fixtures` — not from `playwright-bdd` directly
- Never instantiate page objects inside step definitions — use injected fixtures

### TypeScript
- Strict mode on — `tsconfig.json` → `strict: true`
- `async/await` only — no raw Promises or callbacks
- Prefer `??` over `||` for nullish coalescing
- Timeout constants use underscores: `10_000`, `15_000`

### Environment & secrets
- Read keys from `process.env.*` — never hard-code
- `APPLITOOLS_API_KEY` is optional — all functional assertions must run without it
