import { useEffect, useState } from 'react';
import { ORDER_STATUS, formatDate } from '../../lib/domain/labels';
import { formatPrice } from '../../lib/domain/money';
import type { Order } from '../../lib/domain/types';
import { api } from '../../lib/session/session';
import { Loading, Notice, messageOf } from './ui';
import { useAuthed } from './useAuthed';

export default function OrdersList() {
  const user = useAuthed();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api
      .myOrders()
      .then((list) => setOrders([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((e) => setError(messageOf(e)));
  }, [user]);

  if (!user || (orders === null && !error)) return <Loading lines={4} />;
  if (orders === null) return <Notice tone="error">{error}</Notice>;
  if (orders.length === 0) {
    return (
      <Notice>
        No orders yet. When you buy something, it shows up here with its status. <a href="/">Browse the catalog</a>
      </Notice>
    );
  }

  return (
    <div className="table-wrap">
      <table className="orders">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Placed</th>
            <th scope="col">Items</th>
            <th scope="col">Status</th>
            <th scope="col" className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const s = ORDER_STATUS[o.orderStatus];
            return (
              <tr key={o.id}>
                <td>
                  <a href={`/orders/${o.id}`}>{o.orderNumber}</a>
                </td>
                <td className="tnum">{formatDate(o.createdAt)}</td>
                <td>{o.items.map((i) => i.productName).join(', ')}</td>
                <td>
                  <span className="status" data-tone={s.tone}>
                    {s.label}
                  </span>
                </td>
                <td className="num price">{formatPrice(o.totalAmount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style>{`
        .table-wrap { overflow-x: auto; }
        .orders { width: 100%; border-collapse: collapse; font-size: .9375rem; }
        .orders th { text-align: left; font-size: .8125rem; font-weight: 600; color: var(--lichen); padding: 0 16px 10px 0; border-bottom: 1px solid var(--bark-rule); }
        .orders td { padding: 14px 16px 14px 0; border-bottom: 1px solid var(--bark-rule); vertical-align: top; }
        .orders td:nth-child(3) { max-width: 36ch; color: var(--birch); }
        .orders a { color: var(--ash); font-weight: 700; }
        .orders .num { text-align: right; padding-right: 0; }
      `}</style>
    </div>
  );
}
