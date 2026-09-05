## Context

Both routes are static: the hub builds from `getCaseStudies()` (manual `_order`), the detail from `getCaseStudyBySlug()`, and every interactive behavior today (search) is a client component over data already serialized into the page. The article renders `results` grouped by `platform` in first-appearance order and already reads the first metric as the card's headline. Mock A (artifact `Case Study Trzy Kierunki`, boards "Scoreboard" and "Scoreboard hub") is the visual contract.

Two content facts shape the design:

- `results[].platform` is a **result group**, not a platform. The field's own admin hint suggests "Volvo Car Warszawa"; 15 of 47 studies use brand or channel labels ("FoodSaver", "Strona WWW", "Beesfund", "Facebook (grupa)"), and those groups hold the strongest claims on the site (tracked sales, crowdfunding totals). They are not dirty data and must not be rewritten.
- `results` is localized as a whole array, so anything that reads array order reads it per locale. English arrays were seeded from Polish in the same order, so the lead is the same study-wide today; the spec pins the rule to the rendering locale so a future divergence is at least defined.

Constraints from the repo: no `:has()` page CSS and no pathname-keyed effects because Next 16 Activity keeps the previous page mounted; Lenis owns scrolling (in-page links go through `lenis.scrollTo`, which already subtracts `scroll-margin-top`); Safari is part of verification; the locale-parity test requires `case-studies.en.ts` to mirror every new chrome key.

## Goals / Non-Goals

**Goals:**

- Proof first on both surfaces, with one rule for what "the proof" is (first result, first per group) and that rule stated in the admin UI.
- Zero schema changes and zero data writes. Everything derives at render.
- Both routes stay static; filtering and view state stay in the client and off the URL.
- Every numeral on a hub row shares a baseline; every value with a parenthetical splits instead of wrapping.

**Non-Goals:**

- A "next case study" row at the end of the detail page (Mock B's dead-end fix). Separate change; it needs a related-studies query and its own spec.
- Editorial cleanup of result labels, metric wording or the 48 stock covers.
- A `period` / "Okres" field (Mock C).
- URL-addressable filters (`?platform=tiktok`). Deliberately out: the hub's SEO surface is the listing itself, and a crawlable filter URL would need canonical handling the search deliberately avoided.

## Decisions

**D1. One pure helper module owns the read rules.** `lib/payload/case-study-scoreboard.ts` exports `normalizePlatform` (moved from the article), `platformsOf(study)`, `groupResults(results)` (moved from the article), `leadMetrics(study)` (first per group, in order), and `splitValue(value)` (numeral + parenthetical). Unit tests in `case-study-scoreboard.test.ts` cover the 15 non-platform studies' shapes, composite labels, empty results, and the parenthetical forms present in the database (`(+1 380%)`, `(z 368 do 549)`, `(612 opinii)`). Alternative considered: keep the logic inside the article and card. Rejected because the hub, the ledger row, the scoreboard and the rail all need the same answers and would drift.

**D2. Platform set is the brand-icon set.** The five keys in `brand-icons.tsx` are the only platforms. `social-platforms` (the CMS collection of logos) is not consulted for the rail: it holds whatever logos were uploaded, and its `name`/`key` matching was only ever a fallback for the results heading. The article keeps that fallback for group headings; the rail and marks use brand icons only. Alternative: derive the set from the `social-platforms` collection. Rejected: it would make the rail depend on CMS state that nobody edits and could list a platform no study has.

**D3. Filter state lives in the existing search context.** `CaseStudySearch` gains `platform: PlatformKey | 'all'` and `view: 'grid' | 'ledger'`; `CaseStudySearchEntry` gains `platforms: PlatformKey[]` and the fields the ledger row needs. `Filtered` hides on `(searching && !match) || (platform !== 'all' && !entry.platforms.includes(platform))`. The live region announces the visible count whenever either input is active. Alternative: a second context. Rejected: the two filters must AND, and one derived `visible` set is simpler than two.

**D4. Ledger view is a second render of the same list, not a re-layout.** The listing renders both the grid of cards and the list of rows, each study inside its own `Filtered`, and the view state toggles which container is displayed (`hidden` attribute). Cards keep their images mounted, so switching never refetches (the existing search test already asserts zero refetches; the toggle test asserts the same). Cost: rows double the DOM for 47 studies, but rows carry no images beyond the logo and the whole list is static text. Alternative: CSS-only re-layout of the card into a row. Rejected: the row shows data the card does not (other groups' leads) and the card's board has no place in a row.

**D5. Counts are computed at build and passed as props.** `listing-view.tsx` computes `{ key, count }[]` from `platformsOf` over the published studies and renders the rail server-side; the client only toggles. Counts therefore never change while filtering, which is the honest behavior: "TikTok 14" means fourteen studies exist, not fourteen match the current query.

**D6. Section rail uses `IntersectionObserver` inside a client component scoped to the article, with the observer created and torn down by that component's own effect, not by a pathname effect.** Targets are the existing heading ids (`nasz-klient`, `wyzwanie`, `wyniki`, `podejscie`, `galeria`). Because Activity may keep the previous article mounted, the observer roots on the component's own `article` element via a ref, so two mounted articles cannot cross-mark each other. Clicking a rail link calls the site's Lenis `scrollTo` with the target element. Rail renders only at `--desktop`; below it the DOM is not rendered (not merely hidden), so the observer does not run on mobile.

**D7. The scoreboard reuses the stage recipe, not the card's.** The hero board is the plum gradient over the cover with the grain overlay, the same values the card stage uses (one of the five hand-synced copies in the codebase). The card's board replaces its "artefact" frame: the cover fills the stage instead of sitting as a framed photo inside it. The spec's "stage matches the homepage" scenario still holds because gradient, glow and grain are unchanged; only the artefact frame goes.

**D8. Baseline alignment is structural.** The card numeral block is bottom-anchored inside a fixed-height board; the label is one line with `white-space: nowrap` and ellipsis, height pinned to one line-height. A study without results renders the board with no numeral block, so the board height still matches its neighbours. No JavaScript measures anything.

**D9. Results ledger keeps `CountUp` and the `--len` sizing idea for the large numeral only.** Small numerals are fixed-size; only the lead scales with the value's character count so `328 949,11 zł` does not overflow its 280px column. The 12-track grid and `tileSpans` balancing go with the tiles; the small-metric row is a four-track grid with natural wrap.

**D10. Chrome copy stays in `lib/content`.** New keys: `caseStudyChrome.meta` (`platforms`, `industry`, `scope`), `caseStudyChrome.rail` (aria label), `caseStudiesListing.filters` (`all`, platform display names), `caseStudiesListing.views` (`grid`, `ledger`, aria label). `case-studies.en.ts` mirrors them; the parity test enforces it.

**D11. Admin descriptions carry the rule.** `results.admin.description` becomes "Pierwszy wynik jest twarzą case study: liczba na karcie i w hero. Pierwszy wynik każdej grupy jest liczbą wiodącą tej grupy. Kolejność ma znaczenie." and `platform.admin.description` explains that a platform name gives the group its brand mark and hub filter, while any other label (brand, channel) is allowed and simply has no mark. Descriptions are admin metadata; no migration.

## Risks / Trade-offs

- [Weak leads get loud: Volvo's first result is `+1000`, ASUS's YouTube group lead is `4`] → The rule is deliberate and editorial; the change ships a one-off report script (`lib/payload/report-case-study-leads.ts`, read-only) that prints every study's card face and group leads so the content owner can reorder arrays in the admin before launch. No automatic threshold; a threshold would silently hide real results like `3.` (place in crowdfunding history).
- [Two mounted articles under Activity both run a section-rail observer] → Observer rooted on the component's own article ref (D6); e2e navigates study → hub → study and asserts one current-marked link.
- [Ledger rows double the hub DOM] → Rows are text; measured hub HTML grows by an estimated 60–80 KB uncompressed. Acceptable for a static page; revisit if Lighthouse DOM-size warning appears.
- [Longest titles run four lines in a 290px card beside the rail] → Card title clamps at four lines with balance; ENGIE and ASUS are the worst cases and were checked in the mock.
- [Parenthetical split misreads a value whose parenthesis is not a delta, e.g. `92% (612 opinii)`] → It still renders correctly as numeral + secondary line; the split is presentational and the full string stays in the DOM.
- [Safari: `text-wrap: balance` on the card title and sticky rail inside a grid item] → Rail uses `position: sticky` on the grid child with `align-self: start`, the pattern already used by the blog; verify in WebKit before merge.
- [Removing the full-width cover drops the `preload`ed LCP image] → The scoreboard's cover keeps `preload` and `fetchPriority=high`; it is now smaller (460px column), so LCP should improve. Confirm with the PSI recipe on the bare apex.
- [EN results arrays could be reordered independently of PL in the admin] → Accepted; the spec ties the lead to the rendering locale. `verify-case-study-en.ts` gains a check that PL and EN leads agree, reported not enforced.

## Migration Plan

No data migration. Deploy is a normal ff-merge; the hub and detail pages regenerate at build. Rollback is a revert of the commit. Before merge: run the leads report against production data (read-only, `--prod` via `targetProdEnv`) and hand the list to the content owner; reordering results in the admin is their call and can happen after launch without a deploy.

## Open Questions

- Should `Wszystkie` also show non-platform studies under a separate `Inne` entry? Current answer: no, they are under `Wszystkie` only; an `Inne` bucket labels the best results as "other".
- Does the closing CTA keep "linking to other case studies"? The current spec text says so but the page never did; the breadcrumb is the route back. Left as is; the next-row change should settle it.
