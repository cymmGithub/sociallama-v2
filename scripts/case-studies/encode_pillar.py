#!/usr/bin/env python3
"""Encode one approach-pillar creative into `public/case-studies/<slug>/`.

The counterpart to `encode_cover.py`, for the images that sit *inside* a study
rather than on top of it. A pillar creative is displayed by `.shot` at its own
aspect ratio — 240 px wide when it is portrait, up to 480 px when it is
landscape — so nothing here crops to a fixed box. The job is only: cut the
screenshot chrome away, cap the resolution, and hand Payload a file whose name
already follows the house pattern.

    python3 scripts/case-studies/encode_pillar.py SRC SLUG [--crop x,y,w,h]
                                                           [--name NAME]
                                                           [--dry-run]

`--name` is the exception, not the rule: without it the file is numbered after
the highest `<slug>-gallery-N` already on disk, which is what keeps a re-run
from silently overwriting last week's creative.

## Why no mockup cutout

`mockup_cutout.py` bakes a rounded corner into an image's alpha channel because
a phone-mockup cutout has to carry its own corner. Every file this script
handles is a flat capture — an Instagram export or a screenshot of a post — so
`.shot`'s CSS 18 px radius clips it correctly at any width, and a baked corner
would only fight it. Do not reach for the cutout script here.

## Why the cap is 1350 and the quality is 82

1350 px is the tall side of Instagram's own 4:5 export, so almost every supplied
file is already at or under it, and the cap only catches the occasional 2048 px
screenshot. The largest the browser ever asks for is 480 px at DPR 3 — well
inside it. q82 on a photographic JPEG is where the file stops shrinking and
starts showing artefacts around the hard-edged headline type these creatives are
full of; 78 visibly furs the letterforms.
"""

import os
import sys

from PIL import Image, ImageCms

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEST_ROOT = os.path.join(ROOT, "public", "case-studies")
MAX_SIDE = 1350
QUALITY = 82


def next_name(slug: str) -> str:
    """`<slug>-gallery-N.jpg`, N one past the highest already in the folder."""
    folder = os.path.join(DEST_ROOT, slug)
    highest = 0
    if os.path.isdir(folder):
        prefix = f"{slug}-gallery-"
        for name in os.listdir(folder):
            if not name.startswith(prefix):
                continue
            stem = os.path.splitext(name)[0][len(prefix) :]
            # `-cut` suffixes and other variants share the number they derive from
            digits = stem.split("-")[0]
            if digits.isdigit():
                highest = max(highest, int(digits))
    return f"{slug}-gallery-{highest + 1}.jpg"


def to_srgb(im: Image.Image) -> Image.Image:
    """Convert through an embedded profile if there is one, else assume sRGB.

    A screenshot taken on a wide-gamut Mac display carries a Display P3 profile;
    dropping it without converting is how a brand red arrives on the page as a
    duller, browner red than the client signed off.
    """
    profile = im.info.get("icc_profile")
    if profile:
        try:
            src = ImageCms.ImageCmsProfile(__import__("io").BytesIO(profile))
            im = ImageCms.profileToProfile(
                im, src, ImageCms.createProfile("sRGB"), outputMode="RGB"
            )
        except Exception as exc:  # a broken profile must not lose the image
            print(f"  ! colour conversion failed ({exc}); assuming sRGB")
    return im.convert("RGB")


def encode(src: str, slug: str, crop=None, name=None, dry_run=False) -> str:
    im = Image.open(src)
    original = im.size
    if crop:
        x, y, w, h = crop
        im = im.crop((x, y, x + w, y + h))
    im = to_srgb(im)
    if max(im.size) > MAX_SIDE:
        scale = MAX_SIDE / max(im.size)
        im = im.resize(
            (round(im.width * scale), round(im.height * scale)), Image.LANCZOS
        )

    out_name = name or next_name(slug)
    folder = os.path.join(DEST_ROOT, slug)
    dest = os.path.join(folder, out_name)
    print(
        f"  {original[0]}x{original[1]} -> {im.width}x{im.height}  "
        f"{os.path.relpath(dest, ROOT)}"
    )
    if dry_run:
        return dest
    os.makedirs(folder, exist_ok=True)
    # No EXIF is passed on: `exif` defaults to empty, and the orientation tag is
    # already resolved because the crop box was measured on the pixels as opened.
    im.save(dest, "JPEG", quality=QUALITY, optimize=True, subsampling="4:2:0")
    return dest


def main() -> None:
    args = sys.argv[1:]
    crop = name = None
    dry_run = False
    positional = []
    while args:
        a = args.pop(0)
        if a == "--crop":
            crop = tuple(int(v) for v in args.pop(0).split(","))
            if len(crop) != 4:
                sys.exit("--crop takes x,y,w,h")
        elif a == "--name":
            name = args.pop(0)
        elif a == "--dry-run":
            dry_run = True
        else:
            positional.append(a)
    if len(positional) != 2:
        sys.exit(__doc__)
    src, slug = positional
    encode(src, slug, crop=crop, name=name, dry_run=dry_run)


if __name__ == "__main__":
    main()
