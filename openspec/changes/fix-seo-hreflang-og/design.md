## Context

Audit evidence (2026-08-25, prod, re-verified with a strict XML parse and
complete fetches):

- Sitemap: 92/338 url-blocks carry hreflang (PL halves of statics, careers,
  posts-with-EN, categories). Zero EN entries, zero case-study entries, zero
  services/industries section entries carry any. Google requires return links;
  a one-sided cluster is dropped entirely.
- OG: `/blog`, `/case-studies`, `/kontakt` (+ EN twins) export metadata without
  `openGraph`, inheriting the root layout's whole og object (title "Social
  Lama", `og:url` = locale root). Home pages define `openGraph` without
  `images`/`url` — page-level `openGraph` replaces the layout object outright
  (documented in `lib/utils/metadata.ts`), so home ships **no og:image**.
  `pairMetadata` in the same file already solves exactly this for services/
  industries/careers pages.

The audit's third finding (soft-404 statuses) is handled outside this change:
branch `fix-case-study-404-status` gates the four detail routes via sibling
`layout.tsx` (prod-build verified), and `fix-listing-route-404-status` carries
the still-open listing routes. This change must not touch `loading.tsx`,
route layouts, or `staticParamsOrPlaceholder`.

## Goals / Non-Goals

**Goals:**
- Reciprocal hreflang clusters across the whole sitemap; alternates on both
  halves of every PL↔EN pair including sections and case studies.
- Page-specific OG (title, url, brand image) on hub/listing pages; brand
  og:image restored on both home documents.

**Non-Goals:**
- HTTP status fixes of any kind (owned by the two 404 changes above).
- Category pages keep their deliberate no-OG stance (`categoryMetadata`).
- Blog pagination entries stay without alternates (locale page sets differ).
- Sitemap `lastmod` accuracy (separate audit finding, not in this change).
- On-page `<link rel="alternate">` tags — the sitemap remains the single
  hreflang channel (Google needs one complete method, not two).

## Decisions

**D1 — Sitemap reciprocity by construction, not by duplication.** Extend
`app/sitemap.ts` so the *pair* is computed once and both entries spread the
same `alternates` object: EN statics/careers reuse the pair's `languagesFor`;
EN posts/categories get reverse maps (PL slug by post/category id — the
queries already fetch both locales); case-study entries share one cluster per
slug (same slug both locales); section routes build clusters from
`item.slug`/`item.pairSlug`. A PL post without an EN twin keeps no alternates
(unchanged D6 gate). Normalize `languagesFor('/')` to emit `APP_BASE_URL`
without trailing slash so the home cluster matches its `<loc>` and canonical.

**D2 — OG via the existing builder, not new plumbing.** Swap the three PL
listing pages + three EN twins to `pairMetadata({title, description, path})` —
it already restates the brand image, sets `og:url`, and resolves hreflang
`alternates` from the slug table (a bonus: listing pages gain on-page
canonical/alternates consistency with zero new code). Home pages keep their
bespoke OG copy; add `url` and the brand `images` entry to both.

## Risks / Trade-offs

- [Sitemap grows ~250 alternate clusters] → trivial size; still one fetch,
  well under 50k URLs.
- [`pairMetadata` also changes listing pages' `alternates` shape] → it resolves
  from the same slug table their current `alternatesForPath` calls use; verify
  canonical output byte-for-byte in the checks below.
- [Merge order with `fix-case-study-404-status`] → no file overlap
  (`sitemap.ts` + page metadata here; route layouts there); either order
  merges clean.

## Migration Plan

Normal Vercel build — no data changes. Post-deploy: re-run the audit probes
(sitemap with/without-hreflang block count — expect ~0 unpaired halves; OG tags
on listings + home). Rollback = revert the commit.

## Open Questions

None.
