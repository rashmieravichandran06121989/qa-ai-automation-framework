import { APIRequestContext } from '@playwright/test';

export const API_BASE = 'https://api.practicesoftwaretesting.com';

// ---------------------------------------------------------------------------
// Response type definitions
// ---------------------------------------------------------------------------

export interface ProductImage {
  id: string;
  by_name: string;
  file_name: string;
  title: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  in_stock: boolean;
  is_rental: boolean;
  is_eco_friendly: boolean;
  co2_rating: string;
  product_image: ProductImage;
  category: Pick<Category, 'id' | 'name'>;
  brand: Pick<Brand, 'id' | 'name'>;
}

export interface PaginatedProducts {
  current_page: number;
  data: Product[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  cart_items: CartItem[];
}

// ---------------------------------------------------------------------------
// ApiClient – mirrors the Page Object pattern used for UI tests
// ---------------------------------------------------------------------------

export class ApiClient {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  setToken(token: string): void {
    this.token = token;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  // ── Auth ────────────────────────────────────────────────────────────────

  login(email: string, password: string) {
    return this.request.post(`${API_BASE}/auth/login`, {
      data: { email, password },
      headers: this.headers(),
    });
  }

  // ── Products ────────────────────────────────────────────────────────────

  getProducts(params?: Record<string, string | number>) {
    return this.request.get(`${API_BASE}/products`, {
      params,
      headers: this.headers(),
    });
  }

  getProductById(id: string) {
    return this.request.get(`${API_BASE}/products/${id}`, {
      headers: this.headers(),
    });
  }

  searchProducts(query: string, page = 1) {
    return this.request.get(`${API_BASE}/products/search`, {
      params: { q: query, page },
      headers: this.headers(),
    });
  }

  getRelatedProducts(id: string) {
    return this.request.get(`${API_BASE}/products/${id}/related`, {
      headers: this.headers(),
    });
  }

  // ── Categories ──────────────────────────────────────────────────────────

  getCategories() {
    return this.request.get(`${API_BASE}/categories`, {
      headers: this.headers(),
    });
  }

  getCategoriesTree() {
    return this.request.get(`${API_BASE}/categories/tree`, {
      headers: this.headers(),
    });
  }

  searchCategories(query: string) {
    return this.request.get(`${API_BASE}/categories/search`, {
      params: { q: query },
      headers: this.headers(),
    });
  }

  // ── Brands ──────────────────────────────────────────────────────────────

  getBrands() {
    return this.request.get(`${API_BASE}/brands`, {
      headers: this.headers(),
    });
  }

  getBrandById(id: string) {
    return this.request.get(`${API_BASE}/brands/${id}`, {
      headers: this.headers(),
    });
  }

  searchBrands(query: string) {
    return this.request.get(`${API_BASE}/brands/search`, {
      params: { q: query },
      headers: this.headers(),
    });
  }

  // ── Cart ────────────────────────────────────────────────────────────────

  createCart() {
    return this.request.post(`${API_BASE}/carts`, {
      headers: this.headers(),
    });
  }

  addToCart(cartId: string, productId: string, quantity = 1) {
    return this.request.post(`${API_BASE}/carts/${cartId}`, {
      data: { product_id: productId, quantity },
      headers: this.headers(),
    });
  }

  getCart(cartId: string) {
    return this.request.get(`${API_BASE}/carts/${cartId}`, {
      headers: this.headers(),
    });
  }

  updateCartItemQuantity(cartId: string, productId: string, quantity: number) {
    return this.request.put(`${API_BASE}/carts/${cartId}/product/quantity`, {
      data: { product_id: productId, quantity },
      headers: this.headers(),
    });
  }

  removeCartItem(cartId: string, productId: string) {
    return this.request.delete(`${API_BASE}/carts/${cartId}/product/${productId}`, {
      headers: this.headers(),
    });
  }

  deleteCart(cartId: string) {
    return this.request.delete(`${API_BASE}/carts/${cartId}`, {
      headers: this.headers(),
    });
  }
}
