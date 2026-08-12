# fix-footer-reveal-overflow

## Why

On MacBook-sized windows the footer's OFERTA column renders as one 12-row list, which makes the footer taller than the viewport — and the sticky-bottom reveal then pins the footer's *bottom* to the viewport, pushing the SOCIAL LAMA wordmark up under the fixed header. Reproduced in both Chromium and WebKit at 1440×760 and 1280×715 (wordmark top y=49 under a header ending at y=85): the bug is window-geometry-dependent, not Safari-specific, and 1440×760 is simply what a default Safari window on a 1440×900 MacBook gives the page.

Two mechanisms stack:

1. The OFERTA sub-column flow (`repeat(auto-fill, minmax(11rem, 1fr))`) needs ~384px, but the column's `1.5fr` track only reaches that above a ~1663px viewport — so on every common laptop width the 12 industries stack in one tall column. The current spec documents this as an accepted tradeoff; the accepted tradeoff is what breaks the reveal.
2. The reveal (`position: sticky; bottom: 0; min-height: 100dvh`) silently assumes footer content fits one viewport. When it doesn't, a sticky-bottom element taller than the viewport necessarily pokes above the top edge; nothing degrades.

## What Changes

- Rework the footer's ≥1200px band so the OFERTA column reaches two sub-columns at common laptop widths (~1280–1512px viewport) instead of only above ~1663px — by rebalancing the five-track split and/or lowering the sub-column floor. Labels stay untruncated; whether the longest label („Nieruchomości i Deweloperzy") may wrap to two lines is a design decision recorded in design.md.
- Add a defensive rule so the sticky reveal can never slide footer content under the header: when the footer cannot fit the viewport height, the reveal degrades to normal in-flow rendering (or the footer sheds enough height to fit) rather than overlapping fixed chrome.
- **BREAKING** (spec-level): replaces the site-footer requirement clause that declared two sub-columns at mid-range desktop widths explicitly not required.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-footer`: the "Footer grid adapts across three bands" requirement changes — OFERTA must reach two sub-columns at common laptop widths in the five-track band. A new requirement is added: the desktop reveal must never place footer content under the fixed header; it degrades safely when footer content is taller than the viewport.

## Impact

- `components/layout/footer/footer.module.css` — the `.body` track split at ≥1200px, the `.links[data-cols="2"]` sub-column floor, and the `.footer` desktop reveal block (`position: sticky` / `min-height: 100dvh`).
- No markup, content, or data changes expected (`components/layout/footer/index.tsx` untouched unless the degrade rule needs a measured gate).
- Both locales inherit the fix (EN labels are shorter than PL, so PL is the sizing constraint).
- Verification: Playwright probes in Chromium + WebKit at 1280×715, 1440×760, 1440×815, 1728×1085 — two OFERTA sub-columns at laptop widths, and no wordmark/header overlap at any of them.
