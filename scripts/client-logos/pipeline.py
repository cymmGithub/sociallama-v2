#!/usr/bin/env python3
"""Build the client logos to their visual contracts.

    python3 scripts/client-logos/pipeline.py                # both passes
    python3 scripts/client-logos/pipeline.py --belt         # homepage belt only
    python3 scripts/client-logos/pipeline.py --case-studies # card logos only

Two consumers, two contracts, one set of machinery:

  belt         23 roster brands -> public/assets/clients/<brand>.png
               Full colour, centred. Hover reveals the brand's own colour, so
               ink is never darkened beyond the resting contrast floor.

  case studies 48 published studies -> public/case-studies/<slug>/<slug>-logo-mono.png
               Flat black, left-aligned, for the white listing card and the
               detail page. Colour is deliberately discarded — the cards are a
               scanning surface, not a hover surface, so the set reads as one
               system rather than as confetti.

Both passes share the de-matting, cropping, optical-mass normalisation and
contact-sheet review below. What differs is the ink treatment and the placement,
and those are the only two things either pass overrides.

Why an offline script rather than runtime work: the belt is above the fold on
every homepage render and the inputs only change when a client is added, so the
de-matting/normalisation/contrast judgement is baked into committed PNGs and
reviewed in the diff.

Requires: pillow, numpy, scipy, and inkscape (for the SVG sources).
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

# How far off the white->plate blend line a pixel may sit and still count as
# knockout ink (see `ink_from_plate`). Summed absolute RGB distance, same unit as
# the tolerances above. Generous enough for the anti-aliased fringe along a glyph
# edge, far below POLOmarket's yellow sun at 211.
INK_LINE_TOL = 90

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
# `plate_ink` repaints a white knockout in its plate colour. `boost` multiplies
# the optical-mass correction (still clamped at contain-fit), for a mark whose
# solid plate inflates its measured mass — belt pass only, verified by eye on
# the contact sheet. `punch` keys the plate colour globally rather than by
# border connectivity, without the `plate_ink` repaint: for positive artwork
# whose enclosed glyph counters are background showing through, not ink, and
# would otherwise ship as opaque plate-coloured boxes. `dy` nudges the placed
# mark down by that many canvas pixels (half that at belt size): geometric
# centring is blind to where a mark's ink actually sits, so a top-heavy or
# bottom-heavy neighbour can make a centred mark read as misaligned.
#
# Source precedence is repository-first: the case-study assets were curated
# during their import and are already de-matted and tightly cropped, so Drive
# only wins where the repository copy is a plate, too small, or absent.
BRANDS = [
    ("asus", "ASUS", repo("asus"), "asus", {}),
    # gDrive over the repository asset, which is the BELVEDERE CATERING
    # sub-brand lockup; the Drive copy is the approved restaurant mark. Drops
    # the "RESTAURACJA" strap line — unreadable at belt height — and keeps the
    # crown with the wordmark. `punch` clears the white counters of B, D and R
    # (and the crown's enclosed whites), which the border flood cannot reach.
    ("belvedere", "Belvedere", gd("belvedere.png"), "belvedere", {"gap": 2, "punch": True}),
    ("burger-king", "Burger King", gd("Burger_King_2020.svg.png"), None, {}),
    ("dpd", "DPD", gd("DPD_logo_(2015).svg.webp"), None, {}),
    ("engie", "ENGIE", gd("ENGIE_logotype_2018.png"), "engie", {}),
    ("fm-logistics", "FM Logistic", repo("fm-logistics"), "fm-logistics", {}),
    # gDrive over the repository asset, which is a crop out of a larger layout:
    # it carries a faint watermark arc *and* the tops of a maroon heading
    # bleeding in along the bottom edge, which survive de-matting because they
    # are real ink rather than plate. The Drive copy is the bare lockup.
    ("imid", "Instytut Matki i Dziecka", gd("imid.png"), "imid-cmv", {}),
    # Sits between two bottom-heavy marks (Belvedere's wordmark under its
    # crown, Julius Meinl's roundel over its name) and geometric centring made
    # it read high — ink centroid 44.7 against Belvedere's 56.4. The nudge
    # lands it between its neighbours.
    ("irobot", "iRobot", repo("irobot"), "irobot", {"dy": 6}),
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
    # White wordmark on red, with a yellow sun the repaint leaves alone.
    ("polomarket", "POLOmarket", gd("Polomarket-logo.png"), "polomarket", {"plate_ink": True}),
    # The mark is a wordmark knocked out of a solid rounded plate, and the
    # plate is real ink the normaliser counts — so the mass correction lands at
    # 0.53, the set's strongest shrink, and the logo reads oddly small on the
    # belt. `boost` re-approximates the wordmark, not the plate, as the mass.
    ("pracuj-pl", "pracuj.pl", gd("pracuj.pl logo.webp"), "pracuj-pl", {"boost": 1.35}),
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


def dematte(im, connect_tol=CONNECT_TOL, global_key=False):
    """Strip a uniform plate by flooding inward from the image border.

    A pixel is cleared only if it is within tolerance of the border colour *and*
    connected to the border, so interior negative space inside glyphs is left
    alone rather than punched out by a plain colour key.

    `global_key` drops the connectivity requirement and clears plate-coloured
    pixels wherever they occur. That is only correct for knockout artwork, where
    the ink is reversed *out* of the plate and the enclosed counters of `p`, `o`
    or `R` are therefore filled with the plate colour rather than with ink. On
    those marks the border flood leaves the counters opaque, and `ink_from_plate`
    then paints the surrounding glyph the same colour — merging glyph and counter
    into one silhouette. On positive artwork the same key would punch holes in
    interior detail that is genuine opaque ink, so it stays behind the flag.

    Feathering is unaffected: the alpha ramp below is applied either way, so a
    globally keyed edge is as soft as a flooded one.

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

    if global_key:
        plate = dist < connect_tol
    else:
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

    A pixel counts as ink only if it lies close to the white->plate blend line,
    which is where knockout ink and its anti-aliased fringe necessarily sit. A
    luminance threshold cannot express that: luminance weights green at 0.587, so
    POLOmarket's yellow sun (#F9D000) reads as 199 — brighter than the cutoff —
    and was being repainted red, losing the only non-plate colour in the mark.
    The sun sits 211 off the line, the fringe sits on it, so the line distance
    separates them and a brightness test never can.
    """
    a = np.array(im).astype(np.float32)
    rgb = a[..., :3]
    white_rgb = np.array([255.0, 255.0, 255.0])
    axis = np.array(plate, dtype=np.float32) - white_rgb
    # Project each pixel onto the white->plate segment, then measure how far it
    # missed. t is clamped so colours beyond either end fold back onto it.
    t = np.clip(((rgb - white_rgb) @ axis) / float(axis @ axis), 0.0, 1.0)
    off_line = np.abs(rgb - (white_rgb + t[..., None] * axis)).sum(axis=2)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    ink = (lum > 170) & (off_line < INK_LINE_TOL)
    for channel, value in enumerate(plate):
        a[..., channel] = np.where(ink, value, a[..., channel])
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


def place(im, scale, dy=0):
    """Scale the mark and centre it on the fixed BOX_W x BOX_H canvas,
    optionally nudged `dy` pixels down."""
    w = max(1, round(im.width * scale))
    h = max(1, round(im.height * scale))
    canvas = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
    resized = im.resize((w, h), Image.LANCZOS)
    canvas.alpha_composite(resized, ((BOX_W - w) // 2, (BOX_H - h) // 2 + dy))
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


def build_belt():
    os.makedirs(OUT, exist_ok=True)
    missing = [src for _, _, src, _, _ in BRANDS if not os.path.exists(src)]
    if missing:
        sys.exit("missing sources:\n  " + "\n  ".join(missing))

    # Pass 1 — get every mark to its final shape, then measure it.
    prepared = []
    for key, name, src, slug, opts in BRANDS:
        mark = load(src)
        # Knockout marks key the plate globally — see `dematte`. Only
        # `plate_ink` and `punch` reach that behaviour, and `CS_INHERIT_OPTS`
        # deliberately carries neither, so the case-study pass below is
        # unreachable from here (its `mono_ink` clears counters on its own).
        mark, cut, plate = dematte(
            mark,
            opts.get("tol", CONNECT_TOL),
            global_key=opts.get("plate_ink", False) or opts.get("punch", False),
        )
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
        prepared.append((key, name, slug, mark, fit, cut, dark, opts))

    # Pass 2 — normalise optical mass against the roster median. Contain-fit
    # equalises bounding boxes, not visual weight: a wide wordmark and a compact
    # square mark both fill the box, yet the wordmark carries several times the
    # ink. Scaling by sqrt(median / own mass) evens that out; the clamp keeps
    # nothing larger than contain-fit (it would overflow the box) or smaller
    # than half of it (it would vanish).
    masses = {key: ink_area(mark) * fit**2 for key, _, _, mark, fit, _, _, _ in prepared}
    median = float(np.median(list(masses.values())))

    marks, rows = [], []
    for key, name, slug, mark, fit, cut, dark, opts in prepared:
        correction = min(1.0, max(0.5, (median / masses[key]) ** 0.5) * opts.get("boost", 1.0))
        placed = place(mark, fit * correction, opts.get("dy", 0))
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


# ── Case-study card logos ────────────────────────────────────────────────────
#
# The listing card and the detail page render the client's mark as flat black on
# a white surface. That is an asset problem, not a CSS one: 19 of the 48 sources
# carry a baked-in background, and `filter: grayscale(1) brightness(0)` over
# those blackens the plate along with the mark, so they render as solid black
# rectangles. `mix-blend-mode: multiply` on a white card rescues the 9
# light-boxed ones for free and does nothing for the 8 dark ones — and those are
# the worst offenders. No CSS substitutes for the re-cut.

CS_SRC = os.path.join(ROOT, "public", "case-studies")

# Canvas for the card slot, at 2x the rendered box like the belt. Same reason a
# fixed canvas is required here as there: optical mass is baked into the file,
# and a tightly trimmed export would undo it. The CSS box MUST carry this same
# aspect ratio, or `object-fit: contain` re-fits the mark and the normalisation
# is lost — see .cardLogo in case-studies.module.css.
CS_BOX_W, CS_BOX_H = 280, 72
CS_PAD = 4
CS_INNER_W, CS_INNER_H = CS_BOX_W - 2 * CS_PAD, CS_BOX_H - 2 * CS_PAD

# Ink normalisation, as a fraction of the maximum possible distance from the
# background colour. FLOOR clips keying residue; CEIL_MIN stops a genuinely
# low-contrast source from being stretched into noise.
CS_INK_FLOOR, CS_INK_CEIL_MIN, CS_INK_CEIL_PCT = 0.10, 0.35, 99.5

# Studies whose source cannot be derived from BRANDS. Skibooking has no logo
# asset at all, so its card falls back to the client name as text; the source is
# a vector and cannot be uploaded as one — Payload's media collection sniffs SVG
# as `application/xml`, which is not in its allowed mime list — so rasterising
# here is mandatory, not a preference. The other three were retired from the
# belt in the 2026-08 reconciliation, which removed them from BRANDS; their
# Drive-over-repo source judgements still hold for the card pass, so they are
# pinned here: a1-karting's Drive copy beats the repository crop, Galeria Rondo
# Wiatraczna's repository asset has the emblem's lower arc cut off in the
# artwork itself, and Mercator has no repository asset at all.
CS_EXTRA_SOURCES = {
    "skibooking": gd("skibooking.svg"),
    "a1-karting": gd("a1.jpg"),
    "galeria-rondo-wiatraczna": gd("galeria rondo wiatraczna.png"),
    "mercator": gd("mercator.png"),
}

# Belt-only crop overrides that must NOT carry over. `gap`/`band`/`keep` drop
# secondary lines that are unreadable at the belt's 44px logo height; the card
# slot is taller and shows the full lockup. Source choice does carry over — that
# is a judgement about which file is undamaged, which holds for any consumer.
CS_INHERIT_OPTS = {"tol"}


def cs_sources():
    """slug -> (source path, opts), for every published case study.

    Source precedence follows the belt's: BRANDS already records, per brand and
    with the reasoning, which file is the undamaged one. Ten case studies gain a
    better source that way — notably `imid-cmv`, whose repository asset is a crop
    out of a larger layout carrying a watermark arc and the tops of a maroon
    heading, and `galeria-rondo-wiatraczna`, whose lower arc is cut off in the
    artwork itself. Neither is recoverable by de-matting.
    """
    chosen = {slug: (src, opts) for _, _, src, slug, opts in BRANDS if slug}
    out = {}
    for slug in sorted(os.listdir(CS_SRC)):
        if not os.path.isdir(os.path.join(CS_SRC, slug)):
            continue
        if slug in CS_EXTRA_SOURCES:
            out[slug] = (CS_EXTRA_SOURCES[slug], {})
        elif slug in chosen:
            src, opts = chosen[slug]
            out[slug] = (src, {k: v for k, v in opts.items() if k in CS_INHERIT_OPTS})
        elif os.path.exists(repo(slug)):
            out[slug] = (repo(slug), {})
    return out


def mono_ink(im, plate):
    """Flatten a de-matted mark to black, with ink weight = distance from the
    background colour.

    Alpha alone is the wrong shape. A logo with knocked-out interior detail —
    ozgasl's car, mmhygienic's bottle, bioagris's leaf — draws that detail as
    light *opaque* pixels inside a filled shape, not as transparency, so painting
    the alpha channel black collapses all three into silhouettes.

    Two more rules were tried and each fails while looking correct on a subset.
    Keying on darkness ghosts every mid-tone brand colour (ENGIE blue, FoodSaver
    green, Mazurska gold all render as faint grey). Keying on `max(darkness,
    chroma)` fixes the mid-tones and then turns the red-tile logos into solid
    black squares, because the *background* is itself saturated and chroma marks
    the whole field as ink.

    What works is one idea: ink is whatever is FAR from the background — not
    dark, not saturated, far. `dematte` has already removed the plate and told us
    its colour, so the same measure that cleared the border also clears the
    knockouts inside the glyphs. Where no plate was found the source has real
    transparency, and the background is then the white card it will sit on.

    Distance is measured on the RAW rgb and scaled by alpha rather than on a
    white-flattened image: flattening a soft-alpha mark washes it to mid-grey,
    which keys out as half-ink. Alpha carries coverage, the stored rgb carries
    colour, and keeping them apart is what brings ASUS back crisp while ozgasl's
    knockout still falls away.
    """
    a = np.array(im).astype(np.float32)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3:4] / 255.0
    bg = np.array(plate, dtype=np.float32) / 255.0 if plate else np.ones(3, np.float32)

    dist = np.linalg.norm(rgb - bg, axis=-1, keepdims=True) / np.sqrt(3.0)
    ink = dist * alpha
    ceil = max(float(np.percentile(ink, CS_INK_CEIL_PCT)), CS_INK_CEIL_MIN)
    ink = np.clip((ink - CS_INK_FLOOR) / (ceil - CS_INK_FLOOR), 0, 1)

    out = np.zeros_like(a)  # black rgb, ink as alpha
    out[..., 3] = (ink[..., 0] * 255).round()
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def place_left(im, scale):
    """Scale the mark and set it against the canvas's left edge, centred
    vertically. The card aligns its logo to the body's text column, so the mark
    has to start at a predictable x — a centred canvas would inset each mark by a
    different amount and the column would visibly wander down the grid."""
    w = max(1, round(im.width * scale))
    h = max(1, round(im.height * scale))
    canvas = Image.new("RGBA", (CS_BOX_W, CS_BOX_H), (0, 0, 0, 0))
    canvas.alpha_composite(im.resize((w, h), Image.LANCZOS), (CS_PAD, (CS_BOX_H - h) // 2))
    return canvas


def cs_contact_sheet(marks, path):
    """Every emitted mark on the card's actual white surface, at full opacity.

    Reviewing all 48 is the point. This change's predecessor shipped a visual
    regression precisely because a three-logo spot-check stood in for a full-set
    check, and a mark that keys to a ghost or keeps a plate shows up here and
    nowhere else.
    """
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    cols = 4
    cw, ch = CS_BOX_W + 40, CS_BOX_H + 46
    rows = -(-len(marks) // cols)
    sheet = Image.new("RGB", (cols * cw, rows * ch + 36), "white")
    draw = ImageDraw.Draw(sheet)
    draw.text((20, 12), f"case-study cards — {len(marks)} logos, flat black on the white card surface", fill=(40, 36, 32), font=font)
    for i, (slug, mark) in enumerate(marks):
        x = (i % cols) * cw + 20
        y = (i // cols) * ch + 44
        draw.rectangle([x, y, x + CS_BOX_W, y + CS_BOX_H], outline=(224, 224, 224))
        sheet.paste(mark, (x, y), mark)
        draw.text((x, y + CS_BOX_H + 6), slug, fill=(70, 64, 58), font=font)
    sheet.save(path)


def build_case_studies():
    sources = cs_sources()
    missing = [s for s, (src, _) in sources.items() if not os.path.exists(src)]
    if missing:
        sys.exit("missing sources:\n  " + "\n  ".join(missing))

    # Pass 1 — de-mat, blacken, trim, then measure.
    prepared = []
    for slug, (src, opts) in sources.items():
        mark = load(src)
        mark, cut, plate = dematte(mark, opts.get("tol", CONNECT_TOL))
        mark = trim(mono_ink(mark, plate))
        if mark.width < 2 or mark.height < 2:
            sys.exit(f"{slug}: keyed to nothing — re-source it")
        fit = min(CS_INNER_W / mark.width, CS_INNER_H / mark.height)
        prepared.append((slug, src, mark, fit, cut))

    # Pass 2 — normalise optical mass against this set's own median, exactly as
    # the belt does. `object-fit: contain` equalises bounding boxes, not visual
    # weight, and this set is the extreme case for that: aspect ratios run 0.69
    # (las-vegans, a portrait crest) to 7.38 (volvo), a 10x spread.
    masses = {slug: ink_area(mark) * fit**2 for slug, _, mark, fit, _ in prepared}
    median = float(np.median(list(masses.values())))

    marks, rows = [], []
    for slug, src, mark, fit, cut in prepared:
        correction = min(1.0, max(0.5, (median / masses[slug]) ** 0.5))
        placed = place_left(mark, fit * correction)
        placed.save(os.path.join(CS_SRC, slug, f"{slug}-logo-mono.png"))
        marks.append((slug, placed))
        rows.append((slug, src, mark.size, cut, correction))

    os.makedirs(WORK, exist_ok=True)
    sheet_path = os.path.join(WORK, "case-study-contact-sheet.png")
    cs_contact_sheet(marks, sheet_path)

    print(f"{'case study':<32}{'trimmed':<12}{'de-matted':<11}{'mass corr':<11}{'source'}")
    print("-" * 100)
    for slug, src, size, cut, correction in rows:
        where = "drive" if src.startswith(RAW) else "repo"
        print(
            f"{slug:<32}{f'{size[0]}x{size[1]}':<12}{'yes' if cut else '-':<11}"
            f"{correction:<11.2f}{where}"
        )
    print(f"\n{len(rows)} logos -> {CS_SRC}/<slug>/<slug>-logo-mono.png\ncontact sheet -> {sheet_path}")


def main():
    belt = "--belt" in sys.argv
    studies = "--case-studies" in sys.argv
    run_belt = belt or not studies
    run_studies = studies or not belt
    if run_belt:
        build_belt()
    if run_studies:
        if run_belt:
            print()
        build_case_studies()


if __name__ == "__main__":
    main()
