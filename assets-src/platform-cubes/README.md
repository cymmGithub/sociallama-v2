# Platform cubes

The seven 3D platform cubes — a rounded cube wearing a platform mark, ringed by
floating satellite icons. Two surfaces render them from the same files:

- `/uslugi/content` and its EN twin, one cube per platform row
- the homepage `join-cta` post, where the llama holds one on its raised paw

`raw/` holds the original exports, one per platform, committed so the bake is
re-runnable. The pipeline lives at `scripts/platform-cubes/pipeline.py`; run it
from the repo root:

```sh
python3 scripts/platform-cubes/pipeline.py
```

It writes `public/assets/cube-<platform>*.png` and a review contact sheet at
`.work/contact-sheet.png` (gitignored).

## What the bake is for

Each raw export is trimmed to its own content, so the cube body occupies a
different fraction of every file — 0.62 of the canvas width for LinkedIn, 0.96
for TikTok. CSS can only size the canvas, but the eye compares the cube, so
contain-fitting the raw files into one box produced seven different cube sizes:
a 30% spread on `/uslugi/content` (LinkedIn 248px against TikTok 323px).

The bake resamples every cube body to a common 477px and lays it on a shared
780×663 canvas at a fixed position, so one `width` rule sizes all seven at every
viewport and the homepage swap reads as a substitution rather than a resize.

This replaced a per-file `width` exception in `service.module.css`. Do not bring
that pattern back: it was a fixed `rem` cap, so it stopped tracking the other six
as soon as they hit the `min(100%, …)` branch, and the mismatch it was meant to
fix came out *worse* on mobile (a 46% spread) than on desktop.

## Reviewing a re-bake

Check `.work/contact-sheet.png` before committing. The cubes are laid out on the
brand plum at their baked size, so an outlier is obvious against its neighbours.
The pipeline also re-measures the cube in each file it has just written and
prints the result — all seven must report `w=477` (±1px from rounding) at the
same coordinates. That line is the real check; the sheet is for judging whether
the art still looks right.

Watch for a **clipped satellite icon**. The canvas is solved as the tightest box
that clears every composition's overhang, so whichever file has the widest halo
defines the edge and sits closest to it. Adding a platform with a further-flung
icon grows the canvas for all seven, which is correct but shifts the cube-to-box
ratio — re-derive the `27rem` in `.platformCube` from the new ratio if so.

## Adding or replacing a platform

Drop the new export in `raw/<platform>.png`, add it to `PLATFORMS` in the
pipeline, and re-run. Nothing downstream carries per-file numbers, so no CSS
needs touching unless the canvas ratio moved (above).
