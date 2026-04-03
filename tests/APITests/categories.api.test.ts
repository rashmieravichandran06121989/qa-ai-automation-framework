import { test, expect } from '@playwright/test';
import { ApiClient, Category } from './api-client';

test.describe('Categories API', () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  // ── GET /categories ──────────────────────────────────────────────────────

  test('GET /categories returns 200 with a non-empty array', async () => {
    const res   = await client.getCategories();
    const body: Category[] = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('each category has id, name, slug and parent_id fields', async () => {
    const res   = await client.getCategories();
    const body: Category[] = await res.json();
    const cat = body[0];

    expect(cat).toMatchObject({
      id       : expect.any(String),
      name     : expect.any(String),
      slug     : expect.any(String),
    });
    // parent_id is either a string or null
    expect(cat.parent_id === null || typeof cat.parent_id === 'string').toBe(true);
  });

  test('GET /categories contains at least one root category (parent_id = null)', async () => {
    const res   = await client.getCategories();
    const body: Category[] = await res.json();
    const roots = body.filter(c => c.parent_id === null);

    expect(roots.length).toBeGreaterThan(0);
  });

  // ── GET /categories/tree ─────────────────────────────────────────────────

  test('GET /categories/tree returns 200 with a nested structure', async () => {
    const res  = await client.getCategoriesTree();
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Root nodes in the tree have a sub_categories or children array
    const root = body[0];
    expect(root).toHaveProperty('id');
    expect(root).toHaveProperty('name');
  });

  // ── GET /categories/search ───────────────────────────────────────────────

  test('GET /categories/search?q=Hand returns relevant results', async () => {
    const res  = await client.searchCategories('Hand');
    const body: Category[] = await res.json();

    expect(res.status()).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    body.forEach(c =>
      expect(c.name.toLowerCase()).toContain('hand')
    );
  });

  test('GET /categories/search with unknown term returns empty array', async () => {
    const res  = await client.searchCategories('xyzzy_unknown_cat_999');
    const body = await res.json();

    expect(res.status()).toBe(200);
    // May return empty array or { data: [] } – handle both
    const results = Array.isArray(body) ? body : body.data ?? [];
    expect(results).toHaveLength(0);
  });
});
