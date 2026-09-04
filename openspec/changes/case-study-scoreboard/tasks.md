## 1. Read rules and content

- [ ] 1.1 Create `lib/payload/case-study-scoreboard.ts` with `normalizePlatform`, `PLATFORM_KEYS` (the five brand-icon keys), `platformsOf`, `groupResults`, `leadMetrics`, `splitValue`; move `normalizePlatform` and `groupResults` out of `case-study-article.tsx` and import them back
- [ ] 1.2 Write `lib/payload/case-study-scoreboard.test.ts` (bun test): first-result lead, group leads in order, composite labels match nothing, brand-group studies (FoodSaver, KBP, Getaway shapes) yield the right platforms, empty results, `splitValue` on `432 616 (+1 380%)`, `+50% (z 368 do 549)`, `92% (612 opinii)`, `prawie 3 mln`
- [ ] 1.3 Add chrome keys to `lib/content/case-studies.ts` (`caseStudyChrome.meta`, `caseStudyChrome.rail`, `caseStudiesListing.filters`, `caseStudiesListing.views`) and mirror them in `case-studies.en.ts`; run the locale-parity test
- [ ] 1.4 Rewrite `results` and `platform` admin descriptions in `lib/payload/collections/case-studies.ts` to state the first-result rule (design D11); confirm `bun run payload generate:types` produces no diff beyond comments
- [ ] 1.5 Add read-only `lib/payload/report-case-study-leads.ts` printing each study's card face and per-group leads (dev by default, `--prod` via `targetProdEnv`); run against production and attach the output to the change for the content owner

## 2. Detail page: scoreboard hero and meta rail

- [ ] 2.1 Restructure the hero in `case-study-article.tsx` into left column (breadcrumb, logo, `h1`, lead) and `Scoreboard` (cover under stage gradient + grain, large lead numeral, up to two small group leads with brand marks); remove the standalone `.cover` block and keep `preload` on the scoreboard cover
- [ ] 2.2 Add the meta rail (`Platformy` with brand marks, `Branża` tags, `Zakres` from distinct `approach[].tag`), each row omitted when empty; move the tag list into it
- [ ] 2.3 Style in `case-study.module.css`: two-column hero from `--desktop`, stacked below with scoreboard first after the title block, no-cover fallback on plum, `splitValue` secondary line
- [ ] 2.4 Verify against the mock at 1440 and 390: numerals, marks, cover crop, no second cover

## 3. Detail page: section rail and results ledger

- [ ] 3.1 Create `section-rail.tsx` (client): props are the present sections `{ id, label }[]`; IntersectionObserver rooted on the article ref, current-section state, Lenis `scrollTo` on click; renders nothing below `--desktop`
- [ ] 3.2 Wrap the article body in the two-column grid (`180px` rail + content) and mount the rail with only the sections that rendered; keep prose at its measure
- [ ] 3.3 Replace `.tiles` / `tileSpans` / `spanDesktop` with the ledger: per group, lead numeral (`CountUp`, `--len` sizing, orange rule, label) and a four-track row of small numerals; delete the orange tile styles and the `rowPlan`/`tileSpans` helpers and their comments
- [ ] 3.4 Update `count-up.test.ts` if `rowPlan` tests lived beside it; add a test for the ledger's group ordering if not covered by 1.2
- [ ] 3.5 Verify Julius Meinl (12 metrics, 3 groups), Belvedere (brand group + Facebook), LUISSE (0 results), KBP (no platform, 1 group) at desktop and mobile; WebKit check for the sticky rail

## 4. Hub: board card

- [ ] 4.1 Rewrite `case-study-card.tsx`: stage becomes the board (cover fills under gradient), lead metric via `leadMetrics`, one-line label with brand mark, no excerpt; keep logo/name fallback, title, tags, read link
- [ ] 4.2 Style in `case-studies.module.css`: fixed board height, bottom-anchored numeral block, nowrap ellipsis label pinned to one line-height, four-line title clamp; remove `.cardArtefact` and `.cardExcerpt`
- [ ] 4.3 Verify every numeral in a row shares a baseline with 1-group, 2-group, 3-group and 0-result studies in the same row (temporarily reorder locally if needed); check ENGIE and ASUS titles

## 5. Hub: platform rail, view toggle, ledger view

- [ ] 5.1 Extend `search.ts`: `CaseStudySearchEntry` gains `platforms`, `lead`, `groupLeads`, `logo`, `tags`; `caseStudySearchEntries` fills them via the helper module
- [ ] 5.2 Extend `hub-search.tsx` context with `platform` and `view` state; `Filtered` ANDs search and platform; live region announces the visible count when either is active; add `PlatformRail` (server-rendered counts as props, client selection) and `ViewToggle` components
- [ ] 5.3 Compute `{ key, count }[]` in `listing-view.tsx` at build; render rail + grid in a two-column layout from `--desktop`, chip row above the grid below it; hide the toggle below `--desktop`
- [ ] 5.4 Add `case-study-row.tsx` (ledger row: logo/name, title + tags line, lead numeral with rule and label, other group leads, platform marks, whole-row link) and render the row list beside the grid, each row in its own `Filtered`; toggle display with `hidden`
- [ ] 5.5 Styles for rail, chips, toggle, rows; confirm no card image is re-requested on filter or view change

## 6. Verification and close

- [ ] 6.1 Extend `e2e/case-studies.e2e.ts`: rail counts equal the number of cards carrying each mark, platform filter + search compose, empty intersection keeps the platform, toggle to ledger shows the same set and refetches nothing, no toggle at 390px; both locales
- [ ] 6.2 Extend `e2e/case-study.e2e.ts`: scoreboard numeral equals the first result, exactly one cover image on the page, rail lists only present sections and marks one current after clicking `Wyniki`; navigate study → hub → study and assert one current link
- [ ] 6.3 Run `bun run check`, `bun run test`, e2e on the worktree port; revert the Blob importMap dirt if `build` touched it
- [ ] 6.4 PSI cold-path on the bare apex for one detail page after preview deploy; confirm LCP is the scoreboard cover and not worse than today
- [ ] 6.5 Hand the 1.5 leads report to the content owner; record in the change which studies they chose to reorder
