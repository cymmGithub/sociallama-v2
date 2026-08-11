# Refine team slider: re-cut six edge-clipped portraits, fix the peer-wash flash

## Why

Six of the fifteen `/o-nas` slider cutouts violate the roster's own framing rule
("torso may bleed off the bottom corners, but no limb may bleed above elbow
height, and nothing may terminate mid-frame"): Przemysław Świercz, Aleksander
Dymiński, Agnieszka Klajbert, Katarzyna Kaptur, Emilia Metryka and Paulina
Hildebrand all have arms/shoulders flat-cut at the frame's left or right edge —
three of them with a limb that exits the side and *ends* before the bottom,
which reads as an amputation on the plum band. Alpha-channel measurement
confirms the cuts are baked into the PNGs; the CSS boxes match the image aspect
exactly and crop nothing.

Separately, the plum duotone wash on the slider's two background peers is a
`::after` with `mask-image: url(<raw /o-nas/slider/*.png>)` — a ~300 KB
resource the preload warmers never fetch (they warm the optimized ~32 KB
variants the `<img>`s use). On a cold cache the photo paints seconds before its
mask arrives, so peers flash full-colour and then snap to washed — exactly what
the homepage `?lama=` deep link exposes.

## What Changes

- **Re-cut six portraits** in `public/o-nas/slider/`:
  - *Avatar route* (Agnieszka, Katarzyna, Emilia, Paulina): their 400×400
    homepage-grid avatars are complete cutouts with full arms — one
    `nano_banana_pro` 2:3 edit each extends the torso to hip level on plum,
    then the standard rembg + framing pipeline produces the 422×600 cutout.
  - *Reconstruction route* (Przemysław, Aleksander): no complete source exists;
    the cut cutout flattened on plum is `outpaint_image`-expanded to 1:1 to
    regenerate the missing arm/shoulder, then the same pipeline runs.
  - Framing obeys the recipe: head-width anchor solved *down* from 0.42 until
    every row above the hip line fits inside the 422 width; subject bleeds off
    the bottom edge (`alpha[-1]` coverage present); no mid-frame terminations.
  - Generation batch was fired with explicit user approval on 2026-08-11
    (~12–16 credits). Karolina's and Magda's borderline edge contact is
    deliberately **out of scope** — user capped the batch at these six.
- **Replace the peer wash mechanism**: drop the `::after` + raw-PNG
  `mask-image` and render the wash as a second, identically-placed `<Image>`
  (same optimized URL, same cache entry as the photo) flattened to the wash
  colour with an inline SVG `feColorMatrix` filter. The wash can then never
  lag the photo — they are the same resource.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `onas-team`: the portrait-cutout requirement gains the framing-integrity
  rules (bottom bleed mandatory, side bleed only below elbow height, no
  mid-frame limb terminations); a new requirement makes the peer wash atomic
  with the peer photo (no unwashed flash at any cache temperature).

## Impact

- `public/o-nas/slider/{przemyslaw-swiercz,aleksander-dyminski,agnieszka-klajbert,katarzyna-kaptur,emilia-metryka,paulina-hildebrand}.png`
  — replaced. The homepage grid tiles reuse these files, so both surfaces
  change; both get verified.
- `app/(frontend)/o-nas/sections/team/index.tsx` — `Trio` renders a wash
  `<Image>` per peer instead of setting `--peer-src`; the section gains one
  inline SVG filter def (id must live outside any `'use client'` barrel — see
  the uslugi poster-morph precedent).
- `app/(frontend)/o-nas/sections/team/team.module.css` — `.peer::after` mask
  block replaced by wash-layer rules.
- New `public/` files 404 on a running dev server until it restarts — restart
  is handed to the user, never performed by the agent.
- No roster, order, bio, or locale-content changes.
