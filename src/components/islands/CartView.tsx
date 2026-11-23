import { actions } from 'astro:actions';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../../lib/domain/money';
import type { CartItem, Product } from '../../lib/domain/types';
import { iconFor } from '../../lib/domain/sections';
import { $cartCount } from '../../lib/session/session';
import { Notice, failureOf } from './ui';

interface Props {
  /** The cart as the server loaded it. */
  initialItems: CartItem[];
  /** Catalog entries by slug: the cart API returns no description, so the seller's words come from the catalog. */
  details: Record<string, Product>;
}

export default function CartView({ initialItems, details }: Props) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  async function change(productId: number, quantity: number) {
    setBusyId(productId);
    setError('');
    if (quantity <= 0) {
      const { data, error: failure } = await actions.cart.remove({ productId });
      if (failure) setError(failureOf(failure));
      else {
        setItems((list) => list.filter((i) => i.productId !== productId));
        $cartCount.set(data.count);
      }
    } else {
      const { data, error: failure } = await actions.cart.update({ productId, quantity });
      if (failure) setError(failureOf(failure));
      else {
        setItems((list) => list.map((i) => (i.productId === productId ? data.item : i)));
        $cartCount.set(data.count);
      }
    }
    setBusyId(null);
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Find something in the catalog.</p>
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
            <div className="line__item">
              <LineThumb product={details[item.productSlug]} image={item.productImage} name={item.productName} />
              <div className="line__text">
                <a className="line__name" href={`/p/${item.productSlug}`}>
                  {item.productName}
                </a>
                {details[item.productSlug]?.description && (
                  <blockquote className="voice line__voice">
                    <p>“{details[item.productSlug].description}”</p>
                  </blockquote>
                )}
                <p className="meta tnum">{formatPrice(item.productPrice)} each</p>
              </div>
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
        .line__item { display: grid; grid-template-columns: 88px 1fr; gap: 16px; align-items: start; min-width: 0; }
        .line__text { display: grid; gap: 6px; min-width: 0; }
        .line__voice { font-size: .875rem; padding-left: 12px; }
        .line__voice p { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .thumb { aspect-ratio: 4/3; border-radius: var(--radius); border: 1px solid var(--bark-rule); background: var(--bark-raised); display: grid; place-content: center; color: var(--lichen); overflow: hidden; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
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
          .line__item { grid-column: 1 / -1; grid-template-columns: 72px 1fr; }
          .line__total { text-align: left; }
        }
      `}</style>
    </div>
  );
}

function LineThumb({ product, image, name }: { product?: Product; image: string | null; name: string }) {
  const Icon = iconFor(product?.subcategoryName ?? '', product?.categoryName ?? '');
  return (
    <div className="thumb" aria-hidden="true">
      {image ? <img src={image} alt={name} /> : <Icon size={22} strokeWidth={1.25} />}
    </div>
  );
}
