import { createLocalListingRepository } from './localListingRepository';
import type { ListingRepository } from './listings';

/**
 * The single place the app picks its seller adapter.
 * MOCK until the API supports seller-owned products: listings stay in this browser.
 */
export const IS_MOCK_SELLER_BACKEND = true;

let repo: ListingRepository | null = null;
export function listings(): ListingRepository {
  repo ??= createLocalListingRepository(localStorage);
  return repo;
}

export { PLATFORM_SELLER } from './constants';
