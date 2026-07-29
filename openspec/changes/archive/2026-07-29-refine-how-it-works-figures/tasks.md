# Tasks — refine-how-it-works-figures

## 1. Content

- [x] 1.1 Add `stats: readonly { figure: string; label: string }[]` to `Step.proof` in
      `lib/content/home.ts`, documenting that the row restates and never adds.
- [x] 1.2 Add the five Polish rows. Grouped digits use U+00A0 (`+5 054`,
      `+57 911`, `4 885`, `6,79 mln`).
- [x] 1.3 Add the five English rows in `lib/content/home.en.ts`, using that locale's
      own separators (`+5,054`, `6.79M`).
- [x] 1.4 Confirm every row value is traceable to that step's headline or sentence —
      see the table in `proposal.md`.

## 2. Component

- [x] 2.1 Add a `Stats` component rendering figure + label pairs as plain spans, not a
      list — the sentence already reads these figures aloud once.
- [x] 2.2 Wrap `ProofCard` in a trailing-aligned `.cardRow` beneath the row.
- [x] 2.3 Leave the rail, the scroll trigger, the pin range and the card's contents
      untouched.

## 3. Styles

- [x] 3.1 Figure-row styles: full-width flex, `margin-top: auto`, hairline rules
      between cells and above/below the row.
- [x] 3.2 `.panel` stretches (was centred) — on both grounds; see 3b.3 for how the
      mobile copy is positioned inside it.
- [x] 3.3 `.cardRow` returns to block flow on mobile, so `.proofCard`'s
      `align-self: stretch` still spans the column — inside a flex row it would have
      silently shrunk the touch target to its content width.
- [x] 3.4 Stack the row on mobile: figure leading, noun trailing, hairline between.
- [x] 3.5 Reduce the row's scale at `(max-height: 620px)` so short phones still fit
      one pinned screen.

## 3b. Mobile fill (three rounds of review)

- [x] 3b.1 Stage grows on mobile: `min-height: 68svh` + `grid-template-rows: auto
      minmax(0,1fr) auto`. Reverses the original "no `flex: 1`" decision, whose reason
      (stranding the panel in empty plum) the pinned figure row removed.
- [x] 3b.2 Raise mobile type at `(min-height: 680px)` — the same threshold at which the
      stage's `min-height` starts exceeding the panel's own height.
- [x] 3b.3 Centre the copy as one unit and pin the proof card to the foot, using auto
      margins on `.panelTitle` and `.stats` rather than `justify-content` — see
      `design.md` Decision 5 for why the obvious version breaks step 05.
- [x] 3b.4 Re-tighten the `(max-height: 620px)` guard afterwards; 360×568 had fallen to
      0px slack and is back to 10px.

## 4. Tests

- [x] 4.1 Every step carries two or three figures, each with a non-empty label.
- [x] 4.2 Row figures cannot wrap (same non-breaking rule as the sentence's figures).
- [x] 4.3 Existing "nothing is dated" sweep covers the new strings automatically —
      `allStrings` walks the whole content tree.
- [x] 4.4 A "row restates the copy" test was written and **removed**: half the steps
      spell their figures as words (`Dwa salony`, `Seventeen months later`), so a
      digit-match check would have been an exception list wearing a test's clothes.
      The constraint lives in the type doc and the spec, enforced by review.

## 5. Verification

- [x] 5.1 Stage height constant across all five steps: 1440 → 493px, 390 → 574px,
      identical for every step.
- [x] 5.2 Desktop stage height unchanged by this change (rail-driven): 493px at 1440
      and 482px at 1280, before and after.
- [x] 5.3 Section fits one pinned screen at 1440×900, 417×906, 390×844, 375×667,
      360×640 and 360×568 — slack 82 / 83 / 74 / 39 / 27 / 10px respectively.
- [x] 5.7 Mid-panel gap constant at 15px across all five steps on mobile (was 85–207px).
- [x] 5.4 Mobile proof card still spans the panel and clears 44px.
- [x] 5.5 `bun test` — 589 pass, 0 fail. `tsc --noEmit` — clean.
- [x] 5.6 Biome: 5 pre-existing internal panics, unchanged by this change; no new
      errors.

## 6. Open — not engineering's call

- [ ] 6.1 Client sign-off from iRobot, Volvo and Pracuj.pl for the quoted figures.
      Carried over from `refine-how-it-works-proof`; the row repeats figures the page
      already publishes, so it does not widen the scope.
- [ ] 6.2 Read the row cold in both locales — the sentence and the row now state the
      same figures within ~100px of each other on steps 01 and 03, which is either
      useful emphasis or visible repetition.

## 7. Separate defect, not fixed here

- [ ] 7.1 At 1280×720 the section overflows its pinned screen by ~17px. Pre-existing
      and rail-driven; needs its own change.
