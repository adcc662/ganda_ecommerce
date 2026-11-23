import { actions } from 'astro:actions';
import { useState } from 'react';
import { ORDER_STATUS, PAYMENT_STATUS, formatDate, paymentMethodLabel } from '../../lib/domain/labels';
import { formatPrice } from '../../lib/domain/money';
import type { Order, Payment, PaymentMethod } from '../../lib/domain/types';
import { Notice, failureOf } from './ui';

interface Props {
  /** Loaded on the server by the page. */
  order: Order;
  initialPayments: Payment[];
  methods: PaymentMethod[];
  /** The visitor just placed this order (?placed=1). */
  placed: boolean;
}

export default function OrderDetail({ order, initialPayments, methods, placed }: Props) {
  const [payments, setPayments] = useState(initialPayments);
  const [methodId, setMethodId] = useState<number | null>(methods[0]?.id ?? null);
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);

  const active = payments.find((p) => p.status === 'PENDING' || p.status === 'COMPLETED');
  const status =
    order.orderStatus === 'PENDING' && active?.status === 'PENDING'
      ? { label: 'Payment clearing', tone: 'info' as const }
      : ORDER_STATUS[order.orderStatus];
  const canPay = order.orderStatus === 'PENDING' && !active;

  async function pay() {
    if (methodId === null) return;
    setPaying(true);
    setPayError('');
    const { data: payment, error: failure } = await actions.orders.pay({ orderId: order.id, paymentMethodId: methodId });
    if (failure) setPayError(failureOf(failure));
    else setPayments((list) => [...list, payment]);
    setPaying(false);
  }

  return (
    <div className="order">
      {placed && canPay && <Notice tone="ok">Order placed. Choose how to pay to finish.</Notice>}
      <div className="order__head">
        <div>
          <p className="meta">Order {order.orderNumber}</p>
          <p className="meta">Placed {formatDate(order.createdAt)}</p>
        </div>
        <span className="status" data-tone={status.tone}>
          {status.label}
        </span>
      </div>

      <div className="order__grid">
        <table className="lines">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col" className="num">Qty</th>
              <th scope="col" className="num">Price</th>
              <th scope="col" className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <td>{i.productName}</td>
                <td className="num tnum">{i.quantity}</td>
                <td className="num tnum">{formatPrice(i.unitPrice)}</td>
                <td className="num tnum">{formatPrice(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Subtotal</td><td className="num tnum">{formatPrice(order.subtotal)}</td></tr>
            <tr><td colSpan={3}>Tax</td><td className="num tnum">{formatPrice(order.taxAmount)}</td></tr>
            <tr><td colSpan={3}>Shipping</td><td className="num tnum">{order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Free'}</td></tr>
            <tr className="grand"><td colSpan={3}>Total</td><td className="num price">{formatPrice(order.totalAmount)}</td></tr>
          </tfoot>
        </table>

        <aside className="pane pay">
          <h2>Payment</h2>
          {payments.length > 0 && (
            <ul className="pay__history">
              {payments.map((p) => {
                const s = PAYMENT_STATUS[p.status];
                return (
                  <li key={p.id}>
                    <span>{paymentMethodLabel(p.paymentMethod)} · <span className="tnum">{formatPrice(p.amount)}</span></span>
                    <span className="status" data-tone={s.tone}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {canPay ? (
            <>
              <div className="choices" role="radiogroup" aria-label="Payment method">
                {methods.map((m) => (
                  <label key={m.id} className="choice" data-on={methodId === m.id}>
                    <input type="radio" name="method" checked={methodId === m.id} onChange={() => setMethodId(m.id)} />
                    {paymentMethodLabel(m.name)}
                  </label>
                ))}
              </div>
              {payError && <Notice tone="error">{payError}</Notice>}
              <button className="btn btn--act btn--block" onClick={pay} disabled={paying || methodId === null}>
                {paying ? 'Sending payment…' : `Pay ${formatPrice(order.totalAmount)}`}
              </button>
            </>
          ) : active ? (
            <p className="meta">
              {active.status === 'COMPLETED' ? 'Paid in full. Thank you.' : 'Payment sent. Ganda marks the order paid once it clears; check back here for the status.'}
            </p>
          ) : (
            <p className="meta">This order can no longer be paid.</p>
          )}
        </aside>
      </div>

      <style>{`
        .order { display: grid; gap: 24px; }
        .order__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--bark-rule); }
        .order__grid { display: grid; grid-template-columns: 1fr 340px; gap: 48px; align-items: start; }
        .lines { width: 100%; border-collapse: collapse; }
        .lines th { text-align: left; font-size: .8125rem; font-weight: 600; color: var(--lichen); padding: 0 0 10px; border-bottom: 1px solid var(--bark-rule); }
        .lines td { padding: 12px 0; border-bottom: 1px solid var(--bark-rule); }
        .lines tfoot td { border: 0; padding: 6px 0; color: var(--lichen); }
        .lines .grand td { padding-top: 12px; border-top: 1px solid var(--bark-rule); color: var(--ash); font-weight: 700; font-size: 1.0625rem; }
        .lines .num { text-align: right; }
        .pay { padding: 24px; display: grid; gap: 16px; }
        .pay h2 { font-size: 1.25rem; }
        .pay__history { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: .875rem; }
        .pay__history li { display: flex; justify-content: space-between; gap: 8px; }
        .choices { display: grid; gap: 8px; }
        .choice { display: flex; gap: 10px; align-items: center; padding: 12px 14px; border: 1px solid var(--bark-rule); border-radius: var(--radius); cursor: pointer; }
        .choice[data-on='true'] { border-color: var(--goldenrod); color: var(--ash); }
        .choice input { accent-color: var(--goldenrod); }
        @media (max-width: 900px) { .order__grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
