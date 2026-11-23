import type { CartItem } from './types';

/** Number of units in the cart, as the header badge shows it. */
export function countItems(items: Pick<CartItem, 'quantity'>[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}
