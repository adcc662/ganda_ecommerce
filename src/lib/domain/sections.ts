import { BookOpen, Headphones, Package, Scissors, Shirt, Sofa, Tent, type LucideIcon } from 'lucide-react';
import type { Category, Product } from './types';

const ICONS: Record<string, LucideIcon> = {
  outdoors: Tent,
  handmade: Scissors,
  home: Sofa,
  electronics: Headphones,
  clothing: Shirt,
  books: BookOpen,
};

/** Drawn placeholder for listings without photos; falls back to a parcel. */
export function iconFor(categoryName: string): LucideIcon {
  const key = categoryName.toLowerCase();
  const match = Object.keys(ICONS).find((k) => key.includes(k));
  return match ? ICONS[match] : Package;
}

/** The API has no category filter, so sections are derived from the active product list. */
export function productsIn(products: Product[], category: Category, subcategorySlug?: string | null) {
  const sub = subcategorySlug ? category.subcategories.find((s) => s.slug === subcategorySlug) : undefined;
  return products.filter(
    (p) => p.categoryName === category.name && (!sub || p.subcategoryName === sub.name),
  );
}

export function countBySection(products: Product[]) {
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.categoryName, (counts.get(p.categoryName) ?? 0) + 1);
  return counts;
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
}
