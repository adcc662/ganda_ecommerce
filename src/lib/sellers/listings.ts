/**
 * Seller listings port.
 *
 * The API has no seller ownership yet: products have no seller and only ADMIN can create them.
 * Until it does, listings go through this port, implemented by the MOCK adapter in
 * `localListingRepository.ts` (browser storage). Swap in an API-backed adapter with the same
 * interface when the backend lets USER create products; the UI does not change.
 */

export interface SellerIdentity {
  email: string;
  displayName: string;
}

export interface ListingDraft {
  subcategoryId: number;
  subcategoryName: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
}

export interface Listing extends ListingDraft {
  id: string;
  slug: string;
  sku: string;
  isActive: boolean;
  seller: SellerIdentity;
  createdAt: string;
  updatedAt: string;
}

export type ListingPatch = Partial<Pick<Listing, 'price' | 'discountPrice' | 'stockQuantity' | 'isActive' | 'name' | 'description'>>;

export interface ListingRepository {
  create(owner: SellerIdentity, draft: ListingDraft): Promise<Listing>;
  listByOwner(ownerEmail: string): Promise<Listing[]>;
  update(ownerEmail: string, id: string, patch: ListingPatch): Promise<Listing>;
  remove(ownerEmail: string, id: string): Promise<void>;
}

export class ListingValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super('Check the highlighted fields');
    this.name = 'ListingValidationError';
  }
}
