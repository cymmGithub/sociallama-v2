#!/usr/bin/env python3
"""Task 4 support — trace every site image back to the deck it came from.

The import re-encoded every image (0 of 351 site files are byte-identical to a
deck image), so provenance has to be established perceptually rather than by
hash equality. This uses a 240-bit dHash: greyscale, resize to 16x16, and record
whether each pixel is brighter than its right-hand neighbour. Row-wise gradient
survives resizing and JPEG recompression, which is exactly the transformation
the import applied.

What it produces is the audit's primary mechanical signal. For each site image:

  matchedDeck    the deck whose image it is, and the Hamming distance
  matchedClient  the client that deck belongs to, by content mapping
  crossClient    TRUE when the source image also appears in a DIFFERENT client's
                 deck than the study it is published on — the defect this change
                 exists to fix, detected rather than eyeballed
  poolSpread     which distinct clients' decks hold the source image, BYTE-EXACT

Cross-client status is read off `poolSpread` rather than off perceptual
neighbours, because "looks similar" and "is the same file" are different
questions and only the second one attributes ownership.

The 12-bit threshold is read off the measured distribution rather than chosen:
re-encodings of the same image land at distance 1-4, while the nearest genuinely
different image sits at 37 or above. Nothing falls in between.

Usage: scripts/case-studies/trace_provenance.py [--json OUT] [--threshold N]
"""

import hashlib
import json
import os
import sys
from collections import defaultdict

import numpy as np
from PIL import Image

AUDIT = os.environ.get("AUDIT_ROOT", "/mnt/work/goodone/.cs-audit")
POOL_ROOT = os.environ.get("POOL_ROOT", "/mnt/work/goodone/.cs-pool")
PUBLIC = os.environ.get(
    "PUBLIC_ROOT",
    "/mnt/work/goodone/audit-case-study-imagery/public/case-studies",
)
# 240 bits, not 64. A 64-bit dHash is far too coarse for this corpus: most site
# images are phone mockups — a small screenshot centred on a large black frame —
# and at that resolution the frame dominates the gradient, so unrelated posts
# collide. Measured on the flagged set, a 64-bit hash reported a genuine Adamed
# asthma creative as matching ten other clients purely on its bezel.
HASH_W, HASH_H = 16, 16
BITS = (HASH_W - 1) * HASH_H  # 240
# ~5% of the bit width. Re-encodings of one image land in single digits; the
# nearest genuinely different image sits far above this.
THRESHOLD = 12


def dhash(path):
    """240-bit perceptual hash as a uint8 bit array, or None if undecodable."""
    try:
        with Image.open(path) as im:
            g = im.convert("L").resize(
                (HASH_W, HASH_H), Image.Resampling.LANCZOS
            )
            a = np.asarray(g, dtype=np.int16)
        return (a[:, 1:] > a[:, :-1]).flatten().astype(np.uint8)
    except Exception:
        return None


def main():
    out_path = None
    if "--json" in sys.argv:
        out_path = sys.argv[sys.argv.index("--json") + 1]
    threshold = THRESHOLD
    if "--threshold" in sys.argv:
        threshold = int(sys.argv[sys.argv.index("--threshold") + 1])

    dmap = json.load(open(os.path.join(AUDIT, "deck-map.json")))
    client_of = {
        d["deck"]: d["best"] for d in dmap["decks"] if d["verdict"] == "CONFIDENT"
    }

    # —— hash the deck pool ——
    entries = []  # (deck, file, md5)
    hashes = []
    md5_clients = defaultdict(set)
    for deck in sorted(os.listdir(POOL_ROOT)):
        mdir = os.path.join(POOL_ROOT, deck, "media")
        if not os.path.isdir(mdir):
            continue
        for name in sorted(os.listdir(mdir)):
            p = os.path.join(mdir, name)
            if not os.path.isfile(p):
                continue
            h = dhash(p)
            if h is None:
                continue
            md5 = hashlib.md5(open(p, "rb").read()).hexdigest()
            entries.append((deck, name, md5))
            hashes.append(h)
            c = client_of.get(deck)
            if c:
                md5_clients[md5].add(c)
    H = np.array(hashes, dtype=np.uint8)
    print(f"hashed {len(entries)} deck images", file=sys.stderr)

    site = json.load(open(os.path.join(AUDIT, "site-images.json")))
    results = []
    for s in site["studies"]:
        for im in s["images"]:
            if not im["inScope"]:
                continue
            p = os.path.join(PUBLIC, s["slug"], im["filename"])
            q = dhash(p)
            row = {
                "slug": s["slug"],
                "client": s["client"],
                "field": im["field"],
                "mediaId": im["mediaId"],
                "filename": im["filename"],
                "altPl": im["altPl"],
            }
            if q is None:
                row.update(matchedDeck=None, distance=None, matchedClient=None)
                results.append(row)
                continue
            # Hamming distance against every deck image at once.
            dist = (H ^ q).sum(axis=1)
            order = np.argsort(dist)
            best = int(order[0])
            bd = int(dist[best])
            deck, fname, md5 = entries[best]
            mc = client_of.get(deck)
            spread = sorted(md5_clients.get(md5, set()))
            # Cross-client status is decided by the BYTE-EXACT spread of the
            # matched source image (`poolSpread`), never by how many decks happen
            # to fall inside the perceptual threshold. Perceptual neighbours
            # answer "what does this look like"; only identical bytes answer
            # "whose deck is this image actually in".
            owners = spread if bd <= threshold else []
            row.update(
                matchedDeck=deck if bd <= threshold else None,
                matchedFile=fname if bd <= threshold else None,
                distance=bd,
                matchedClient=mc if bd <= threshold else None,
                poolSpread=owners,
                crossClient=bool(owners and s["slug"] not in owners),
                multiClientSource=bool(len(owners) > 1),
            )
            results.append(row)

    matched = [r for r in results if r.get("matchedDeck")]
    cross = [r for r in results if r.get("crossClient")]
    multi = [r for r in results if r.get("multiClientSource")]
    unmatched = [r for r in results if not r.get("matchedDeck")]

    print(f"{len(results)} in-scope site images")
    print(f"{len(matched)} traced to a deck image (distance <= {threshold})")
    print(f"{len(unmatched)} with no deck match — not from any deck in the pool")
    print(f"{len(cross)} whose source belongs ONLY to other clients' decks")
    print(f"{len(multi)} whose source appears in more than one client's deck")

    if cross:
        print("\nCROSS-CLIENT — published on a study whose client does not own the source:")
        for r in sorted(cross, key=lambda x: x["slug"]):
            print(
                f"  {r['slug']:28} {r['field']:24} {r['filename']:38} "
                f"d={r['distance']:2} source={r['poolSpread']}"
            )

    if multi:
        print("\nMULTI-CLIENT SOURCE — source image sits in several clients' decks:")
        for r in sorted(multi, key=lambda x: x["slug"]):
            print(
                f"  {r['slug']:28} {r['field']:24} {r['filename']:38} "
                f"d={r['distance']:2} clients={r['poolSpread']}"
            )

    if unmatched:
        print(f"\nNO DECK MATCH ({len(unmatched)}) — sourced outside the decks:")
        for r in sorted(unmatched, key=lambda x: x["slug"]):
            print(
                f"  {r['slug']:28} {r['field']:24} {r['filename']:38} "
                f"nearest d={r['distance']}"
            )

    if out_path:
        json.dump({"threshold": threshold, "images": results}, open(out_path, "w"),
                  indent=2, ensure_ascii=False)
        print(f"\nwrote {out_path}")


if __name__ == "__main__":
    main()
