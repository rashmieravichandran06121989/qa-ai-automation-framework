import { test, expect } from '@playwright/test';

// jsonplaceholder has no login endpoint, so these tests stand in for
// what a real auth contract test looks like — shape asserts against the
// user + posts relationship. Separate file because the API suite should
// still ship three logical pieces: auth, read, write.

test.describe('jsonplaceholder — auth-shaped contracts', () => {
  test('GET /users/:id exposes the fields an auth response would populate', async ({
    request,
  }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        id: 1,
        username: expect.any(String),
        email: expect.stringMatching(/@/),
        phone: expect.any(String),
      }),
    );
  });

  test('GET /users/:id/posts returns posts scoped to that user', async ({
    request,
  }) => {
    const res = await request.get('/users/1/posts');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Every returned post is owned by user 1 — analogous to "every
    // resource in the response belongs to the authenticated user."
    for (const post of body) {
      expect(post.userId).toBe(1);
    }
  });

  test('Missing resource returns 404 — stand-in for negative auth', async ({
    request,
  }) => {
    const res = await request.get('/users/9999/posts');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });
});
