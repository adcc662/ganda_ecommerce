#!/usr/bin/env node
/**
 * DEV ONLY: fills an empty local API with SAMPLE categories and products so the storefront has
 * something to show. Every item here is placeholder content, not a real listing.
 *
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-dev.mjs
 * The admin account is the one the API bootstraps from the same variables on first start.
 */
const API = process.env.PUBLIC_API_URL ?? 'http://localhost:8080';
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD to the API admin account.');
  process.exit(1);
}

const catalog = [
  ['Outdoors', 'Gear for trails, water and weekends away.', {
    Bikes: [
      ['Trek FX 2 hybrid, 54 cm', 'Two summers of commuting. New chain and tires in May, small scuff on the top tube. Rides like it did on day one.', 420, null, 1],
      ['Wooden balance bike', 'Our youngest outgrew it. Birch frame, seat adjusts for ages two to four.', 40, null, 1],
      ['Road helmet, medium, MIPS', 'Never crashed, stored indoors. Pads replaced last spring.', 60, 48, 1],
    ],
    Camping: [
      ['Two-person backpacking tent', 'All poles, all stakes, footprint too. Never packed wet.', 145, null, 1],
      ['Dual-burner camp stove', 'Lights every time. Propane not included.', 35, null, 2],
      ['Down sleeping bag, 20°F', 'Lofts back fully after a night in the stuff sack. Washed once with down soap.', 160, 130, 1],
    ],
  }],
  ['Handmade', 'Made by the person selling it.', {
    Leather: [
      ['Leather saddle bag', 'I cut and stitch each one by hand from vegetable-tanned hide. Fits most rear racks. Two left in this run.', 68, null, 2],
      ['Bifold wallet, saddle stitched', 'Six card slots, one bill pocket. Darkens nicely with use.', 45, null, 8],
    ],
    Ceramics: [
      ['Stoneware mug set of four', 'Wheel-thrown, glazed in a deep moss green. Dishwasher safe; each one is slightly different.', 72, null, 3],
      ['Speckled serving bowl', 'Wide and shallow, about eleven inches across. Food safe glaze.', 54, null, 1],
    ],
  }],
  ['Home', 'Furniture, kitchen and everything between.', {
    Furniture: [
      ['Walnut side table', 'Solid walnut, oil finish, one small water ring on top. 22 inches tall.', 180, 150, 1],
      ['Rattan accent chair', 'Sturdy, no broken weaves. Cushion cover just washed.', 95, null, 1],
    ],
    Kitchen: [
      ['Cast iron skillet, 12 inch', 'Stripped and re-seasoned six times. Slick as anything.', 38, null, 1],
      ['Stand mixer, barely used', 'Works perfectly. Comes with whisk, paddle and dough hook.', 210, null, 1],
    ],
  }],
  ['Electronics', 'Phones, audio, computers and parts.', {
    Audio: [
      ['Over-ear headphones, wired', 'Studio monitors, new ear pads, detachable cable.', 85, null, 1],
      ['Bookshelf speakers, pair', 'Warm and clear, no blown cones. Speaker wire included.', 120, 99, 1],
    ],
    Computers: [
      ['Mechanical keyboard, tactile', 'Brown switches, PBT keycaps, USB-C. Lightly used for a year.', 70, null, 1],
      ['27 inch monitor, 1440p', 'No dead pixels. Stand tilts and swivels.', 190, null, 1],
    ],
  }],
  ['Clothing', 'Worn, loved, or never worn at all.', {
    Outerwear: [
      ['Waxed canvas jacket, M', 'Re-waxed this fall. Corduroy collar, all snaps work.', 110, null, 1],
      ['Wool overshirt, L', 'Heavy flannel, red and black check. No moth holes.', 55, null, 1],
    ],
  }],
  ['Books & Media', 'Pages, records and tapes.', {
    Books: [
      ['Field guide to North American trees', 'Some pencil notes in the margins from a botany class.', 18, null, 1],
      ['Box of 12 paperback mysteries', 'Read once each. Good for a long summer.', 24, null, 1],
    ],
    Records: [
      ['Jazz vinyl lot, 15 records', 'Mostly 70s pressings, sleeves worn, vinyl plays clean.', 80, null, 1],
    ],
  }],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : undefined;
}

const { token } = await call('/api/auth/login', {
  method: 'POST',
  body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
});

const existing = await call('/api/categories');
if (existing.length) {
  console.log(`API already has ${existing.length} categories; nothing seeded.`);
  process.exit(0);
}

let count = 0;
for (const [name, description, subs] of catalog) {
  const category = await call('/api/categories', {
    method: 'POST',
    token,
    body: { name, slug: slug(name), description },
  });
  for (const [subName, products] of Object.entries(subs)) {
    const sub = await call(`/api/categories/${category.id}/subcategories`, {
      method: 'POST',
      token,
      body: { name: subName, slug: slug(`${name}-${subName}`), description: null },
    });
    for (const [pName, pDesc, price, discountPrice, stock] of products) {
      await call('/api/products', {
        method: 'POST',
        token,
        body: {
          subcategoryId: sub.id,
          name: pName,
          description: pDesc,
          slug: slug(pName),
          sku: `SAMPLE-${String(++count).padStart(3, '0')}`,
          price,
          discountPrice,
          stockQuantity: stock,
          isActive: true,
        },
      });
    }
  }
}
console.log(`Seeded ${catalog.length} categories and ${count} sample products.`);
