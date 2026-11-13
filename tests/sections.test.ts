import { describe, expect, it } from 'vitest';
import { Bike, Coffee, Package, Scissors, Tent } from 'lucide-react';
import { iconFor, isSample } from '@/lib/domain/sections';

describe('iconFor', () => {
  it('draws the subsection, not the section', () => {
    expect(iconFor('Bikes', 'Outdoors')).toBe(Bike);
    expect(iconFor('Camping', 'Outdoors')).toBe(Tent);
    expect(iconFor('Ceramics', 'Handmade')).toBe(Coffee);
  });

  it('falls back to the section icon, then to a parcel', () => {
    expect(iconFor('Knitwear', 'Handmade')).toBe(Scissors);
    expect(iconFor('Odds and ends', 'Miscellaneous')).toBe(Package);
  });
});

describe('isSample', () => {
  it('flags products created by the dev seed script', () => {
    expect(isSample({ sku: 'SAMPLE-009' })).toBe(true);
    expect(isSample({ sku: 'GND-ABC-1' })).toBe(false);
    expect(isSample({ sku: null })).toBe(false);
  });
});
