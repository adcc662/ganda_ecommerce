import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import { z } from 'astro/zod';
import { accountApi, API_URL } from '../lib/api/client';
import { describeApiError } from '../lib/api/errors';
import { ApiError, createHttp } from '../lib/api/http';
import { countItems } from '../lib/domain/cart';
import type { AuthResponse } from '../lib/domain/types';
import { withAccount } from '../lib/session/server';

/**
 * Server functions the islands call instead of the Spring API.
 * The JWT lives in the Astro session; it is attached here and never sent to the browser.
 */

function sessionOf(context: ActionAPIContext) {
  if (!context.session) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Sessions are not configured.' });
  return context.session;
}

/** Re-throws any failure as an ActionError the browser can read (code + visitor-facing message). */
function fail(e: unknown): never {
  if (e instanceof ActionError) throw e;
  const { status, message } = describeApiError(e);
  throw new ActionError({ code: ActionError.statusToCode(status), message });
}

/** Runs an account call with the session's JWT; a rejected token ends the session (see withAccount). */
async function account<T>(context: ActionAPIContext, fn: Parameters<typeof withAccount<T>>[1]): Promise<T> {
  try {
    return await withAccount(sessionOf(context), fn);
  } catch (e) {
    fail(e);
  }
}

async function startSession(context: ActionAPIContext, { token, ...user }: AuthResponse) {
  const session = sessionOf(context);
  // A new session id on login prevents session fixation.
  await session.regenerate();
  session.set('token', token);
  session.set('user', user);
  return user;
}

const anonymous = () => accountApi(createHttp({ baseUrl: API_URL, getToken: () => null }));

const text = (message: string) => z.string().trim().min(1, message);
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);
const id = z.number().int().positive();

export const server = {
  auth: {
    login: defineAction({
      accept: 'form',
      input: z.object({ email: text('Enter your email.'), password: z.string().min(1, 'Enter your password.') }),
      handler: async ({ email, password }, context) => {
        try {
          return { user: await startSession(context, await anonymous().login(email, password)) };
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            throw new ActionError({ code: 'UNAUTHORIZED', message: 'That email and password do not match an account.' });
          }
          fail(e);
        }
      },
    }),

    register: defineAction({
      accept: 'form',
      input: z.object({
        firstName: text('Enter your first name.'),
        lastName: text('Enter your last name.'),
        email: text('Enter your email.'),
        password: z.string().min(1, 'Choose a password.'),
        phone: optionalText,
      }),
      handler: async (input, context) => {
        try {
          return { user: await startSession(context, await anonymous().register(input)) };
        } catch (e) {
          fail(e);
        }
      },
    }),

    logout: defineAction({
      handler: async (_input, context) => {
        sessionOf(context).destroy();
        return { ok: true };
      },
    }),

    /** Invalidates every token the API issued to this user, then ends this session. */
    logoutAll: defineAction({
      handler: async (_input, context) => {
        await account(context, (api) => api.logoutAll());
        sessionOf(context).destroy();
        return { ok: true };
      },
    }),
  },

  cart: {
    add: defineAction({
      input: z.object({ productId: id, quantity: id }),
      handler: (input, context) =>
        account(context, async (api) => {
          await api.addToCart(input.productId, input.quantity);
          return { count: countItems(await api.cart()) };
        }),
    }),

    update: defineAction({
      input: z.object({ productId: id, quantity: id }),
      handler: (input, context) =>
        account(context, async (api) => {
          const item = await api.updateCart(input.productId, input.quantity);
          return { item, count: countItems(await api.cart()) };
        }),
    }),

    remove: defineAction({
      input: z.object({ productId: id }),
      handler: (input, context) =>
        account(context, async (api) => {
          await api.removeFromCart(input.productId);
          return { count: countItems(await api.cart()) };
        }),
    }),
  },

  addresses: {
    create: defineAction({
      input: z.object({
        addressType: z.enum(['SHIPPING', 'BILLING']),
        streetAddress: z.string(),
        apartment: z.string().nullable(),
        city: z.string(),
        stateProvince: z.string(),
        postalCode: z.string(),
        country: z.string(),
        isDefault: z.boolean(),
      }),
      handler: (input, context) => account(context, (api) => api.createAddress(input)),
    }),
  },

  orders: {
    /** Orders exactly what is in the server-side cart, then empties it. */
    place: defineAction({
      input: z.object({ shippingAddressId: id, billingAddressId: id }),
      handler: (input, context) =>
        account(context, async (api) => {
          const cart = await api.cart();
          if (cart.length === 0) throw new ActionError({ code: 'BAD_REQUEST', message: 'Your cart is empty.' });
          const order = await api.placeOrder({
            ...input,
            items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          });
          await api.clearCart().catch(() => undefined);
          return { orderId: order.id };
        }),
    }),

    pay: defineAction({
      input: z.object({ orderId: id, paymentMethodId: id }),
      handler: (input, context) => account(context, (api) => api.pay(input.orderId, input.paymentMethodId)),
    }),
  },
};
