#!/usr/bin/env python3
"""Build the homepage client-belt logos to a single visual contract.

    python3 scripts/client-logos/pipeline.py

Reads the per-brand source chosen in BRANDS below (repository case-study assets
where they are already clean, the staged gDrive set otherwise) and writes
`public/assets/clients/<brand>.png` plus a review contact sheet.

Why an offline script rather than runtime work: the belt is above the fold on
every homepage render and the inputs only change when a client is added, so the
de-matting/normalisation/contrast judgement is baked into committed PNGs and
reviewed in the diff.

Requires: pillow, numpy, scipy, and inkscape (for the one SVG source).
"""

import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "assets-src", "client-logos", "raw")
CS = os.path.join(ROOT, "public", "case-studies")
OUT = os.path.join(ROOT, "public", "assets", "clients")
WORK = os.path.join(ROOT, "assets-src", "client-logos", ".work")

# The belt renders each logo in a 140x44 box; emit at 2x so the assets stay
# crisp on high-density displays. The canvas is FIXED and the mark is padded
# inside it — `object-fit: contain` equalises bounding boxes, so a tightly
# trimmed export would undo the optical-mass normalisation below.
BOX_W, BOX_H = 280, 88

# Keep the mark off the canvas edge. The belt contains this canvas into 140x44,
# exactly half size, so a glyph sitting on the outermost pixel row maps onto a
# half pixel and loses most of its weight to the downscale — the ink is in the
# file but the logo renders as though clipped. It only bites the marks whose
# contain-fit is height-bound (Dolina Charlotty, Rondo Wiatraczna, IMiD), which
# are the only ones with ink on the edge row at all. Every scale below solves
# against this inset box, so "contain-fit" means the padded canvas and no mark
# can land flush.
PAD_X, PAD_Y = 4, 4
INNER_W, INNER_H = BOX_W - 2 * PAD_X, BOX_H - 2 * PAD_Y

# De-matting thresholds, as summed absolute RGB distance from the plate colour.
# CLEAR is the floor: anything closer than this is plate and goes fully
# transparent. Between CLEAR and CONNECT the alpha ramps, which is what keeps
# anti-aliased glyph edges soft instead of hard-keyed. The gap matters — a
# single threshold used for both left IMiD's watermark arc sitting at distance
# ~35 with ~60% alpha, i.e. a visible ghost.
CLEAR_TOL = 45
CONNECT_TOL = 72

# The resting contrast floor is a CSS filter (`grayscale(1) brightness(0.8)` on
# .logo), not an asset edit — at rest the belt is grayscaled, so that is a
# luminance problem, and correcting it in CSS costs nothing on hover. Only ink
# too light for the filter to reach is corrected here.
#
# The arithmetic: sand is luminance ~220 at 0.75 resting opacity, so a mark at
# luminance L composites to 0.75 * 0.8L + 55. Staying at or below ~145 against a
# 220 band needs L <= ~190, which the CSS filter covers on its own. Above that —
# Mercator 229, POLOmarket 216, Rabkoland 203, all near-white ink left behind
# when their coloured plate came off — no uniform filter can help without
# crushing the other 28, so those are darkened in the asset.
#
# FLOOR is 150 rather than the readability limit itself: darkening is what hover
# reveals, so it is kept to the minimum the resting state needs. Pulling these
# three to 105 made their hover colour read as mud.
LIGHT_INK_LUM = 190
CONTRAST_FLOOR = 150

SAND = (224, 221, 211)
REST_OPACITY = 0.75


def repo(slug):
    return os.path.join(CS, slug, f"{slug}-logo.png")


def gd(name):
    return os.path.join(RAW, name)


# brand key -> source, case-study slug, and optional per-brand overrides.
#
# Three ways to drop part of a stacked lockup that is unreadable at 44px, all
# operating on the *trimmed* mark. `gap` cuts at the n-th blank row band and
# `band` keeps the slice between two of them; both are preferred, because a seam
# the image itself reports cannot land mid-glyph. `keep` cuts at a height
# fraction and is only for marks with no blank row anywhere — a badge whose
# outline runs the full height — where it has to be set by eye and verified.
# `tol` overrides CONNECT_TOL for a plate that needs a wider reach, and
# `plate_ink` repaints a white knockout in its plate colour.
#
# Source precedence is repository-first: the case-study assets were curated
# during their import and are already de-matted and tightly cropped, so Drive
# only wins where the repository copy is a plate, too small, or absent.
BRANDS = [
    ("a1-karting", "A1 Karting", gd("a1.jpg"), "a1-karting", {}),
    ("asus", "ASUS", repo("asus"), "asus", {}),
    ("burger-king", "Burger King", gd("Burger_King_2020.svg.png"), None, {}),
    # Drops "Resort & SPA" — unreadable at belt height.
    ("dolina-charlotty", "Dolina Charlotty", repo("dolina-charlotty"), "dolina-charlotty", {"gap": 2}),
    ("dpd", "DPD", gd("DPD_logo_(2015).svg.webp"), None, {}),
    ("dynamic-development", "Dynamic Development", repo("dynamic-development"), "dynamic-development", {}),
    ("ed-invest", "ED Invest", repo("ed-invest"), "ed-invest", {}),
    ("engie", "ENGIE", gd("ENGIE_logotype_2018.png"), "engie", {}),
    ("fm-logistics", "FM Logistic", repo("fm-logistics"), "fm-logistics", {}),
    # gDrive over the repository asset, which is a tight crop with 91 inked
    # pixels sitting on its bottom row — the emblem's lower arc is cut off in the
    # artwork itself. The Drive copy has the full roundel with clear margins.
    ("galeria-rondo-wiatraczna", "Galeria Rondo Wiatraczna", gd("galeria rondo wiatraczna.png"), "galeria-rondo-wiatraczna", {}),
    ("home-invest", "Home Invest", gd("HOME_INVEST_LOGO_TIFF-DR-2.png"), None, {}),
    # gDrive over the repository asset, which is a crop out of a larger layout:
    # it carries a faint watermark arc *and* the tops of a maroon heading
    # bleeding in along the bottom edge, which survive de-matting because they
    # are real ink rather than plate. The Drive copy is the bare lockup.
    ("imid", "Instytut Matki i Dziecka", gd("imid.png"), "imid-cmv", {}),
    ("irobot", "iRobot", repo("irobot"), "irobot", {}),
    ("julius-meinl", "Julius Meinl", gd("Julius_Meinl_(2004).svg.png"), "julius-meinl", {}),
    ("jw-construction", "JW Construction", repo("jw-construction"), "jw-construction", {}),
    # Drops "Krajowe Centrum Przeciwdziałania Uzależnieniom".
    ("kcpu", "KCPU", gd("kcpu-logo-cmyk.png.webp"), None, {"gap": 1}),
    ("lg-electronics", "LG Electronics", gd("LG_Electronics_logo.png"), None, {}),
    # Script only: the cocoa-bean roundel above and the "manufaktura czekolady"
    # strap line below are both dropped. This is the roster's one hairline mark —
    # 5% ink coverage against a 26% median — and optical-mass normalisation
    # cannot lift it, because scale-up is clamped at contain-fit. Keeping the
    # roundel also made the lockup height-bound, so it filled half the box and
    # read as a gap in the belt. Alone, the script is width-bound, fills the box
    # and roughly doubles its stroke weight (user decision 2026-07-27).
    ("manufaktura-czekolady", "Manufaktura Czekolady", gd("manufaktura-czekolady-logo.webp"), None, {"band": (1, 2)}),
    # gDrive over the existing public/assets copy: 514x98 against 136x84, and
    # it is the horizontal lockup with no "SPORT" line to crop.
    ("medicover", "Medicover", gd("medicover.png"), None, {}),
    # White wordmark on navy — repainted navy rather than darkened. See
    # ink_from_plate.
    ("mercator", "Mercator Medical", gd("mercator.png"), "mercator", {"plate_ink": True}),
    ("motointegrator", "Motointegrator", repo("motointegrator"), "motointegrator", {}),
    # gDrive over the existing public/assets copy, which carries a leftover box
    # outline and a "100%" chip; this one is the clean single-line lockup.
    ("oryginalny-sok", "Oryginalny Sok", gd("logo-oryginalny-sok.png"), None, {}),
    # White wordmark on red, with a yellow sun the repaint leaves alone.
    ("polomarket", "POLOmarket", gd("Polomarket-logo.png"), "polomarket", {"plate_ink": True}),
    ("pracuj-pl", "pracuj.pl", gd("pracuj.pl logo.webp"), "pracuj-pl", {}),
    ("produkty-cukiernicze-brzesc", "Brześć", repo("produkty-cukiernicze-brzesc"), "produkty-cukiernicze-brzesc", {}),
    # Drops the "Park Rozrywki" ribbon. The badge's white sticker outline inks
    # every row, so there is no seam to find — hence `keep`, cut just above the
    # ribbon. Verified at belt size: uncropped, RABKOLAND shrinks and the ribbon
    # is mush; cut, the wordmark reads.
    ("rabkoland", "Rabkoland", gd("rabkoland.svg"), "rabkoland", {"keep": 0.766}),
    ("riviera", "Centrum Riviera", repo("riviera"), "riviera", {}),
    # `film skrzat.webp` in the gDrive set is the movie poster, not the mark.
    ("skrzat", "Skrzat", repo("skrzat"), "skrzat", {}),
    ("toms", "Toms", gd("Toms.svg.webp"), None, {}),
    ("vistula", "Vistula", gd("vistula.jpg"), "vistula", {}),
    # One merged VOLVO entry for Dom Volvo + Volvo Car Warszawa, which share the
    # `volvo` case study. The repository asset is already the bare wordmark, so
    # the two-line "Dom Volvo" lockup in gDrive is not used.
    ("volvo", "VOLVO", repo("volvo"), "volvo", {}),
]


def load(path):
    """Open any source as RGBA, rasterising SVG at a generous height first."""
    if path.endswith(".svg"):
        os.makedirs(WORK, exist_ok=True)
        dst = os.path.join(WORK, os.path.basename(path) + ".png")
        if not os.path.exists(dst):
            subprocess.run(["inkscape", path, "-h", "600", "-o", dst], check=True, capture_output=True)
        path = dst
    return Image.open(path).convert("RGBA")


def dematte(im, connect_tol=CONNECT_TOL):
    """Strip a uniform plate by flooding inward from the image border.

    A pixel is cleared only if it is within tolerance of the border colour *and*
    connected to the border, so interior negative space inside glyphs is left
    alone rather than punched out by a plain colour key.

    Returns the image, whether a plate was cut, and the plate's colour — which
    `ink_from_plate` needs for knockout marks.
    """
    a = np.array(im).astype(np.int16)
    if a[..., 3].min() < 250:
        return im, False, None  # already has real transparency

    rgb = a[..., :3]
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.abs(rgb - bg).sum(axis=2)

    labels, _ = ndimage.label(dist < connect_tol)
    touching = set(labels[0]) | set(labels[-1]) | set(labels[:, 0]) | set(labels[:, -1])
    touching.discard(0)
    plate = np.isin(labels, list(touching))

    ramp = np.clip((dist - CLEAR_TOL) / (connect_tol - CLEAR_TOL), 0, 1)
    out = a.copy()
    out[..., 3] = np.where(plate, (ramp * 255).astype(np.int16), 255)
    return Image.fromarray(out.astype(np.uint8), "RGBA"), True, tuple(int(c) for c in bg)


def ink_from_plate(im, plate):
    """Repaint a knockout mark's white ink in the colour of the plate it sat on.

    POLOmarket and Mercator are delivered as white lockups on a solid brand
    colour — red and navy respectively. De-matting removes the plate and leaves
    white ink, which is invisible on sand; darkening it toward the contrast floor
    makes it grey, and grey is what hover then reveals. But the plate colour *is*
    the brand colour, so painting the ink in it reconstructs the logo those
    brands actually use everywhere else: red `polo` rather than a grey one. It
    also kills the coloured fringe left along the glyph edges, which now matches
    the ink instead of contradicting it.

    Only near-white pixels are repainted, so POLOmarket keeps its yellow sun.
    """
    a = np.array(im).astype(np.float32)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    white = lum > 170
    for channel, value in enumerate(plate):
        a[..., channel] = np.where(white, value, a[..., channel])
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def trim(im):
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bbox) if bbox else im


def ink_row_gaps(im, min_height=2):
    """Row ranges with no ink, top to bottom — the seams in a stacked lockup."""
    inked = np.array(im)[..., 3] > 8
    rows = inked.sum(axis=1)
    gaps, start = [], None
    for i, filled in enumerate(rows):
        if filled == 0:
            if start is None:
                start = i
        else:
            if start is not None and i - start >= min_height:
                gaps.append((start, i - 1))
            start = None
    return gaps


def crop_between_gaps(im, after, before):
    """Keep the band of the mark between two blank row bands (both 1-based).

    For a three-part stacked lockup where only the middle part survives belt
    size — Manufaktura Czekolady, whose roundel above and strap line below both
    have to go so the script can fill the box.
    """
    gaps = ink_row_gaps(im)
    if len(gaps) < max(after, before):
        raise ValueError(f"wanted gaps {after} and {before}, found {len(gaps)}: {gaps}")
    top = sum(gaps[after - 1]) // 2
    bottom = sum(gaps[before - 1]) // 2
    return im.crop((0, top, im.width, bottom))


def crop_to_fraction(im, keep):
    """Keep the top `keep` fraction of the mark's height."""
    return im.crop((0, 0, im.width, round(im.height * keep)))


def crop_above_gap(im, index):
    """Keep everything above the `index`-th blank row band (1-based).

    Cropping by a hand-measured height fraction is what this replaces: a
    fraction that lands a few pixels off slices through a descender, and the
    result reads as a clipped logo rather than as a wrong constant. Cutting at a
    seam the image itself reports cannot land mid-glyph.
    """
    gaps = ink_row_gaps(im)
    if len(gaps) < index:
        raise ValueError(f"wanted gap {index}, found {len(gaps)}: {gaps}")
    top, bottom = gaps[index - 1]
    return im.crop((0, 0, im.width, (top + bottom) // 2))


def ink_lum(im):
    """Alpha-weighted mean luminance of the ink."""
    a = np.array(im).astype(np.float32)
    alpha = a[..., 3] / 255.0
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    weight = alpha.sum()
    return float((lum * alpha).sum() / weight) if weight >= 1 else 0.0


def ink_area(im):
    return float((np.array(im)[..., 3] / 255.0).sum())


def darken(im):
    """Pull light ink down to the contrast floor, preserving hue."""
    lum = ink_lum(im)
    if lum <= LIGHT_INK_LUM:
        return im, False
    a = np.array(im).astype(np.float32)
    a[..., :3] = np.clip(a[..., :3] * (CONTRAST_FLOOR / max(lum, 1.0)), 0, 255)
    return Image.fromarray(a.astype(np.uint8), "RGBA"), True


def place(im, scale):
    """Scale the mark and centre it on the fixed BOX_W x BOX_H canvas."""
    w = max(1, round(im.width * scale))
    h = max(1, round(im.height * scale))
    canvas = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
    resized = im.resize((w, h), Image.LANCZOS)
    canvas.alpha_composite(resized, ((BOX_W - w) // 2, (BOX_H - h) // 2))
    return canvas


def contact_sheet(marks, path):
    """Every emitted logo under the belt's resting treatment on the sand band."""
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    cols = 4
    cw, ch = BOX_W + 40, BOX_H + 46
    rows = -(-len(marks) // cols)
    sheet = Image.new("RGB", (cols * cw, rows * ch + 36), SAND)
    draw = ImageDraw.Draw(sheet)
    draw.text((20, 12), f"client belt — {len(marks)} logos, grayscale at resting opacity {REST_OPACITY} on sand", fill=(40, 36, 32), font=font)
    for i, (key, mark) in enumerate(marks):
        x = (i % cols) * cw + 20
        y = (i // cols) * ch + 44
        draw.rectangle([x, y, x + BOX_W, y + BOX_H], outline=(198, 194, 184))
        grey = mark.convert("LA").convert("RGBA")
        grey.putalpha(grey.getchannel("A").point(lambda v: round(v * REST_OPACITY)))
        sheet.paste(grey, (x, y), grey)
        draw.text((x, y + BOX_H + 6), key, fill=(70, 64, 58), font=font)
    sheet.save(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    missing = [src for _, _, src, _, _ in BRANDS if not os.path.exists(src)]
    if missing:
        sys.exit("missing sources:\n  " + "\n  ".join(missing))

    # Pass 1 — get every mark to its final shape, then measure it.
    prepared = []
    for key, name, src, slug, opts in BRANDS:
        mark = load(src)
        mark, cut, plate = dematte(mark, opts.get("tol", CONNECT_TOL))
        if opts.get("plate_ink"):
            if plate is None:
                sys.exit(f"{key}: plate_ink needs a plate to sample, none found")
            mark = ink_from_plate(mark, plate)
        mark = trim(mark)
        if "gap" in opts:
            mark = trim(crop_above_gap(mark, opts["gap"]))
        elif "band" in opts:
            mark = trim(crop_between_gaps(mark, *opts["band"]))
        elif "keep" in opts:
            mark = trim(crop_to_fraction(mark, opts["keep"]))
        mark, dark = darken(mark)
        fit = min(INNER_W / mark.width, INNER_H / mark.height)
        prepared.append((key, name, slug, mark, fit, cut, dark))

    # Pass 2 — normalise optical mass against the roster median. Contain-fit
    # equalises bounding boxes, not visual weight: a wide wordmark and a compact
    # square mark both fill the box, yet the wordmark carries several times the
    # ink. Scaling by sqrt(median / own mass) evens that out; the clamp keeps
    # nothing larger than contain-fit (it would overflow the box) or smaller
    # than half of it (it would vanish).
    masses = {key: ink_area(mark) * fit**2 for key, _, _, mark, fit, _, _ in prepared}
    median = float(np.median(list(masses.values())))

    marks, rows = [], []
    for key, name, slug, mark, fit, cut, dark in prepared:
        correction = min(1.0, max(0.5, (median / masses[key]) ** 0.5))
        placed = place(mark, fit * correction)
        placed.save(os.path.join(OUT, f"{key}.png"))
        marks.append((key, placed))
        rows.append((key, name, slug, mark.size, cut, dark, correction))

    sheet_path = os.path.join(WORK, "contact-sheet.png")
    os.makedirs(WORK, exist_ok=True)
    contact_sheet(marks, sheet_path)

    print(f"{'brand':<28}{'trimmed':<12}{'de-matted':<11}{'darkened':<10}{'mass corr':<10}{'case study'}")
    print("-" * 92)
    for key, _, slug, size, cut, dark, correction in rows:
        print(
            f"{key:<28}{f'{size[0]}x{size[1]}':<12}{'yes' if cut else '-':<11}"
            f"{'yes' if dark else '-':<10}{correction:<10.2f}{slug or '-'}"
        )
    print(f"\n{len(rows)} logos -> {OUT}\ncontact sheet -> {sheet_path}")


if __name__ == "__main__":
    main()
