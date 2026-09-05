## 1. Read rules and content

- [x] 1.1 Create `lib/payload/case-study-scoreboard.ts` with `normalizePlatform`, `PLATFORM_KEYS` (the five brand-icon keys), `platformsOf`, `groupResults`, `leadMetrics`, `splitValue`; move `normalizePlatform` and `groupResults` out of `case-study-article.tsx` and import them back
- [x] 1.2 Write `lib/payload/case-study-scoreboard.test.ts` (bun test): first-result lead, group leads in order, composite labels match nothing, brand-group studies (FoodSaver, KBP, Getaway shapes) yield the right platforms, empty results, `splitValue` on `432 616 (+1 380%)`, `+50% (z 368 do 549)`, `92% (612 opinii)`, `prawie 3 mln`
- [x] 1.3 Add chrome keys to `lib/content/case-studies.ts` (`caseStudyChrome.meta`, `caseStudyChrome.rail`, `caseStudiesListing.filters`, `caseStudiesListing.views`) and mirror them in `case-studies.en.ts`; run the locale-parity test
- [x] 1.4 Rewrite `results` and `platform` admin descriptions in `lib/payload/collections/case-studies.ts` to state the first-result rule (design D11); confirm `bun run payload generate:types` produces no diff beyond comments
- [x] 1.5 Add read-only `lib/payload/report-case-study-leads.ts` printing each study's card face and per-group leads (dev by default, `--prod` via `targetProdEnv`); run against production and attach the output to the change for the content owner

## 2. Detail page: scoreboard hero and meta rail

- [x] 2.1 Restructure the hero in `case-study-article.tsx` into left column (breadcrumb, logo, `h1`, lead) and `Scoreboard` (cover under stage gradient + grain, large lead numeral, up to two small group leads with brand marks); remove the standalone `.cover` block and keep `preload` on the scoreboard cover
- [x] 2.2 Add the meta rail (`Platformy` with brand marks, `Branża` tags, `Zakres` from distinct `approach[].tag`), each row omitted when empty; move the tag list into it
- [x] 2.3 Style in `case-study.module.css`: two-column hero from `--desktop`, stacked below with scoreboard first after the title block, no-cover fallback on plum, `splitValue` secondary line
- [x] 2.4 Verify at 1440 and 390: numerals, marks, no second cover (asserted: exactly one `scoreboardCover`, one `preload` link, zero `.tile`). Cover CROP unverified — local dev returns 500 for every `/api/media/file/*`, so no photograph renders here; needs a preview deploy or the user's own dev DB

## 3. Detail page: section rail and results ledger

- [x] 3.1 Create `section-rail.tsx` (client): props are the present sections `{ id, label }[]`; IntersectionObserver rooted on the article ref, current-section state, Lenis `scrollTo` on click; renders nothing below `--desktop`
- [x] 3.2 Wrap the article body in the two-column grid (`180px` rail + content) and mount the rail with only the sections that rendered; keep prose at its measure
- [x] 3.3 Replace `.tiles` / `tileSpans` / `spanDesktop` with the ledger: per group, lead numeral (`CountUp`, `--len` sizing, orange rule, label) and a four-track row of small numerals; delete the orange tile styles and the `rowPlan`/`tileSpans` helpers and their comments
- [x] 3.4 Update `count-up.test.ts` if `rowPlan` tests lived beside it; add a test for the ledger's group ordering if not covered by 1.2
- [x] 3.5 Verified Julius Meinl (12 metrics, 3 groups), Belvedere (brand group + Facebook), LUISSE (0 results → no Wyniki section, rail omits it), KBP (no platform, 1 group) at 1440 and 390
- [x] 3.5b WebKit check: both sticky rails pin at the header offset (114px), the ledger's six columns resolve to one x across all rows, and the brand-mark sprite paints with its gradient

## 4. Hub: board card

- [x] 4.1 Rewrite `case-study-card.tsx`: stage becomes the board (cover fills under gradient), lead metric via `leadMetrics`, one-line label with brand mark, no excerpt; keep logo/name fallback, title, tags, read link
- [x] 4.2 Style in `case-studies.module.css`: fixed board height, bottom-anchored numeral block, nowrap ellipsis label pinned to one line-height, four-line title clamp; remove `.cardArtefact` and `.cardExcerpt`
- [x] 4.3 Verify every numeral in a row shares a baseline with 1-group, 2-group, 3-group and 0-result studies in the same row (temporarily reorder locally if needed); check ENGIE and ASUS titles

## 5. Hub: industry rail, view toggle, ledger view

The rail was specified as a platform filter and changed to industries mid-change
(user decision) — 5.0a-5.3 record what shipped.

- [x] 5.0a Add `PENDING_INDUSTRIES` / `INDUSTRY_OPTIONS` / `INDUSTRY_KEYS` to `lib/content/branze.ts` + `.en.ts`; parity test asserts both locales list the same ids in the same order
- [x] 5.0b Add the non-localized `industry` select to `lib/payload/collections/case-studies.ts`, generate the additive migration, apply it to dev
- [x] 5.0c Add `lib/payload/assign-case-study-industries.ts` (slug->industry table, dry-run by default); backfill all 47 on dev and confirm a re-run reports zero pending
- [x] 5.1 Extend `search.ts`: `CaseStudySearchEntry` gains `industry`; add `industryCounts`. Deliberately NOT carrying the row's logo/title/metrics - both views are server-rendered and already on the page, so indexing them would ship every study twice for no consumer
- [x] 5.2 Extend `hub-search.tsx` context with `industry` and `view` state; `Filtered` ANDs search and industry; live region announces the visible count when either is active; add `IndustryRail` (server-built items as props, client selection) and `ViewToggle` components
- [x] 5.3 Compute the rail items in `listing-view.tsx` at build, dropping industries no study carries; render rail + grid in a two-column layout from `--desktop`, chip row above the grid below it; hide the toggle below `--desktop`
- [x] 5.4 Add `case-study-row.tsx` (ledger row: logo/name, title + tags line, lead numeral with rule and label, other group leads, platform marks, whole-row link) and render the row list beside the grid, each row in its own `Filtered`; toggle display with `hidden`
- [x] 5.5 Styles for rail, chips, toggle, rows; confirm no card image is re-requested on filter or view change

## 6. Verification and close

- [x] 6.1 Extend `e2e/case-studies.e2e.ts`: every rail count equals the cards that survive selecting it, industry + search compose, empty intersection keeps the industry, toggle to ledger shows the same set and refetches nothing, no toggle at 390px; both locales
- [x] 6.6 Dev server restarted; the PL hub additionally needed `POST /api/revalidate?tag=case-studies` because `findCaseStudies` is `'use cache'` with `cacheLife('weeks')`. Rail verified in both locales (17 industries, `finanse`/`fashion` correctly absent)
- [x] 6.2 Extend `e2e/case-study.e2e.ts`: scoreboard numeral equals the first result, exactly one cover image on the page, rail lists only present sections and marks one current after clicking `Wyniki`; navigate study → hub → study and assert one current link
- [x] 6.3 `bun run check` clean; e2e on the worktree port: 6 of 8 case-study specs pass, plus all 11 blog specs (the shared scroll-spy touches `toc.tsx`). The 2 failures are the pre-existing `@monitor` spec asserting zero console errors, which this environment cannot satisfy — every `/api/media/file/*` returns 500 locally, and untouched pages show the same (`/blog` 17 resource errors, a blog post 2, `/o-nas` 0)
- [ ] 6.4 PSI cold-path on the bare apex for one detail page after preview deploy; confirm LCP is the scoreboard cover and not worse than today
- [~] 6.5 Leads report handed over as `artifacts/leads-dev.txt`; awaiting the content owner's reordering decisions. The `--prod` run is still pending approval
- [ ] 6.7 Before merge: run `assign-case-study-industries --apply --prod` AFTER the deploy (the build reads NULLs otherwise) — the script now revalidates `case-studies` itself
