## 1. Sitemap hreflang reciprocity

- [x] 1.1 Rework `app/sitemap.ts` per design D1: shared cluster on both halves
  of statics + careers; reverse EN→PL maps for posts and categories; clusters
  on case-study and services/industries entries via slug/pairSlug; pagination
  stays bare; normalize the home cluster's trailing slash.
- [x] 1.2 Verify on a production build: fetch `/sitemap.xml`, assert zero
  url-blocks that name a pair partner without carrying the cluster (XML-parse
  count: with-hreflang blocks ≈ all paired URLs, EN included; untranslated PL
  posts bare; home hrefs byte-match their `<loc>`).

## 2. Open Graph on listings and home

- [x] 2.1 Swap `/blog`, `/case-studies`, `/kontakt` + EN twins (`en/blog`,
  `en/case-studies`, `en/contact`) metadata to `pairMetadata`; keep
  titles/descriptions identical to today's.
- [x] 2.2 Add `url` + brand `images` to the bespoke `openGraph` of
  `(home)/page.tsx` and `en/page.tsx`.
- [x] 2.3 Verify raw HTML of all eight documents: page-specific
  `og:title`/`og:url`, brand `og:image` present; canonicals unchanged;
  category pages unchanged (no OG).

## 3. Ship checks

- [x] 3.1 `bun run check` (lint + types) and the test suite; revert the
  `importMap.js` noise if the build dirties it (known local-build artifact).
  - `bun run check` exit 0 — 698 tests pass, 0 fail; COMPONENTS.md up to date.
    Biome's 5-file internal panic is the pre-existing condition (exit 0).
    `importMap.js` was dirtied by the e2e run and has been reverted.
- [x] 3.2 E2E suite (worktree port config per `.worktree-meta.json` if
  applicable). Ran on :3007 — **86 passed, 3 failed, all 3 pre-existing**:
  `case-study.e2e.ts` (PL + EN) and `sitemap-crawl.e2e.ts`. All three fail with
  the same signature — `400 (Bad Request)` on media — and **all three reproduce
  with this change fully reverted** (verified by patching the diff out and
  re-running). Root cause is the `relaxed` limiter in `lib/utils/rate-limit.ts`
  (60 req/60s on `api:*`): one media-heavy page exceeds it locally, and
  `/_next/image` surfaces the upstream 429 as a 400. Not a flake — deterministic
  locally. The sitemap's `<loc>` count is **176 before and after** this change
  (only `xhtml:link` alternates were added), so the crawl's workload is
  unchanged.
- [ ] 3.3 After deploy: re-run the audit probes against prod in a fresh browser
  context (sitemap reciprocity count, OG tags on listings + home).
  - BLOCKED until deploy — cannot run from the worktree.
  - **Must cover the one branch this checkout could not exercise:** the shared
    dev DB holds zero EN posts and zero EN categories, so the EN→PL reverse-map
    clusters in `enPostRoutes` / `enCategoryRoutes` never ran locally. Prod has
    translated posts, so the prod probe is what proves those two branches.
