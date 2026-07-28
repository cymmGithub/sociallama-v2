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

The media column is sized per exhibit type rather than uniformly:

| Panel type | Media column | Steps |
|---|---|---|
| chart-led | `minmax(0, 26rem)` | 01, 04, 05 |
| diagram | `minmax(0, .78fr) / minmax(0, 1.22fr)` | 02 |
| photo-led | `minmax(0, 13.5rem)` | 03 |

Photographs are capped at `max-height: 22rem`, because one tall portrait screenshot otherwise sets the height for all five panels.

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

## Decision 9 — Mixed roster, with each panel marked

Steps 01 and 04 are iRobot, 02 is Volvo, 03 is Pracuj.pl. Step 05 carries **no** client mark: steps 01–04 are evidence of what was done for someone else, while 05 addresses the reader directly (*"dostajesz co miesiąc"*), and attribution there fights the copy.

## Risks

| Risk | Mitigation |
|---|---|
| Redrawn evidence reads as agency-made again | Real figures, named clients, per-step deep links, and one genuine artefact at step 05 |
| Step 04 shows subscriptions and omits declining views | Open question 2; a safe alternative is built and one switch away |
| Client objects after launch | Sign-off before ship; everything except the iRobot baseline and the report pages is already public |
| Figures drift from the case studies | Deep links point at the section carrying the same number, so drift is visible; open question 4 is one such drift, already present |
| Section grows back toward the density that was rejected | Copy budget is part of the spec: one headline, one sentence, one visual, one link |
