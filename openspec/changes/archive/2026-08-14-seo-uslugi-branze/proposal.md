# Proposal: seo-uslugi-branze

## Why

Senuto data (2026-08) shows the domain's only strong commercial ranking is
`agencja social media` (#1, ~1/3 of all organic traffic) — while the
highest-value keyword cluster in the niche, "prowadzenie/obsługa social media"
(~2 400 searches/mo combined, CPC 4–13 zł, transactional intent), has no
targeting page at all on either the live site or v2. The service and industry
pages v2 ships carry brand-language titles that no one searches for, and the
`/oferta/*` legacy redirects dump ranking commercial URLs onto a homepage
anchor. v2 is not yet in production, so every fix here ships with the launch
at zero migration risk.

## What Changes

- New SEO landing page at `/uslugi/prowadzenie-social-media` (EN twin
  `/en/services/social-media-management`) targeting the
  "prowadzenie/obsługa social media" + "cennik" keyword cluster, with a
  concrete pricing section and page-level FAQ + FAQ JSON-LD. The page is
  **outside the main navigation** (no menu, hero-rotator, or homepage
  services-tab entry) — user decision 2026-08-14.
- Demand-phrase titles/meta descriptions on three existing service pages:
  `audyt-i-konsultacje` ("Audyt social media…"), `kampanie-reklamowe`
  ("Kampanie reklamowe w social media…"), `influencer-marketing`
  ("Agencja influencer marketingu…"). Metadata only; no layout changes.
- Demand-phrase titles/meta + one intent-matching lead paragraph on two
  industry pages: `hotele-i-miejsca-wypoczynkowe` (marketing hotelu) and
  `nieruchomosci-i-deweloperzy` (marketing nieruchomości). The other ten
  industries are untouched (no measurable search demand).
- The six `/oferta/<platform>` legacy redirects retarget from `/#uslugi` to
  the new landing (their content successor; old `/oferta/facebook/` still
  ranks #10 for "obsługa facebooka", a cluster member).
- Internal links to the landing: from the `/uslugi` index and from the
  homepage FAQ pricing answer.

## Capabilities

### New Capabilities

- `seo-service-landing`: the `/uslugi/prowadzenie-social-media` landing —
  routes in both locales, cluster-targeted content structure (scope, pricing
  with a concrete figure, page FAQ), FAQ structured data, exclusion from
  primary navigation, and the internal links that make it non-orphaned.

### Modified Capabilities

- `services-pages`: the "Localized SEO surface for service pages" requirement
  gains demand-phrase title/description mandates for the audit, ad-campaigns,
  and influencer-marketing pages.
- `branze-pages`: the "Localized SEO surface for industry pages" requirement
  gains demand-phrase title/description (and intent lead) mandates for the
  hotels and real-estate pages; copy remains user-approved per the existing
  requirement.
- `seo-url-parity`: the `/oferta/*` redirect mapping requirement changes
  target from `/#uslugi` to the new landing.

## Impact

- `lib/content/uslugi.ts` + `uslugi.en.ts` (new entry, flagged out-of-nav),
  `app/(frontend)/uslugi/[slug]` routing surface (new slug), menu/home
  surfaces must NOT pick the new entry up.
- Metadata blocks of three service and two industry content entries
  (PL + EN twins for parity).
- `lib/wp-redirects.ts` (six destination changes).
- Homepage FAQ pricing answer (link added), `/uslugi` index listing.
- Tests: `locale-parity`, `orphan-coverage` must pass with the new entry;
  redirect e2e (if present) updated for new targets.
- Draft PL/EN copy is written in this change but requires content-team
  approval before launch (consistent with existing copy-approval requirements).
