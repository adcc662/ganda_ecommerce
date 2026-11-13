import {
  Armchair,
  Bike,
  BookOpen,
  Coffee,
  CookingPot,
  Disc3,
  Headphones,
  Monitor,
  Package,
  Scissors,
  Shirt,
  Sofa,
  Tent,
  type LucideIcon,
} from 'lucide-react';
import type { Category, Product } from './types';

/** Keyword → drawn icon. Subsection keywords are checked before section keywords. */
const SUBSECTION_ICONS: [string, LucideIcon][] = [
  ['bike', Bike],
  ['camp', Tent],
  ['ceramic', Coffee],
  ['leather', Scissors],
  ['furniture', Armchair],
  ['kitchen', CookingPot],
  ['audio', Headphones],
  ['computer', Monitor],
  ['record', Disc3],
  ['book', BookOpen],
  ['outerwear', Shirt],
];

const SECTION_ICONS: [string, LucideIcon][] = [
  ['outdoor', Tent],
  ['handmade', Scissors],
  ['home', Sofa],
  ['electronic', Headphones],
  ['clothing', Shirt],
  ['book', BookOpen],
];

function match(list: [string, LucideIcon][], name: string) {
  const key = name.toLowerCase();
  return list.find(([k]) => key.includes(k))?.[1];
}

/** Drawn placeholder for listings without photos. */
export function iconFor(subcategoryName: string, categoryName = ''): LucideIcon {
  return match(SUBSECTION_ICONS, subcategoryName) ?? match(SECTION_ICONS, categoryName) ?? Package;
}

/** Products created by `scripts/seed-dev.mjs` carry SAMPLE- SKUs and must read as placeholders. */
export function isSample(product: { sku: string | null }): boolean {
  return product.sku?.startsWith('SAMPLE-') ?? false;
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
