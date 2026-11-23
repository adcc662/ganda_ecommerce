import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../src/lib/api/http';
import { describeApiError } from '../src/lib/api/errors';
import { loadAuthed, withAccount, type SessionStore } from '../src/lib/session/server';
import type { AccountApi } from '../src/lib/api/client';

function fakeSession(token: string | undefined): SessionStore & { destroyed: boolean } {
  const s = {
    destroyed: false,
    get: vi.fn(async (key: string) => (key === 'token' ? token : undefined)),
    destroy: vi.fn(() => {
      s.destroyed = true;
    }),
  };
  return s;
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
