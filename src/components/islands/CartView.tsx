import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatPrice } from '../../lib/domain/money';
import type { CartItem } from '../../lib/domain/types';
import { api, refreshCartCount } from '../../lib/session/session';
import { Loading, Notice, messageOf } from './ui';
import { useAuthed } from './useAuthed';

export default function CartView() {
  const user = useAuthed();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    api.cart().then(setItems).catch((e) => setError(messageOf(e)));
  }, [user]);

  async function change(productId: number, quantity: number) {
    setBusyId(productId);
    setError('');
    try {
      if (quantity <= 0) {
        await api.removeFromCart(productId);
        setItems((list) => list?.filter((i) => i.productId !== productId) ?? null);
      } else {
        const updated = await api.updateCart(productId, quantity);
        setItems((list) => list?.map((i) => (i.productId === productId ? updated : i)) ?? null);
      }
      refreshCartCount();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusyId(null);
    }
  }

  if (!user || (items === null && !error)) return <Loading lines={3} />;
  if (items === null) return <Notice tone="error">{error}</Notice>;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Find something in the catalog: every entry is written by the person selling it.</p>
        <a className="btn btn--act" href="/">Browse everything</a>
        <style>{`.cart-empty{display:grid;justify-items:start;gap:12px;padding:32px 0;border-top:1px solid var(--bark-rule)} .cart-empty p{color:var(--lichen)}`}</style>
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="cart">
      <ul className="cart__lines">
        {items.map((item) => (
          <li key={item.productId} className="line" aria-busy={busyId === item.productId}>
            <div>
              <a className="line__name" href={`/p/${item.productSlug}`}>
                {item.productName}
              </a>
              <p className="meta tnum">{formatPrice(item.productPrice)} each</p>
            </div>
            <div className="stepper" role="group" aria-label={`Quantity of ${item.productName}`}>
              <button className="btn btn--quiet" onClick={() => change(item.productId, item.quantity - 1)} disabled={busyId !== null} aria-label="One less">
                <Minus size={16} />
              </button>
              <output className="tnum">{item.quantity}</output>
              <button className="btn btn--quiet" onClick={() => change(item.productId, item.quantity + 1)} disabled={busyId !== null} aria-label="One more">
                <Plus size={16} />
              </button>
            </div>
            <p className="price tnum line__total">{formatPrice(item.subtotal)}</p>
            <button className="btn btn--quiet btn--danger" onClick={() => change(item.productId, 0)} disabled={busyId !== null} aria-label={`Remove ${item.productName}`}>
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <aside className="pane cart__summary">
        <dl>
          <div>
            <dt>Items</dt>
            <dd className="tnum">{count}</dd>
          </div>
          <div className="cart__total">
            <dt>Subtotal</dt>
            <dd className="price tnum">{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="meta">Tax and shipping are added when you place the order.</p>
        {error && <Notice tone="error">{error}</Notice>}
        <a className="btn btn--act btn--block" href="/checkout">
          Check out
        </a>
      </aside>
      <style>{`
        .cart { display: grid; grid-template-columns: 1fr 340px; gap: 48px; align-items: start; }
        .cart__lines { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--bark-rule); }
        .line { display: grid; grid-template-columns: 1fr auto 110px auto; gap: 16px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--bark-rule); }
        .line[aria-busy='true'] { opacity: .6; }
        .line__name { font-weight: 700; color: var(--ash); text-decoration: none; }
        .line__name:hover { text-decoration: underline; }
        .line__total { text-align: right; }
        .stepper { display: flex; align-items: center; border: 1px solid var(--bark-rule); border-radius: var(--radius); }
        .stepper output { min-width: 28px; text-align: center; font-weight: 700; color: var(--ash); }
        .cart__summary { padding: 24px; display: grid; gap: 16px; position: sticky; top: 96px; }
        .cart__summary dl { margin: 0; display: grid; gap: 8px; }
        .cart__summary dl div { display: flex; justify-content: space-between; }
        .cart__summary dd { margin: 0; }
        .cart__total { padding-top: 8px; border-top: 1px solid var(--bark-rule); font-size: 1.0625rem; color: var(--ash); font-weight: 700; }
        @media (max-width: 860px) {
          .cart { grid-template-columns: 1fr; gap: 24px; }
          .line { grid-template-columns: 1fr auto; }
          .line__total { text-align: left; }
        }
      `}</style>
    </div>
  );
}
