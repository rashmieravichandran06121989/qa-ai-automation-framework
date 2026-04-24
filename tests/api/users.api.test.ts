import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { UserSchema } from './schemas';

// jsonplaceholder read-side tests. No auth, stable since 2013, used by
// the React/Vue tutorials — reliable enough to anchor a CI gate on.
// Shape assertions go through Zod schemas in ./schemas.ts so a contract
// drift fails with a readable path ("expected at $.address.city") rather
// than a vague toMatchObject miss.

test.describe('jsonplaceholder — users (read)', () => {
  test('GET /users returns the user list', async ({ request }) => {
    const res = await request.get('/users');
    expect(res.status()).toBe(200);

    const body = await res.json();
    const users = z.array(UserSchema).parse(body);

    expect(users.length).toBeGreaterThan(0);
    // IDs are unique within the list — cheap extra check beyond the
    // schema since Zod can't express "collection-wide" constraints.
    const ids = new Set(users.map((u) => u.id));
    expect(ids.size).toBe(users.length);
  });

  test('GET /users/1 returns a single user', async ({ request }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);

    const user = UserSchema.parse(await res.json());
    expect(user.id).toBe(1);
    expect(user.email).toContain('@');
  });

  test('GET /users/9999 returns 404 for a non-existent user', async ({
    request,
  }) => {
    const res = await request.get('/users/9999');
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body).toEqual({});
  });
});
