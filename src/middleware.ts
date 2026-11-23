import { defineMiddleware } from 'astro:middleware';
import { isProtectedPath, loginHref } from './lib/session/routes';

/**
 * Reads the session once per request and exposes the user to pages.
 * Logged-in pages redirect to login before anything renders.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const user = (await context.session?.get('user')) ?? null;
  context.locals.user = user;

  const { pathname, search } = context.url;
  if (!user && isProtectedPath(pathname)) return context.redirect(loginHref(pathname + search));

  return next();
});
