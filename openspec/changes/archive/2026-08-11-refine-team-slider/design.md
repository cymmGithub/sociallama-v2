# Design — refine-team-slider

## Decision 1: Source strategy per portrait

Measured edge-contact of the six shipped cutouts (alpha > 10, 422×600):

| Portrait | Left edge | Right edge | Defect class |
|---|---|---|---|
| agnieszka-klajbert | y340–599 (43%) | y375–599 (38%) | both sides, from elbow height |
| aleksander-dyminski | y377–599 (37%) | y414–599 (31%) | both sides |
| przemyslaw-swiercz | y519–599 (14%) | y410–599 (32%) | right arm flat-cut |
| emilia-metryka | y408–587 (30%) | clear | limb terminates mid-frame |
| katarzyna-kaptur | y461–591 (22%) | clear | limb terminates mid-frame |
| paulina-hildebrand | y477–599 (20%) | y422–498 (12%) | right side mid-frame amputation |

No raw photographs exist anywhere in the repo or its git history — only
finished derivatives. The 400×400 homepage avatars
(`public/assets/team/*.webp`) are complete cutouts (zero edge contact) for
four of the six, so:

- **Avatar route** (Agnieszka, Katarzyna, Emilia, Paulina): flatten avatar on
  plum `#913155` → `nano_banana_pro` 2:3 image-edit (extend torso to hip
  level, keep arms inside frame, likeness pinned) → bria-rmbg + decontam +
  head-width framing. Precedent: Kamil/Robert shipped from 240² avatars this
  way.
- **Reconstruction route** (Przemysław, Aleksander): no complete source; the
  cut 422×600 cutout flattened on plum → `outpaint_image` 1:1 (regenerates
  the amputated arm beyond the old canvas) → same pipeline. Precedent: the
  recipe's arm-reconstruction clause.

Framing constraint (now normative in the spec delta): solve the head-width
fraction downward from 0.42 until every row above the hip line fits inside
the 422 width with ~6 px margin; subject must reach row 599; verify
`alpha[0]`/`alpha[-1]` columns and a plum contact sheet of the full roster
before shipping. Likeness is approved by the user from that contact sheet —
any miss is retaken or falls back to the other route.

Batch fired 2026-08-11 (session 4b82e605): nano_banana_pro jobs
`f6991c90` (agnieszka), `c110abcc` (katarzyna), `afab8deb` (emilia),
`d1445d6b` (paulina); outpaint jobs `bb089dc3` (przemysław), `d4d8303c`
(aleksander → NSFW-false-flagged twice, fell back to nano_banana_pro
`cd18fddb`).

**Route revision, same day:** raw studio photos surfaced in `~/Downloads`
for Emilia (`emi (3).jpg`), Paulina (`paulina 2 new.jpg`) and Agnieszka
(`Agnieszka_szare.png`) — all three matted clean (bria-rmbg, zero edge
contact), so their generations were discarded in favour of the raws.
Katarzyna has no raw; her generation needed a pose-pinned retake
(`94673df6`). Two bottom-gap leftovers: Przemysław's reconstruction added
width but nothing below the old canvas (63 px short, forearms in the band —
stretch would warp them) and Paulina's raw ends at her hands (104 px short),
so each needs one downward outpaint before framing. Emilia's 12 px gap on
plain black fabric was closed with the recipe's local stretch instead.

## Decision 2: Peer wash becomes a same-resource layer, not a second fetch

Rejected options:

- *Preload the raw PNGs*: ~300 KB × 15 ≈ 4.5 MB of warmers to keep a mask
  that duplicates bytes the page already has. Fixes the flash by paying the
  cost twice.
- *Dedicated tiny mask assets*: still a second resource per peer, still a
  race — just shorter. Adds 15 generated files to maintain in lockstep with
  the cutouts.
- *Approximate the wash with pure CSS `filter` on the img*: no second
  resource, but a sepia/hue-rotate chain only approximates
  `color-mix(in srgb, var(--color-primary) 60%, #d1568c)` and drifts if the
  brand tokens move.

Chosen: render the wash as a **second `<Image>` with identical props** to the
peer photo (same `src`, `fill`, `sizes` → same optimized URL → same HTTP
cache entry), stacked over it and flattened to the exact wash colour by an
inline SVG `<filter>` using `feColorMatrix` (zeroed RGB rows with constant
offsets = exact flat colour, alpha preserved). The wash cannot lag the photo:
its pixels come from the same response. `--peer-src` and the `::after` mask
block are deleted.

Notes for implementation:

- The SVG filter def renders once in the section markup; its `id` must not
  sit behind a `'use client'` barrel (uslugi poster-morph precedent) and the
  wash colour matrix is derived from the resolved plum tokens at authoring
  time — if brand plum changes, the matrix constants change with it (comment
  them as derived).
- Keep `.peer { filter: saturate(0.6); opacity: 0.9 }` on the photo layer;
  the wash layer carries `opacity: 0.66` exactly as the `::after` did.
- Verify in WebKit as well as Chromium (`filter: url(#…)` on HTML elements;
  Safari-is-not-optional rule).
