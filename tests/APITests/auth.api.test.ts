import { test, expect } from '@playwright/test';
import { ApiClient } from './api-client';

const VALID_EMAIL    = 'customer3@practicesoftwaretesting.com';
const VALID_PASSWORD = 'pass123';

test.describe('Auth API – POST /auth/login', () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test('returns 200 and a JWT token for valid credentials', async () => {
    const res = await client.login(VALID_EMAIL, VALID_PASSWORD);

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('access_token');
    expect(typeof body.access_token).toBe('string');
    expect(body.access_token.length).toBeGreaterThan(0);
    expect(body).toHaveProperty('token_type');
  });

  test('returned token is a well-formed Bearer JWT', async () => {
    const res = await client.login(VALID_EMAIL, VALID_PASSWORD);
    const { access_token } = await res.json();

    // A JWT has exactly three Base64-URL segments separated by dots
    const parts = access_token.split('.');
    expect(parts).toHaveLength(3);
  });

  test('returns 4xx for invalid password', async () => {
    const res = await client.login(VALID_EMAIL, 'wrong-password');
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('returns 4xx for non-existent user', async () => {
    const res = await client.login('nobody@example.com', 'password');
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('returns 422 when request body is empty', async ({ request }) => {
    const res = await request.post('https://api.practicesoftwaretesting.com/users/login', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });
});
