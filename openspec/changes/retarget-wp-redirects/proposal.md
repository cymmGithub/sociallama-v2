# Retarget legacy WP redirects to fragment-free routes

## Why

The committed WP redirect map (`lib/wp-redirects.ts`, 2026-07-17) still points eight rules at homepage anchors (`/#uslugi`, `/#o-nas`), which crawlers read as plain `/` — the redirect equity consolidates into the homepage instead of the intended sections. Board decision 2026-08-04: retarget to real, fragment-free routes. (An earlier same-day revision of this change built six dedicated `/uslugi/*` platform pages as targets; the board dropped that idea later the same day — the legacy offer URLs consolidate into the services hub instead.)

## What Changes

- Retarget in the generator's dispositions and regenerate `lib/wp-redirects.ts`:
  - `/oferta` and `/oferta/{facebook,instagram,linkedin,tiktok,twitter,pinterest}` → `/uslugi` (was `/#uslugi`)
  - `/500-zl-na-reklame` → `/uslugi` (was `/#uslugi`)
  - `/z-lama-warto` → `/o-nas` (was `/#o-nas`)
  - No redirect destination may carry a URL fragment.
- Move the generator's report path out of the archived `migrate-wp-content` change dir (report follows the change that owns the current disposition revision).
- Unchanged: `/tag/:slug → /blog`, `/cookie-policy → /polityka-prywatnosci`, `statusCode: 301` throughout, 11 rules total.
- The six live WP `/oferta/*` pages' text is captured under `copy-sources/` — the WP host disappears at cutover, so the content is preserved for any future revisit; no pages are built now.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `seo-url-parity`: page redirect targets SHALL be dedicated fragment-free v2 routes; dispositions for `/oferta*`, `/500-zl-na-reklame`, and `/z-lama-warto` change accordingly.

## Impact

- `lib/scripts/generate-wp-redirects.ts` (disposition table) + regenerated `lib/wp-redirects.ts` consumed by `next.config.ts`.
- Parity gate must stay green: every retargeted source 301s to a page resolving HTTP 200.
- No content-module, routing, menu, sitemap, or Payload changes.
