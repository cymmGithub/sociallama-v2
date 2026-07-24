# Mobile menu simplification + viewport fix

**Date:** 2026-07-24
**Surface:** `components/layout/header/*`, `lib/content/home.ts`, `lib/content/home.en.ts`

## Problem

The full-screen menu overlay is unusable on real phones: the bottom rows
(utility links, PL/EN toggle, socials) are unreachable or cut off. Two distinct
causes, addressed separately:

1. **Viewport bug (root cause).** `.overlay` is `position: fixed; inset: 0` with
   `.overlayInner { min-height: 100% }`. On mobile that sizes to the *large*
   viewport (URL bar hidden), so the panel extends below the visible area and,
   because content fits within `min-height`, there is nothing to scroll to. The
   bottom is physically off-screen behind browser chrome. This bug exists
   regardless of item count.
2. **Too much content on mobile.** 12 industries + 7 services + utility +
   socials is more than a phone screen should carry.

## Decisions (confirmed with user)

- Trim is **mobile-only**; desktop keeps the full menu unchanged.
- **USŁUGI** mobile set: Content · Sprzedaż · Kreacje & Wideo, + "More" → `/uslugi`.
- **BRANŻE** mobile set: Automotive · Elektronika i AGD · Beauty · Fashion ·
  Health, + "More" → `/branze`.
- **Socials** removed from the menu overlay entirely (all sizes); still present
  in footer/hero.
- Services "More" points at `/uslugi` even though the route does not exist yet —
  consistent with the existing USŁUGI links, which are accepted interim 404s
  (`home.ts:150`). Slug is final; the page drops in later with no menu change.
- EN mirrors PL: "More" → `/en/industries` and `/en/services`.

## Design

### Part 1 — Viewport fix (all sizes, both locales)
`header.module.css`:
- `.overlay`: replace the `inset: 0`-derived height with an explicit
  `height: 100dvh` (keep `top/left/right: 0`, keep `overflow-y: auto`). `dvh`
  (not `svh`) because the overlay locks scroll while open, so the URL bar can't
  change mid-view — `dvh` is stable and gap-free.
- `.overlayInner`: add `env(safe-area-inset-bottom)` to the bottom padding so the
  last row clears the home-indicator.

### Part 2 — Mobile trim (pure CSS, mobile-first, no JS)
Types (`home.ts`):
- `MenuItem` gains optional `mobileHidden?: boolean`.
- `MenuColumn` gains optional `more?: MenuItem`.

Content (`home.ts` + `home.en.ts`):
- BRANŻE: map `industryNav`, flagging the 7 non-core industries `mobileHidden`;
  add `more` → `/branze` (PL) / `/en/industries` (EN). Core membership is matched
  by slug, but the slug set is **per-locale** — PL uses `automotive`,
  `elektronika-i-agd`, `beauty`, `fashion`, `health`; EN uses `automotive`,
  `electronics`, `beauty`, `fashion`, `health` (the two locales have different
  industry slugs). Each content file declares its own core set.
- USŁUGI: flag Strategia · Audyt i konsultacje · Influencer marketing ·
  Szkolenia i kursy `mobileHidden`; add `more` → `/uslugi` (PL) /
  `/en/services` (EN).

Render (`header/index.tsx`):
- Each item `<li>` gets `data-mobile-hidden` when `item.mobileHidden`.
- After each column's `<ul>`, render `column.more` (when present) as a
  `<li class={s.moreItem}>` link.
- Extend the `--i` stagger cursor to account for the extra "More" node so the
  open-cascade delays stay ordered.

CSS (`header.module.css`), using the existing `@custom-media --mobile`
(`≤799.98px`):
- `@media (--mobile) { li[data-mobile-hidden] { display: none } }`
- `.moreItem { display: none }` by default; `@media (--mobile) { .moreItem { display: block } }`
- Desktop output is unchanged.

### Part 3 — Remove socials from the menu
`header/index.tsx`:
- Delete the `.socials` `<ul>` block (currently ~lines 252–272).
- Remove the now-unused `socials` import.

`header.module.css`:
- Remove the orphaned `.socials`, `.social`, `.socialIcon` rules (used only by
  the menu overlay).

## Out of scope
- Building the `/uslugi` (and `/en/services`) hub pages.
- Any change to desktop menu content, footer, or hero socials.

## Verification
- Playwright at a phone viewport (e.g. 390×844) with the URL-bar height
  simulated: open the menu, confirm the "More" links and PL/EN toggle are
  visible and clickable, and that BRANŻE shows 5 + More, USŁUGI shows 3 + More,
  no socials.
- Desktop (≥800px): full 12 + 7 lists, no "More" links, no socials.
- Biome + `tsc` clean.
