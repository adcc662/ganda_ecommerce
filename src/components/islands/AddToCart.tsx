import { actions } from 'astro:actions';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { loginHref } from '../../lib/session/routes';
import { $cartCount } from '../../lib/session/session';
import { Notice, failureOf } from './ui';

interface Props {
  productId: number;
  productName: string;
  stock: number;
  /** From the server session; visitors are sent to log in before adding. */
  loggedIn: boolean;
}

export default function AddToCart({ productId, productName, stock, loggedIn }: Props) {
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<'idle' | 'busy' | 'added' | 'error'>('idle');
  const [error, setError] = useState('');

  if (stock === 0) {
    return <Notice tone="error">Out of stock. The seller has none left right now.</Notice>;
  }

  async function add() {
    if (!loggedIn) {
      window.location.href = loginHref(window.location.pathname);
      return;
    }
    setState('busy');
    const { data, error: failure } = await actions.cart.add({ productId, quantity: qty });
    if (failure) {
      setError(failureOf(failure));
      setState('error');
      return;
    }
    $cartCount.set(data.count);
    setState('added');
  }

  return (
    <div className="buy">
      <div className="buy__row">
        <div className="stepper" role="group" aria-label="Quantity">
          <button type="button" className="btn btn--quiet" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One less">
            <Minus size={16} />
          </button>
          <output className="tnum" aria-live="polite">{qty}</output>
          <button type="button" className="btn btn--quiet" onClick={() => setQty((q) => Math.min(stock, q + 1))} disabled={qty >= stock} aria-label="One more">
            <Plus size={16} />
          </button>
        </div>
        <button type="button" className="btn btn--act buy__cta" onClick={add} disabled={state === 'busy'}>
          {state === 'busy' ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
      <p className="meta">{stock <= 3 ? `Only ${stock} left.` : `${stock} in stock.`}</p>
      {state === 'added' && (
        <Notice tone="ok">
          {qty} × {productName} is in your cart. <a href="/cart">View cart</a>
        </Notice>
      )}
      {state === 'error' && <Notice tone="error">{error}</Notice>}
      <style>{`
        .buy { display: grid; gap: 12px; }
        .buy__row { display: flex; gap: 12px; }
        .buy__cta { flex: 1; min-height: 52px; font-size: 1.0625rem; }
        .stepper { display: flex; align-items: center; border: 1px solid var(--bark-rule); border-radius: var(--radius); }
        .stepper .btn { min-height: 50px; }
        .stepper output { min-width: 32px; text-align: center; font-weight: 700; color: var(--ash); }
      `}</style>
    </div>
  );
}
