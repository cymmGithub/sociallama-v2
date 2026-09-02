#!/usr/bin/env python3
"""Build the Good One group mark for the footer's dark ground.

    python3 scripts/group-logo/pipeline.py

Reads `assets-src/group-logo/raw/good-one.png`, writes
`public/assets/group/good-one.png` and a review sheet to
`assets-src/group-logo/.work/review.png` (gitignored). Provenance and the
review criteria live in the raws' README.

Deliberately not a pass of `scripts/client-logos/pipeline.py`. That script
solves the belt's problem: 23 marks contain-fitted into one fixed canvas,
de-matted off their plates and normalised against the roster's median ink mass
so they read as equal weight beside each other. None of it applies to a single
mark rendered at its own aspect with no neighbours — the canvas, the median and
the roster loop would all be machinery around one file. What carries over is the
part that matters: an offline script with a committed raw and a committed
output, reviewed in the diff, never a hand edit.

The one treatment the mark needs is the ink lift, and it has to be selective.
Good One's artwork is drawn for a light ground: the wordmark is near-black
(#181818) and vanishes on the footer's #161216, while the sygnet is saturated
red/orange/yellow and reads perfectly. A global luminance lift — the obvious
fix — brings the wordmark back and simultaneously washes the sygnet to salmon
and peach. So the lift keys on saturation, not luminance: near-neutral ink is
the wordmark and gets recoloured to the footer's link tone; anything with real
chroma is brand colour and passes through untouched.

Requires: pillow.
"""

import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "assets-src", "group-logo", "raw", "good-one.png")
OUT = os.path.join(ROOT, "public", "assets", "group", "good-one.png")
WORK = os.path.join(ROOT, "assets-src", "group-logo", ".work")

# The footer's own `.link` colour: --color-cream (#faf9f5) at 82% over
# --color-ink-deep (#161216), which is what `color-mix` resolves to in
# footer.module.css. The mark IS a link, so it is set at the weight of the
# links beside it — one step brighter than the label above it, and a step below
# the giant outline wordmark it sits under.
INK = (209, 207, 205)

# Below this saturation a pixel is neutral, i.e. wordmark. Measured on the raw:
# its wordmark is a grey ramp topping out at 0.51 (eight nearly-transparent
# antialiasing pixels; the body of it is 0.0), and every sygnet pixel carries
# 1.0 — both the fills and their rims, because this export antialiases through
# alpha rather than by blending toward a plate. The threshold sits in the empty
# middle of that gap, so neither class can drift into the other under a
# re-export.
NEUTRAL_MAX_SAT = 0.6

# The ground every review judgement is made against: --color-ink-deep, the
# footer's own background.
GROUND = (22, 18, 22)


def saturation(r: int, g: int, b: int) -> float:
    """HSV saturation. Cheap, and the only channel the split depends on."""
    peak = max(r, g, b)
    return 0.0 if peak == 0 else (peak - min(r, g, b)) / peak


def lift_neutral_ink(img: Image.Image) -> Image.Image:
    """Recolour neutral ink to INK, preserving alpha and every chromatic pixel.

    Alpha is carried through untouched, which is what keeps the glyphs their
    original weight: this artwork antialiases the wordmark through the alpha
    channel (its RGB stays inside a 32-85 band across 221 distinct alpha
    values), so replacing RGB and leaving alpha alone re-inks a letter without
    fattening it or hard-keying its edge.
    """
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if saturation(r, g, b) < NEUTRAL_MAX_SAT:
                px[x, y] = (*INK, a)
    return out


def review_sheet(before: Image.Image, after: Image.Image) -> Image.Image:
    """Both states on the footer's ground, at 3x, for the pre-commit look.

    Two panels are enough: there is one mark, and its only state change is an
    opacity nudge on hover that no static sheet can show better than the page.
    """
    scale, pad = 3, 26
    w, h = before.width * scale, before.height * scale
    sheet = Image.new("RGBA", (w + pad * 2, h * 2 + pad * 3), (*GROUND, 255))
    sheet.alpha_composite(before.resize((w, h), Image.LANCZOS), (pad, pad))
    sheet.alpha_composite(after.resize((w, h), Image.LANCZOS), (pad, h + pad * 2))
    return sheet


def main() -> None:
    raw = Image.open(RAW).convert("RGBA")
    emitted = lift_neutral_ink(raw)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    os.makedirs(WORK, exist_ok=True)
    emitted.save(OUT)
    review_sheet(raw, emitted).convert("RGB").save(os.path.join(WORK, "review.png"))

    print(f"emitted {os.path.relpath(OUT, ROOT)} ({emitted.width}x{emitted.height})")
    print(f"review  {os.path.relpath(os.path.join(WORK, 'review.png'), ROOT)}")
    print("Read the review sheet before committing the emitted PNG.")


if __name__ == "__main__":
    main()
