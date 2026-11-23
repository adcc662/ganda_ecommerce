import { useState, type FormEvent } from 'react';
import type { AuthUser, Category } from '../../lib/domain/types';
import { IS_MOCK_SELLER_BACKEND, listings } from '../../lib/sellers';
import { adBudget } from '../../lib/sellers/localListingRepository';
import EntryPreview from './EntryPreview';
import { Field, Notice, fieldErrorsOf, messageOf } from './ui';

export default function ListingComposer({ categories, user }: { categories: Category[]; user: AuthUser }) {
  const [subId, setSubId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sale, setSale] = useState('');
  const [stock, setStock] = useState('1');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const category = categories.find((c) => c.subcategories.some((s) => s.id === subId));
  const sub = category?.subcategories.find((s) => s.id === subId);
  const budget = adBudget(description);
  const sellerName = `${user.firstName} ${user.lastName.charAt(0)}.`;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const errors: Record<string, string> = {};
    if (!sub || !category) errors.subcategoryId = 'Pick the section buyers will find it in';
    const sp = sale ? Number(sale) : null;
    if (sp != null && Number(price) > 0 && sp >= Number(price)) errors.discountPrice = 'A sale price has to be lower than the price';
    if (Object.keys(errors).length) {
      setFields(errors);
      return;
    }
    setBusy(true);
    try {
      await listings().create(
        { email: user.email, displayName: sellerName },
        {
          subcategoryId: sub!.id,
          subcategoryName: sub!.name,
          categoryName: category!.name,
          name,
          description,
          price: Number(price),
          discountPrice: sp,
          stockQuantity: Number(stock),
        },
      );
      window.location.assign('/sell/listings?added=1');
    } catch (err) {
      setFields(fieldErrorsOf(err));
      setError(messageOf(err));
      setBusy(false);
    }
  }

  return (
    <div className="composer">
      <form className="composer__form" onSubmit={submit} noValidate>
        {IS_MOCK_SELLER_BACKEND && (
          <Notice>
            Seller accounts are still being built. Listings you add now are saved on this device only and buyers cannot see them yet.
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="Section" error={fields.subcategoryId}>
          <select className="input" value={subId} onChange={(e) => setSubId(e.target.value ? Number(e.target.value) : '')} aria-invalid={!!fields.subcategoryId}>
            <option value="">Choose a section</option>
            {categories.map((c) => (
              <optgroup key={c.id} label={c.name}>
                {c.subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        <Field label="What are you selling?" error={fields.name}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} placeholder="Trek FX 2 hybrid, 54 cm" aria-invalid={!!fields.name} />
        </Field>

        <Field
          label="In your own words"
          error={fields.description}
          hint={<span className="tnum" data-over={budget.over}>{budget.used} / {budget.max} characters. This is the quote buyers read first.</span>}
        >
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} aria-invalid={!!fields.description || budget.over} />
        </Field>

        <div className="composer__row">
          <Field label="Price (USD)" error={fields.price}>
            <input className="input tnum" inputMode="decimal" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={!!fields.price} />
          </Field>
          <Field label="Sale price (optional)" error={fields.discountPrice}>
            <input className="input tnum" inputMode="decimal" type="number" min="0" step="0.01" value={sale} onChange={(e) => setSale(e.target.value)} aria-invalid={!!fields.discountPrice} />
          </Field>
          <Field label="How many?" error={fields.stockQuantity}>
            <input className="input tnum" inputMode="numeric" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} aria-invalid={!!fields.stockQuantity} />
          </Field>
        </div>

        <div className="composer__actions">
          <button className="btn btn--act" disabled={busy}>{busy ? 'Saving…' : 'Add to the catalog'}</button>
          <a className="btn btn--quiet" href="/sell/listings">Your listings</a>
        </div>
      </form>

      <aside className="composer__preview" aria-label="Preview of your entry">
        <h2>How buyers will see it</h2>
        <div className="composer__sheet">
          <EntryPreview
            name={name}
            description={description}
            price={Number(price) || 0}
            discountPrice={sale ? Number(sale) : null}
            stockQuantity={Number(stock) || 0}
            categoryName={category?.name ?? ''}
            subcategoryName={sub?.name ?? ''}
            sellerName={sellerName}
          />
        </div>
      </aside>

      <style>{`
        .composer { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 56px; align-items: start; }
        .composer__form { display: grid; gap: 20px; }
        .composer__row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .composer__actions { display: flex; gap: 8px; }
        .composer [data-over='true'] { color: var(--ember); }
        .composer__preview { position: sticky; top: 96px; display: grid; gap: 16px; }
        .composer__preview h2 { font-size: .8125rem; font-weight: 600; color: var(--lichen); }
        .composer__sheet { padding: 24px 0; border-top: 1px solid var(--bark-rule); border-bottom: 1px solid var(--bark-rule); }
        @media (max-width: 960px) {
          .composer { grid-template-columns: 1fr; gap: 32px; }
          .composer__preview { position: static; }
        }
        @media (max-width: 520px) { .composer__row { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
