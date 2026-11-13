import type { OrderStatus, PaymentStatus } from './types';

type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Awaiting payment', tone: 'warn' },
  PROCESSING: { label: 'Being packed', tone: 'info' },
  SHIPPED: { label: 'On its way', tone: 'info' },
  DELIVERED: { label: 'Delivered', tone: 'ok' },
  CANCELLED: { label: 'Cancelled', tone: 'bad' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Payment pending', tone: 'warn' },
  COMPLETED: { label: 'Paid', tone: 'ok' },
  FAILED: { label: 'Payment failed', tone: 'bad' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
};

/** API payment method names are snake_case identifiers such as `credit_card`. */
export function paymentMethodLabel(name: string): string {
  const special: Record<string, string> = { paypal: 'PayPal' };
  if (special[name]) return special[name];
  const words = name.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
