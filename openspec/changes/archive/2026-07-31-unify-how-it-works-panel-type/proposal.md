## Why

The homepage process panel read as a display headline with a caption under it: the
headline ran at `clamp(1.15rem, 4vw, 3.7rem)` and the supporting sentence at
`clamp(0.82rem, 1.15vw, 1.15rem)` — a 3.5× size gap that made the sentence look
like a footnote to the claim rather than part of it. The section's job is to make
one falsifiable statement per step, and splitting it across two type sizes worked
against that.

Two of the five steps also said the same thing twice: the headline stated the
claim and the sentence restated it with the same figures, which only looked
acceptable while the two were different sizes.

This proposal documents work already implemented and shipped in `bf9badf6`, so the
`how-it-works-proof` spec matches `main`.

## What Changes

- Headline and supporting sentence render at **one type size** on every step and
  at every breakpoint. Only weight, letter case and tint separate them.
- The shared size is `clamp(1.15rem, 2.6vw, 2.4rem)`, not the headline's former
  `3.7rem`. **This is a constraint, not a preference**: all five panels share one
  grid cell, so the stage is permanently as tall as its tallest step, and the
  section is pinned at `min-height: 100svh`. Copy that does not fit is cut off the
  top and bottom of the screen rather than scrolled to. Both at `3.7rem` needs
  1038px inside an 816px viewport and drops the figure row and proof card off the
  screen at *every* desktop width measured (+138 at 1440×900, +244 at 1366×768,
  +181 at 1280×800, +140 at 800×700).
- **BREAKING** (spec-level): the panel headline becomes **optional**. A step whose
  sentence already opens with its headline carries the sentence alone rather than
  saying it twice. PL and EN steps 01 and 03 now do; steps 02, 04 and 05 keep
  their headline.
- Step 01's sentence ends on a colon and hands off to the figure row instead of
  restating the same two numbers in prose. Step 03's sentence leads with the
  filter, so the former headline is its opening clause.
- The supporting sentence loses its `max-width: 60ch`; at display size it runs the
  panel's full width, so the figure row now fills the depth the prose leaves
  rather than the width beside it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `how-it-works-proof`: the headline changes from mandatory on every step to
  optional, and the panel gains a requirement that the headline and the sentence
  render at one size, bounded by the pinned viewport.

## Impact

- `app/(frontend)/(home)/sections/how-it-works/how-it-works.module.css` —
  `.panelTitle` and `.panelSay` merged into one rule; mobile tiers unified; the
  short-viewport tier (`max-height: 620px`) takes its own step down, because at
  `1rem` the pinned section ran 19px past a 360×568 screen.
- `app/(frontend)/(home)/sections/how-it-works/index.tsx` — the headline renders
  only when the step carries one.
- `lib/content/home.ts`, `lib/content/home.en.ts` — `Step.proof.title` is now
  optional; steps 01 and 03 merge their headline into the sentence in both
  locales.
- `lib/content/how-it-works.test.ts` — unchanged and still passing. Its
  "grouped numbers cannot wrap" check already tolerates a missing headline, and
  both merged sentences stay inside the 25-word budget (22 and 23 words).
- No change to the figure row, the proof card, the step rail, the pin mechanism
  or the case-study links.
