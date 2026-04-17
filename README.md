# Playwright + Applitools Eyes — Quality Engineering Demo

Built as part of my Quality Engineering upskill journey — demonstrating how AI tools (Applitools visual AI + GitHub Copilot) can be integrated into a production-grade test framework to catch regressions that traditional assertions miss. This is the kind of framework I design and own in my current role at Arrive.

![CI](https://github.com/rashmieravichandran06121989/playwright-demo/actions/workflows/playwright.yml/badge.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![Playwright](https://img.shields.io/badge/playwright-1.44-blue)
![Applitools](https://img.shields.io/badge/applitools-eyes--playwright-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A production-quality test automation framework demonstrating how **Playwright**, **Applitools Eyes** visual AI, and **GitHub Copilot** work together to catch regressions that traditional assertions miss.

Built against the open demo store **[practicesoftwaretesting.com](https://practicesoftwaretesting.com)**.

---

## What's inside

| Layer | Technology | Coverage |
|-------|-----------|---------|
| UI smoke tests | Playwright + Applitools Ultrafast Grid | 5 end-to-end flows |
| BDD scenarios | playwright-bdd + Gherkin | 5 feature files |
| API tests | Playwright APIRequestContext | Auth, Products, Brands, Categories, Cart |
| Visual AI | Applitools Eyes (Chrome, Firefox, Mobile Safari) | 8 visual checkpoints |
| CI/CD | GitHub Actions | Runs on every push and PR |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions CI                     │
│  push / PR  →  npm ci  →  playwright test  →  report    │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────▼──────┐ ┌─────▼─────┐ ┌────▼──────┐
   │ Smoke Tests │ │ BDD Tests │ │ API Tests │
   │  (5 specs)  │ │(5 features)│ │ (5 files) │
   └──────┬──────┘ └─────┬─────┘ └───────────┘
          │              │
   ┌──────▼──────────────▼──────┐
   │      Page Object Models    │
   │  BasePage  HomePage  Login │
   │  ProductPage   CartPage    │
   └──────────────┬─────────────┘
                  │
   ┌──────────────▼─────────────┐
   │   Applitools Ultrafast Grid │
   │  Chrome · Firefox · Safari  │
   │  (3 browsers, 1 test run)   │
   └─────────────────────────────┘
```

---

## Test coverage

### Smoke tests (`tests/smoke/smoke.test.ts`)

| ID | Scenario | Assertions |
|----|----------|-----------|
| SMOKE-01 | Homepage loads | Title, product grid rendered, visual snapshot |
| SMOKE-02 | Login with valid credentials | Redirect after login, visual snapshots (before + after) |
| SMOKE-03 | Search returns results | Result count > 0, first title matches keyword, visual snapshot |
| SMOKE-04 | Product detail + add to cart | Name/price visible, item added, visual snapshots |
| SMOKE-05 | Cart summary | Item count ≥ 1, total displayed, checkout button visible, visual snapshot |

### API tests (`tests/APITests/`)

| File | Endpoint group | Key assertions |
|------|---------------|---------------|
| `auth.api.test.ts` | `POST /auth/login` | 200 + JWT token, malformed token rejected, 4xx on bad credentials |
| `products.api.test.ts` | `GET /products` | Pagination, search, related products |
| `brands.api.test.ts` | `GET /brands` | List, by ID, search |
| `categories.api.test.ts` | `GET /categories` | Tree structure, search |
| `cart.api.test.ts` | `POST /carts` | Create, add item, update quantity, delete |

---

## Key design patterns

### Page Object Model

Every page is a TypeScript class extending `BasePage`. Locators are `readonly` properties using `data-test` attributes — they never appear inside test assertions.

```ts
// pages/HomePage.ts
export class HomePage extends BasePage {
  readonly searchInput = this.page.locator('[data-test="search-query"]');
  readonly productCards = this.page.locator('a[href^="/product/"]');

  async searchFor(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
```

### Visual AI with Applitools Eyes

Each smoke test opens an Eyes session, takes targeted checkpoints, and closes. The `VisualGridRunner` fans out to Chrome, Firefox, and mobile Safari in a single run — no extra time cost.

```ts
if (VISUAL_ENABLED) {
  await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-01: Homepage');
  await eyes.check('Homepage - full page', Target.window().fully());
  await eyes.close();
}
```

Visual checks are **skipped gracefully** when `APPLITOOLS_API_KEY` is unset, so functional assertions still run in every environment.

### BDD with Gherkin

Scenarios are written in plain English so non-technical stakeholders can read and contribute.

```gherkin
# features/smoke03-search.feature
Scenario: Search returns relevant results for a known term
  Given I navigate to the homepage
  When I search for "Pliers"
  Then the search results should contain at least one product
  And the first product title should contain "Pliers"
```

### ApiClient — REST mirror of the POM pattern

All API calls go through a typed `ApiClient` class, keeping tests clean and endpoints easy to find.

```ts
const res = await client.login(email, password);
expect(res.status()).toBe(200);
const { access_token } = await res.json();
```

### GitHub Copilot integration

A `.github/copilot-instructions.md` file teaches Copilot the project's conventions — locator strategy, test ID format, Eyes session lifecycle, BDD imports — so generated code fits right in without manual cleanup.

---

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/rashmieravichandran06121989/playwright-demo.git
cd playwright-democd applitools-playwright-demo
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps chromium

# 3. Configure Applitools (optional — functional tests run without it)
cp .env.example .env
# Edit .env and paste your free API key from https://applitools.com
```

### Run the tests

```bash
# Smoke tests (UI + visual)
npm run test:smoke

# BDD scenarios
npm run test:bdd

# API tests
npm run test:api

# Open the HTML report
npm run test:report
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APPLITOOLS_API_KEY` | Optional | Enables visual AI checkpoints. Get a free key at [applitools.com](https://applitools.com) |

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every push and pull request:

1. Installs Node 20 + dependencies
2. Installs Chromium via `playwright install`
3. Runs smoke, BDD, and API tests
4. Uploads the Playwright HTML report as a build artifact

Add `APPLITOOLS_API_KEY` as a repository secret to enable visual regression checks in CI.

---

## Project structure

```
.
├── .github/
│   ├── copilot-instructions.md  # Copilot context for this project
│   └── workflows/
│       └── playwright.yml       # CI pipeline
├── docs/
│   └── screenshots/             # Demo screenshots for README / LinkedIn
├── features/                    # Gherkin feature files (BDD)
├── fixtures/                    # Shared test fixtures + BDD bindings
├── pages/                       # Page Object Models
│   ├── BasePage.ts
│   ├── CartPage.ts
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   └── ProductPage.ts
├── steps/                       # BDD step definitions
├── tests/
│   ├── APITests/                # REST API tests + ApiClient
│   └── smoke/
│       └── smoke.test.ts        # 5 smoke tests with visual checkpoints
├── applitools.config.ts         # Applitools Eyes configuration
├── playwright.config.ts         # Playwright configuration
└── .env.example                 # Environment variable template
```


---

## Tech stack

- **[Playwright](https://playwright.dev)** — cross-browser end-to-end testing
- **[Applitools Eyes](https://applitools.com)** — AI-powered visual regression testing (Ultrafast Grid)
- **[playwright-bdd](https://vitalets.github.io/playwright-bdd)** — Cucumber/Gherkin BDD for Playwright
- **[TypeScript](https://www.typescriptlang.org)** — strict mode, full type safety
- **[GitHub Actions](https://github.com/features/actions)** — CI/CD automation
- **[GitHub Copilot](https://github.com/features/copilot)** — AI pair programming with project-specific instructions

---

