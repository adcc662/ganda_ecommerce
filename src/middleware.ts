import { defineMiddleware } from 'astro:middleware';
import { isProtectedPath, loginHref } from './lib/session/routes';
import { resolveRequest } from './lib/session/server';

/**
 * Decides who is visiting before anything renders: reads the session, checks the token with
 * the API (a rejected token ends the session here), and exposes the user and cart count.
 * Logged-in pages redirect to login when there is no user.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { user, cartCount } = context.session ? await resolveRequest(context.session) : { user: null, cartCount: null };
  context.locals.user = user;
  context.locals.cartCount = cartCount;

  const { pathname, search } = context.url;
  if (!user && isProtectedPath(pathname)) return context.redirect(loginHref(pathname + search));

  return next();
});
