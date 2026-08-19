#!/usr/bin/env python3
"""Rebuild Ariadna's cover plate.

    python3 scripts/case-studies/ariadna_cover.py

Writes `public/case-studies/ariadna/ariadna-cover-2.jpg`.

Ariadna is the one study whose cover is a built plate rather than a photograph.
Its own campaign creatives are all portrait phone screens, and the stock photo
it shipped with named neither the brand nor the work, so the cover carries the
client's logotype on the site's cream instead.

Three numbers are load-bearing:

  2400×1263 (1.90:1)   the ratio the 2026-08-19 cover re-cut settled on. The
                       hero paints 16:9 and the listing card's artefact box
                       swings between roughly 1.87:1 and 2.50:1, both with
                       `object-fit: cover`, so the plate is cropped top and
                       bottom by up to ~24%. Everything that matters sits in
                       the middle band.
  logo width 1180px    the mark reads at card size (the card renders the cover
                       about 300 CSS px wide) without crowding the hero.
  grain ±4             the same faint noise the plum stages carry, so the flat
                       fill does not band on a wide gamut display.

The logotype is `assets-src/case-studies/ariadna-logo.svg`, traced with potrace
from `public/case-studies/ariadna/ariadna-logo.png`. Tracing rather than
upscaling is deliberate: the mark is flat two-colour art, the raster in the
repo is 586px wide, and the copy on panelariadna.pl is SMALLER still (386px) —
so there is no larger source to fetch, and an AI upscaler is the one tool that
must not touch it, because it rewrites small logotype taglines into nonsense.

Requires: pillow, numpy, inkscape.
"""

import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw

W, H = 2400, 1263
CREAM = (250, 249, 245)   # --color-cream
SAND = (224, 221, 211)    # --color-sand
SVG = 'assets-src/case-studies/ariadna-logo.svg'
OUT = 'public/case-studies/ariadna/ariadna-cover-2.jpg'


def logo(width):
    """Render the traced logotype at `width` px, cropped to its own ink."""
    with tempfile.NamedTemporaryFile(suffix='.png') as tmp:
        subprocess.run(
            ['inkscape', '--export-type=png', f'--export-filename={tmp.name}',
             f'--export-width={width}', '--export-background-opacity=0', SVG],
            check=True, capture_output=True)
        im = Image.open(tmp.name).convert('RGBA')
        return im.crop(im.getbbox())


def grain(im, amount=4):
    a = np.asarray(im.convert('RGB'), dtype=np.int16)
    # Seeded so a rebuild is byte-comparable with the shipped file.
    noise = np.random.default_rng(7).integers(
        -amount, amount + 1, a.shape[:2])[:, :, None]
    return Image.fromarray(np.clip(a + noise, 0, 255).astype(np.uint8))


def ring(size, colour, alpha, width_frac=0.13):
    """The logo's own two arcs, blown up as the plate's only ornament."""
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lw = int(size * width_frac)
    d.arc([lw // 2, lw // 2, size - lw // 2, size - lw // 2],
          start=-58, end=272, fill=colour + (alpha,), width=lw)
    inner = int(size * 0.42)
    off = (size - inner) // 2
    d.arc([off + lw // 2, off + lw // 2,
           off + inner - lw // 2, off + inner - lw // 2],
          start=-58, end=272, fill=colour + (alpha,), width=lw)
    return im


plate = Image.new('RGB', (W, H), CREAM)
big = ring(1500, SAND, 255)
plate.paste(big, (W - 620, H // 2 - 750), big)
small = ring(760, SAND, 150)
plate.paste(small, (-300, -180), small)
plate = grain(plate).convert('RGBA')

mark = logo(1180)
plate.paste(mark, ((W - mark.width) // 2, (H - mark.height) // 2), mark)

# 4:4:4 chroma: the wordmark is hard black on flat cream and the mark is a
# saturated red, both of which 4:2:0 smears.
plate.convert('RGB').save(OUT, 'JPEG', quality=92, subsampling=0)
print(f'{OUT} {W}x{H}')
