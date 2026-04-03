import { test, expect } from '@playwright/test';
import { ApiClient, PaginatedProducts, Cart } from './api-client';

test.describe('Cart API', () => {
  let client: ApiClient;
  let inStockProductId: string;

  test.beforeAll(async ({ request }) => {
    // Resolve a real in-stock product ID once for all cart tests
    const c = new ApiClient(request);
    const res  = await c.getProducts({ page: 1 });
    const body: PaginatedProducts = await res.json();
    const inStock = body.data.find(p => p.in_stock);
    if (!inStock) throw new Error('No in-stock product found on page 1');
    inStockProductId = inStock.id;
  });

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  // ── POST /carts ───────────────────────────────────────────────────────────

  test('POST /carts creates a new cart and returns an id', async () => {
    const res  = await client.createCart();
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
  });

  // ── POST /carts/{id} – add item ──────────────────────────────────────────

  test('POST /carts/{id} adds a product to the cart', async () => {
    const createRes = await client.createCart();
    const { id: cartId } = await createRes.json();

    const addRes = await client.addToCart(cartId, inStockProductId, 1);
    expect(addRes.status()).toBeGreaterThanOrEqual(200);
    expect(addRes.status()).toBeLessThan(300);
  });

  // ── GET /carts/{id} ──────────────────────────────────────────────────────

  test('GET /carts/{id} returns the cart with the added item', async () => {
    const createRes = await client.createCart();
    const { id: cartId } = await createRes.json();
    await client.addToCart(cartId, inStockProductId, 2);

    const getRes   = await client.getCart(cartId);
    const body: Cart = await getRes.json();

    expect(getRes.status()).toBe(200);
    expect(body).toHaveProperty('cart_items');
    expect(Array.isArray(body.cart_items)).toBe(true);
    expect(body.cart_items.length).toBe(1);

    const item = body.cart_items[0];
    expect(item.product_id).toBe(inStockProductId);
    expect(item.quantity).toBe(2);
  });

  // ── PUT /carts/{id}/product/quantity ─────────────────────────────────────

  test('PUT /carts/{id}/product/quantity updates item quantity', async () => {
    const createRes = await client.createCart();
    const { id: cartId } = await createRes.json();
    await client.addToCart(cartId, inStockProductId, 1);

    const updateRes = await client.updateCartItemQuantity(cartId, inStockProductId, 3);
    expect(updateRes.status()).toBeGreaterThanOrEqual(200);
    expect(updateRes.status()).toBeLessThan(300);

    // Verify the quantity was updated
    const getRes   = await client.getCart(cartId);
    const body: Cart = await getRes.json();
    const item = body.cart_items.find(i => i.product_id === inStockProductId);
    expect(item?.quantity).toBe(3);
  });

  // ── DELETE /carts/{id}/product/{productId} ───────────────────────────────

  test('DELETE /carts/{id}/product/{productId} removes the item', async () => {
    const createRes = await client.createCart();
    const { id: cartId } = await createRes.json();
    await client.addToCart(cartId, inStockProductId, 1);

    const deleteRes = await client.removeCartItem(cartId, inStockProductId);
    expect(deleteRes.status()).toBeGreaterThanOrEqual(200);
    expect(deleteRes.status()).toBeLessThan(300);

    // Cart should now be empty
    const getRes  = await client.getCart(cartId);
    const body: Cart = await getRes.json();
    expect(body.cart_items).toHaveLength(0);
  });

  // ── DELETE /carts/{id} ───────────────────────────────────────────────────

  test('DELETE /carts/{id} removes the entire cart', async () => {
    const createRes = await client.createCart();
    const { id: cartId } = await createRes.json();
    await client.addToCart(cartId, inStockProductId, 1);

    const deleteRes = await client.deleteCart(cartId);
    expect(deleteRes.status()).toBeGreaterThanOrEqual(200);
    expect(deleteRes.status()).toBeLessThan(300);
  });
});
