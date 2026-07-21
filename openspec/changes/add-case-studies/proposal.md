## Why

The site has a "Case study" CTA on every client hover-card in the ZAUFALI NAM belt that deliberately links nowhere (`clientCardCta` in `home.ts`). We have three real case studies (iRobot, Pracuj.pl, Volvo) to publish. A dedicated Case Studies segment turns those dead buttons into destinations and adds rich, structured, keyword-relevant pages — the primary goal is SEO growth.

## What Changes

- New Payload **`case-studies` collection** mirroring the blog `posts` pattern (CMS-editable, drafts/published, `seo` group).
- **`/case-studies`** listing page (blog-style cards) and **`/case-studies/[slug]`** detail pages (`irobot`, `pracuj-pl`, `volvo`).
- Detail template with semantic sections: hero (client, tags, period), Wyzwanie, Podejście, Wyniki (per-platform metric tiles), Galeria, CTA.
- **SEO**: per-study metadata (title/description/canonical/OG), **JSON-LD `Article` + `BreadcrumbList`** (new to the site — the blog has none today), dynamic sitemap entries, breadcrumbs, internal links; a `/seo-audit` pass after build.
- Seed the three studies from the source PDFs (text + slide images rendered to web assets).
- **Deferred** (separate follow-up after `polish-homepage` merges): wire `home.ts` clients to their case-study slugs so the CTA links through instead of showing the tooltip.

## Capabilities

### New Capabilities
- `case-studies`: the Case Studies collection, its listing and detail routes, the detail-page rendering, and its SEO surface (metadata, JSON-LD, sitemap inclusion).

### Modified Capabilities
<!-- none — sitemap/JSON-LD for case studies are covered under the new capability -->

## Impact

- **Payload**: new `lib/payload/collections/case-studies.ts`; register it in `payload.config.ts`; generate a migration (run `--prod` at merge). Reuses the existing `media` collection.
- **Routes**: `app/(frontend)/case-studies/` (listing + card + `[slug]` detail + template); add the listing to `lib/static-routes.ts`; extend `app/sitemap.ts` with published case studies.
- **Queries**: add case-study fetchers to `lib/payload/queries.ts` (list, by-slug, for-sitemap), wrapped in React `cache()` per the use-cache convention.
- **Assets**: slide images extracted from the 3 PDFs into `public/case-studies/…` (or the `media` collection).
- **Deferred**: `lib/content/home.ts` (`clientCardCta` + client→slug) — a small change owned by `polish-homepage` this round, done after it merges.
- **Sequencing / DB**: built after `polish-homepage` + `good-one-orbit` merge and their tabs close, so the new collection's dev schema-push doesn't thrash the shared Neon dev DB. Own worktree; shared dev DB safe by then.
