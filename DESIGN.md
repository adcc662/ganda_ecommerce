---
name: Ganda ecommerce
description: A people's catalog where anyone can sell anything, filed by section and quoted in the seller's own words.
colors:
  bark: "#231e18"
  bark-raised: "#302b25"
  bark-rule: "#48413a"
  lichen: "#a8977c"
  birch: "#cabcb1"
  ash: "#e4d4c8"
  goldenrod: "#e0ac16"
  goldenrod-deep: "#c99a12"
  ink-on-gold: "#231e18"
  fern: "#6eb958"
  ember: "#d35c5c"
  rust: "#ca7f32"
  sky: "#88a4d3"
typography:
  display:
    fontFamily: "Libre Franklin Variable, Libre Franklin, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.4rem + 1.6vw, 2.5rem)"
    fontWeight: 820
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Libre Franklin Variable, Libre Franklin, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Libre Franklin Variable, Libre Franklin, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Libre Franklin Variable, Libre Franklin, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  voice:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Libre Franklin Variable, Libre Franklin, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  tag: "2px"
  base: "4px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "72px"
components:
  button-act:
    backgroundColor: "{colors.goldenrod}"
    textColor: "{colors.ink-on-gold}"
    rounded: "{rounded.base}"
    padding: "0 24px"
    height: "44px"
  button-act-hover:
    backgroundColor: "{colors.goldenrod-deep}"
    textColor: "{colors.ink-on-gold}"
  button-default:
    backgroundColor: "transparent"
    textColor: "{colors.ash}"
    rounded: "{rounded.base}"
    padding: "0 24px"
    height: "44px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ash}"
    rounded: "{rounded.base}"
    padding: "0 12px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.bark-raised}"
  input:
    backgroundColor: "{colors.bark}"
    textColor: "{colors.birch}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
    height: "44px"
  pane:
    backgroundColor: "{colors.bark-raised}"
    rounded: "{rounded.base}"
  sample-tag:
    backgroundColor: "transparent"
    textColor: "{colors.sky}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
  section-tab:
    backgroundColor: "{colors.bark-raised}"
    textColor: "{colors.birch}"
    padding: "14px 16px"
  section-tab-active:
    backgroundColor: "{colors.bark}"
    textColor: "{colors.goldenrod}"
---

# Design System: Ganda ecommerce

## Overview

**Creative North Star: "The People's Catalog"**

Ganda reads like a mail-order catalog that its readers wrote themselves. Every listing is an entry filed under an open section: a framed photo at left, the name and price on one line, the seller's own words quoted beneath a fern-green rule, and a small line of facts. The page is dark woodland bark, flat and ruled with hairlines, so the only things that glow are goldenrod (what you can do: sell, add to cart, the price you pay) and fern (what the seller said).

Density is catalog density, not landing-page density. Sections stack one after another with a heading, their subsection links and four newest entries in a two-column list; there is no hero, no carousel and no uniform card grid. Structure comes from rules and alignment instead of boxes, and depth comes from two tonal steps of bark instead of shadows.

The interface type is Libre Franklin, heavy and tight at the top of the hierarchy and plain at body size. Bitter italic is reserved for one job: the seller's voice.

**Key Characteristics:**
- Dark, flat woodland ground with two tonal steps (bark, raised bark) and hairline rules.
- Goldenrod is the single act colour; fern is the seller's voice; ember, rust and sky are status only.
- Entries are rows in a ruled list, not cards.
- The quoted seller note with its green rule recurs on every surface that shows a listing.
- Square-ish 4px corners everywhere; 2px only on the tiny sample tag.

## Colors

A base16 woodland palette on dark bark, where colour is functional and every hue has one job.

### Primary
- **Goldenrod** (goldenrod): the act colour. Fills "Add your listing", "Add to cart" and every primary action; colours prices, the "All N in Section" links, the active section tab, focus outlines, text selection and the input caret.
- **Deep Goldenrod** (goldenrod-deep): hover state of goldenrod fills only.
- **Ink on Gold** (ink-on-gold): text on goldenrod fills; the same value as bark.

### Secondary
- **Fern** (fern): the seller's voice. The 1px left rule of every quote, the quote attribution, and the "ok" status dot and notice icon.

### Tertiary
- **Ember** (ember): errors, invalid fields, destructive buttons, "Out of stock".
- **Rust** (rust): low stock ("1 left", "Only 1 left") and the "warn" status dot.
- **Sky** (sky): the "Sample entry" outline tag on seeded data and the "info" status dot.

### Neutral
- **Bark** (bark): page ground, header, inputs, the active section tab.
- **Raised Bark** (bark-raised): panes, the section strip, footer, photo frames, the closing invite block, quiet-button hover.
- **Bark Rule** (bark-rule): every hairline and border; 2px under section headings.
- **Lichen** (lichen): secondary text: meta lines, subsection links, ledes, placeholders, hints, counts, placeholder icons; also the hover border on outlined controls.
- **Birch** (birch): body text and seller quotes.
- **Ash** (ash): headings, entry names, button labels, emphasized values.

### Named Rules
**The One Act Colour Rule.** Goldenrod means "you can act here" or "this is what it costs". Never use it for decoration, section headers at rest, or illustration.

**The Voice Is Green Rule.** Fern belongs to what sellers say. A green rule beside text means a seller wrote it; nothing else gets a green rule.

**The Status Hues Are Not Accents Rule.** Ember, rust and sky appear only as status: errors and sold, low stock and pending, samples and info.

## Typography

**Display Font:** Libre Franklin Variable (with Libre Franklin, system-ui, sans-serif)
**Body Font:** Libre Franklin Variable
**Voice Font:** Bitter italic 400 (with Georgia, serif)

**Character:** A sturdy, very heavy grotesque for the catalog's own voice, set tight like a printed header, against a warm slab italic that sounds like a person writing. The pairing separates who is talking: the store or the seller.

### Hierarchy
- **Display** (820, clamp 1.875rem to 2.5rem, 1.15, -0.03em): page titles ("Everything for sale"), product names on the product page, app and auth page titles.
- **Headline** (800, 1.625rem, 1.15, -0.025em): section headings on the home, the invite heading, the product page price.
- **Title** (750, 1.0625rem): entry names and entry prices; totals in cart, checkout and orders sit at 700.
- **Body** (400, 0.9375rem, 1.55): running text; ledes cap at 46ch, invite copy at 56ch, product quote at 60ch.
- **Voice** (italic 400, 0.9375rem, 1.55): seller quotes in entries and cart lines; 1.0625rem on the product page; 0.8125rem on phones under 520px.
- **Label** (600, 0.8125rem): field labels, status labels, "All N in Section" links, placeholder frame captions; meta lines and subsection links use the same size at 400 in lichen.

The wordmark is a one-off at 820, 1.5rem, -0.035em in ash.

### Named Rules
**The Bitter Is Only For Sellers Rule.** Bitter italic sets the seller's quoted words and nothing else. Interface copy, headings and the store's own explanations stay in Libre Franklin.

**The Tabular Money Rule.** Prices, counts and quantities use tabular figures.

## Layout

A centred page column (max 1360px) with a fluid gutter (clamp 16px, 4vw, 48px). Spacing runs on a 4px-based scale: 4, 8, 12, 16, 24, 32, 48, 72.

The home is filed by section. Under the sticky top bar (72px tall: wordmark, full-width search, account and cart, goldenrod "Add your listing") sits the section strip: a horizontally scrolling row of tabs with counts, separated by vertical hairlines. Then the page title with its lede on the right, then one block per section: heading, subsection links and an "All N in Section" link on a baseline row over a 2px rule, followed by the four newest entries in a two-column list (48px column gap) that collapses to one column under 1000px. Sections are 48px apart; the invite block sits 72px below the last one.

An entry is a two-column grid: a 4:3 photo frame (110 to 150px wide; 112px under 520px) and a body with 12px internal gap, 24px block padding and a hairline top border. On phones the name and price stack.

The product page is a two-column split (1.15fr media, 1fr info, 48px gap) with sticky media; it stacks under 860px. Checkout and order detail split into content and a sticky raised summary pane, stacking under 900px. Under 760px the header wraps: search drops to its own full-width row and "Add your listing" shortens to "Sell".

## Elevation & Depth

Flat. There are no drop shadows anywhere. Depth is two tonal steps: bark for the ground and raised bark for panes, the section strip, frames and the footer, each edged by a 1px bark-rule hairline. The only box-shadows in the system are state indicators: a 1px goldenrod ring that doubles a focused input's border, and a 2px inset goldenrod underline on the active section tab.

### Named Rules
**The Flat Bark Rule.** Surfaces never lift. If something needs to stand apart, move it one tonal step and give it a hairline.

## Shapes

Square-ish and quiet: 4px corners on buttons, inputs, panes, frames, notices and the invite block; 2px on the sample tag and focus outline; full circles only for 7px status dots. Borders are 1px hairlines in bark-rule; the section heading rule is the single 2px exception. Empty photo frames carry a faint 135-degree hatch (1px lines every 12px at 45% bark-rule) behind a lucide line icon for the subsection and its name.

## Components

### Buttons
Solid and plain; weight carries emphasis, not ornament.
- **Shape:** 4px corners, 44px minimum height, 24px horizontal padding, 600 weight.
- **Act (primary):** goldenrod fill and border, ink-on-gold text at 750. Hover darkens to deep goldenrod.
- **Default:** transparent with a bark-rule hairline and ash text; hover lifts the border to lichen.
- **Quiet:** no border, 12px padding; hover fills raised bark.
- **Danger:** default button with ember text.
- **Disabled:** 50% opacity, not-allowed cursor.
- **Motion:** colour, border and background transition over 160ms on cubic-bezier(0.16, 1, 0.3, 1).

### Chips (Sample entry tag)
- **Style:** inline outline tag, 1px sky border, sky text, 0.75rem at 600, 2px corners, 0 6px padding; leads the meta line of any seeded listing.
- **State:** static; it is a disclosure, never a filter.

### Status
A 7px dot before a 600-weight 0.8125rem ash label. Dot tone: fern ok, rust warn, ember bad, sky info, lichen neutral. Used for order and payment states.

### Cards / Containers
- **Pane:** raised bark, 1px bark-rule border, 4px corners, no shadow. Order summaries, payment panels, notices.
- **Invite block:** raised bark with 32px padding and no border; one per home page, closing the catalog.
- **Entries are not cards:** they are rows separated by hairlines.

### Inputs / Fields
- **Style:** bark fill, 1px bark-rule border, 4px corners, 44px min height, 10px 12px padding; placeholder in lichen; caret in goldenrod. Selects use a lichen chevron. Textareas start at 140px.
- **Hover:** border to lichen.
- **Focus:** border to goldenrod plus a 1px goldenrod ring, no outer glow.
- **Error:** ember border and an ember 0.8125rem message under the field; hints sit there in lichen.
- **Labels:** 0.8125rem, 600, ash, 4px above the control.

### Navigation
- **Top bar:** sticky, bark ground with a bottom hairline; the search is an outlined field that fills the free width and takes the goldenrod focus ring on focus-within.
- **Section strip:** raised bark band; each tab 14px 16px, 600 birch, with a lichen tabular count; hover moves to bark and ash; the current tab is bark with goldenrod text and a 2px inset goldenrod underline. Scrolls horizontally on narrow screens with no scrollbar.
- **Breadcrumbs:** 0.8125rem lichen links separated by slashes; ash and underlined on hover.
- **Footer:** raised bark band, 0.8125rem links, underline on hover.

### Seller Voice (signature)
The seller's note, quoted. A blockquote with 16px left padding and a 1px fern left rule, set in Bitter italic birch with curly quotes. An optional attribution under it in Libre Franklin 500, 0.8125rem, fern. It appears in catalog entries (truncated near 170 characters), on the product page at 1.0625rem, in cart lines, and in the Sell composer's live preview of the entry being written.

### Catalog Entry (signature)
Photo frame left; name (title, ash) and price (title, goldenrod, tabular, struck-through original in lichen) on one baseline row; seller voice; meta line in lichen: optional sample tag, "Sold by … · subsection · stock", where stock turns rust at three or fewer and ember at zero. Hovering the entry dims the photo to 85% opacity over 200ms; the name underlines on hover.

## Do's and Don'ts

### Do:
- **Do** file listings as ruled entries in a list, with the 4:3 frame at left and the seller voice beneath the name and price.
- **Do** keep goldenrod for actions and prices only; every surface should offer "Add your listing" in goldenrod.
- **Do** quote seller-written text in Bitter italic behind a 1px fern rule, everywhere a listing appears.
- **Do** separate with 1px bark-rule hairlines and tonal steps (bark to raised bark), never shadows.
- **Do** mark seeded or demo data with the sky "Sample entry" outline tag.
- **Do** draw a lucide line icon plus the subsection name in empty photo frames, over the faint hatch.
- **Do** keep controls at a 44px minimum height with 4px corners.

### Don't:
- **Don't** build a uniform product-card grid or a hero carousel; the catalog list is the identity.
- **Don't** use Bitter for interface copy, headings or the store's own voice.
- **Don't** add drop shadows, gradients or glows to surfaces; the only rings are focus and the active tab underline.
- **Don't** give anything but seller words a green rule, or use ember, rust or sky as decoration.
- **Don't** round corners past 4px or pill-shape buttons.
