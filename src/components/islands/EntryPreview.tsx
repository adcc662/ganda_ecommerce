import { iconFor } from '../../lib/domain/sections';
import { formatPrice, priceOf } from '../../lib/domain/money';

interface Props {
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  categoryName: string;
  subcategoryName: string;
  sellerName: string;
}

/** React twin of Entry.astro, used where the entry must update live. */
export default function EntryPreview(p: Props) {
  const Icon = iconFor(p.categoryName || 'Other');
  const tag = priceOf({ price: p.price || 0, discountPrice: p.discountPrice });
  const stock = p.stockQuantity === 0 ? 'Out of stock' : p.stockQuantity <= 3 ? `${p.stockQuantity} left` : `${p.stockQuantity} in stock`;

  return (
    <article className="preview-entry">
      <div className="preview-entry__frame" role="img" aria-label="Photo placeholder">
        <Icon size={32} strokeWidth={1.25} aria-hidden="true" />
        <span>{p.subcategoryName || 'Section'}</span>
      </div>
      <div className="preview-entry__body">
        <div className="preview-entry__head">
          <h3>{p.name || 'Your item’s name'}</h3>
          <p className="price">
            {formatPrice(tag.current)}
            {tag.original && <s>{formatPrice(tag.original)}</s>}
          </p>
        </div>
        <blockquote className="voice">
          <p>“{p.description || 'Describe it the way you would to a friend: what it is, what shape it is in, why you are selling it.'}”</p>
        </blockquote>
        <p className="meta">
          {`Sold by ${p.sellerName} · ${p.subcategoryName || 'Section'} · `}
          <span className={p.stockQuantity === 0 ? 'out' : p.stockQuantity <= 3 ? 'low' : undefined}>{stock}</span>
        </p>
      </div>
      <style>{`
        .preview-entry { display: grid; grid-template-columns: 160px 1fr; gap: 20px; }
        .preview-entry__frame { aspect-ratio: 4/3; border-radius: var(--radius); border: 1px solid var(--bark-rule); background: var(--bark-raised); display: grid; place-content: center; justify-items: center; gap: 8px; color: var(--lichen); font-size: .8125rem; font-weight: 600;
          background-image: repeating-linear-gradient(135deg, transparent 0 11px, color-mix(in srgb, var(--bark-rule) 45%, transparent) 11px 12px); }
        .preview-entry__body { display: grid; align-content: start; gap: 12px; min-width: 0; }
        .preview-entry__head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
        .preview-entry h3 { font-size: 1.0625rem; font-weight: 750; overflow-wrap: anywhere; }
        .preview-entry .voice p { overflow-wrap: anywhere; }
        .preview-entry .low { color: var(--rust); font-weight: 600; }
        .preview-entry .out { color: var(--ember); font-weight: 600; }
        @media (max-width: 520px) { .preview-entry { grid-template-columns: 112px 1fr; gap: 16px; } .preview-entry__head { flex-direction: column; gap: 4px; } .preview-entry .voice { font-size: .8125rem; } }
      `}</style>
    </article>
  );
}
