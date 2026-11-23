import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../src/lib/api/http';
import { describeApiError, invalidFields } from '../src/lib/api/errors';
import { loadAuthed, resolveRequest, withAccount, type SessionStore } from '../src/lib/session/server';
import type { AccountApi } from '../src/lib/api/client';

function fakeSession(token: string | undefined): SessionStore & { destroyed: boolean } {
  const s = {
    destroyed: false,
    get: vi.fn(async (key: string) => (key === 'token' ? token : undefined)),
    destroy: vi.fn(() => {
      s.destroyed = true;
    }),
  };
  return s as unknown as SessionStore & { destroyed: boolean };
}

const apiWith = (impl: Partial<AccountApi>) => () => impl as AccountApi;

describe('withAccount', () => {
  it('builds the API with the session token and returns the result', async () => {
    const session = fakeSession('jwt-1');
    const make = vi.fn(apiWith({ cart: async () => [] }));
    await expect(withAccount(session, (api) => api.cart(), make)).resolves.toEqual([]);
    expect(make).toHaveBeenCalledWith('jwt-1');
    expect(session.destroyed).toBe(false);
  });

  it('rejects with 401 and never calls the API when there is no token', async () => {
    const session = fakeSession(undefined);
    const make = vi.fn(apiWith({}));
    await expect(withAccount(session, (api) => api.cart(), make)).rejects.toMatchObject({ status: 401 });
    expect(make).not.toHaveBeenCalled();
  });

  it('destroys the session when the API rejects the token', async () => {
    const session = fakeSession('expired');
    const make = apiWith({ cart: async () => Promise.reject(new ApiError(401, 'Your session has ended. Log in again.')) });
    await expect(withAccount(session, (api) => api.cart(), make)).rejects.toMatchObject({ status: 401 });
    expect(session.destroyed).toBe(true);
  });

  it('keeps the session on other API errors', async () => {
    const session = fakeSession('jwt-1');
    const make = apiWith({ cart: async () => Promise.reject(new ApiError(409, 'Conflict')) });
    await expect(withAccount(session, (api) => api.cart(), make)).rejects.toMatchObject({ status: 409 });
    expect(session.destroyed).toBe(false);
  });
});

describe('loadAuthed', () => {
  it('returns data on success', async () => {
    const result = await loadAuthed(fakeSession('jwt'), (api) => api.myOrders(), apiWith({ myOrders: async () => [] }));
    expect(result).toEqual({ data: [], error: null });
  });

  it('returns the ApiError instead of throwing', async () => {
    const result = await loadAuthed(fakeSession(undefined), (api) => api.myOrders(), apiWith({}));
    expect(result.data).toBeNull();
    expect(result.error).toMatchObject({ status: 401 });
  });

  it('wraps unexpected failures as a 500 ApiError', async () => {
    const result = await loadAuthed(fakeSession('jwt'), () => Promise.reject(new TypeError('boom')), apiWith({}));
    expect(result.error).toBeInstanceOf(ApiError);
    expect(result.error?.status).toBe(500);
  });
});

describe('describeApiError', () => {
  it('adds the wait time to rate-limit messages', () => {
    expect(describeApiError(new ApiError(429, 'Too many login attempts', {}, 120))).toEqual({
      status: 429,
      message: 'Too many login attempts. Try again in 2 minutes.',
    });
  });

  it('uses singular minute for short waits', () => {
    expect(describeApiError(new ApiError(429, 'Slow down', {}, 30)).message).toBe('Slow down. Try again in 1 minute.');
  });

  it('appends field errors so they survive the trip to the browser', () => {
    expect(describeApiError(new ApiError(400, 'Validation failed', { email: 'Email is already registered' }))).toEqual({
      status: 400,
      message: 'Validation failed: Email is already registered.',
    });
  });

  it('maps an unreachable API to 503', () => {
    expect(describeApiError(new ApiError(0, 'Could not reach Ganda.')).status).toBe(503);
  });

  it('hides unexpected errors behind a generic message', () => {
    expect(describeApiError(new Error('secret stack detail'))).toEqual({ status: 500, message: 'Something went wrong.' });
  });
});

describe('invalidFields', () => {
  it('returns the API message and per-field errors of a validation failure', () => {
    const e = new ApiError(400, 'Validation Failed', { password: 'Password must be at least 8 characters' });
    expect(invalidFields(e)).toEqual({
      message: 'Validation Failed',
      fieldErrors: { password: 'Password must be at least 8 characters' },
    });
  });

  it('is null for errors without field errors', () => {
    expect(invalidFields(new ApiError(409, 'Email already registered'))).toBeNull();
    expect(invalidFields(new Error('boom'))).toBeNull();
  });
});

describe('resolveRequest', () => {
  function sessionWithUser(token: string | undefined) {
    const s = fakeSession(token);
    const user = token ? { email: 'a@b.co', firstName: 'Ana', lastName: 'Q' } : undefined;
    return Object.assign(s, {
      get: vi.fn(async (key: string) => (key === 'token' ? token : key === 'user' ? user : undefined)),
    });
  }

  it('returns no user and never calls the API without a session', async () => {
    const make = vi.fn(apiWith({}));
    await expect(resolveRequest(sessionWithUser(undefined), make)).resolves.toEqual({ user: null, cartCount: null });
    expect(make).not.toHaveBeenCalled();
  });

  it('returns the user and cart count while the token is valid', async () => {
    const make = apiWith({ cart: async () => [{ quantity: 2 }, { quantity: 1 }] as never });
    await expect(resolveRequest(sessionWithUser('jwt'), make)).resolves.toEqual({
      user: { email: 'a@b.co', firstName: 'Ana', lastName: 'Q' },
      cartCount: 3,
    });
  });

  it('logs the visitor out before rendering when the API rejects the token', async () => {
    const session = sessionWithUser('revoked');
    const make = apiWith({ cart: async () => Promise.reject(new ApiError(401, 'Your session has ended. Log in again.')) });
    await expect(resolveRequest(session, make)).resolves.toEqual({ user: null, cartCount: null });
    expect(session.destroyed).toBe(true);
  });

  it('keeps the user when the cart is unavailable for other reasons', async () => {
    const session = sessionWithUser('jwt');
    const make = apiWith({ cart: async () => Promise.reject(new ApiError(0, 'Could not reach Ganda.')) });
    await expect(resolveRequest(session, make)).resolves.toMatchObject({ user: { firstName: 'Ana' }, cartCount: null });
    expect(session.destroyed).toBe(false);
  });
});
