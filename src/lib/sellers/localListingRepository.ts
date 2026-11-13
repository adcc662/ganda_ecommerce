/**
 * MOCK seller adapter: stores listings in browser storage on this device only.
 * Replace with an API adapter once the backend supports seller-owned products.
 */
import {
  ListingValidationError,
  type Listing,
  type ListingDraft,
  type ListingPatch,
  type ListingRepository,
  type SellerIdentity,
} from './listings';

export const AD_BUDGET = 600;
const STORAGE_KEY = 'ganda.mock.listings.v1';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function adBudget(description: string) {
  const used = description.length;
  return { used, max: AD_BUDGET, over: used > AD_BUDGET };
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'listing'
  );
}

function validate(fields: Pick<ListingDraft, 'name' | 'description' | 'price' | 'stockQuantity'>) {
  const errors: Record<string, string> = {};
  if (!fields.name.trim()) errors.name = 'Product name is required';
  if (!(fields.price > 0)) errors.price = 'Price must be greater than 0';
  if (!Number.isInteger(fields.stockQuantity) || fields.stockQuantity < 0) {
    errors.stockQuantity = 'Stock quantity must be greater than or equal to 0';
  }
  if (adBudget(fields.description).over) errors.description = `Keep the description under ${AD_BUDGET} characters`;
  if (Object.keys(errors).length) throw new ListingValidationError(errors);
}

export function createLocalListingRepository(
  store: KeyValueStore,
  now: () => Date = () => new Date(),
): ListingRepository {
  const read = (): Listing[] => {
    try {
      return JSON.parse(store.getItem(STORAGE_KEY) ?? '[]') as Listing[];
    } catch {
      return [];
    }
  };
  const write = (listings: Listing[]) => store.setItem(STORAGE_KEY, JSON.stringify(listings));

  const findOwned = (listings: Listing[], ownerEmail: string, id: string) => {
    const index = listings.findIndex((l) => l.id === id && l.seller.email === ownerEmail);
    if (index === -1) throw new Error('Listing not found');
    return index;
  };

  return {
    async create(owner: SellerIdentity, draft: ListingDraft) {
      validate(draft);
      const listings = read();
      const base = slugify(draft.name);
      const taken = new Set(listings.map((l) => l.slug));
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

      const stamp = now().toISOString();
      const listing: Listing = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        id: crypto.randomUUID(),
        slug,
        sku: `GND-${Date.now().toString(36).toUpperCase()}-${listings.length + 1}`,
        isActive: true,
        seller: owner,
        createdAt: stamp,
        updatedAt: stamp,
      };
      write([listing, ...listings]);
      return listing;
    },

    async listByOwner(ownerEmail: string) {
      return read().filter((l) => l.seller.email === ownerEmail);
    },

    async update(ownerEmail: string, id: string, patch: ListingPatch) {
      const listings = read();
      const index = findOwned(listings, ownerEmail, id);
      const next: Listing = { ...listings[index], ...patch, updatedAt: now().toISOString() };
      validate(next);
      listings[index] = next;
      write(listings);
      return next;
    },

    async remove(ownerEmail: string, id: string) {
      const listings = read();
      const index = findOwned(listings, ownerEmail, id);
      listings.splice(index, 1);
      write(listings);
    },
  };
}
