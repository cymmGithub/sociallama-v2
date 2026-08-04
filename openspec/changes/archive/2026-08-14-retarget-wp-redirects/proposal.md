# Retarget legacy WP redirects to fragment-free routes

## Why

The committed WP redirect map (`lib/wp-redirects.ts`, 2026-07-17) pointed eight rules at homepage anchors (`/#uslugi`, `/#o-nas`), which crawlers read as plain `/` — the redirect equity consolidates into the homepage instead of the intended sections. Board decision 2026-08-04: retarget to real, fragment-free routes. (An earlier same-day revision of this change built six dedicated `/uslugi/*` platform pages as targets; the board dropped that idea later the same day.)

Scope narrowed 2026-08-14: `seo-uslugi-branze` shipped first and retargeted the six `/oferta/{platform}` URLs at `/uslugi/prowadzenie-social-media` — a fragment-free target, and a closer content successor than the hub, which removes the per-platform relevance loss this change had accepted. Three anchor targets were left untouched by it, and they are what remains here.

## What Changes

- Retarget the last three anchor destinations, in the generator's dispositions and in the committed module together:
  - `/oferta` → `/uslugi` (was `/#uslugi`)
  - `/500-zl-na-reklame` → `/uslugi` (was `/#uslugi`)
  - `/z-lama-warto` → `/o-nas` (was `/#o-nas`)
  - After this, no redirect destination carries a URL fragment.
- Move the generator's report path out of the archived `migrate-wp-content` change dir to `docs/wp-page-disposition.md` — a stable location, so it cannot rot into another archived directory the next time a change owns the dispositions.
- Unchanged: the six `/oferta/{platform}` rules (owned by `seo-uslugi-branze`), `/tag/:slug → /blog`, `/cookie-policy → /polityka-prywatnosci`, `statusCode: 301` throughout, 11 rules total.
- The six live WP `/oferta/*` pages' text is captured under `copy-sources/` — the WP host disappears at cutover, so the content is preserved for any future revisit; no pages are built now.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `seo-url-parity`: no redirect destination may carry a URL fragment; dispositions for `/oferta`, `/500-zl-na-reklame` and `/z-lama-warto` change accordingly. The `/oferta/{platform}` requirement added by `seo-uslugi-branze` is left alone.

## Impact

- `lib/scripts/generate-wp-redirects.ts` (disposition table) + regenerated `lib/wp-redirects.ts` consumed by `next.config.ts`.
- Parity gate must stay green: every retargeted source 301s to a page resolving HTTP 200.
- No content-module, routing, menu, sitemap, or Payload changes.
