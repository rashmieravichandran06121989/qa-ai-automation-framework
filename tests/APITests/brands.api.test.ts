import { test, expect } from '@playwright/test';
import { ApiClient, Brand } from './api-client';

test.describe('Brands API', () => {
  let client: ApiClient;
  let firstBrandId: string;

  test.beforeAll(async ({ request }) => {
    const c = new ApiClient(request);
    const res = await c.getBrands();
    const body: Brand[] = await res.json();
    firstBrandId = body[0].id;
  });

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  // ── GET /brands ──────────────────────────────────────────────────────────

  test('GET /brands returns 200 with a non-empty array', async () => {
    const res   = await client.getBrands();
    const body: Brand[] = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('each brand has id, name and slug fields', async () => {
    const res   = await client.getBrands();
    const body: Brand[] = await res.json();
    const brand = body[0];

    expect(brand).toMatchObject({
      id  : expect.any(String),
      name: expect.any(String),
      slug: expect.any(String),
    });
  });

  // ── GET /brands/{id} ─────────────────────────────────────────────────────

  test('GET /brands/{id} returns 200 for a valid brand id', async () => {
    const res   = await client.getBrandById(firstBrandId);
    const body: Brand = await res.json();

    expect(res.status()).toBe(200);
    expect(body.id).toBe(firstBrandId);
    expect(body.name.length).toBeGreaterThan(0);
  });

  test('GET /brands/{id} returns 404 for an unknown id', async () => {
    const res = await client.getBrandById('non-existent-brand-000');
    expect(res.status()).toBe(404);
  });

  // ── GET /brands/search ───────────────────────────────────────────────────

  test('GET /brands/search?q=Forge returns ForgeFlex Tools', async () => {
    const res   = await client.searchBrands('Forge');
    const body: Brand[] = await res.json();

    expect(res.status()).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    body.forEach(b =>
      expect(b.name.toLowerCase()).toContain('forge')
    );
  });

  test('GET /brands/search with unknown term returns empty array', async () => {
    const res  = await client.searchBrands('xyzzy_no_brand_999');
    const body = await res.json();

    expect(res.status()).toBe(200);
    const results = Array.isArray(body) ? body : body.data ?? [];
    expect(results).toHaveLength(0);
  });
});
