#!/usr/bin/env python3
"""Generate merged-outline wordmark paths -> lib/wordmark-paths.ts

WHY: the display wordmarks (footer "SOCIAL LAMA", the marquee "WITH SOCIAL LAMA"
outline row) are drawn as an OUTLINE stroke at tight tracking. Rendered as plain
<text>/-webkit-text-stroke, each glyph is stroked independently, so where tight
tracking makes letters overlap you see the two outlines cross/double — it reads
as "sloppy". Fix: position the glyphs, boolean-UNION them into ONE path
(skia-pathops), and stroke that single merged silhouette. Overlaps dissolve into
clean joins; tight tracking is preserved.

REGENERATE (nothing here is committed except this script + the output .ts):

    cd lib/scripts
    python3 -m venv .wm-venv && . .wm-venv/bin/activate
    pip install fonttools skia-pathops
    curl -fsSL 'https://github.com/google/fonts/raw/main/ofl/exo2/Exo2%5Bwght%5D.ttf' -o Exo2.ttf
    python gen-wordmark.py          # writes ../wordmark-paths.ts
    rm -rf .wm-venv Exo2.ttf        # clean up (both are gitignored / transient)

Exo 2 is the site's --font-display (loaded via next/font/google at runtime; this
script only needs the file to trace outlines). wght 800 + tracking -0.02em match
the display treatment. Edit TARGETS below to change copy/tracking, then rerun.
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import ControlBoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
import pathops

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "Exo2.ttf")
OUT = os.path.join(HERE, "..", "wordmark-paths.ts")
WEIGHT = 800
TRACKING_EM = -0.02


def merged(text):
    f = TTFont(FONT)
    instantiateVariableFont(f, {"wght": WEIGHT}, inplace=True)
    upm = f["head"].unitsPerEm
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    hmtx = f["hmtx"]
    tracking = TRACKING_EM * upm
    path = pathops.Path()
    pen = path.getPen()
    x = 0.0
    for ch in text:
        gname = cmap.get(ord(ch))
        if gname is None:
            x += 0.3 * upm + tracking
            continue
        if gname != "space":
            rec = DecomposingRecordingPen(gs)  # flatten composite glyphs
            gs[gname].draw(rec)
            rec.replay(TransformPen(pen, (1, 0, 0, 1, x, 0)))
        x += hmtx[gname][0] + tracking
    path.simplify()  # boolean self-union: dissolve internal overlaps
    bp = ControlBoundsPen(None)
    path.draw(bp)
    xMin, yMin, xMax, yMax = bp.bounds
    spen = SVGPathPen(None)
    path.draw(TransformPen(spen, (1, 0, 0, -1, 0, 0)))  # y-up -> y-down
    return dict(d=spen.getCommands(), xMin=xMin, yMin=yMin, xMax=xMax,
                yMax=yMax, advance=x, upm=upm)


def n(v):
    return f"{v:.1f}"


# Footer: centered static wordmark -> ink-bounds viewBox + small pad.
fw = merged("SOCIAL LAMA")
padF = 0.03 * fw["upm"]
fvb = (f'{n(fw["xMin"] - padF)} {n(-fw["yMax"] - padF)} '
       f'{n((fw["xMax"] - fw["xMin"]) + 2 * padF)} '
       f'{n((fw["yMax"] - fw["yMin"]) + 2 * padF)}')

# Marquee tile: width = full advance (incl. trailing "  ·  ") so repeats tile
# seamlessly; height = cap box (baseline 0 .. yMax).
mw = merged("WITH SOCIAL LAMA  ·  ")
mvb = f'0 {n(-mw["yMax"])} {n(mw["advance"])} {n(mw["yMax"])}'

ts = f'''// AUTO-GENERATED — merged-outline wordmark paths (Exo 2, wght {WEIGHT}, tracking {TRACKING_EM}em).
// Each path is the boolean-UNION of the glyph outlines (skia-pathops), so a single
// stroke draws only the merged silhouette — no crossing lines where letters overlap
// (the reason plain outlined <text> looked "sloppy" at tight tracking).
//
// Regenerate with lib/scripts/gen-wordmark.py (see that file's header). If the
// copy changes, the path must be regenerated — it is not live text.

export const footerWordmarkPath = {{
  viewBox: '{fvb}',
  d: '{fw["d"]}',
}} as const

// Tile for the scrolling marquee outline row. viewBox width is the full advance
// width (incl. the trailing "  ·  " separator) so the Marquee repeats seamlessly.
export const marqueeOutlinePath = {{
  viewBox: '{mvb}',
  d: '{mw["d"]}',
}} as const
'''
with open(OUT, "w") as fh:
    fh.write(ts)
print("wrote", os.path.normpath(OUT))
print("footer viewBox:", fvb)
print("marquee viewBox:", mvb)
