## 1. Sitemap hreflang reciprocity

- [ ] 1.1 Rework `app/sitemap.ts` per design D1: shared cluster on both halves
  of statics + careers; reverse EN→PL maps for posts and categories; clusters
  on case-study and services/industries entries via slug/pairSlug; pagination
  stays bare; normalize the home cluster's trailing slash.
- [ ] 1.2 Verify on a production build: fetch `/sitemap.xml`, assert zero
  url-blocks that name a pair partner without carrying the cluster (XML-parse
  count: with-hreflang blocks ≈ all paired URLs, EN included; untranslated PL
  posts bare; home hrefs byte-match their `<loc>`).

## 2. Open Graph on listings and home

- [ ] 2.1 Swap `/blog`, `/case-studies`, `/kontakt` + EN twins (`en/blog`,
  `en/case-studies`, `en/contact`) metadata to `pairMetadata`; keep
  titles/descriptions identical to today's.
- [ ] 2.2 Add `url` + brand `images` to the bespoke `openGraph` of
  `(home)/page.tsx` and `en/page.tsx`.
- [ ] 2.3 Verify raw HTML of all eight documents: page-specific
  `og:title`/`og:url`, brand `og:image` present; canonicals unchanged;
  category pages unchanged (no OG).

## 3. Ship checks

- [ ] 3.1 `bun run check` (lint + types) and the test suite; revert the
  `importMap.js` noise if the build dirties it (known local-build artifact).
- [ ] 3.2 E2E suite (worktree port config per `.worktree-meta.json` if
  applicable).
- [ ] 3.3 After deploy: re-run the audit probes against prod in a fresh browser
  context (sitemap reciprocity count, OG tags on listings + home).
