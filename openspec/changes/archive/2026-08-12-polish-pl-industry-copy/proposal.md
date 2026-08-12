# polish-pl-industry-copy

## Why

The Polish locale mixes English into its industry surfaces: four of the twelve canonical industry labels are English (Automotive, Health, Fashion, Petcare), so the overlay menu, footer OFERTA column and `/branze` hub read as a PL/EN jumble, and several PL industry pages carry standalone English phrases in their copy („Thought leadership" as a Finanse pillar, „Community" chips/marquee entries, „Branża health wymaga…"). The EN locale is clean; the fix is PL-side only.

The rule is **soft, not blanket** (user decision 2026-08-12): translate what has a natural Polish name; keep entrenched loanwords and terms of art that Polish marketing actually uses (Beauty, Horeca, B2B, fintech, storytelling, content, influencer marketing).

## What Changes

- Rename four PL industry labels in the canonical module (`lib/content/branze.ts`): Automotive → **Motoryzacja**, Health → **Zdrowie**, Fashion → **Moda**, Petcare → **Zoologiczna**. Beauty and Horeca stay (entrenched terms); the other six are already Polish. Slugs, routes and EN labels are untouched — no redirects, no URL changes.
- The renames flow automatically into every derived surface (menu BRANŻE column, footer OFERTA, `/branze` hub cards, industry page headings, sitemap labels) because all derive from the one module.
- Align the four industries' meta titles/descriptions with the renames („Social media dla branży motoryzacyjnej / zdrowotnej / modowej / zoologicznej") and fix in-copy references („Branża health wymaga…" → „Branża zdrowotna wymaga…").
- Replace standalone English phrases in PL industry copy: „Thought leadership" → „Budowanie pozycji eksperta", „Community" (chips/marquee, Petcare + Rozrywka) → „Społeczność", „Community marketing" → „Marketing społeczności", „Trend-driven content" → „Content oparty na trendach". Terms of art stay (Social commerce, Influencer marketing, UGC, Lookbook, Drop, Wellbeing, fintech, B2B & B2C).
- Update the three specs that hardcode the canonical label list (`branze-pages`, `site-nav`, `industries-hub`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `branze-pages`: the canonical industry list requirement's PL labels change for four industries; adds a requirement that PL industry copy carries no standalone English phrases (soft rule — entrenched loanwords permitted).
- `site-nav`: the menu overlay's BRANŻE column enumeration updates to the new PL labels.
- `industries-hub`: the poster-card canonical-order scenario updates to the new PL labels.

## Impact

- `lib/content/branze.ts` only — labels, meta titles/descriptions, pillars/chips/marquee entries, brief copy for the four renamed industries plus the Finanse/Rozrywka phrase fixes. `branze.en.ts`, slugs, `pairSlug` mapping, and all homepage content (`home.ts` — including the „Strategy that works" slogan, which is brand voice and off-limits) are untouched.
- Services list (`uslugi.ts` labels: Content, Influencer marketing) deliberately unchanged — entrenched terms under the soft rule, and they double as page names.
- New Polish copy must pass the static orphan audit (single-letter words get ` ` per house style).
- SEO surface: title-tag wording changes for four industries on a pre-launch domain; URLs unchanged.
