import { accountApi, API_URL, type AccountApi } from '../api/client';
import { ApiError, createHttp } from '../api/http';
import { countItems } from '../domain/cart';
import type { AuthUser } from '../domain/types';

/** The slice of `AstroSession` this module needs, so it can be tested without Astro. */
export interface SessionStore {
  get(key: 'token'): Promise<string | undefined>;
  get(key: 'user'): Promise<AuthUser | undefined>;
  destroy(): void;
}

export function accountApiFor(token: string): AccountApi {
  return accountApi(createHttp({ baseUrl: API_URL, getToken: () => token }));
}

/**
 * Runs an account API call with the session's JWT.
 * No token is a 401; a 401 from the API ends the session so the next request starts logged out.
 */
export async function withAccount<T>(
  session: SessionStore,
  fn: (api: AccountApi) => Promise<T>,
  makeApi: (token: string) => AccountApi = accountApiFor,
): Promise<T> {
  const token = await session.get('token');
  if (!token) throw new ApiError(401, 'Your session has ended. Log in again.');
  try {
    return await fn(makeApi(token));
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) session.destroy();
    throw e;
  }
}

/** Page loader for logged-in pages: returns data or the error, never throws. */
export async function loadAuthed<T>(
  session: SessionStore,
  fn: (api: AccountApi) => Promise<T>,
  makeApi?: (token: string) => AccountApi,
): Promise<{ data: T; error: null } | { data: null; error: ApiError }> {
  try {
    return { data: await withAccount(session, fn, makeApi), error: null };
  } catch (e) {
    const error = e instanceof ApiError ? e : new ApiError(500, 'Something went wrong loading your account.');
    return { data: null, error };
  }
}

/**
 * Who is visiting, decided before the page renders (called from middleware).
 * The cart read doubles as a token check: if the API rejects the token, the session ends here,
 * while it can still change the response, and the request continues logged out.
 */
export async function resolveRequest(
  session: SessionStore,
  makeApi?: (token: string) => AccountApi,
): Promise<{ user: AuthUser | null; cartCount: number | null }> {
  const user = (await session.get('user')) ?? null;
  if (!user) return { user: null, cartCount: null };
  const cart = await loadAuthed(session, (api) => api.cart(), makeApi);
  if (cart.error?.status === 401) return { user: null, cartCount: null };
  return { user, cartCount: cart.data ? countItems(cart.data) : null };
}
