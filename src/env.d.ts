declare namespace App {
  interface Locals {
    /** The logged-in user, set by `src/middleware.ts` from the session. */
    user: import('./lib/domain/types').AuthUser | null;
  }

  /** What the Astro session holds. The JWT stays on the server; the browser only has the session cookie. */
  interface SessionData {
    token: string;
    user: import('./lib/domain/types').AuthUser;
  }
}
