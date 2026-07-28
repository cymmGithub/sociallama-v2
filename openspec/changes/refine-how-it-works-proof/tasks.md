## 0. Blockers — settle before writing code

- [ ] 0.1 Get written sign-off from **iRobot** (starting-point figure `1 168`, likes growth, YouTube subscriber growth), **Volvo** (content structure across the two profiles) and **Pracuj.pl** (AR-filter figures, report pages in the isometric render). Everything except the iRobot baseline and the report pages is already public in the case studies.
- [ ] 0.2 Decide step 04: **YouTube before/after** (iRobot, more arresting, shows subscriptions while omitting the concurrent decline in views) or **audience demographics** (Pracuj.pl, no asymmetry, less arresting). Both are built in the v2 mock behind a switch. See proposal Open Question 2.
- [ ] 0.3 Decide whether step 05 keeps its call to action. It currently ends with headline, sentence and render only — no link out. See proposal Open Question 3.
- [ ] 0.4 Fix the Pracuj.pl case-study likes figure (`104,8 tys.` on the page versus `+184 000` for one year in the report) before this section starts linking readers to it. Independent defect; own change if preferred.

## 1. Assets

- [ ] 1.1 Export the three Volvo pillar frames to `public/case-studies/volvo/` derivatives sized for the panel: `volvo-vcw-post.jpg`, `volvo-konkurs-podium.jpg`, `volvo-dom-savedate.jpg`, cropped to a shared 9:16 frame so the row does not read as ragged. Mapping is in `seed-case-studies.ts:588–666`.
- [ ] 1.2 Export the Pracuj.pl AR filter page (`pracuj-pl-ar-grid.jpg`) at panel size.
- [ ] 1.3 Generate the isometric report render. Take three pages of the Pracuj.pl deck — *Świadomość marki*, *Demografia fanów*, *Rekomendacje* — and **exclude the title page** (it is the only one carrying the year in large type). Derive the canvas from the card geometry plus shadow offset with a 70px margin, and assert every canvas edge is fully transparent before saving; hand-tuned canvases have already clipped a corner once. Save as WebP with alpha.
- [ ] 1.4 Recolour the three client wordmarks (`*-logo-mono.png`, black on transparent) to cream for the plum stage, or apply the recolour in CSS.
- [ ] 1.5 Confirm no exported asset shows a legible date. Verify the AR page and the report pages specifically.

## 2. Content

- [ ] 2.1 Extend the `Step` type in `lib/content/home.ts` to carry per-step proof: `label`, `title`, `say`, optional `client`, and `href`. Keep `number`, `text` and `image` — `text` is the rail sentence and stays verbatim.
- [ ] 2.2 Populate the five steps' proof copy. Budget per panel: one headline, one sentence of ~15–25 words carrying one or two figures. Figures come from the reports and are reproduced without rounding for effect.
- [ ] 2.3 Add the client keys: `irobot` (01, 04), `volvo` (02), `pracuj-pl` (03). Step 05 gets **no** client — it addresses the reader, not a case.
- [ ] 2.4 Express every interval as a duration. No years, no full dates, no month names, in copy or in `alt` text.
- [ ] 2.5 Add the EN twin in `lib/content/home.en.ts`. `Localized<>` parity is type-enforced, so this cannot ship half-done.
- [ ] 2.6 Take the case-study route prefix as a prop rather than hardcoding `/case-studies`, following the `caseStudyBase` pattern in `client-logos/index.tsx:49`. Slugs are shared across locales; only the prefix differs.

## 3. Section layout

- [ ] 3.1 Restructure `app/(frontend)/(home)/sections/how-it-works/index.tsx` from five cards into a two-column stage: step rail left, exhibit panel right. Keep `useScrollTrigger`, the `40svh`-per-step cadence and the progress bar untouched.
- [ ] 3.2 Move the existing card treatment onto the rail items — glass fill, orange border and glow on the active item, dimmed otherwise. Rail items stay real buttons with `aria-current`.
- [ ] 3.3 Render all five panels into **one grid cell** (`grid-area: 1 / 1`) and hide inactive ones with `visibility: hidden`, not `display: none`, so the stage height is the tallest panel and never changes between steps. `visibility` also keeps inactive panels out of the tab order and the a11y tree.
- [ ] 3.4 Do **not** add `flex: 1` to `.stage`. It is content-sized and vertically centred today; stretching it to the viewport strands the panels in empty plum. See `design.md` Decision 2.
- [ ] 3.5 Size the media column per exhibit type: `26rem` for chart-led steps (01, 04, 05), a `.78fr / 1.22fr` split for the diagram (02), `13.5rem` for the photo-led step (03). Cap photographs at `max-height: 22rem`.
- [ ] 3.6 Keep the reduced-motion fallback behaving as it does now.

## 4. Exhibits

- [ ] 4.1 **Step 01 — line chart.** Two plotted points with a zero-based y-axis, three gridlines with tick labels, x-ticks under each measured point, area fill, and a darker stroke beneath the accent line so it stays legible over the stage's orange glow. Grid at ~13% opacity, axes at ~30%. Do **not** interpolate a curve between the two points — no monthly data exists.
- [ ] 4.2 Add the likes figure as a labelled delta row beneath the chart, **not** as a second line. The two measures differ by an order of magnitude; sharing one axis is the classic misread.
- [ ] 4.3 **Step 02 — 2×3 diagram.** Two profile columns × three platform rows, one word per cell, closed by `2 salony × 3 platformy = 6 osobnych planów treści`. Words are condensed from the Volvo pillars.
- [ ] 4.4 Use the official brand marks from `app/(frontend)/case-studies/[slug]/brand-icons.tsx` for the platform rows. **Do not reach for Lucide** — `lucide-react@1.24.0` ships no brand icons (removed at v1) — and do not redraw the marks monoline.
- [ ] 4.5 Give each inlined SVG a unique gradient `id`. The Instagram gradient appears more than once and duplicate ids are invalid markup.
- [ ] 4.6 **Step 03 — stat row plus the real filter page.** Four figures from TikTok Effect House and the published AR grid screenshot.
- [ ] 4.7 **Step 04 — before/after columns.** Four bars, the two pre-engagement periods muted and the two Social Lama periods in the accent, value labels anchored to each bar rather than to a shared top line, and a dashed marker at the handover. Axis labels carry no dates (`dwa lata przed` / `rok przed` / `1. rok z nami` / `2. rok z nami`).
- [ ] 4.8 **Step 05 — isometric render.** No frame, border or radius on top of it: the image carries its own shadow and alpha, and a second frame reads as a picture of a picture.

## 5. Narrow viewports

- [ ] 5.1 Hide the diagram, tag lists, pull quotes and conclusion blocks at narrow widths; keep the headline and the single strongest visual.
- [ ] 5.2 Add the one-line substitute for step 02, whose only substantive content is the diagram.
- [ ] 5.3 Turn the panel link into a full-width pill with a minimum 44px target height.
- [ ] 5.4 Explicitly unset the per-panel column rules inside the narrow-viewport query. They carry higher specificity than the query and will otherwise keep a two-column panel on a phone.
- [ ] 5.5 Scope the photo-row `max-height: none` reset to the photo row only. Written broadly it cancels the height cap on other exhibits further up the same query.
- [ ] 5.6 Auto-scroll the horizontal rail so the active step stays centred, without moving page scroll.

## 6. Verification

- [ ] 6.1 Add the no-dates check to the section's test surface: strip base64 and the SVG namespace, then fail on any `19xx`/`20xx`, any `dd.mm.yyyy`, and any Polish month name. Cover `alt` text and `aria-label`.
- [ ] 6.2 Assert the stage height is identical across all five steps at 1440×900, 1280×720 and 390×844.
- [ ] 6.3 Assert no panel element overflows the stage, and the page never scrolls horizontally.
- [ ] 6.4 Assert exactly one panel is visible per step, and that inactive panels are absent from the tab order.
- [ ] 6.5 Check the section against the homepage a11y gate: keyboard focus visible on rail items and links, rail operable by keyboard, charts carrying an accessible description of what they show.
- [ ] 6.6 Confirm both locales render and that case-study links resolve to the right locale prefix.
- [ ] 6.7 Screenshot all five steps in both locales and review before merge — the layout bugs in this work were all found by measurement, not by reading the CSS.

## 7. Close-out

- [ ] 7.1 `bun run check`.
- [ ] 7.2 Update the `how-it-works-proof-mocks` memory with the final decisions and drop the mock URLs once the section is live.
