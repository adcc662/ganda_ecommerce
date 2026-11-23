import { atom } from 'nanostores';

/**
 * Browser-side session state. The session itself (JWT and user) lives on the server;
 * islands only share the cart badge count after a cart change on the current page.
 * `null` means "nothing changed here yet": the header keeps the count the server rendered.
 */
export const $cartCount = atom<number | null>(null);
