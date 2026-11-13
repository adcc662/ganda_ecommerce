import { describe, expect, it } from 'vitest';
import { formatPrice, priceOf } from '@/lib/domain/money';

describe('formatPrice', () => {
  it('formats USD with cents and thousands separators', () => {
    expect(formatPrice(1234.5)).toBe('$1,234.50');
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('priceOf', () => {
  it('uses the discount price when it is lower than the price', () => {
    expect(priceOf({ price: 100, discountPrice: 80 })).toEqual({ current: 80, original: 100 });
  });

  it('ignores a missing, zero or higher discount price', () => {
    expect(priceOf({ price: 100, discountPrice: null })).toEqual({ current: 100, original: null });
    expect(priceOf({ price: 100, discountPrice: 0 })).toEqual({ current: 100, original: null });
    expect(priceOf({ price: 100, discountPrice: 120 })).toEqual({ current: 100, original: null });
  });
});
