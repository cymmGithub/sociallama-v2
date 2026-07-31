#!/usr/bin/env python3
"""Normalise the seven platform cubes onto one canvas so they render at one size.

    python3 scripts/platform-cubes/pipeline.py

The art is seven separate 3D renders: a rounded cube wearing a platform mark,
surrounded by floating satellite icons (hearts, replies, bells). Each was
exported trimmed to its own content, so the cube body occupies a different
fraction of every file — 0.62 of the canvas width for LinkedIn, 0.96 for
TikTok. CSS sizes the *canvas*. The eye compares the *cube*. Contain-fitting
seven differently padded exports into one box therefore produces seven
different cube sizes, which is what this pipeline exists to remove:

  /uslugi/content   the cubes are width-bound in a min(100%, 27rem) box, so the
                    canvas fraction passed straight through as a 30% spread in
                    rendered cube width (LinkedIn 248px vs TikTok 323px).

  homepage join-cta the cube box is wide (129x78), so every canvas is instead
                    height-bound and the spread there was already only 4.5%.
                    It is fed from the same files and inherits this fix.

Output: every file gets an IDENTICAL canvas with the cube body at an IDENTICAL
size and position, so one `width` rule sizes all seven correctly at every
viewport. There are deliberately no per-platform numbers left in the CSS —
those cannot survive an art swap, because nothing links them back to the file
they were derived from.

Requires: pillow, numpy, scipy.
"""

import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "assets-src", "platform-cubes", "raw")
OUT = os.path.join(ROOT, "public", "assets")
WORK = os.path.join(ROOT, "assets-src", "platform-cubes", ".work")

# Source stem -> published filename. The published names carry export hashes for
# four of the seven and are referenced from lib/content/{uslugi,home}{,.en}.ts;
# renaming them would touch four content files to no visual end.
PLATFORMS = {
    "facebook": "cube-facebook-70862a.png",
    "instagram": "cube-instagram.png",
    "tiktok": "cube-tiktok.png",
    "x": "cube-x-5d9863.png",
    "linkedin": "cube-linkedin.png",
    "pinterest": "cube-pinterest-6e33ed.png",
    "youtube": "cube-youtube.png",
}

# Every cube body is resampled to this width. 477px is Facebook's native cube,
# which is also X's and (within 1px) YouTube's and Pinterest's — the four-file
# cluster the set already agreed on. Standardising on it leaves those four
# essentially untouched and moves only the three outliers, so the page keeps its
# current visual weight. It costs LinkedIn a 6.7% upscale; on a soft 3D render
# with no fine detail that is invisible, and the alternative (standardising down
# to LinkedIn) would have shrunk the whole section by 7%.
TARGET_CUBE_W = 477

# Alpha above which a pixel counts as artwork. The renders have a soft outer
# falloff, so a >0 test would drag the measured bounds into the haze.
ALPHA_FLOOR = 60

# Breathing room so no artwork sits on the outermost pixel row. Two files
# (Instagram, LinkedIn) define the extreme overhangs and would otherwise land
# flush against the border by construction; a pixel on the border maps onto a
# half pixel when the browser contains 768px into ~432px and loses most of its
# weight, which reads as a satellite icon fading at one edge only.
PAD = 6

# The satellite icons overlap the cube in several files (YouTube's bell touches
# its top-left corner, Facebook's thumb its top edge), so a plain alpha bounding
# box measures cube+icons and reads 5-10% too wide. Eroding by this radius first
# severs those thin contacts, the largest surviving blob is unambiguously the
# cube body, and dilating back by the same radius restores its true edge.
SEPARATION_RADIUS = 10


def cube_bbox(rgba):
    """Bounding box of the cube body alone, with satellite icons excluded."""
    art = np.array(rgba)[:, :, 3] > ALPHA_FLOOR
    conn = ndimage.generate_binary_structure(2, 2)
    cores, count = ndimage.label(
        ndimage.binary_erosion(art, conn, iterations=SEPARATION_RADIUS)
    )
    areas = ndimage.sum(cores > 0, cores, range(1, count + 1))
    cube = cores == int(np.argmax(areas)) + 1
    body = ndimage.binary_dilation(cube, conn, iterations=SEPARATION_RADIUS) & art
    ys, xs = np.where(body)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def main():
    os.makedirs(WORK, exist_ok=True)

    # Measure and scale first; the canvas can only be solved once every
    # composition is at its final size.
    plates = {}
    for stem, published in PLATFORMS.items():
        src = Image.open(os.path.join(RAW, f"{stem}.png")).convert("RGBA")
        x0, y0, x1, y1 = cube_bbox(src)
        scale = TARGET_CUBE_W / (x1 - x0)
        art = src.resize(
            (round(src.width * scale), round(src.height * scale)), Image.LANCZOS
        )
        plates[stem] = {
            "published": published,
            "art": art,
            # Anchors, in the resampled image's own pixels: the cube's
            # horizontal centre and its bottom edge.
            "anchor_x": (x0 + x1) / 2 * scale,
            "anchor_y": y1 * scale,
            "native": (src.size, x1 - x0, scale),
        }

    # The cubes are registered to each other by centre-x and bottom-y — bottom
    # because they sit on an implied ground plane, and centre rather than an
    # edge because each is rotated slightly differently, so no single edge is
    # common to all seven. The canvas is then the tightest box that still clears
    # every composition's satellite icons: the widest left overhang plus the
    # widest right overhang, measured from that shared anchor. Solving it from
    # the overhangs rather than picking a round number is what guarantees no
    # file is clipped.
    left = max(p["anchor_x"] for p in plates.values())
    right = max(p["art"].width - p["anchor_x"] for p in plates.values())
    top = max(p["anchor_y"] for p in plates.values())
    bottom = max(p["art"].height - p["anchor_y"] for p in plates.values())

    canvas = (
        int(np.ceil(left + right)) + PAD * 2,
        int(np.ceil(top + bottom)) + PAD * 2,
    )
    anchor = (int(round(left)) + PAD, int(round(top)) + PAD)
    print(f"canvas {canvas[0]}x{canvas[1]}  cube anchor {anchor}  width {TARGET_CUBE_W}")

    sheet = Image.new("RGBA", (canvas[0] * 4, canvas[1] * 2), (145, 49, 85, 255))
    for index, (stem, plate) in enumerate(plates.items()):
        out = Image.new("RGBA", canvas, (0, 0, 0, 0))
        offset = (
            anchor[0] - round(plate["anchor_x"]),
            anchor[1] - round(plate["anchor_y"]),
        )
        out.alpha_composite(plate["art"], offset)

        verify = cube_bbox(out)
        (nw, nh), native_cube, scale = plate["native"]
        print(
            f"  {stem:10s} {nw}x{nh} cube {native_cube} x{scale:.3f}"
            f" -> cube ({verify[0]},{verify[1]})-({verify[2]},{verify[3]})"
            f" w={verify[2] - verify[0]}"
        )
        out.save(os.path.join(OUT, plate["published"]), optimize=True)
        sheet.alpha_composite(out, ((index % 4) * canvas[0], (index // 4) * canvas[1]))

    sheet.save(os.path.join(WORK, "contact-sheet.png"))
    print(f"contact sheet -> {os.path.relpath(os.path.join(WORK, 'contact-sheet.png'), ROOT)}")


if __name__ == "__main__":
    main()
