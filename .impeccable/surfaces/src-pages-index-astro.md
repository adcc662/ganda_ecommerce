---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Storefront (catalog, product, cart, checkout, seller)

Scope: every buyer and seller screen of Ganda ecommerce. Visitor mode: Operate. Build path: code-led.
Job: buyers find and buy from strangers; sellers list in minutes. Proof/content: real API data; seller identity from the mock seller adapter until the API supports it.
Unresolved: product photography (none exists; placeholders only), logo.

## Direction contract

THESIS: Ganda is a people's catalog. Each listing is an entry the seller wrote, filed under open sections, with the seller's own words quoted beside price and place. It refuses the uniform card grid with a hero carousel that every marketplace ships.

OWN-WORLD: base16 woodland on a dark bark ground (#231e18), raised panes #302b25, rules #48413a, text #cabcb1/#e4d4c8; goldenrod #e0ac16 is the act colour (Sell, Add to cart, prices), fern green #6eb958 marks the seller's voice, red #d35c5c only for errors and sold. Flat colour, hairline rules, square-ish 4px corners, Libre Franklin for the interface, Bitter italic only for seller quotes.

STORY: a visitor scans entries like a catalog, trusts what the seller says, adds to cart, checks out; anyone sees "Add your listing" at every turn.

FIRST VIEWPORT: top bar (wordmark left, full-width search, cart/orders, goldenrod "Add your listing" right); section index strip under it; section heading with count; a two-column list of entries, each photo 4:3 at left, name + price row, quoted seller note with green rule, seller · city · condition line.

FORM: Access Catalog (Whole Earth Catalog entries), position 1 on the ordered list, taken as IMPECCABLE'S PICK; seed:860a400fe9d46824. Signature move: the quoted seller note with its green rule, which carries through product page, cart lines and the Sell composer's live preview of your entry.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
