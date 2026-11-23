import { describe, expect, it } from 'vitest';
import { countItems } from '../src/lib/domain/cart';

describe('countItems', () => {
  it('counts units, not lines', () => {
    expect(countItems([{ quantity: 2 }, { quantity: 3 }])).toBe(5);
  });

  it('is zero for an empty cart', () => {
    expect(countItems([])).toBe(0);
  });
});
