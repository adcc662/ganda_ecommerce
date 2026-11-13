const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(amount: number): string {
  return usd.format(amount);
}

export interface PriceTag {
  current: number;
  /** The undiscounted price, present only when a real discount applies. */
  original: number | null;
}

export function priceOf(item: { price: number; discountPrice: number | null }): PriceTag {
  const { price, discountPrice } = item;
  if (discountPrice != null && discountPrice > 0 && discountPrice < price) {
    return { current: discountPrice, original: price };
  }
  return { current: price, original: null };
}
