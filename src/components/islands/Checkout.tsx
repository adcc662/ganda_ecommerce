import { actions } from 'astro:actions';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../../lib/domain/money';
import type { Address, CartItem } from '../../lib/domain/types';
import { $cartCount } from '../../lib/session/session';
import AddressForm, { formatAddress } from './AddressForm';
import { Notice, failureOf } from './ui';

interface Props {
  /** Cart and saved addresses as the server loaded them. */
  cart: CartItem[];
  savedAddresses: Address[];
}

function pick(saved: Address[], type: string) {
  return saved.find((a) => a.addressType === type && a.isDefault) ?? saved.find((a) => a.addressType === type);
}

export default function Checkout({ cart, savedAddresses }: Props) {
  const [addresses, setAddresses] = useState(savedAddresses);
  const [shippingId, setShippingId] = useState<number | null>(pick(savedAddresses, 'SHIPPING')?.id ?? savedAddresses[0]?.id ?? null);
  const [billingSame, setBillingSame] = useState(true);
  const [billingId, setBillingId] = useState<number | null>(pick(savedAddresses, 'BILLING')?.id ?? null);
  const [adding, setAdding] = useState<'SHIPPING' | 'BILLING' | null>(savedAddresses.length ? null : 'SHIPPING');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  if (cart.length === 0) {
    return (
      <Notice>
        Your cart is empty, so there is nothing to check out. <a href="/">Browse the catalog</a>
      </Notice>
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const effectiveBilling = billingSame ? shippingId : billingId;
  const ready = shippingId !== null && effectiveBilling !== null && !placing;

  function saved(address: Address) {
    setAddresses((list) => [...list, address]);
    if (adding === 'BILLING') setBillingId(address.id);
    else setShippingId(address.id);
    setAdding(null);
  }

  async function place() {
    if (shippingId === null || effectiveBilling === null) return;
    setPlacing(true);
    setError('');
    // The server orders what is in the session's cart and empties it.
    const { data, error: failure } = await actions.orders.place({ shippingAddressId: shippingId, billingAddressId: effectiveBilling });
    if (failure) {
      setError(failureOf(failure));
      setPlacing(false);
      return;
    }
    $cartCount.set(0);
    window.location.assign(`/orders/${data.orderId}?placed=1`);
  }

  const choices = (type: 'SHIPPING' | 'BILLING', selected: number | null, onPick: (id: number) => void) => {
    const list = type === 'BILLING' ? addresses : addresses;
    return (
      <div className="choices" role="radiogroup" aria-label={`${type === 'SHIPPING' ? 'Shipping' : 'Billing'} address`}>
        {list.map((a) => (
          <label key={a.id} className="choice" data-on={selected === a.id}>
            <input type="radio" name={type} checked={selected === a.id} onChange={() => onPick(a.id)} />
            <span>{formatAddress(a)}</span>
          </label>
        ))}
        {adding === type ? (
          <div className="pane add-pane">
            <AddressForm type={type} onSaved={saved} onCancel={addresses.length ? () => setAdding(null) : undefined} />
          </div>
        ) : (
          <button type="button" className="btn btn--quiet add" onClick={() => setAdding(type)}>
            <Plus size={16} aria-hidden="true" /> Add a new address
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="checkout">
      <div className="checkout__steps">
        <section aria-labelledby="ship-title">
          <h2 id="ship-title">Where should it go?</h2>
          {choices('SHIPPING', shippingId, setShippingId)}
        </section>

        <section aria-labelledby="bill-title">
          <h2 id="bill-title">Billing address</h2>
          <label className="check">
            <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} /> Same as shipping
          </label>
          {!billingSame && choices('BILLING', billingId, setBillingId)}
        </section>
      </div>

      <aside className="pane summary">
        <h2>Order summary</h2>
        <ul>
          {cart.map((i) => (
            <li key={i.productId}>
              <span>
                {i.quantity} × {i.productName}
              </span>
              <span className="tnum">{formatPrice(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="summary__total">
          <span>Subtotal</span>
          <span className="price tnum">{formatPrice(subtotal)}</span>
        </div>
        <p className="meta">Tax and shipping are calculated by Ganda when the order is placed. You pay on the next step.</p>
        {error && <Notice tone="error">{error}</Notice>}
        <button className="btn btn--act btn--block" onClick={place} disabled={!ready}>
          {placing ? 'Placing order…' : 'Place order'}
        </button>
      </aside>

      <style>{`
        .checkout { display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: start; }
        .checkout__steps { display: grid; gap: 40px; }
        .checkout h2 { font-size: 1.25rem; margin-bottom: 16px; }
        .choices { display: grid; gap: 8px; }
        .choice { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border: 1px solid var(--bark-rule); border-radius: var(--radius); cursor: pointer; transition: border-color 160ms var(--ease-out); }
        .choice:hover { border-color: var(--lichen); }
        .choice[data-on='true'] { border-color: var(--goldenrod); color: var(--ash); }
        .choice input { accent-color: var(--goldenrod); margin-top: 3px; }
        .add { justify-self: start; }
        .add-pane { padding: 20px; }
        .check { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .check input { accent-color: var(--goldenrod); width: 16px; height: 16px; }
        .summary { padding: 24px; display: grid; gap: 16px; position: sticky; top: 96px; }
        .summary h2 { margin: 0; }
        .summary ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: .9375rem; }
        .summary li { display: flex; justify-content: space-between; gap: 12px; }
        .summary__total { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--bark-rule); font-weight: 700; color: var(--ash); }
        @media (max-width: 900px) { .checkout { grid-template-columns: 1fr; } .summary { position: static; } }
      `}</style>
    </div>
  );
}
