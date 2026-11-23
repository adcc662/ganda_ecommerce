/** Pages that need a logged-in user. Middleware redirects visitors without a session to log in. */
const PROTECTED = ['/cart', '/checkout', '/account', '/orders', '/sell'];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/**
 * Only same-site paths are valid redirect targets after logging in.
 * Backslashes and control characters are rejected: URL parsers treat `\` like `/` and drop
 * tabs and newlines, so `/\t/evil.example` would otherwise resolve to another host.
 */
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(next)) return '/';
  return next;
}

export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
