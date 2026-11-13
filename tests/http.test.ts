import { describe, expect, it, vi } from 'vitest';
import { ApiError, createHttp } from '@/lib/api/http';

function respond(status: number, body?: unknown, headers: Record<string, string> = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('createHttp', () => {
  it('sends the bearer token and query params, and parses JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respond(200, { ok: true }));
    const http = createHttp({ baseUrl: 'http://api', getToken: () => 'tok', fetchImpl });

    const data = await http.request('/api/cart/add', { method: 'POST', query: { productId: 3, quantity: 2 } });

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://api/api/cart/add?productId=3&quantity=2');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  it('omits Authorization when there is no token and serialises JSON bodies', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respond(201, { id: 1 }));
    const http = createHttp({ baseUrl: 'http://api', getToken: () => null, fetchImpl });

    await http.request('/api/auth/login', { method: 'POST', body: { email: 'a@b.c' } });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"email":"a@b.c"}');
  });

  it('returns undefined for 204 responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const http = createHttp({ baseUrl: 'http://api', getToken: () => 'tok', fetchImpl });

    await expect(http.request('/api/auth/logout-all', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('throws ApiError with the server message and field errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      respond(400, { status: 400, error: 'Validation Failed', errors: { email: 'Email should be valid' } }),
    );
    const http = createHttp({ baseUrl: 'http://api', getToken: () => null, fetchImpl });

    const err = await http.request<never>('/api/auth/register', { method: 'POST', body: {} }).catch((e: ApiError) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.fieldErrors).toEqual({ email: 'Email should be valid' });
    expect(err.message).toBe('Validation Failed');
  });

  it('reads Retry-After on 429', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(respond(429, { message: 'Too many failed login attempts' }, { 'Retry-After': '540' }));
    const http = createHttp({ baseUrl: 'http://api', getToken: () => null, fetchImpl });

    const err = await http.request<never>('/api/auth/login', { method: 'POST', body: {} }).catch((e: ApiError) => e);

    expect(err.status).toBe(429);
    expect(err.retryAfterSeconds).toBe(540);
    expect(err.message).toBe('Too many failed login attempts');
  });

  it('turns network failures into an ApiError with status 0', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const http = createHttp({ baseUrl: 'http://api', getToken: () => null, fetchImpl });

    const err = await http.request<never>('/api/categories').catch((e: ApiError) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });
});
