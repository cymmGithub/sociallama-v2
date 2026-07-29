## Why

`/branze` and `/en/industries` are linked from the mobile overlay menu but were never built, so both 404. The repo has carried this as tracked debt — `PENDING_PAGES` in `e2e/locale-routing.e2e.ts` skips them and `hasIndex: false` in `lib/i18n/slug-map.ts` keeps the locale toggle from aiming at the dead pair.

The fix is not to delete the links. On mobile the overlay menu is deliberately truncated — `MOBILE_BRANZE_SLUGS` trims BRANŻE from 12 items to 6 and the USŁUGI column from 7 to 3 — so the mobile-only `more` link is the only affordance that reaches the hidden items. Desktop lists everything and needs no hub. That makes the hub pages genuinely load-bearing on mobile and redundant everywhere else, which settles both open questions at once: build the missing industries hub, and stop surfacing hub links outside the mobile menu.

The footer follows from the same reasoning. Today its NAWIGACJA column spends a slot on `USŁUGI → /uslugi` while the seven service pages — the pages actually worth linking — appear nowhere in the footer at all.

## What Changes

- **New `/branze` and `/en/industries` index pages**, mirroring the shipped `/uslugi` hub: plum hero (section label, title, intro) over a cream card grid, one card per industry. Cards reuse the existing `label` and `tagline` fields, so no new per-industry copy is written — only a `chrome.index` block (title, intro, cardCta) per locale.
- **Footer gains a USŁUGI / SERVICES column** between NAWIGACJA and OFERTA, listing the seven service detail pages. The desktop grid goes from four tracks to five, rebalanced to protect OFERTA's two-column industry list.
- **Footer NAWIGACJA drops its hub link** — `USŁUGI → /uslugi` (PL) and `SERVICES → /en/services` (EN). Hub pages are reachable from the mobile overlay menu only.
- **Hub `more` links keep their destinations** and now resolve in both locales. No menu link 404s.
- **Pending-page bookkeeping is cleared**: `hasIndex` flips to `true` for the industries pair, `PENDING_PAGES` is deleted, and both index URLs join the sitemap.
- EN chrome still omits BLOG — `/en/blog` does not exist and is out of scope here.

## Capabilities

### New Capabilities

- `industries-hub`: the `/branze` and `/en/industries` index pages — route, layout, card data source, localized metadata, and sitemap presence.
- `site-footer`: the footer's column inventory, the rule that hub links live only in the mobile menu, and the responsive grid that carries five desktop tracks.

### Modified Capabilities

- `branze-pages`: the industries index now exists, so the "every industry resolves" requirement extends to the index route and the sitemap requirement extends to both index URLs.
- `site-nav`: the overlay menu's mobile-only `more` links are specified, and both are required to resolve rather than being allowed to 404.
- `site-i18n`: the locale toggle maps `/branze` ↔ `/en/industries` as an index pair instead of falling back to locale home.

## Impact

**New files**
- `app/(frontend)/branze/page.tsx`, `app/(frontend)/branze/industries-index.tsx`, `app/(frontend)/branze/index.module.css`
- `app/(frontend-en)/en/industries/page.tsx`

**Modified**
- `lib/content/branze.ts`, `lib/content/branze.en.ts` — add `chrome.index`; parity is enforced by `LocalizedBranze`
- `lib/content/home.ts`, `lib/content/home.en.ts` — footer column restructure
- `components/layout/footer/footer.module.css` — 4 → 5 desktop grid tracks
- `lib/i18n/slug-map.ts` — `hasIndex: true` for the industries pair
- `app/sitemap.ts` — add `/branze` and `/en/industries`
- `lib/i18n/slug-map.test.ts` — index-pair expectations
- `e2e/locale-routing.e2e.ts` — remove `PENDING_PAGES`, add the index pair to the toggle sweep

**Not affected**
- `lib/wp-redirects.ts` — its `/oferta` rules target the `/#uslugi` homepage anchor, not the hub
- `/uslugi` and `/en/services` hub pages — kept as-is, only their inbound footer links change
- All 24 `/branze/*` and `/en/industries/*` detail routes — unchanged
