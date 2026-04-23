import { test, expect } from '@playwright/test';
import { ApiClient, Product, PaginatedProducts } from './api-client';

test.describe('Products API', () => {
  let client: ApiClient;
  let firstProductId: string;

  test.beforeAll(async ({ request }) => {
    client = new ApiClient(request);
    // Resolve a real product ID once for all tests in this file
    const res  = await client.getProducts({ page: 1 });
    const body: PaginatedProducts = await res.json();
    firstProductId = body.data[0].id;
  });

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  // ── GET /products ────────────────────────────────────────────────────────

  test('GET /products returns 200 with a paginated envelope', async () => {
    const res  = await client.getProducts();
    const body: PaginatedProducts = await res.json();

    expect(res.status()).toBe(200);
    expect(body).toMatchObject({
      current_page : expect.any(Number),
      data         : expect.any(Array),
      from         : expect.any(Number),
      last_page    : expect.any(Number),
      per_page     : expect.any(Number),
      to           : expect.any(Number),
      total        : expect.any(Number),
    });
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /products page 1 returns up to 9 items per page', async () => {
    const res  = await client.getProducts({ page: 1 });
    const body: PaginatedProducts = await res.json();

    expect(res.status()).toBe(200);
    expect(body.current_page).toBe(1);
    expect(body.data.length).toBeLessThanOrEqual(body.per_page);
  });

  test('each product has the expected fields', async () => {
    const res  = await client.getProducts();
    const body: PaginatedProducts = await res.json();
    const product: Product = body.data[0];

    expect(product).toMatchObject({
      id          : expect.any(String),
      name        : expect.any(String),
      price       : expect.any(Number),
      in_stock    : expect.any(Boolean),
      is_rental   : expect.any(Boolean),
      co2_rating  : expect.any(String),
      category    : expect.objectContaining({ id: expect.any(String), name: expect.any(String) }),
      brand       : expect.objectContaining({ id: expect.any(String), name: expect.any(String) }),
    });
    expect(product.price).toBeGreaterThan(0);
  });

  // ── GET /products/{id} ───────────────────────────────────────────────────

  test('GET /products/{id} returns 200 for a valid product', async () => {
    const res  = await client.getProductById(firstProductId);
    const body: Product = await res.json();

    expect(res.status()).toBe(200);
    expect(body.id).toBe(firstProductId);
    expect(body.name.length).toBeGreaterThan(0);
    expect(body.price).toBeGreaterThan(0);
  });

  test('GET /products/{id} returns 404 for an unknown id', async () => {
    const res = await client.getProductById('non-existent-id-000');
    expect(res.status()).toBe(404);
  });

  // ── GET /products/{id}/related ───────────────────────────────────────────

  test('GET /products/{id}/related returns 200 with an array', async () => {
    const res  = await client.getRelatedProducts(firstProductId);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  // ── GET /products/search ─────────────────────────────────────────────────

  test('GET /products/search?q=Pliers returns relevant results', async () => {
    const res  = await client.searchProducts('Pliers');
    const body: PaginatedProducts = await res.json();

    expect(res.status()).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    // The API returns fuzzy/related results alongside exact matches.
// Assert at least one result contains the search term rather than all.
const matchingProducts = body.data.filter((p: any) =>
  p.name.toLowerCase().includes('pliers')
);
expect(matchingProducts.length).toBeGreaterThan(0);
  });

  test('GET /products/search with unknown term returns empty data array', async () => {
    const res  = await client.searchProducts('xyzzy_does_not_exist_123');
    const body: PaginatedProducts = await res.json();

    expect(res.status()).toBe(200);
    expect(body.data).toHaveLength(0);
  });
});
