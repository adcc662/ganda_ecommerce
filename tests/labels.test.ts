import { describe, expect, it } from 'vitest';
import { ORDER_STATUS, paymentMethodLabel } from '@/lib/domain/labels';

describe('paymentMethodLabel', () => {
  it('humanises the API snake_case method names', () => {
    expect(paymentMethodLabel('credit_card')).toBe('Credit card');
    expect(paymentMethodLabel('cash_on_delivery')).toBe('Cash on delivery');
    expect(paymentMethodLabel('paypal')).toBe('PayPal');
  });
});

describe('ORDER_STATUS', () => {
  it('labels every status the API can return', () => {
    expect(Object.keys(ORDER_STATUS).sort()).toEqual(
      ['CANCELLED', 'DELIVERED', 'PENDING', 'PROCESSING', 'REFUNDED', 'SHIPPED'],
    );
  });
});
