import { atom, computed } from 'nanostores';
import { accountApi, API_URL } from '../api/client';
import { ApiError, createHttp } from '../api/http';
import type { AuthResponse, AuthUser } from '../domain/types';

/**
 * Browser-only session. The JWT lives in localStorage (24h expiry, enforced by the API);
 * a 401 from any call clears it.
 */
const KEY = 'ganda.session.v1';

interface Session {
  token: string;
  user: AuthUser;
}

function load(): Session | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}

export const $session = atom<Session | null>(load());
export const $user = computed($session, (s) => s?.user ?? null);
export const $cartCount = atom<number | null>(null);

$session.listen((s) => {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the session lasts for this page only */
  }
});

export function signIn({ token, ...user }: AuthResponse) {
  $session.set({ token, user });
}

export function signOut() {
  $session.set(null);
  $cartCount.set(null);
}

const http = createHttp({ baseUrl: API_URL, getToken: () => $session.get()?.token ?? null });

/** Account API that signs the user out when the API rejects the token. */
export const api = new Proxy(accountApi(http), {
  get(target, prop: keyof ReturnType<typeof accountApi>) {
    const fn = target[prop];
    return async (...args: unknown[]) => {
      try {
        return await (fn as (...a: unknown[]) => Promise<unknown>)(...args);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) signOut();
        throw e;
      }
    };
  },
});

export async function refreshCartCount() {
  if (!$session.get()) return $cartCount.set(null);
  try {
    const items = await api.cart();
    $cartCount.set(items.reduce((n, i) => n + i.quantity, 0));
  } catch {
    $cartCount.set(null);
  }
}

export function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}
