## Why

The HOW IT WORKS stage is a plum block that its own content does not fill.

Measured on the live page at 1440×900:

| | |
|---|---|
| stage block | 1408 × **493** px |
| active panel's content (steps 01–04) | **265** px tall |
| active panel's content (step 05) | **177** px tall |
| what sets the block's height | the five-item rail beside it — **418** px |

The block is tall because the rail has five items, and the panel is short because a
step is a headline plus one sentence. The sentence is additionally capped at `60ch`,
so it stops around halfway across a ~1000px column. The result is a large empty
rectangle in the block's right half, made more conspicuous by the orange glow that
sits in exactly that corner — and worst on the closing step, which carries no proof
card at all.

This is the direct consequence of `refine-how-it-works-proof`, which was right to cut
the density but left the container sized for the density it removed.

Three directions were mocked against the real copy and reviewed
(`https://claude.ai/code/artifact/043f30bf-6c38-43e1-9ad1-39dec94a3ee6`). The chosen
one is the least invasive of the three: the rail, the pin, the proof card and the
step copy are all untouched, and the fill comes from restating each step's figures at
display scale.

## What Changes

- **A figure row per step.** Beneath the sentence, each step restates its own figures
  as two or three cells — figure at display scale in accent orange, its noun beneath
  in mono caps. The row spans the panel's full width and is pinned to the foot of the
  panel, so it lands on the same baseline on every step regardless of how long that
  step's sentence runs.
- **The proof card moves to the panel's bottom-right**, under the figure row, so the
  panel closes on the same corner the progress bar runs to instead of leaving the
  right half open.
- **The panel stretches instead of centring.** It was vertically centred inside a cell
  sized by the rail, which is what put plum both above and below the copy.
- **Nothing new is claimed.** Every value in the row is already on the step's own
  surface — in its sentence, or (steps 02 and 05, whose sentences carry no digits) in
  its headline and its stated reporting cadence.

### Figures, and where each comes from

| Step | Row | Source |
|---|---|---|
| 01 | `+5 054` obserwujących · `+57 911` polubień · `17` miesięcy | the sentence, verbatim |
| 02 | `2` salony · `3` platformy · `6` strategii | its own headline, "Dwa salony, trzy platformy, sześć strategii" |
| 03 | `6,79 mln` wyświetleń · `4 885` filmów użytkowników · `0` umów z influencerami | the sentence; the `0` restates "bez żadnej umowy" |
| 04 | `~20×` więcej subskrypcji · `1` rok opieki | the sentence's "blisko dwudziestokrotnie", "w pierwszym roku" |
| 05 | `12` raportów w roku · `1` podsumowanie roczne | the sentence's "co miesiąc" and "na koniec roku" |

Explicitly **out of scope**: any exhibit, chart, diagram or image (still forbidden);
the rail's contents and behaviour; the pin range; the step copy itself; mobile layout.

## Capabilities

### Modified Capabilities

- `how-it-works-proof`: each step's panel gains a figure row restating that step's own
  figures at display scale, pinned to the foot of the panel; the proof card moves
  below it at the panel's trailing edge. The per-step element budget is amended to
  admit the row.

## Non-Goals

- **No new evidence.** The row is a restatement, not an addition. Anything that is not
  already on the step's surface does not go in it.
- **No exhibits, still.** The prohibition on charts, diagrams, photographs and
  rendered artefacts from `refine-how-it-works-proof` stands unchanged. A row of set
  type is not an exhibit.
- **No mobile figure row.** Mobile has no void to fill — the panel is already full
  width there, and the section has to fit one pinned viewport. The sentence above
  carries every one of these figures, so the row is dropped rather than stacked. See
  `design.md` Decision 3.
- **No rail redesign.** Two of the three mocks reshaped the rail into an index or a
  gauge; both were rejected in favour of leaving it alone.

## Impact

- **Modified code**:
  - `lib/content/home.ts` — `Step.proof` gains `stats`; five PL rows added.
  - `lib/content/home.en.ts` — five EN rows added.
  - `app/(frontend)/(home)/sections/how-it-works/index.tsx` — new `Stats` component;
    `ProofCard` wrapped in a trailing-aligned row.
  - `app/(frontend)/(home)/sections/how-it-works/how-it-works.module.css` — figure-row
    styles; `.panel` stretches on desktop and keeps centring on mobile; `.cardRow`.
  - `lib/content/how-it-works.test.ts` — row shape and non-breaking-figure tests.
- **No new dependencies, no new assets, no new env vars.**
- **Open item carried forward**: client sign-off from iRobot, Volvo and Pracuj.pl for
  the figures still quoted. The row does not widen that scope — it repeats figures the
  page already publishes.
