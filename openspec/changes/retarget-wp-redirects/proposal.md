# Retarget legacy WordPress redirects to dedicated pages

## Why

The committed WP redirect map (`lib/wp-redirects.ts`, generated 2026-07-17) predates the dedicated `/uslugi` and `/o-nas` pages: eight rules still point at homepage anchors (`/#uslugi`, `/#o-nas`). Google ignores URL fragments in redirect targets — for crawlers those redirects are just `/` — so the current map consolidates the old offer/why-us pages' equity into the homepage instead of the closest surviving equivalents, and human visitors land mid-scroll on the homepage rather than on a full page about the thing they searched for.

## What Changes

- Retarget in the generator's dispositions (`lib/scripts/generate-wp-redirects.ts`), then regenerate `lib/wp-redirects.ts`:
  - `/oferta` and `/oferta/{facebook,instagram,linkedin,tiktok,twitter,pinterest}` → `/uslugi` (was `/#uslugi`)
  - `/500-zl-na-reklame` → `/uslugi` (was `/#uslugi`)
  - `/z-lama-warto` → `/o-nas` (was `/#o-nas`)
- Unchanged: `/tag/:slug → /blog` blanket rule, `/cookie-policy → /polityka-prywatnosci`, `statusCode: 301` throughout.
- No redirect target may carry a URL fragment from now on — targets are dedicated routes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `seo-url-parity`: page redirects with a v2 equivalent SHALL target a dedicated v2 route (no homepage-anchor/fragment targets); the recorded dispositions for `/oferta*`, `/500-zl-na-reklame`, and `/z-lama-warto` change accordingly.

## Impact

- `lib/scripts/generate-wp-redirects.ts` — disposition table (source of truth).
- `lib/wp-redirects.ts` — regenerated artifact consumed by `next.config.ts` `redirects()`.
- SEO only in the positive direction: same 301 semantics, more relevant targets. No route, schema, or content changes; shared dev DB untouched.
- The parity gate (sitemap-driven check) must stay green — every retargeted source still 301s to a resolving 200 target.
