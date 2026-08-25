## Why

The 2026-08-25 SEO audit of sociallama.pl found two defects worth fixing now
(a third — soft-404 statuses — is already solved on the
`fix-case-study-404-status` branch and its `fix-listing-route-404-status`
follow-up, see Impact). (1) Sitemap hreflang is **non-reciprocal**: only PL
entries carry alternates (92 of 338); every EN entry — and both sides of the
services/industries and case-study sections — has none, so Google drops the
whole annotation set and the EN locale is invisible as an alternate.
(2) Listing pages (`/blog`, `/case-studies`, `/kontakt` + EN twins) inherit the
root layout's whole Open Graph object (generic "Social Lama" title, root
`og:url`), and the home pages define `openGraph` without images, dropping
`og:image` entirely — every share of these pages degrades to a generic or
imageless card.

## What Changes

- `app/sitemap.ts` emits the same hreflang cluster on **both** halves of every
  PL↔EN pair: EN statics, EN posts, EN categories, careers EN, and the
  currently bare case-study and services/industries section entries. Blog
  pagination stays bare (locale page sets differ — deliberate). The home
  cluster's `https://…pl/` trailing-slash form is normalized to match its
  `<loc>`/canonical.
- Listing pages get page-specific Open Graph (own title, own `og:url`, brand
  `og:image`) via the existing `pairMetadata` builder; the PL and EN home pages
  keep their bespoke OG but regain `url` and the brand image.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-i18n`: sitemap hreflang clusters SHALL be reciprocal — every URL in a
  PL↔EN pair lists the same alternates, in both locales' entries (new
  requirement).
- `site-metadata`: hub/listing pages SHALL ship shareable page-specific Open
  Graph cards; home documents SHALL include the brand `og:image` (new
  requirement).

## Impact

- `app/sitemap.ts`: alternates on EN/section/case-study entries (reverse
  EN→PL slug maps already derivable from the queries it makes).
- `app/(frontend)/{blog,case-studies,kontakt}/page.tsx`,
  `app/(frontend-en)/en/{blog,case-studies,contact}/page.tsx`: metadata swaps
  to `pairMetadata`; `app/(frontend)/(home)/page.tsx` + `app/(frontend-en)/en/page.tsx`:
  OG `url` + `images`.
- **Soft-404s are explicitly out of scope here.** The detail routes (posts,
  case studies, both locales) are fixed and prod-build-verified on branch
  `fix-case-study-404-status` (`bb705fe6`, awaiting merge); the four listing
  routes are captured in its follow-up proposal
  `fix-listing-route-404-status` — the layout-gate mechanism provably does not
  transfer to them (see that branch's `design.md` and the `AGENTS.md` "Route
  status vs `loading.tsx`" note it adds).
- No schema/DB changes; no migration. After deploy, re-run the audit probes
  (sitemap reciprocity count, OG tags on listings and home).
