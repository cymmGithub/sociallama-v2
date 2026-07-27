## Context

48 case studies, 47 logo PNGs on disk plus one study (`skibooking`) with none. The presentation problem was diagnosed against an interactive mock rendering all 48 real cards with independent toggles for card surface, asset source, colour treatment and sizing model, so each variable could be isolated. Two findings from that mock drove the design and are worth recording, because both contradict the obvious approach.

## Decision 1 — a CSS filter cannot deliver monochrome logos

The intuitive implementation is `filter: grayscale(1) brightness(0)` over the existing assets. The mock disproves it directly: with the original PNGs selected, forcing black turns 19 logos into **solid black rectangles**, because `brightness(0)` blackens the baked background along with the mark. On a white card, `mix-blend-mode: multiply` would rescue the 9 light-boxed logos for free, but does nothing for the 8 dark-boxed ones — they become black slabs, and those are the worst offenders today.

**The asset re-cut is therefore mandatory regardless of colour treatment.** Colour is the finishing step, not the fix. This is the single most important thing to carry into implementation: no amount of CSS substitutes for the pipeline.

## Decision 2 — key on distance from the background, not on darkness

The pipeline went through five formulations before converging. Recording the failures because each is a plausible thing to reach for again:

| attempt | rule | failure |
|---|---|---|
| 1 | alpha channel is the shape; paint it black | destroys logos with knocked-out interior detail — ozgasl's car, mmhygienic's bottle, bioagris's leaf all become filled silhouettes |
| 2 | key on luminance (dark = ink) | ghosts every mid-tone brand colour: ENGIE blue, FoodSaver green and Mazurska gold render as faint grey |
| 3 | `max(darkness, chroma)` | fixes the mid-tones but turns red-tile logos (polomarket, julius-meinl) into solid black squares — the *background* is itself saturated, so chroma marks the whole field as ink |
| 4 | **distance from the sampled background colour** | correct in principle; regressed ASUS and pracuj.pl |
| 5 | 4 + a background-existence test | shipped |

The final rule is one idea: **ink is whatever is far from the background colour** — not dark, not saturated, far. That covers every source class uniformly:

```
white box + black text     bg=white  ->  text is far      -> ink
red box   + white text     bg=red    ->  text is far      -> ink
navy box  + gold art       bg=navy   ->  art is far       -> ink
transparent + colour art   bg=white  ->  art far, knockout falls away
```

Two refinements were necessary and are not obvious:

**Border-ring alpha is not a safe test for "does a background exist".** A tightly-cropped wordmark (ASUS, pracuj.pl, irobot) bleeds to the frame edge, so its ring samples *ink*. Subtracting the ring median then erases the logo and keeps its antialiasing — ASUS rendered as a grey ghost. The fix is to test the ring's **uniformity** on the white-flattened image: a real background is one flat colour; a bleeding logo's ring is not.

**For sources that do have transparency, measure distance on the raw RGB and let alpha scale it.** Flattening a soft-alpha mark onto white before measuring washes it to mid-grey and keys it out as half-ink. Alpha carries coverage; the stored RGB carries colour. Keeping them separate is what makes ASUS come back crisp while ozgasl's knocked-out interior still falls away.

**Three logos defeat the ring-uniformity heuristic** — `mazurska`, `mercator`, `adamed` — because their ink runs to the frame edge *and* they sit on a baked tile, so the ring is neither clean background nor clean ink. They carry an explicit `FORCE_BAKED` override. A sixth heuristic was rejected: it would destabilise the 44 logos that already work to rescue three. A three-entry override list is the cheaper and more honest instrument.

**Residual failures (3 of 48)** are recorded in `proposal.md`. They are information-loss problems in the source files, not algorithm problems, and need the clients' vectors.

## Decision 3 — optical area normalisation, not just `object-fit: contain`

`contain` equalises the **box**, not the **ink**. Fitted to an identical box, VOLVO (dense wordmark, AR 7.38) and Rondo Wiatraczna (airy crest, AR 1.32) still read at very different weights. The pipeline emits an inked-pixel-area figure per logo; the card scales each so its rendered ink area lands near the set median, clamped to `[0.72, 1.35]` so nothing goes silly.

This is a genuine judgement call with a cost: it adds a per-logo data dependency the card must carry. The mock exposes it as a separate toggle ("Fixed box" vs "Fixed box + optical") specifically so it can be dropped without touching anything else if the added complexity is not judged worth it.

## Decision 4 — unconditional monochrome, no hover reveal

The homepage `ClientLogos` belt greys logos at rest and reveals brand colour on `:hover`, gated to fine pointers. Mirroring that on the cards was mocked (preset C) and rejected: the cards are a scanning surface rather than a hover surface, so most visitors would only ever see the grey state, and a colour-on-hover card competes with the card's own hover affordance.

The cost is real and worth stating: a few marks are carried mainly by colour — Riviera's rainbow, ENGIE, Bioagris. Monochrome is the standard agency convention (Webflow, Vercel and Linear all do it) and the set reads as one system, which is the actual goal.

## Decision 5 — the header backdrop is the site's own stage, not generated imagery

The reference the direction came from is `webflow.com/customers`. Webflow does **not** generate their header images: every card is a screenshot of the customer's real site composited inside the Webflow Designer chrome. The unifier is *a repeated frame around authentic content*.

Three directions were mocked. The chosen one puts the real client photograph on the shared brand stage as a floating framed artefact with the headline metric. A Higgsfield-generated backdrop family was built and evaluated — two real generations, 4 credits — and dropped, because the mock showed the floating artefact covers nearly the whole frame, so the generated layer contributes a corner gradient in exchange for drift across 48 images and a credit cost per regeneration. The site's own stage recipe delivers the same composition deterministically and additionally unifies the grid with the homepage.

A full-bleed plum duotone was also mocked and rejected: it discards the client's own colour (Vobis pink, Power Elements green all collapse to plum) for a grade that reads as a filter. Note for anyone revisiting it — the naive implementation (`mix-blend-mode: luminosity` over a plum ground) drags every midtone to hot magenta and looks cheap; a real duotone needs desaturation first, then `multiply` with a warm-to-plum ramp.

## Decision 6 — extend the merged client-logo pipeline, do not add a second one

**Added during implementation.** This change was branched from `04efb81`, before
`rebuild-client-marquee` merged at `5a727c4`. That change landed
`scripts/client-logos/pipeline.py` and a `client-logo-assets` spec capability
covering plate removal, crop-to-primary-mark, optical-mass normalisation and
contact-sheet review — the same three sub-problems Decisions 2 and 3 above solve
from scratch. There was **no textual git conflict** between the two branches,
which is exactly why this nearly shipped as a silent duplicate.

The two contracts genuinely differ and cannot share output files:

| | belt | case-study cards |
|---|---|---|
| ink | full colour; hover reveals it | flat black |
| placement | centred on 280×88 | left-aligned on 280×72 |
| light ink | darkened to a contrast floor | irrelevant — everything is black |

But the *machinery* is common, so the pipeline gained a `--case-studies` pass
that reuses `dematte`, `trim`, `load` and `ink_area` untouched and overrides only
`mono_ink` and `place_left`. Three consequences worth recording:

- **The border-connected flood is better than the ring-uniformity gate** in
  Decision 2. That gate has a precondition it cannot see: it asks "is there a
  plate *behind* the mark", which is meaningless for an opaque source that fills
  its frame. ENGIE and KBP are opaque dark tiles whose ink bleeds to the edge —
  the gate answered "no background", the whole tile keyed as ink, and the logo
  came out inverted. Flooding inward from the border has no such blind spot.
  Decision 2's ink rule survives intact; only its background-existence test is
  replaced. `FORCE_BAKED` disappears with it.
- **Optical mass is baked into the asset, not applied in CSS.** Decision 3
  proposed a per-logo scale factor the card would carry. The merged pipeline
  already solves this against a fixed canvas, so the data dependency Decision 3
  flagged as its cost simply does not arise. The constraint this transfers to
  the CSS is that the slot's aspect ratio must equal the canvas's, or `contain`
  re-fits the mark and undoes the normalisation.
- **`BRANDS` already records which source file is undamaged, per brand and with
  the reasoning.** Inheriting those choices fixes `imid-cmv`, one of the three
  residual defects, because its repository asset is a crop out of a larger layout
  carrying a watermark arc. Its belt-height crop overrides (`gap`/`band`/`keep`)
  are deliberately *not* inherited — they drop secondary lines that are
  unreadable at 44px, and the card slot is taller.

## Implementation constraints

- **`background-size: 700px 700px` on the grain tile is load-bearing.** It is fixed so noise density stays identical across panels of different widths. Changing it to `cover` silently breaks the match with the homepage. The source module carries this comment; carry it across.
- **`.d3 > * { position: relative; z-index: 1 }`** is required — tree order paints the grain `::after` over the children otherwise. The homepage module has the same line for the same reason.
- **Payload rejects SVG uploads** (`application/xml`), so the ski-booking logo must be rasterised before upload.
- **`--surface-2` is theme-derived** via `color-mix`. A white card needs a token, not a literal, or it breaks under any other `data-theme`.
- **`refresh-case-study-logos.ts` must be run twice** — its own header explains why, and the check is that no filename matches `/-\d+\.png$/`.
