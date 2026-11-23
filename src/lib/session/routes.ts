/** Pages that need a logged-in user. Middleware redirects visitors without a session to log in. */
const PROTECTED = ['/cart', '/checkout', '/account', '/orders', '/sell'];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/** Only same-site paths are valid redirect targets after logging in. */
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}

export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
