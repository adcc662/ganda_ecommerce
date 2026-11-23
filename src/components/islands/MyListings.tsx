import { useEffect, useState } from 'react';
import { formatDate } from '../../lib/domain/labels';
import { IS_MOCK_SELLER_BACKEND, listings } from '../../lib/sellers';
import type { Listing } from '../../lib/sellers/listings';
import type { AuthUser } from '../../lib/domain/types';
import EntryPreview from './EntryPreview';
import { Loading, Notice, messageOf } from './ui';

export default function MyListings({ user }: { user: AuthUser }) {
  const [items, setItems] = useState<Listing[] | null>(null);
  const [error, setError] = useState('');
  const added = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('added');

  useEffect(() => {
    listings().listByOwner(user.email).then(setItems).catch((e) => setError(messageOf(e)));
  }, [user.email]);

  if (items === null && !error) return <Loading lines={3} />;
  if (items === null) return <Notice tone="error">{error}</Notice>;

  async function patch(id: string, change: Partial<Listing>) {
    setError('');
    try {
      const next = await listings().update(user.email, id, change);
      setItems((list) => list?.map((l) => (l.id === id ? next : l)) ?? null);
    } catch (e) {
      setError(messageOf(e));
    }
  }

  async function remove(l: Listing) {
    if (!window.confirm(`Take “${l.name}” out of the catalog? This cannot be undone.`)) return;
    await listings().remove(user.email, l.id);
    setItems((list) => list?.filter((x) => x.id !== l.id) ?? null);
  }

  return (
    <div className="mine">
      {IS_MOCK_SELLER_BACKEND && (
        <Notice>These listings are saved on this device only until seller accounts launch. Buyers cannot see them yet.</Notice>
      )}
      {added && <Notice tone="ok">Your entry is in. Adjust the price or quantity any time below.</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      {items.length === 0 ? (
        <div className="mine__empty">
          <h2>You have not listed anything yet</h2>
          <p>Bikes, bowls, books, jackets: anything you own or make has a place here.</p>
          <a className="btn btn--act" href="/sell">Add your listing</a>
        </div>
      ) : (
        <ul className="mine__list">
          {items.map((l) => (
            <li key={l.id} className="mine__item" data-paused={!l.isActive}>
              <EntryPreview
                name={l.name}
                description={l.description}
                price={l.price}
                discountPrice={l.discountPrice}
                stockQuantity={l.stockQuantity}
                categoryName={l.categoryName}
                subcategoryName={l.subcategoryName}
                sellerName={l.seller.displayName}
              />
              <div className="mine__controls">
                <span className="status" data-tone={l.isActive ? (l.stockQuantity > 0 ? 'ok' : 'bad') : 'neutral'}>
                  {l.isActive ? (l.stockQuantity > 0 ? 'Listed' : 'Sold out') : 'Paused'}
                </span>
                <label className="mine__qty">
                  <span>Quantity</span>
                  <input
                    className="input tnum"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={l.stockQuantity}
                    onBlur={(e) => Number(e.target.value) !== l.stockQuantity && patch(l.id, { stockQuantity: Number(e.target.value) })}
                  />
                </label>
                <button className="btn" onClick={() => patch(l.id, { isActive: !l.isActive })}>{l.isActive ? 'Pause' : 'Relist'}</button>
                <button className="btn btn--quiet btn--danger" onClick={() => remove(l)}>Delete</button>
                <span className="meta">Added {formatDate(l.createdAt)} · {l.sku}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .mine { display: grid; gap: 20px; }
        .mine__empty { display: grid; justify-items: start; gap: 12px; padding: 32px 0; border-top: 1px solid var(--bark-rule); }
        .mine__empty p { color: var(--lichen); }
        .mine__list { list-style: none; margin: 0; padding: 0; }
        .mine__item { display: grid; gap: 16px; padding: 24px 0; border-top: 1px solid var(--bark-rule); }
        .mine__item[data-paused='true'] .preview-entry { opacity: .55; }
        .mine__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding-left: 180px; }
        .mine__qty { display: flex; align-items: center; gap: 8px; font-size: .8125rem; }
        .mine__qty .input { width: 84px; min-height: 40px; padding: 6px 10px; }
        .mine__controls .btn { min-height: 40px; }
        .mine__controls .meta { margin-left: auto; }
        @media (max-width: 960px) { .mine__controls { padding-left: 180px; } }
        @media (max-width: 640px) { .mine__controls { padding-left: 0; } .mine__controls .meta { margin-left: 0; width: 100%; } }
      `}</style>
    </div>
  );
}
