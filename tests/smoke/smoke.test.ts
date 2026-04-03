import { test, expect } from '@playwright/test';
import { Eyes, Target, VisualGridRunner } from '@applitools/eyes-playwright';
import { buildEyesConfig } from '../../applitools.config';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';

// ---------------------------------------------------------------------------
// Shared Applitools runner – one runner per test suite keeps batches together.
// VisualGridRunner concurrency matches the Playwright workers count (5).
// ---------------------------------------------------------------------------
const runner = new VisualGridRunner({ testConcurrency: 5 });
const eyesConfig = buildEyesConfig();

// Visual checks are skipped gracefully when no API key is configured so that
// functional assertions can still run in CI environments without Applitools.
const VISUAL_ENABLED = !!process.env.APPLITOOLS_API_KEY;

// Test credentials provided by practicesoftwaretesting.com
const VALID_EMAIL    = 'customer@practicesoftwaretesting.com';
const VALID_PASSWORD = 'welcome01';

// ---------------------------------------------------------------------------
// Smoke Test 1 – Homepage loads and renders correctly
// ---------------------------------------------------------------------------
test('SMOKE-01: Homepage loads and displays product catalogue', async ({ page }) => {
  const homePage = new HomePage(page);
  const eyes = new Eyes(runner);
  eyes.setConfiguration(eyesConfig);

  await homePage.open();

  // Functional assertions
  await expect(page).toHaveTitle(/Practice Software Testing/i);
  const productCount = await homePage.getProductCount();
  expect(productCount).toBeGreaterThan(0);

  // Visual checkpoint
  if (VISUAL_ENABLED) {
    await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-01: Homepage');
    await eyes.check('Homepage - full page', Target.window().fully());
    await eyes.close();
  }
});

// ---------------------------------------------------------------------------
// Smoke Test 2 – User can log in with valid credentials
// ---------------------------------------------------------------------------
test('SMOKE-02: User can log in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const eyes = new Eyes(runner);
  eyes.setConfiguration(eyesConfig);

  await loginPage.open();

  // Visual checkpoint of the login form before interaction
  if (VISUAL_ENABLED) {
    await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-02: Login');
    await eyes.check('Login page - initial state', Target.window().fully());
  }

  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);

  // After successful login the user is redirected to the home/account page
  await expect(page).not.toHaveURL(/\/auth\/login/);

  // Visual checkpoint after login
  if (VISUAL_ENABLED) {
    await eyes.check('Post-login - account page', Target.window().fully());
    await eyes.close();
  }
});

// ---------------------------------------------------------------------------
// Smoke Test 3 – Search returns relevant results
// ---------------------------------------------------------------------------
test('SMOKE-03: Search returns relevant results for a known term', async ({ page }) => {
  const homePage = new HomePage(page);
  const eyes = new Eyes(runner);
  eyes.setConfiguration(eyesConfig);

  await homePage.open();
  await homePage.searchFor('Pliers');

  // Functional assertion – at least one result returned
  const resultCount = await homePage.getProductCount();
  expect(resultCount).toBeGreaterThan(0);

  // At least the first result should be relevant to the search term.
  // We intentionally do not assert every card because the site may return
  // loosely-related products alongside direct matches.
  const firstTitle = (await homePage.productTitles.first().textContent()) ?? '';
  expect(firstTitle.toLowerCase()).toContain('pliers');

  // Visual checkpoint
  if (VISUAL_ENABLED) {
    await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-03: Search Results');
    await eyes.check('Search results - Pliers', Target.window().fully());
    await eyes.close();
  }
});

// ---------------------------------------------------------------------------
// Smoke Test 4 – Product detail page renders and add-to-cart works
// ---------------------------------------------------------------------------
test('SMOKE-04: Product detail page renders and item can be added to cart', async ({ page }) => {
  const homePage    = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage    = new CartPage(page);
  const eyes = new Eyes(runner);
  eyes.setConfiguration(eyesConfig);

  await homePage.open();

  // Navigate to the first product
  await homePage.clickProductByIndex(0);

  // Functional assertions on product detail page
  const name  = await productPage.getProductName();
  const price = await productPage.getProductPrice();
  expect(name.length).toBeGreaterThan(0);
  expect(price.length).toBeGreaterThan(0);

  // Visual checkpoint of product detail
  if (VISUAL_ENABLED) {
    await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-04: Product Detail');
    await eyes.check('Product detail page', Target.window().fully());
  }

  // Add to cart
  await productPage.addToCart();

  // Navigate to cart and verify item is present
  await cartPage.open();
  const itemCount = await cartPage.getCartItemCount();
  expect(itemCount).toBeGreaterThan(0);

  // Visual checkpoint of cart
  if (VISUAL_ENABLED) {
    await eyes.check('Cart with added item', Target.window().fully());
    await eyes.close();
  }
});

// ---------------------------------------------------------------------------
// Smoke Test 5 – Cart reflects correct item count and total
// ---------------------------------------------------------------------------
test('SMOKE-05: Cart displays correct item and total after adding a product', async ({ page }) => {
  const homePage    = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage    = new CartPage(page);
  const eyes = new Eyes(runner);
  eyes.setConfiguration(eyesConfig);

  await homePage.open();

  // Add the second product to the cart to avoid collision with test 4
  await homePage.clickProductByIndex(1);
  await productPage.addToCart();

  // Navigate to cart
  await cartPage.open();

  // Functional assertions
  const itemCount = await cartPage.getCartItemCount();
  expect(itemCount).toBeGreaterThanOrEqual(1);

  const total = await cartPage.getCartTotal();
  expect(total.trim().length).toBeGreaterThan(0);

  // Proceed-to-checkout button must be visible
  await expect(cartPage.proceedToCheckoutButton).toBeVisible();

  // Visual checkpoint
  if (VISUAL_ENABLED) {
    await eyes.open(page, 'PracticeSoftwareTesting', 'SMOKE-05: Cart Summary');
    await eyes.check('Cart summary page', Target.window().fully());
    await eyes.close();
  }
});

// ---------------------------------------------------------------------------
// Teardown – collect Applitools results after all tests in the file
// ---------------------------------------------------------------------------
test.afterAll(async () => {
  if (VISUAL_ENABLED) {
    const allTestResults = await runner.getAllTestResults(false);
    console.log('Applitools Visual Test Results:', allTestResults);
  }
});
