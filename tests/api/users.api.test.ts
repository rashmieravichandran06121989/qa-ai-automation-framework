import { test, expect } from '@playwright/test';

// jsonplaceholder read-side tests. No auth, stable since 2013, used by
// the React/Vue tutorials — reliable enough to anchor a CI gate on.

test.describe('jsonplaceholder — users (read)', () => {
  test('GET /users returns the user list', async ({ request }) => {
    const res = await request.get('/users');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Every user has the canonical jsonplaceholder shape.
    for (const user of body) {
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          address: expect.objectContaining({ city: expect.any(String) }),
          company: expect.objectContaining({ name: expect.any(String) }),
        }),
      );
    }
  });

  test('GET /users/1 returns a single user', async ({ request }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({
      id: 1,
      name: expect.any(String),
      email: expect.stringContaining('@'),
    });
  });

  test('GET /users/9999 returns 404 for a non-existent user', async ({
    request,
  }) => {
    const res = await request.get('/users/9999');
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({});
  });
});
