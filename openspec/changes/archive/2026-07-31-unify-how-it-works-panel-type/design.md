## Context

The proof panel carried two type sizes: `.panelTitle` at `clamp(1.15rem, 4vw, 3.7rem)`
and `.panelSay` at `clamp(0.82rem, 1.15vw, 1.15rem)` — 58px against 16.5px at a 1440
viewport. The request was to remove that distinction and run both at the headline's
size.

The binding constraint is the section's own geometry, and it is not obvious from
reading the CSS:

- `.panels` places all five panels in `grid-area: 1 / 1`. Every panel contributes its
  height even while `visibility: hidden`, so the stage is permanently as tall as the
  **tallest** step. There is no per-step outcome — step 03's sentence sets the height
  for steps 01–05 alike.
- `.pin` / `.sticky` pin the section at `min-height: 100svh`. Content that exceeds the
  viewport is not scrolled to; it grows the sticky block past the screen and is cut off
  the top and bottom during the pin.

Together these mean a type-size change is all-or-nothing and is bounded by the
shortest viewport the site supports, not by the average one.

## Goals / Non-Goals

**Goals:**
- Headline and supporting sentence render at one size, so a panel reads as a single
  statement rather than a claim with a caption.
- The section stays inside one pinned screen at every supported viewport, desktop and
  mobile, in both locales.
- Steps that would otherwise state their claim twice state it once.

**Non-Goals:**
- Changing the figure row, the proof card, the step rail, the pin mechanism or the
  case-study links.
- Changing which steps carry client evidence, or any figure's value.
- Rewriting the copy of steps 02, 04 and 05.
- Reinstating exhibits — the prohibition from `refine-how-it-works-proof` stands.

## Decisions

### Shared size is `clamp(1.15rem, 2.6vw, 2.4rem)`, not the headline's `3.7rem`

Measured in Chromium against the section's real CSS and fonts, with both elements at
the old headline size:

| Viewport | Both at 3.7rem UPPER | Both at 3.7rem sentence case | 4vw / 2.8rem | 2.6vw / 2.4rem |
|---|---|---|---|---|
| 1440×816 | +222 | +104 | fits | fits |
| 1440×900 | +138 | +20 | fits | fits |
| 1536×864 | +67 | +67 | fits | fits |
| 1366×768 | +244 | +188 | +26 | fits |
| 1280×800 | +181 | +129 | +37 | fits |
| 800×700 | +140 | +117 | +117 | fits |

The literal request fails at every desktop width, not only the tight ones — at
1440×816 the stage needs 1038px inside an 816px viewport, which slices the figure row
in half and puts the proof card entirely off screen. `2.6vw / 2.4rem` is the largest
shared size that clears all of them and is still 2.1× the sentence's previous size.

**Alternatives considered:**
- *Keep 3.7rem and cut the copy.* Would need steps 03 and 04 roughly halved, to ~55
  characters. Rejected: a copywriting change to fit a type size, when the copy was
  drawn from client reports and had just been agreed.
- *Shrink only the long step.* Impossible — the shared grid cell makes height a
  section-wide property, not a per-step one.
- *Unpin the section, or let it scroll.* Rejected: pinned sequential activation is an
  existing requirement of this capability.

### Only weight, case and tint separate the two

The headline keeps `font-weight: 800`, uppercase and full cream; the sentence takes
`font-weight: 700`, sentence case and cream at 88%. Uppercase on the sentence was
built and reviewed — it also fits at 2.4rem — but costs one extra line per step and
makes a 160-character sentence markedly harder to read. Sentence case was chosen.

Uppercase is not merely stylistic here: at 3.7rem it accounted for 118px of the
overflow on its own (1038px against 920px), because Exo 2's caps are wider and caps
defeat the descender-based line packing.

### The headline becomes optional rather than always rendered

Once both run at one size, a headline followed by a sentence that restates it reads
as the same sentence twice. Steps 01 and 03 fold the headline into the sentence and
render no headline; `Step.proof.title` becomes optional and the component renders the
element only when the step carries one.

Step 01 ends on a colon so the figure row completes the thought, which also removes
the prose restatement of two figures the row already shows at display scale.

### Mobile is tiered, and the short tier needed its own step down

Three tiers, each unifying the two sizes: base mobile at `1.15rem`, tall phones
(`min-height: 680px`) at `1.45rem`, short phones (`max-height: 620px`) at `0.9rem`
with a tightened `.panelText` gap.

The short tier is a measured value, not a guess. At `1rem` the pinned section ran 19px
past a 360×568 screen on the Polish homepage — the sentence alone was 74px across four
lines in a 282px panel. `0.9rem` plus the tighter gap brings it back inside.

### The sentence's `max-width: 60ch` is dropped

At display size 60ch exceeds the panel's own width, so the cap no longer does
anything. Removing it makes the figure row's rationale accurate again: the row now
fills the depth the prose leaves rather than the width beside it.

## Risks / Trade-offs

- **The headline is 35% smaller than it was** → Accepted deliberately. The panel gains
  a single voice, and the sentence — the part carrying the falsifiable claim — more
  than doubles. The alternative preserved the headline's scale at the cost of cutting
  the copy.
- **Panel height is a section-wide property, so any future copy addition can push the
  section off a pinned screen** → The failure is silent: the stage clips rather than
  scrolls, and it appears on every step at once. Mitigated by recording the measured
  ceilings in the CSS comment beside the rule, and by the added spec requirement
  binding the panel to one pinned screen.
- **Verified in Chromium only** → Safari's `text-wrap: pretty` support is newer and
  degrades to normal wrapping, which can add a line on a narrow panel. The 2.4rem cap
  leaves headroom at every desktop size; the short-phone tier is the thinnest margin.
- **A standalone HTML mock cannot verify the mobile tiers** → `@media (--mobile)` is
  PostCSS custom-media and is silently dropped outside the build, so a mock renders
  mobile at desktop values and reports a false pass. The 360×568 overflow only
  surfaced against the running dev server. Mobile claims in this capability must be
  measured on the real page.

## Migration Plan

Already deployed in `bf9badf6`. Pure presentation and copy: no schema, no data, no
route and no API change. Rollback is a revert of that commit.
