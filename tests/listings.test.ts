import { beforeEach, describe, expect, it } from 'vitest';
import { AD_BUDGET, adBudget, createLocalListingRepository, type KeyValueStore } from '@/lib/sellers/localListingRepository';
import { ListingValidationError } from '@/lib/sellers/listings';

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

const owner = { email: 'maya@example.com', displayName: 'Maya R.' };
const draft = {
  subcategoryId: 4,
  subcategoryName: 'Bikes',
  categoryName: 'Outdoors',
  name: 'Trek FX 2 hybrid',
  description: 'Two summers of commuting.',
  price: 420,
  discountPrice: null,
  stockQuantity: 1,
};

describe('local listing repository (mock seller adapter)', () => {
  let store: KeyValueStore;
  beforeEach(() => {
    store = memoryStore();
  });

  it('creates an active listing with a slug and sku, owned by the seller', async () => {
    const repo = createLocalListingRepository(store, () => new Date('2026-11-13T10:00:00Z'));

    const listing = await repo.create(owner, draft);

    expect(listing.slug).toBe('trek-fx-2-hybrid');
    expect(listing.sku).toMatch(/^GND-/);
    expect(listing.isActive).toBe(true);
    expect(listing.seller).toEqual(owner);
    expect(await repo.listByOwner(owner.email)).toHaveLength(1);
    expect(await repo.listByOwner('someone@else.com')).toHaveLength(0);
  });

  it('persists across repository instances on the same store', async () => {
    await createLocalListingRepository(store).create(owner, draft);
    expect(await createLocalListingRepository(store).listByOwner(owner.email)).toHaveLength(1);
  });

  it('rejects drafts that the API would reject, with field messages', async () => {
    const repo = createLocalListingRepository(store);
    const err = await repo
      .create(owner, { ...draft, name: ' ', price: 0, stockQuantity: -1, description: 'x'.repeat(AD_BUDGET + 1) })
      .catch((e) => e);

    expect(err).toBeInstanceOf(ListingValidationError);
    expect(err.fieldErrors).toEqual({
      name: 'Product name is required',
      price: 'Price must be greater than 0',
      stockQuantity: 'Stock quantity must be greater than or equal to 0',
      description: `Keep the description under ${AD_BUDGET} characters`,
    });
    expect(await repo.listByOwner(owner.email)).toHaveLength(0);
  });

  it('updates and removes only the owner’s listing', async () => {
    const repo = createLocalListingRepository(store);
    const listing = await repo.create(owner, draft);

    const updated = await repo.update(owner.email, listing.id, { stockQuantity: 0, isActive: false });
    expect(updated.stockQuantity).toBe(0);
    expect(updated.isActive).toBe(false);

    await expect(repo.remove('intruder@example.com', listing.id)).rejects.toThrow('Listing not found');
    await repo.remove(owner.email, listing.id);
    expect(await repo.listByOwner(owner.email)).toHaveLength(0);
  });

  it('makes slugs unique per store', async () => {
    const repo = createLocalListingRepository(store);
    await repo.create(owner, draft);
    const second = await repo.create(owner, draft);
    expect(second.slug).toBe('trek-fx-2-hybrid-2');
  });
});

describe('adBudget', () => {
  it('reports used characters against the budget', () => {
    expect(adBudget('hello')).toEqual({ used: 5, max: AD_BUDGET, over: false });
    expect(adBudget('x'.repeat(AD_BUDGET + 3)).over).toBe(true);
  });
});
