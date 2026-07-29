## 0. Blockers — settle before writing code

- [ ] 0.1 Get written sign-off from **iRobot** (starting-point figure `1 168`, likes growth, YouTube subscriber growth), **Volvo** (content structure across the two profiles) and **Pracuj.pl** (AR-filter figures). **Scope shrank at 11.x**: the report render and the second AR creator still were deleted with the exhibits, so the never-published items are down to the iRobot baseline and the YouTube growth figures — both still quoted in the copy. Everything else is already public in the case studies.
- [x] 0.2 **DECIDED: YouTube before/after (iRobot).** Ships subscriptions while omitting the concurrent decline in views; the alternative (Pracuj.pl demographics) was raised and declined. The mock's variant switch does not ship.
- [x] 0.3 **DECIDED: no call to action on step 05.** It ends on headline, sentence and render. No link out, no client mark.
- [ ] 0.4 Fix the Pracuj.pl case-study likes figure. **NOT FIXED — the premise does not survive checking the sources, and the decision is not ours to make.** Both decks were pulled from Drive and read:
  - `Raport roczny Pracuj.pl 2024 .pptx`, *Zaangażowanie*: `ŁĄCZNA LICZBA POLUBIEŃ +184 000` (one year).
  - `KWIECIEŃ 2026 – Pracuj.pl – CASE STUDY` (the freshest client-facing deck): `104,8 TYS. — Łączna liczba polubień materiałów`.
  - The site therefore **matches its source**: `seed-case-studies.ts` reproduces the case-study deck faithfully. The contradiction is between two Social Lama documents, not between the deck and the website, so editing the site copy would only make it disagree with the deck the client was given.
  - Complicating it further: the same annual report's AR-filter slide (TikTok Effect House) reports `183 706` likes for the filter alone — within 0.2% of the `+184 000` booked as whole-profile engagement, while the neighbouring comment (`+4 249` vs `4 885`) and share (`+22 000` vs `27 607`) figures do **not** match. That is consistent with one mis-copied cell in the annual report, but it is not provable from the artefacts.
  - **Owner decision needed**: which figure is authoritative. Until then nothing on the site should change. Step 03 is unaffected — its two figures were verified directly against the Effect House panel, and it deep-links to `#podejscie`, not to the results tiles carrying the contested number.

## 1. Assets

- [x] 1.1 Export the three Volvo pillar frames to `public/case-studies/volvo/` derivatives sized for the panel: `volvo-vcw-post.jpg`, `volvo-konkurs-podium.jpg`, `volvo-dom-savedate.jpg`, cropped to a shared 9:16 frame so the row does not read as ragged. Mapping is in `seed-case-studies.ts:588–666`. **Already present** — all three derivatives are in `public/case-studies/volvo/` from the case-study seed, so this was a no-op. They are also unused: design Decision 5 replaced the three-frame treatment with the 2×3 diagram, so step 02 ships no photographs.
- [x] 1.2 Export the Pracuj.pl AR filter page (`pracuj-pl-ar-grid.jpg`) at panel size. **Already present** — `pracuj-pl-ar-grid.jpg` (362×776) ships with the Pracuj.pl case study.
- [x] 1.3 Generate the isometric report render. Take three pages of the Pracuj.pl deck — *Świadomość marki*, *Demografia fanów*, *Rekomendacje* — and **exclude the title page** (it is the only one carrying the year in large type). Derive the canvas from the card geometry plus shadow offset with a 70px margin, and assert every canvas edge is fully transparent before saving; hand-tuned canvases have already clipped a corner once. Save as WebP with alpha.
- [x] 1.4 Recolour the three client wordmarks (`*-logo-mono.png`, black on transparent) to cream for the plum stage, or apply the recolour in CSS. **Superseded by 8.8** — the client wordmarks are no longer rendered, so nothing needs recolouring. The CSS recolour was implemented and then removed with the marks.
- [x] 1.5 Confirm no exported asset shows a legible date. Verify the AR page and the report pages specifically.

## 2. Content

- [x] 2.1 Extend the `Step` type in `lib/content/home.ts` to carry per-step proof: `label`, `title`, `say`, optional `client`, and `href`. Keep `number`, `text` and `image` — `text` is the rail sentence and stays verbatim. **Revised by 8.8** — `label` and `client` were implemented, then removed. The shipped shape is `{ title, say, href?, cta? }`.
- [x] 2.2 Populate the five steps' proof copy. Budget per panel: one headline, one sentence of ~15–25 words carrying one or two figures. Figures come from the reports and are reproduced without rounding for effect.
- [x] 2.3 Add the client keys: `irobot` (01, 04), `volvo` (02), `pracuj-pl` (03). Step 05 gets **no** client — it addresses the reader, not a case. **Superseded by 8.8** — client keys were added, then removed with the marks. Attribution is now the deep link alone.
- [x] 2.4 Express every interval as a duration. No years, no full dates, no month names, in copy or in `alt` text.
- [x] 2.5 Add the EN twin in `lib/content/home.en.ts`. `Localized<>` parity is type-enforced, so this cannot ship half-done.
- [x] 2.6 Take the case-study route prefix as a prop rather than hardcoding `/case-studies`, following the `caseStudyBase` pattern in `client-logos/index.tsx:49`. Slugs are shared across locales; only the prefix differs.

## 3. Section layout

- [x] 3.1 Restructure `app/(frontend)/(home)/sections/how-it-works/index.tsx` from five cards into a two-column stage: step rail left, exhibit panel right. Keep `useScrollTrigger`, the `40svh`-per-step cadence and the progress bar untouched.
- [x] 3.2 Move the existing card treatment onto the rail items — glass fill, orange border and glow on the active item, dimmed otherwise. Rail items stay real buttons with `aria-current`.
- [x] 3.3 Render all five panels into **one grid cell** (`grid-area: 1 / 1`) and hide inactive ones with `visibility: hidden`, not `display: none`, so the stage height is the tallest panel and never changes between steps. `visibility` also keeps inactive panels out of the tab order and the a11y tree.
- [x] 3.4 Do **not** add `flex: 1` to `.stage`. It is content-sized and vertically centred today; stretching it to the viewport strands the panels in empty plum. See `design.md` Decision 2.
- [x] 3.5 Size the media column per exhibit type: `26rem` for chart-led steps (01, 04, 05), a `.78fr / 1.22fr` split for the diagram (02), `13.5rem` for the photo-led step (03). Cap photographs at `max-height: 22rem`. **Superseded on desktop by 8.1** — steps 01–04 have no media column inside the panel there. Still accurate for narrow viewports and for step 05.
- [x] 3.6 Keep the reduced-motion fallback behaving as it does now.

## 4. Exhibits

- [x] 4.1 **Step 01 — line chart.** Two plotted points with a zero-based y-axis, three gridlines with tick labels, x-ticks under each measured point, area fill, and a darker stroke beneath the accent line so it stays legible over the stage's orange glow. Grid at ~13% opacity, axes at ~30%. Do **not** interpolate a curve between the two points — no monthly data exists.
- [x] 4.2 Add the likes figure as a labelled delta row beneath the chart, **not** as a second line. The two measures differ by an order of magnitude; sharing one axis is the classic misread.
- [x] 4.3 **Step 02 — 2×3 diagram.** Two profile columns × three platform rows, one word per cell, closed by `2 salony × 3 platformy = 6 osobnych planów treści`. Words are condensed from the Volvo pillars.
- [x] 4.4 Use the official brand marks from `app/(frontend)/case-studies/[slug]/brand-icons.tsx` for the platform rows. **Do not reach for Lucide** — `lucide-react@1.24.0` ships no brand icons (removed at v1) — and do not redraw the marks monoline.
- [x] 4.5 Give each inlined SVG a unique gradient `id`. The Instagram gradient appears more than once and duplicate ids are invalid markup.
- [x] 4.6 **Step 03 — stat row plus the real filter page.** Four figures from TikTok Effect House and the published AR grid screenshot. **AMENDED.** The four-stat row belongs to the superseded dense revision; the shipped content model allows one sentence and one exhibit. Step 03 carries the AR grid screenshot plus two figures inline in its sentence (`6,79 mln`, `4 885`), both verified against the TikTok Effect House panel in the deck (`6 786 233` views, `4885` posts).
- [x] 4.7 **Step 04 — before/after columns.** Four bars, the two pre-engagement periods muted and the two Social Lama periods in the accent, value labels anchored to each bar rather than to a shared top line, and a dashed marker at the handover. Axis labels carry no dates (`dwa lata przed` / `rok przed` / `1. rok z nami` / `2. rok z nami`).
- [x] 4.8 **Step 05 — isometric render.** No frame, border or radius on top of it: the image carries its own shadow and alpha, and a second frame reads as a picture of a picture.

## 5. Narrow viewports

- [x] 5.1 Hide the diagram, tag lists, pull quotes and conclusion blocks at narrow widths; keep the headline and the single strongest visual. **AMENDED.** Written for the dense revision, where step 02 had photographs *and* a matrix. In the shipped design the diagram is step 02's only visual, so hiding it would leave the panel with no exhibit at all — the case the spec's "No panel is left empty" scenario guards against. Measured at 390×844 the cells render at ~11.8px and read cleanly, so the diagram stays.
- [x] 5.2 Add the one-line substitute for step 02, whose only substantive content is the diagram. **NOT NEEDED** — follows from 5.1: step 02 keeps its diagram, so there is nothing to substitute for.
- [x] 5.3 Turn the panel link into a full-width pill with a minimum 44px target height.
- [x] 5.4 Explicitly unset the per-panel column rules inside the narrow-viewport query. They carry higher specificity than the query and will otherwise keep a two-column panel on a phone.
- [x] 5.5 Scope the photo-row `max-height: none` reset to the photo row only. Written broadly it cancels the height cap on other exhibits further up the same query.
- [x] 5.6 Auto-scroll the horizontal rail so the active step stays centred, without moving page scroll.

## 6. Verification

- [x] 6.1 Add the no-dates check to the section's test surface: strip base64 and the SVG namespace, then fail on any `19xx`/`20xx`, any `dd.mm.yyyy`, and any Polish month name. Cover `alt` text and `aria-label`.
- [x] 6.2 Assert the stage height is identical across all five steps at 1440×900, 1280×720 and 390×844.
- [x] 6.3 Assert no panel element overflows the stage, and the page never scrolls horizontally.
- [x] 6.4 Assert exactly one panel is visible per step, and that inactive panels are absent from the tab order.
- [x] 6.5 Check the section against the homepage a11y gate: keyboard focus visible on rail items and links, rail operable by keyboard, charts carrying an accessible description of what they show.
- [x] 6.6 Confirm both locales render and that case-study links resolve to the right locale prefix.
- [x] 6.7 Screenshot all five steps in both locales and review before merge — the layout bugs in this work were all found by measurement, not by reading the CSS.

## 7. Close-out

- [x] 7.1 `bun run check` — **run; fails at the Biome step on a pre-existing, branch-independent bug.** Biome 2.5.3 panics (`index out of bounds`) on five files, and the panicking set is byte-identical on `main`: `components/blog/newsletter.tsx`, `components/ui/form/hook.ts`, `lib/content/home.ts`, `lib/content/home.en.ts`, `lib/integrations/shopify/cart/cart-context.tsx`. `home.ts` panicked before this change too, so nothing here made it worse. `linter.domains.project=none` (the earlier mitigation, 9642ef5) is already set and no longer suppresses it. The steps `check` short-circuits past were run individually and pass: `tsc --noEmit` clean, `bun test` 508 pass / 0 fail, `manifest:check` up to date, and `biome check` scoped to this change's files exits 0 (one `useSemanticElements` warning, see 3.2).
- [x] 7.2 Memory updated: `how-it-works-proof-mocks` (implemented; which artifact URL actually shipped, since the recorded one pointed at the superseded dense revision), `case-study-likes-contradiction` (premise corrected) and `biome-internal-panic` (the recorded fix no longer holds).

## 8. Revision — exhibit lifted above the stage (2026-07-29)

Layout rethink after reviewing the built section: the sand beside the heading was a ~900×290px void while the plum block's copy sat small.

- [x] 8.1 Move steps 01–04's exhibit out of the plum stage into the void beside the heading, right-aligned, heading scale unchanged. Step 05's render stays on plum — it is near-white paper and would wash out on sand.
- [x] 8.2 Drive every exhibit colour from `--ex-*` custom properties so the same markup reads on both grounds. The plum set sits on `.panels` and pins absolute tokens (theme-proof island); the sand set is theme-aware, and `--color-contrast` already resolves to plum there — orange on sand is ~1.6:1 and was unusable for the chart's large figures.
- [x] 8.3 Keep the lifted slots in one shared grid cell so the head height is constant across all five steps, including step 05 where none is shown. Measured: head `352`, stage `493` (PL) / `452` (EN), one value each across every step.
- [x] 8.4 Bottom-align the lifted slots. Sharing a cell stretches each slot to the tallest exhibit, so a short one (the diagram) otherwise floats at the top instead of sitting on the heading's baseline.
- [x] 8.5 Enlarge the panel copy and the rail cards to fill the freed width — title to `clamp(1.15rem, 4vw, 3.7rem)`, sentence to `60ch`, rail column `15rem → 21rem`, rail cards to `0.85rem/1rem` padding at `0.9rem` type. The stage height is set by the rail, so the copy grew for free.
- [x] 8.6 Reclaim the height that the enlarged copy cost: `.sticky` padding-block `--safe * 1.25 → --safe` and gap `--gap * 1.5 → --gap`. Polish overflowed the viewport by 9px before this (`sticky 909` in a 900 viewport); now exactly `900`.
- [x] 8.7 Narrow viewports unchanged — the exhibit renders twice and CSS hides whichever does not apply. Verified: mobile still stacks copy then exhibit inside the plum block, on the plum ground.
- [x] 8.8 Remove the eyebrow label and client wordmark from every step (user decision). See `design.md` Decision 9 for the trade; the deep link is now the only attribution and the test asserts it.
- [x] 8.9 Thread `idPrefix` through `BrandIcon`. Rendering the diagram twice turned the hardcoded `ig-gradient` into a real duplicate id — the exact failure task 4.5 warned about. `useId()` was rejected: `brand-icons.tsx` has no `'use client'` and is rendered from a Server Component on the case-study pages. Verified zero duplicate ids on both locales at both viewports.
- [x] 8.10 Amend `specs/how-it-works-proof/spec.md` — the attribution requirement no longer demands a client mark, the panel-contents list drops the eyebrow and mark, and the constant-height requirement now covers the lifted area too.

## 9. Revision — wider exhibits, three AR shots, step 02 as an infographic (2026-07-29)

- [x] 9.1 Give the lifted exhibit every pixel the heading does not need: head columns `1fr / 34rem` → `auto / 1fr`. A fixed exhibit column had left a third strip of dead sand between heading and chart.
- [x] 9.2 Widen and flatten the follower chart's plot frame (viewBox `340×186` → `574×186`, ~3:1). At the old ratio the extra width would have doubled its height and blown the pinned 100svh budget; measured head actually *fell* from `352` to `306`.
- [x] 9.3 Step 03 shows three AR shots instead of one. Only two genuine AR screenshots existed in the repo, so the third was recovered from the deck's embedded media (`ppt/media/image77.png`, 943×2048 — a second creator with the effect on) and **cropped to remove the post date `2024-5-17`**, which the no-dates rule forbids. Rejected `pracuj-pl-humor-pov.jpg` for the same reason: it carries a legible `2025-11-15`, and it is not AR material anyway.
- [x] 9.4 Cap the photo row (`max-width: 37rem`). It is the only exhibit whose height grows with its width, and all four lifted slots share one cell — unbounded it would set the head height for every step.
- [x] 9.5 Rebuild step 02 as a two-card infographic: one card per dealership, each with three platform rows (brand mark, platform name, pillar word in display type), closed by the equation line. The six-cell count design Decision 5 rests on is preserved; only the arrangement changed, and side by side the repeated platforms now show *the same channel, planned differently*.
- [x] 9.6 Give the cards a filled accent header bar. Cream-on-sand is barely five percent apart in luminance, so with only a border the cards dissolved into the page and the exhibit read as a plain list. Added `--ex-card`, `--ex-card-border`, `--ex-card-shadow`, `--ex-on-accent`, `--ex-hairline` to both grounds.
- [x] 9.7 Extend the gradient-id scope to the profile column. Each diagram now draws every brand mark twice more, so `hiw-<instance>-ig-gradient` was no longer unique; it is now `hiw-<instance>-<column>-ig-gradient`. Verified six unique gradient ids and zero duplicates across both locales at both viewports.
- [x] 9.8 Convert the `\uXXXX` escapes an earlier scripted edit had left in the Polish content back to literal characters, so `home.ts` reads like the rest of the module — but keep U+00A0 escaped, since an invisible non-breaking space in source is a maintenance trap.
- [x] 9.9 Re-verify: head `306` and stage `493` (PL) / `452` (EN) constant across all five steps, `sticky` exactly `900` in a 900 viewport, no horizontal scroll, one panel visible per step, mobile unchanged and still on the plum ground.

## 10. Revision — lift step 05, restore attribution (2026-07-29)

- [x] 10.1 Lift step 05's report render above the stage too, so all five steps behave alike and the void is never empty. Required regenerating the render at **~2.9:1** (`1700×588`, was `1400×934`): at its original 1.5:1 it would have been 567px tall in the head. Fan flattened via `STEP`, `TAN_UP`, `TAN_RIGHT` and tighter margins in `assets-src/report-iso/iso.py`; all three page headings stay recognisable.
- [x] 10.2 Reframe the follower chart again (viewBox `574×186` → `660×186`, ~3.5:1) to pay for the attribution row inside the same shared cell.
- [x] 10.3 **Restore client attribution, reversing 8.8** — a `Na przykładzie` / `Case in point` label plus a large client wordmark directly above each exhibit. This is the user's own catch and it vindicates the concern raised when the marks were dropped: with no mark, the client's figures read as Social Lama's own. The wordmark is now `2rem` rather than the `0.9rem` inline mark that failed to register.
- [x] 10.4 Wordmarks need no recolour on sand — they ship black on transparent, which is already right on a light ground; only the plum ground inverts (`--ex-logo-filter`). As a side effect the Pracuj.pl lozenge finally reads correctly, having looked like a white smudge when inverted on plum.
- [x] 10.5 Amend the spec again: attribution is required (in its new form), and lifting is now mandatory on wide viewports rather than optional.
- [x] 10.6 Re-verify: head `319` and stage `493` (PL) / `452` (EN) constant across all five steps, `sticky` exactly `900`, zero duplicate ids (6 unique gradients), 508 tests pass, mobile carries the attribution on the plum ground.

- [x] 10.7 Promote the attribution from plain text to a **chip** — cream pill, accent border, on both grounds. Above a chart whose top-left is empty, plain text floated in space and read as decoration; this is the one element that stops a client's figures being mistaken for the agency's, so it has to survive a glance.
- [x] 10.8 **Bug found while chasing "step 1 has no attribution": six sand-ground variables were never defined.** `--ex-hairline`, `--ex-card`, `--ex-card-border`, `--ex-card-shadow`, `--ex-on-accent` and `--ex-logo-filter` existed only on the plum set. An undefined `var()` invalidates the whole declaration, so on sand the attribution chip and the infographic cards rendered with *no* background and *no* border at all. This had been silently degrading the step-02 cards since 9.6 — the "cream on sand is too low contrast" diagnosis there was wrong; there was simply no fill. `--ex-logo-filter` being undefined happened to be harmless, since black-on-transparent is already correct on a light ground.

**Cause worth keeping:** the edit that should have added those six was a scripted `str.replace` **without an assertion**, so it silently matched nothing while the neighbouring plum replace succeeded. Every other replace in this change asserted first and would have failed loudly. Assert on every scripted edit.

**Gotcha worth keeping:** after regenerating the render, the section still measured the *old* aspect — Next's dev image cache was serving the previous bitmap, and `height: auto` sizes from the served file, not the declared `width`/`height`. Fix is `rm -rf .next/dev/cache/images` (not all of `.next`).

## 11. Revision — exhibits removed entirely (2026-07-29)

First outside feedback: the graphics above the gradient block had to go. Asked whether the evidence should move back inside the block or be dropped, the decision was **delete entirely, every viewport**. The section is now the step rail plus a headline, one sentence and one link per step. This unwinds sections 8–10 and much of 1, 3 and 4.

- [x] 11.1 Delete `exhibits.tsx` and every exhibit: follower chart, content-structure infographic, AR shot row, isometric report render.
- [x] 11.2 Delete the lifted block above the stage, the client attribution chip, and the `--ex-*` two-ground colour system. `.head` returns to a plain column; `.panel` to a single copy column.
- [x] 11.3 Keep `Say` — moved into `index.tsx`. The accented figures in each sentence are now the whole of the evidence, so it is more load-bearing than before, not less.
- [x] 11.4 Delete `HOW_IT_WORKS_GEOMETRY`, the `exhibits` content block, the `attribution` label and the per-step `client` key from both locales.
- [x] 11.5 Revert `idPrefix` on `BrandIcon` (`git checkout HEAD --`) — the diagram was its only consumer, so the prop would have been dead API. The pre-existing latent duplicate-id on case-study pages with two Instagram tiles is therefore still there, untouched and out of scope.
- [x] 11.6 Delete the generated assets and their generator: `public/case-studies/pracuj-pl/pracuj-pl-report-iso.webp`, `pracuj-pl-ar-creator-2.jpg`, `assets-src/report-iso/`. The pre-existing case-study creatives (`pracuj-pl-ar-grid.jpg`, `pracuj-pl-ar-creator.jpg`, the Volvo frames) are untouched — they were never added by this change.
- [x] 11.7 Trim `how-it-works.test.ts` to what still exists: no-dates (both locales, plus a source-literal sweep), verbatim step sentences, step numbering, the ~25-word budget, link presence on 01–04 and absence on 05, the non-breaking-figure guard, and locale href parity. Dropped the geometry, exhibit-shape and image-existence assertions. 504 pass.
- [x] 11.8 Amend the specs: `how-it-works-proof` loses "One exhibit per step" and "Charts are honest by construction", and gains "Each step carries concrete, sourced copy" (which explicitly forbids exhibits) plus "Grouped numbers do not break across lines". The `homepage` delta no longer describes an exhibit swapping beside the rail.
- [x] 11.9 Re-verify: **zero images in the section**, stage `493` (PL) / `452` (EN) desktop and `319` mobile — constant across all five steps, `sticky` exactly `900` in a 900 viewport, no horizontal scroll, one panel visible per step, both locales.

**Also reverted this session:** a temporary one-line pause of the services autoplay (`sections/services/index.tsx`), added for review and reverted on request. `git diff` against `HEAD` for that file is empty.

## 12. Revision — the proof card (2026-07-29)

Attribution for each step's figures was called mandatory after the removal, so a subtle card went back in — not the exhibits.

- [x] 12.1 Add `ProofCard`: client wordmark, `Tak to wyglądało u` / `Here's how it looked at`, and `Zobacz case study` / `See the case study`. The whole card is the link.
- [x] 12.2 Take the wordmark's `alt` from `CLIENT_ROSTER` rather than the roster key — `pracuj-pl` would be announced as "pracuj dash p l". Brand names do not translate, so one shared roster serves both locales.
- [x] 12.3 Replace the four bespoke per-step `cta` strings with one shared `caseStudyCta`; restore the per-step `client` key.
- [x] 12.4 Style it as a quiet glass slab on the plum panel, matching the rail cards' language, full-width on narrow viewports so it clears 44px on its own.
- [x] 12.5 Verify: 4 wordmarks in the section (one per client step, `iRobot` / `VOLVO` / `Pracuj.pl` / `iRobot`), **step 05 has none**, stage `493` (PL) / `452` (EN) desktop and `345` mobile constant across steps, `sticky` exactly `900`, no horizontal scroll, 505 tests pass.
- [x] 12.6 Amend the spec: "Evidence is real and checkable" becomes "Evidence is **named** and checkable", with a scenario for the wordmark's accessible name; the narrow-viewport requirement now targets the card.
- [x] 12.7 Replace the `→` glyph with Lucide's `ArrowRight`, sized off `em` via the existing `.ctaIcon` pattern, and nudge it `translateX(4px)` on card hover/focus. Transform only, so it stays on the compositor; `global.css` already neutralizes transitions under reduced motion, so no local guard. Verified in the DOM: `lucide-arrow-right`, `transform: none` at rest → `matrix(1, 0, 0, 1, 4, 0)` on hover.
