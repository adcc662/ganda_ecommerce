import { createHttp, type Http } from './http';
import type {
  Address,
  AddressInput,
  AuthResponse,
  CartItem,
  Category,
  Order,
  Payment,
  PaymentMethod,
  Product,
} from '../domain/types';

export const API_URL: string = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8080';

/** Catalog reads are public, so server-rendered pages use an anonymous client. */
export function catalogApi(http: Http = createHttp({ baseUrl: API_URL, getToken: () => null })) {
  return {
    categories: () => http.request<Category[]>('/api/categories'),
    activeProducts: () => http.request<Product[]>('/api/products/active', { query: { sortBy: 'createdAt', sortDir: 'DESC' } }),
    search: (keyword: string) =>
      http.request<Product[]>('/api/products/search', { query: { keyword, sortBy: 'createdAt', sortDir: 'DESC' } }),
    bySlug: (slug: string) => http.request<Product>(`/api/products/slug/${encodeURIComponent(slug)}`),
  };
}

export function accountApi(http: Http) {
  return {
    login: (email: string, password: string) =>
      http.request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } }),
    register: (body: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
      http.request<AuthResponse>('/api/auth/register', { method: 'POST', body }),
    logoutAll: () => http.request<void>('/api/auth/logout-all', { method: 'POST' }),

    cart: () => http.request<CartItem[]>('/api/cart'),
    addToCart: (productId: number, quantity: number) =>
      http.request<CartItem>('/api/cart/add', { method: 'POST', query: { productId, quantity } }),
    updateCart: (productId: number, quantity: number) =>
      http.request<CartItem>('/api/cart/update', { method: 'PUT', query: { productId, quantity } }),
    removeFromCart: (productId: number) =>
      http.request<void>('/api/cart/remove', { method: 'DELETE', query: { productId } }),
    clearCart: () => http.request<void>('/api/cart/clear', { method: 'DELETE' }),

    addresses: () => http.request<Address[]>('/api/addresses'),
    createAddress: (body: AddressInput) => http.request<Address>('/api/addresses', { method: 'POST', body }),

    placeOrder: (body: { shippingAddressId: number; billingAddressId: number; items: { productId: number; quantity: number }[] }) =>
      http.request<Order>('/api/orders', { method: 'POST', body }),
    myOrders: () => http.request<Order[]>('/api/orders/my-orders'),
    order: (id: number) => http.request<Order>(`/api/orders/${id}`),

    paymentMethods: () => http.request<PaymentMethod[]>('/api/payment-methods'),
    pay: (orderId: number, paymentMethodId: number) =>
      http.request<Payment>(`/api/orders/${orderId}/payments`, { method: 'POST', body: { paymentMethodId } }),
    payments: (orderId: number) => http.request<Payment[]>(`/api/orders/${orderId}/payments`),
  };
}

export type AccountApi = ReturnType<typeof accountApi>;
