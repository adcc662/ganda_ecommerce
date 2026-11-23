import { describe, expect, it } from 'vitest';
import { isProtectedPath, loginHref, safeNext } from '../src/lib/session/routes';

describe('isProtectedPath', () => {
  it.each(['/cart', '/checkout', '/account', '/orders', '/orders/42', '/sell', '/sell/listings', '/cart/'])(
    'guards %s',
    (path) => expect(isProtectedPath(path)).toBe(true),
  );

  it.each(['/', '/login', '/register', '/p/lamp', '/section/home', '/search', '/cartoon', '/sellers', '/_actions/auth.login'])(
    'leaves %s public',
    (path) => expect(isProtectedPath(path)).toBe(false),
  );
});

describe('safeNext', () => {
  it('keeps same-site paths with their query', () => {
    expect(safeNext('/orders/3?placed=1')).toBe('/orders/3?placed=1');
  });

  it.each([null, '', '//evil.example', 'https://evil.example', '/\\evil.example', 'javascript:alert(1)', '/\t/evil.example', '/\n/evil.example', '/\r/evil.example'])(
    'falls back to / for %s',
    (next) => expect(safeNext(next)).toBe('/'),
  );
});

describe('loginHref', () => {
  it('encodes where to return after logging in', () => {
    expect(loginHref('/orders/3?placed=1')).toBe('/login?next=%2Forders%2F3%3Fplaced%3D1');
  });
});
