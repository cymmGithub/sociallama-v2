#!/usr/bin/env python3
"""Blur a third-party brand mark out of a cover, softly enough to read as defocus.

A stock cover may not carry someone else's brand mark. Where a frame is right in
every other way, the mark is blurred rather than the picture rejected — the
Pexels licence permits modification, and the edit is recorded in
`pexels-provenance.md` beside the source id.

Two details make the difference between "retouched" and "censored":

- The blur radius scales with the mark, not the frame. A fixed radius either
  leaves a large wordmark legible or turns a small one into an obvious smear.
- The patch is composited through a feathered mask, so it has no edge. A hard
  rectangle reads as a redaction box even when the blur inside it is gentle.

Boxes are given in the coordinates of the SOURCE image, so measure them on the
file you pass in.

    python3 scripts/case-studies/blur_marks.py IN OUT --box x0,y0,x1,y1 [--box ...]
"""

import sys

from PIL import Image, ImageDraw, ImageFilter

# Gaussian alone does not do this job. A high-contrast wordmark keeps its
# silhouette through a radius large enough to fog the whole panel — blurring
# redistributes the ink, it does not discard it. So the mark is first destroyed
# by a downsample (information genuinely thrown away, and irreversible), then
# blurred just enough to hide the resampling steps. The divisor is relative to
# the mark's short side, so one setting works for a 65px wordmark and a 25px one.
SHRINK_RATIO = 0.10  # downsample the patch to a tenth of the mark's short side
RADIUS_RATIO = 0.22  # then soften, so it reads as defocus and not as mosaic
FEATHER_RATIO = 0.28  # feather as a fraction of the short side — no patch edge


def blur_box(im, box):
    x0, y0, x1, y1 = box
    short = max(4, min(x1 - x0, y1 - y0))
    radius = max(2.0, short * RADIUS_RATIO)
    feather = max(2.0, short * FEATHER_RATIO)

    # Work on a padded crop so the blur pulls in surrounding pixels instead of
    # smearing the box's own edge back over itself. The pad has to clear the
    # feather too, because the mask is grown outside the box (see below).
    pad = int(max(radius * 3, short) + feather * 2)
    px0, py0 = max(0, x0 - pad), max(0, y0 - pad)
    px1, py1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    patch = im.crop((px0, py0, px1, py1))

    small = max(2, round(short * SHRINK_RATIO))
    tiny = (max(2, patch.width * small // short), max(2, patch.height * small // short))
    patch = patch.resize(tiny, Image.BOX).resize(patch.size, Image.BICUBIC)
    patch = patch.filter(ImageFilter.GaussianBlur(radius))

    # Grow the rectangle by the feather BEFORE blurring the mask. Feathering a
    # box-sized rectangle ramps the alpha inward from its edge, and a wordmark
    # fills most of its own box — so the glyphs land in the ramp and a third of
    # the original bleeds back through, leaving the mark readable. Growing first
    # keeps the box itself fully opaque and puts the fade outside it.
    mask = Image.new("L", patch.size, 0)
    grow = int(round(feather))
    ImageDraw.Draw(mask).rectangle(
        (x0 - px0 - grow, y0 - py0 - grow, x1 - px0 + grow, y1 - py0 + grow), fill=255
    )
    mask = mask.filter(ImageFilter.GaussianBlur(feather))

    im.paste(patch, (px0, py0), mask)
    return radius


def main():
    args, boxes, positional = sys.argv[1:], [], []
    while args:
        a = args.pop(0)
        if a == "--box":
            boxes.append(tuple(int(v) for v in args.pop(0).split(",")))
        else:
            positional.append(a)
    if len(positional) != 2 or not boxes:
        sys.exit(__doc__)

    im = Image.open(positional[0]).convert("RGB")
    for box in boxes:
        radius = blur_box(im, box)
        print(f"  blurred {box}  radius={radius:.1f}px")
    im.save(positional[1], "PNG")
    print(f"{positional[1]}  {im.width}x{im.height}  {len(boxes)} mark(s)")


if __name__ == "__main__":
    main()
