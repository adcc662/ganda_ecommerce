declare namespace App {
  interface Locals {
    /** The logged-in user, set by `src/middleware.ts` from the session. */
    user: import('./lib/domain/types').AuthUser | null;
    /** Cart units for the header badge; null when logged out or the cart could not be read. */
    cartCount: number | null;
  }

  /** What the Astro session holds. The JWT stays on the server; the browser only has the session cookie. */
  interface SessionData {
    token: string;
    user: import('./lib/domain/types').AuthUser;
  }
}
