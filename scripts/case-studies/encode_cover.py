#!/usr/bin/env python3
"""Encode one case-study cover: crop to 1.9:1, cap the long edge, fit a budget.

Every new cover goes through this regardless of where the pixels came from
(Pexels, a client photo, a recrop of the old cover), so the whole set shares one
geometry and one weight class.

1.9:1 is the OG box, and it is the widest of the three crops the same file
renders in — the listing card takes 2.10 out of it (vertical trim) and the hero
takes 1.78 (horizontal trim), so the subject has to survive the central
~90% x ~94% of this frame. `--anchor-x/--anchor-y` move the crop window when the
subject is not centred; 0.5 is a centre crop, 0 is flush left/top.

    python3 scripts/case-studies/encode_cover.py IN OUT [--anchor-y 0.35]
"""

import os
import sys

from PIL import Image

TARGET_RATIO = 1.9
LONG_EDGE = 1920
MAX_BYTES = 350 * 1024
QUALITY_START, QUALITY_MIN = 86, 68


def crop_to_ratio(im, ratio=TARGET_RATIO, ax=0.5, ay=0.5):
    w, h = im.size
    if w / h > ratio:  # too wide — trim the sides
        nw, nh = round(h * ratio), h
    else:  # too tall — trim top/bottom
        nw, nh = w, round(w / ratio)
    x = round((w - nw) * ax)
    y = round((h - nh) * ay)
    return im.crop((x, y, x + nw, y + nh))


def encode(src, dest, ax=0.5, ay=0.5):
    im = Image.open(src)
    im = crop_to_ratio(im.convert("RGB"), ax=ax, ay=ay)
    if im.width > LONG_EDGE:
        im = im.resize((LONG_EDGE, round(LONG_EDGE / TARGET_RATIO)), Image.LANCZOS)

    # Step the quality down rather than the pixels: at the card's 1150px render
    # width a 1920px source still downsamples, so detail survives a lower q far
    # better than it survives a smaller frame.
    for q in range(QUALITY_START, QUALITY_MIN - 1, -3):
        im.save(dest, "JPEG", quality=q, optimize=True, progressive=True, subsampling=0)
        if os.path.getsize(dest) <= MAX_BYTES:
            break
    return im.size, q, os.path.getsize(dest)


def main():
    args = [a for a in sys.argv[1:]]
    ax = ay = 0.5
    positional = []
    while args:
        a = args.pop(0)
        if a == "--anchor-x":
            ax = float(args.pop(0))
        elif a == "--anchor-y":
            ay = float(args.pop(0))
        else:
            positional.append(a)
    if len(positional) != 2:
        sys.exit(__doc__)
    size, q, nbytes = encode(positional[0], positional[1], ax, ay)
    flag = "" if nbytes <= MAX_BYTES else "  !! over budget"
    print(f"{positional[1]}  {size[0]}x{size[1]}  q={q}  {nbytes // 1024}KB{flag}")


if __name__ == "__main__":
    main()
