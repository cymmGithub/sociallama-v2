## Context

Two mocks were built and reviewed before this design settled. Both are private artifacts:

- **v1 — report pages as-is**: `https://claude.ai/code/artifact/02210e77-5b55-42a1-8aa1-3098da0b222c`
- **v2…v9 — native render, current direction**: `https://claude.ai/code/artifact/77f5e975-b020-4700-8d41-75feefe74ef6`

The second artifact still carries switches for the two undecided variants (step 02 presentation, step 04 content) and for icon treatment. Those switches are mock-only scaffolding and do not ship.

Source material: `Raport roczny Pracuj.pl 2024.pptx` and `iRobot - raport z całej współpracy.pptx`, both under the Drive folder recorded in the `gdrive-rclone-download` memory. Every figure quoted below was read from those decks; none is estimated.

---

## Decision 1 — Rail plus one exhibit, not five cards

Five cards in a row is what makes the pin pointless: all five are legible immediately, so scrolling only moves a highlight. Moving the steps into a left rail and giving the right side to **one exhibit at a time** means each scroll beat swaps real content, which is what a pin is for.

The rail keeps the existing card treatment — glass fill, orange border and glow on `[aria-current="true"]` — so the active-state language the section already has survives the move.

**Rejected: keeping the cards and adding a proof chip to each.** A ⅕-width column cannot hold a logo, a figure and a link at readable size, and five client logos in a row compete with the client marquee one screen above.

## Decision 2 — The stage stays content-sized

The live `.stage` has no `flex: 1`; it is content-height, vertically centred inside a `100svh` sticky. The first native mock added `flex: 1` and the panels ended up marooned in a field of empty plum — the section looked *emptier* than what it replaced.

Keep it content-sized. To stop the stage resizing as steps swap, **all five panels share one grid cell** (`grid-area: 1 / 1`) and inactive panels are hidden with `visibility`, not `display`. The container is therefore always as tall as the tallest panel, the stage height is constant across all five beats, and `visibility: hidden` still removes inactive panels from the tab order and the accessibility tree.

Measured: 0px height change across steps at 1440×900, 1280×720 and 390×844.

## Decision 3 — Charts get half the panel; photos do not

**Superseded on desktop by Decision 10** — steps 01–04 no longer have a media column inside the panel at all. This still describes narrow viewports, where every exhibit stacks under its copy, and step 05 on desktop.

Photographs are capped (`max-height: 22rem`, `13rem` on narrow viewports), because one tall portrait screenshot otherwise sets the height for all five panels, which share a cell.

## Decision 4 — Step 01 is a line chart with real axes and exactly two points

The chart plots `1 168` at the start against `6 222` after seventeen months, with a zero-based y-axis, three gridlines, tick labels and x-ticks under each measured point.

**It has two points because two points is all the data there is.** Neither deck contains a monthly series. Drawing a curve between them would mean inventing the middle, and the one section whose entire purpose is proving the words are true is the worst possible place to invent anything. If monthly follower counts can be exported from TikTok, this becomes a real series and the x-axis gains meaning it does not yet fully have.

The y-axis starts at zero so the growth is not visually exaggerated. Grid is set at 13% opacity against axes at 30%, so the data is the brightest thing in the frame.

**Likes are a second row, not a second line.** `+57 911` (×40) is more dramatic than the follower growth (×5,3), but the two measures differ by an order of magnitude and sharing one axis is the single most common chart misread. Followers carry the chart; likes carry a labelled delta beneath it.

## Decision 5 — Step 02 is a diagram, not photographs and not a table

Three treatments were built and compared in the mock:

| Treatment | Proves the claim? | Reading cost |
|---|---|---|
| Three campaign frames | no — shows *that* content exists, not that six plans differ | none |
| Full text matrix (2 × 3 cells of prose) | yes | high — this is what "too much to read" was about |
| **2×3 diagram, one word per cell** | **yes** | **near zero** |

**Revised 2026-07-29 into a two-card infographic** — one card per dealership, three platform rows each, rather than a 2×3 matrix. The count is unchanged (six filled cells) and so is the argument; what the card form adds is that the *same* three platforms visibly repeat with different words in them, which is closer to the actual claim than a matrix's shared axes. The cards needed a filled accent header to survive the sand ground: cream on sand is barely five percent apart in luminance, and with only a hairline border the exhibit read as a plain list.

The diagram wins because **the reader counts the cells**. Two columns, three rows, six filled tiles, one word each (`Premiery / Rodzinnie`, `Kulisy / Design`, `Floty / Społecznie`), closed by the line `2 salony × 3 platformy = 6 osobnych planów treści`. The headline stops being a claim and becomes something visibly true. Every word is condensed from the Volvo pillars in `seed-case-studies.ts:588–666`.

**Platform marks are the official full-colour brand SVGs**, inlined from `app/(frontend)/case-studies/[slug]/brand-icons.tsx`. Two alternatives were considered and rejected:

- **Lucide.** The installed `lucide-react@1.24.0` ships 1978 icons and **zero brand marks** — Facebook, Instagram and LinkedIn were removed at v1 for trademark reasons. Verified by grepping the whole package. Substituting a generic glyph (`at-sign` beside the word "Instagram") would be arbitrary decoration.
- **Redrawing the marks monoline "in Lucide's style."** That is inventing someone else's trademark.

Monochrome and icon-less variants were mocked; colour was chosen. The design argument against colour is recorded for the record: three saturated foreign hues make the axis labels the most saturated thing in a panel whose content is the six cells.

## Decision 6 — Nothing is dated, and a build check enforces it

Absolute dates age the page the moment it is read; durations stay true forever. *"Sześć tygodni od podpisania umowy do pierwszego opublikowanego materiału"* is a claim about how the agency works. `27.03.2024` is a fact about one Tuesday.

This is enforced mechanically because it is exactly the kind of rule that leaks. During the mock build the check caught two occurrences a read-through had missed: a screen-reader label reading *"na TikToku w 2024 roku"*, and a footer credit naming the report by year.

The check strips base64 blobs and the SVG namespace URL, then fails on any `19xx`/`20xx`, any `dd.mm.yyyy`, and any Polish month name.

Note the source deck is older than the current year, which is a second reason not to date anything: an accurate date would also read as stale.

## Decision 7 — Step 05 renders real pages in isometric projection

Rather than a stylised "document" card, step 05 shows three real pages of the Pracuj.pl report — *Świadomość marki*, *Demografia fanów*, *Rekomendacje* — projected isometrically with per-card shadows and a hairline cream edge.

Generated with a perspective transform (8 coefficients solved corner-to-corner), width running up-to-the-right, height falling slightly right. **The frame is computed from the geometry, not hand-tuned**: an early pass clipped the back card's top-right corner at `y ≈ −174` while `getbbox()` still produced a plausible-looking image, because the missing corner had simply never been drawn. The generator now derives the canvas from all card corners plus the shadow offset, adds a 70px margin, and asserts every canvas edge is fully transparent.

**The title page is excluded** — it is the only page carrying the year in large type.

Legibility is intentionally at the threshold: headings and the Social Lama mark are recognisable, body text is not. It should prove the document exists without dumping a client's data onto the homepage.

Output is WebP with alpha (68KB versus 369KB as PNG).

## Decision 8 — Mobile keeps the claim and the link, not the detail

A reader scrolling a pinned section on a phone will not read six matrix cells at 10px. Presenting them anyway is theatre. Each panel keeps its headline and single strongest visual; the matrix, goal tags, pull quote and conclusion boxes are hidden behind `.m-hide`, panel 02 substitutes a one-line summary, and the panel closes on a full-width **44px** pill link.

Three cascade bugs were fixed here and are worth recording, because all three had the same shape — a later, equally-specific rule silently undoing an earlier one:

- `.duo .media` (0,2,0) beat `.v2-diagram` (0,1,0), so the diagram inherited the three-column photo grid and collapsed to a third of the panel.
- Per-variant panel rules (`body[data-v2=…] .panel.duo`, specificity 0,3,1) outrank the mobile media query (0,2,0), so the phone kept a two-column panel until they were explicitly unset inside the query.
- `.duo .media img{max-height:none}`, written for the aspect-ratio-driven photo row, cancelled the height cap on a different variant further up the same query.

## Decision 9 — Mixed roster, no visible marks

Steps 01 and 04 are iRobot, 02 is Volvo, 03 is Pracuj.pl; 05 addresses the reader directly (*"dostajesz co miesiąc"*) and belongs to no client.

**Revised 2026-07-29 (user decision): the eyebrow label and client wordmark are removed from every step.** This was argued against and overruled, and the trade should be recorded plainly. What is lost is the at-a-glance "portfolio walk" reading — the mitigation this design originally offered against five exhibits looking like five disconnected boasts. What survives is the part that carries the actual burden of proof: every claim still deep-links to the case-study section holding the same figure, so it can be checked in one click. The removal also had a practical upside — the Pracuj.pl mark is a knocked-out lozenge rather than a wordmark, and at 0.9rem on plum it read as a white smudge next to the two clean wordmarks.

Consequence worth watching: with the marks gone, the link is now the *only* attribution, so `how-it-works.test.ts` asserts its presence on steps 01–04 rather than treating it as decoration.

## Risks

| Risk | Mitigation |
|---|---|
| Redrawn evidence reads as agency-made again | Real figures, named clients, per-step deep links, and one genuine artefact at step 05 |
| Step 04 shows subscriptions and omits declining views | Open question 2; a safe alternative is built and one switch away |
| Client objects after launch | Sign-off before ship; everything except the iRobot baseline and the report pages is already public |
| Figures drift from the case studies | Deep links point at the section carrying the same number, so drift is visible; open question 4 is one such drift, already present |
| Section grows back toward the density that was rejected | Copy budget is part of the spec: one headline, one sentence, one visual, one link |

## Decision 10 — On desktop the exhibit is lifted out of the plum stage

Measured on the built section, the sand ground to the right of "HOW / IT WORKS" was a **~900×290px void** at 1440 (larger at 1920), while inside the plum stage the panel copy sat small in a block whose height was set by the rail. Both problems have the same fix: move the exhibit up into the void and give the freed width back to the copy and the rail cards.

- **Steps 01–04 lift; step 05 does not.** The report render is near-white paper — it pops on plum and would wash out on sand. So on step 05 the void is simply empty, which the display heading absorbs without looking broken.
- **This is a re-skin, not a move.** Every exhibit was drawn for plum (grid at 13% cream, axes at 30% cream, cells on orange at 13%). All of it now comes from `--ex-*` custom properties that the two grounds set differently: the plum set on `.panels` pins absolute tokens so the island stays theme-proof, while the lifted set uses the theme-aware trio — and on this ground `--color-contrast` already resolves to plum, which is what gives the sand charts adequate contrast where orange would have failed (`#f09b39` on `#e0ddd3` is roughly 1.6:1).
- **The height invariant now applies twice.** The lifted slots share one grid cell exactly as the panels do, so the head keeps a constant height across all five steps — including step 05, where the cell sits empty at the height of the tallest exhibit. Measured: head `352px` and stage `493px` (PL) / `452px` (EN), unchanged across every step.
- **Narrow viewports are untouched.** The exhibit is rendered twice — once lifted, once in the panel — and CSS hides whichever does not apply. That is what forced `idPrefix` onto `BrandIcon`: with the diagram rendered twice, the hardcoded `ig-gradient` id became a real duplicate. `useId()` was rejected because `brand-icons.tsx` has no `'use client'` and is rendered from a Server Component on the case-study pages.

**Cost:** the exhibit and its headline are now ~300px apart on desktop, and with the client marks also gone (Decision 9) the lifted graphic sits beside the section heading with no caption of its own. The chart's own `aria-label` still describes it, and the active rail item plus the panel headline supply the context visually.

## Decision 11 — Exhibit width is bounded by height, not by taste

Once the exhibits moved up (Decision 10), the obvious next move was to let them run as wide as the head allows. Two of the four take that for free — the bar chart's height is fixed in CSS and the infographic's is set by its text, so both simply got wider. The other two are constrained:

- **The follower chart** keeps an aspect ratio, so width and height move together. Widening it to fill the head meant *reshaping* it: the plot frame went from `340×186` to `574×186` (~3:1). The section has to fit `100svh` with the stage below it, and at the old ratio the chart alone would have consumed the budget. Measured, the head actually got shorter — `352px` → `306px`.
- **The photo row** is capped at `37rem` for the same reason, and this one is a trap worth naming: all four lifted slots share a single grid cell, so the *tallest* exhibit sets the head height for every step. An uncapped row of three portrait screenshots would silently push the whole section past the viewport on step 03 only.

## Decision 12 — Step 03 shows three AR stills, and the third had to be recovered

One screenshot under-sold a filter that 4 885 people actually used, so step 03 shows three. Only two genuine AR images existed in the repo (`pracuj-pl-ar-grid`, `pracuj-pl-ar-creator`); the deck reuses those same two. The third was recovered from the deck's **embedded media** (`ppt/media/image77.png`, 943×2048 — a second creator with the effect on), which is higher resolution than anything rendered from the slides.

It carried a visible post date (`2024-5-17`) and was cropped above the caption row to remove it. `pracuj-pl-humor-pov.jpg` was considered and rejected twice over: it carries a legible `2025-11-15`, and it is not AR material, so using it under an AR headline would have padded the evidence rather than added to it.

**This has a consent consequence** — see task 0.1. The proposal's original claim that "everything except the iRobot baseline and the report pages is already public in the case studies" no longer holds: this still shows an identifiable creator and has never been published on the site.

## Decision 13 — The exhibits are removed (2026-07-29)

First outside feedback on the built section was that the graphics above the gradient block had to go. Asked whether the evidence should move back inside the block or be dropped, the decision was to **delete the exhibits entirely, on every viewport**. What ships is the step rail plus, per step, a headline, one sentence and one link.

This unwinds Decisions 3, 5, 7, 10, 11 and 12, and most of Decision 9. Recorded plainly, because it is a large reversal:

- **What is gone:** the follower chart, the content-structure infographic, the AR shots, the isometric report render, the client attribution, the `--ex-*` two-ground colour system, `HOW_IT_WORKS_GEOMETRY`, `exhibits.tsx`, the `idPrefix` prop on `BrandIcon`, and the two generated assets (`pracuj-pl-report-iso.webp`, `pracuj-pl-ar-creator-2.jpg`) with their generator.
- **What survives, and why the change is still worth shipping:** the five step sentences are unchanged, but each now sits beside a headline and a sentence carrying **real, unrounded figures from client reports** — `1 168`, `+5 054`, `+57 911`, `6,79 mln`, `4 885`, `blisko dwudziestokrotnie` — each deep-linked to the case-study section holding the same number. The original complaint was that the section asserted a process and gave the reader no reason to believe it. Specific, sourced, checkable numbers still answer that; they just answer it in words rather than pictures.
- **What is honestly weaker:** the proposal's argument was that *"an unreadable document is not proof, it is texture"* and that redrawn evidence earns belief by being visible. Prose figures are easier to skim past than a chart, and with the client marks gone too, nothing on the section's own surface says these are a client's numbers rather than the agency's — the reader has to follow a link to find out. That risk was raised twice and the decision was made with it in view.
- **Consent scope shrinks back.** Deleting `pracuj-pl-ar-creator-2.jpg` and the report render removes the two never-published items from the sign-off ask. What remains needing consent is the iRobot baseline (`1 168`) and the YouTube growth figures, which are still quoted in the copy.

## Decision 14 — The proof card (2026-07-29)

Decision 13's full deletion did not survive contact: attribution for the figures was then called mandatory. What went back in is **not** the exhibits — it is a subtle card at the foot of each step's copy:

> Tak to wyglądało u **[VOLVO]**
> ZOBACZ CASE STUDY →

- **The wordmark is the brand name**, so the label deliberately stops short of repeating it and the card reads as one sentence. Its `alt` comes from `CLIENT_ROSTER`, not the roster key — `pracuj-pl` would otherwise be announced as "pracuj dash p l".
- **The whole card is the link**, which also gives narrow viewports a 44px target without a separate pill.
- **Per-step CTA copy is gone.** Four bespoke strings ("Zobacz, jak zaczynaliśmy", "Zobacz całą strukturę"…) became one shared `caseStudyCta`, because the card now supplies the context the bespoke wording used to carry.
- **Step 05 has no card** — no client, nothing to attribute, consistent with Decision 9.

This lands where the section should probably have started: the figures do the arguing, and the card says whose figures they are and where to check them. It restores what Decision 9's removal cost — visible client attribution — without reopening Decision 13.
