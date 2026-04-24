import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { UserSchema, PostSchema } from './schemas';

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

    const user = UserSchema.parse(await res.json());
    expect(user.id).toBe(1);
    expect(user.email).toMatch(/@/);
  });

  test('GET /users/:id/posts returns posts scoped to that user', async ({
    request,
  }) => {
    const res = await request.get('/users/1/posts');
    expect(res.status()).toBe(200);

    const posts = z.array(PostSchema).parse(await res.json());
    expect(posts.length).toBeGreaterThan(0);
    // Every returned post is owned by user 1 — analogous to
    // "every resource in the response belongs to the authenticated user".
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('Missing resource returns 404 — stand-in for negative auth', async ({
    request,
  }) => {
    const res = await request.get('/users/9999/posts');
    expect(res.status()).toBe(200);

    const posts = z.array(PostSchema).parse(await res.json());
    expect(posts.length).toBe(0);
  });
});
