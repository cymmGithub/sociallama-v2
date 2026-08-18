#!/usr/bin/env python3
"""Cut phone mockups out of the plate they were exported on.

    python3 scripts/case-studies/mockup_cutout.py <image> [<image> ...]

Creatives arrive as a phone mockup sitting on a black or white slab. The
case-study surface renders approach creatives frameless, so that slab shows up
on the sand page as a hard rectangle around the phone. This trims the slab and
keys the device's rounded corners to transparency, so the phone floats.

Two shapes, both handled:

  trim   the phone sits inside a uniform plate — trim the plate, then flood the
         residual corner background away from the four corners.
  round  the image IS the phone, edge to edge, on a square canvas — there is no
         plate to trim, only square corners to round to the device radius.

THE GATE IS THE POINT. A flat creative whose margin is part of the design must
never be trimmed, and a coloured plate must never be flooded away — doing that
ate FoodSaver's green background and cut an arc out of a Galeria Rondo creative
during the first pass. So `classify` only accepts a result that still looks like
a phone: portrait-ish (1.5–2.6), with rounded corners costing between 0.4% and
10% of the frame. Everything else is left alone.

`NOT_A_MOCKUP` is the correction for the gate's own false positives: four plain
photographs whose corners happen to be uniform (a dark forest, a pale wall) and
that therefore pass the corner test by luck. Every automatic bezel-continuity
test I tried failed to separate them, because JPEG noise on a black phone body
is as uneven as a photograph's edge — so this stays a reviewed list. Verify any
addition by eye on the sand background, not on a checkerboard.

Requires: pillow, numpy, scipy.
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

def analyse(path, tol=14):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im, dtype=int)
    h, w = a.shape[:2]
    ring = np.concatenate([a[0], a[-1], a[:,0], a[:,-1]])
    bg = np.median(ring, axis=0)
    close = (np.abs(a - bg).sum(axis=2) <= tol*3)
    def run(lines):
        n = 0
        for l in lines:
            if l.mean() >= 0.985: n += 1
            else: break
        return n
    t, b, l, r = run(close), run(close[::-1]), run(close.T), run(close.T[::-1])
    # inner region after trimming the uniform slabs
    y0, y1 = t, h - b
    x0, x1 = l, w - r
    if y1 - y0 < 40 or x1 - x0 < 40:
        return None
    inner = close[y0:y1, x0:x1]
    ih, iw = inner.shape
    lab, n = ndimage.label(inner)
    corners = {lab[0,0], lab[0,-1], lab[-1,0], lab[-1,-1]} - {0}
    corner_px = int(np.isin(lab, list(corners)).sum()) if corners else 0
    frac = corner_px / (ih*iw)
    return dict(bg=tuple(int(v) for v in bg), trim=(t,b,l,r), inner=(iw,ih),
                corner_frac=frac, aspect=ih/iw)

def classify(path):
    """-> ('trim'|'round'|None, info). Only phone-shaped results pass."""
    info = analyse(path)
    if info is None: return None, None
    t,b,l,r = info['trim']
    trimmed = (t+b+l+r) > 0
    # a phone mock is portrait-ish and its rounded corners cost a few percent
    phoneish = 1.5 <= info['aspect'] <= 2.6
    rounded = 0.004 <= info['corner_frac'] <= 0.10
    if not (phoneish and rounded):
        return None, info
    return ('trim' if trimmed else 'round'), info

def apply(path, out, tol=14):
    kind, info = classify(path)
    if kind is None: return None
    im = Image.open(path).convert('RGB')
    a = np.asarray(im, dtype=int)
    h, w = a.shape[:2]
    ring = np.concatenate([a[0], a[-1], a[:,0], a[:,-1]])
    bg = np.median(ring, axis=0)
    t,b,l,r = info['trim']
    pad = 2
    y0, y1 = max(0, t-pad), h - max(0, b-pad)
    x0, x1 = max(0, l-pad), w - max(0, r-pad)
    a = a[y0:y1, x0:x1]
    close = (np.abs(a - bg).sum(axis=2) <= tol*3)
    hh, ww = close.shape
    alpha = np.full((hh, ww), 255, np.uint8)
    lab, _ = ndimage.label(close)
    corners = {lab[0,0], lab[0,-1], lab[-1,0], lab[-1,-1]} - {0}
    if corners:
        alpha[np.isin(lab, list(corners))] = 0
    rgba = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA')
    am = rgba.getchannel('A').filter(ImageFilter.GaussianBlur(0.8))
    rgba.putalpha(am)
    rgba.save(out)
    return dict(kind=kind, size=(ww,hh), cut=int((alpha==0).sum()), **info)

def is_fullbleed_phone(path, tol=45):
    """The image IS the phone, edge to edge: square canvas corners that should be
    rounded. Ring is the device body, so the flood above finds nothing."""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im, dtype=int)
    h, w = a.shape[:2]
    if not (1.85 <= h/w <= 2.35): return False
    k = 18
    pats = [a[:k,:k], a[:k,-k:], a[-k:,:k], a[-k:,-k:]]
    meds = [np.median(p.reshape(-1,3), axis=0) for p in pats]
    uniform = all((np.abs(p-m).sum(axis=2) <= tol).mean() > 0.9 for p, m in zip(pats, meds))
    same = max(np.abs(m-meds[0]).sum() for m in meds) < 40
    return bool(uniform and same)

# Plain photographs that pass the corner test by luck (a dark forest, a pale
# wall) — no device body, so rounding them would be an uninvited design change.
# JPEG noise on a black bezel defeats every automatic bezel-continuity test I
# tried, so this stays a reviewed list rather than a threshold.
NOT_A_MOCKUP = {
    'skrzat-gallery-5.jpg', 'skrzat-gallery-6.jpg',
    'stadler-form-gallery-7.jpg', 'stadler-form-gallery-8.jpg',
}

def round_canvas(path, out, ratio=0.16):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w-1, h-1], radius=int(w*ratio), fill=255)
    im.putalpha(mask.filter(ImageFilter.GaussianBlur(0.8)))
    im.save(out)
    return (w, h)


if __name__ == '__main__':
    import sys
    import tempfile

    for path in sys.argv[1:]:
        name = path.rsplit('/', 1)[-1]
        if name in NOT_A_MOCKUP:
            print(f'{name}: skipped (reviewed as not a mockup)')
            continue
        kind, _ = classify(path)
        if kind is None and is_fullbleed_phone(path):
            kind = 'round'
        if kind is None:
            print(f'{name}: skipped (gate rejected — not a phone mockup)')
            continue
        stem = path.rsplit('.', 1)[0]
        out = f'{stem}-cut.webp'
        # Cut losslessly first, encode once. Letting the cut write straight to
        # `out` and then re-saving it would put the result through two WebP
        # encodes, and the generation loss shows up as a ~2/255 drift.
        with tempfile.NamedTemporaryFile(suffix='.png') as tmp:
            if kind == 'round':
                round_canvas(path, tmp.name)
            else:
                apply(path, tmp.name)
            Image.open(tmp.name).convert('RGBA').save(
                out, 'WEBP', quality=90, method=6
            )
        print(f'{name}: {kind} -> {out.rsplit("/", 1)[-1]}')
