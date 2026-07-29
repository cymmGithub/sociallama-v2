# Design — refine-how-it-works-figures

## Decision 1 — Fill with the figures the copy already has, not with new material

The section's evidence is numeric, and the numbers were buried mid-sentence at body
size. Lifting them out is the only fill available that adds no claim: the alternative
ways to occupy ~500×1000px of plum are an image (forbidden), more prose (the sentence
is capped at 25 words for a reason), or an invented statistic.

Steps 02 and 05 have no digits in their sentences, which is what makes this decision
non-trivial — a row that works for three steps and not the other two is not a layout.
Both turned out to state their figures in words: step 02's own headline is *"Dwa
salony, trzy platformy, sześć strategii"*, and step 05 states a monthly report and an
annual wrap-up. So all five steps can carry a row without inventing anything.

**Rejected**: deriving figures that read well but are not stated — e.g. "0 zł za
influencerów" for step 03. The copy says *"bez żadnej umowy"*, so the row says
`0 umów z influencerami`.

## Decision 2 — The row is pinned to the foot of the panel, not floated under the sentence

`margin-top: auto` inside the panel's flex column. Two consequences, both wanted:

1. The panel now occupies the cell the rail sizes, instead of being vertically centred
   inside it with plum above and below. `.panel` changes from `align-items: center` to
   `stretch` on desktop for this reason.
2. The row lands on the same baseline on all five steps. Sentences run one to three
   lines depending on the step; a row that followed the sentence directly would move
   with it, and the block would look like it was breathing between steps even though
   its height is constant.

Mobile ends up elsewhere — see Decision 5, which supersedes this for narrow
viewports once the stage stopped being panel-sized there.

## Decision 3 — Mobile gets the row too, stacked, and this reverses a first attempt

The row was initially hidden below 800px on the reasoning that mobile had no void and
no spare vertical budget. **Measurement contradicted both halves of that**, and the
row was restored:

| viewport | stage before | empty ground above / below |
|---|---|---|
| 390 × 844 | 345 px | 188 / 188 px |
| 360 × 640 | 340 px | 90 / 90 px |

45% of the pinned screen was empty on a modern phone. The stage was floating, not
filling.

The row is **stacked** rather than squeezed into three columns: three cells across a
390px panel gives each ~110px, which forces the figures to a size that defeats the
purpose of lifting them out of the sentence. As rows — figure leading, noun trailing to
the far edge, hairline between — they keep display scale and read as a short ledger.

**Consequence to keep in mind**: on mobile the *panel* sets the stage height (the rail
is a 90px horizontal strip), unlike desktop where the *rail* sets it. So on mobile,
and only on mobile, this row can push the section past its pinned screen. It did:
at 360×568 the stage overflowed by 28px. Hence Decision 4.

## Decision 4 — Short viewports shrink the row rather than drop it

`@media (--mobile) and (max-height: 620px)` takes the figures down one notch. Hiding
the row instead would have been simpler, but the row is the whole point of the change,
and a phone short enough to trigger this is a phone where the empty stage looked worst.

Measured after the change (stage bottom vs. viewport bottom):

| viewport | result |
|---|---|
| 1440 × 820 | fits, 42px slack |
| 375 × 667 | fits, 42px slack |
| 360 × 640 | fits, 30px slack |
| 360 × 568 | fits, 5px slack |

## Decision 5 — On mobile the stage grows, and the copy is centred with the card at the foot

Three rounds of review after the row landed, all on mobile:

1. **"height should be even bigger"** — the stage was still content-sized on mobile and
   floated: at 417×906 it filled ~455px and left half the pinned screen as ground.
   Fixed with `min-height: 68svh` on the stage plus `grid-template-rows: auto
   minmax(0,1fr) auto`, so the panel absorbs the growth. `min-height`, not `flex: 1` —
   it can only grow the block, so short phones (already taller than 68svh in content)
   are untouched and cannot be clipped by it.
2. **"fonts should be bigger"** — the block grew and the type did not. Raised inside
   `@media (--mobile) and (min-height: 680px)`, the same threshold at which 68svh
   starts exceeding the panel's own height. Tying the two to one number stops them
   drifting apart: type only grows where there is room to grow into.
3. **"gap in the middle… move the text"**, then **"card to the bottom"** — pinning the
   figures to the foot (correct on desktop) opened a hole mid-panel on mobile, measured
   at 85px on the fullest step and 207px on the closing one. The copy is now one unit
   with the spare height split above and below it, and the proof card sits alone at the
   foot.

   Done with a **pair of auto margins** — `margin-top: auto` on `.panelTitle`,
   `margin-bottom: auto` on `.stats` — rather than `justify-content: center`. Two
   reasons, both load-bearing: an auto margin on the card alone would have won over
   `justify-content` and top-aligned the copy instead of centring it; and the pair
   still centres correctly on the closing step, which has no card, where a
   card-anchored rule would have bottom-aligned it.

Measured after all three (mid-panel gap now constant at 15px on every step):

| viewport | stage | share of screen | fits |
|---|---|---|---|
| 417 × 906 | 616 px | 68% | 83px slack |
| 390 × 844 | 574 px | 68% | 74px slack |
| 375 × 667 | 468 px | 70% | 39px slack |
| 360 × 640 | 466 px | 73% | 27px slack |
| 360 × 568 | 422 px | 74% | 10px slack |
| 1440 × 900 (desktop) | 493 px | 55% | unchanged |

## Decision 6 — Two mocked alternatives were rejected

Both reshaped the rail, and both were dropped in review:

- **Kartoteka** — rail collapses to a numbered index, the process sentence moves into
  the panel as a lead, and the proof card becomes a full-bleed bar on the block's
  bottom edge. Filled the most evenly of the three. Rejected: needs five new short
  labels (WARSZTAT, STRATEGIA, …) and rewrites the rail.
- **Miernik** — no columns; navigation becomes a vertical gauge on the trailing edge
  whose active numeral grows to 96px. Filled the most aggressively. Rejected: only one
  step's process sentence is visible at a time, and a section called "how it works"
  should show the whole process without requiring a scroll.

The chosen direction leaves the rail, the pin, the step copy and the proof card's
contents untouched.

## Known issue, pre-existing, not addressed here

At **1280×720** the section overflows its pinned screen by ~17px. This is **not** caused
by this change: on desktop the stage height is set by the rail, and the rail is
unchanged — measured identical stage heights (1440: 493px; 1280: 482px) before and
after. It is a separate defect in the section's vertical budget at short desktop
viewports and should be its own change.
