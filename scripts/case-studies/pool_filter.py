#!/usr/bin/env python3
"""Task 1.3–1.4 — reduce each deck's extracted media to a usable replacement pool.

Runs AFTER map_decks.py, and depends on it: the central filter asks "how many
distinct CLIENTS does this exact image appear in", which cannot be answered from
folder names. Several folders hold the same client's work (`Finanse/` holds
Mazurska's and Las Vegan's decks; `Kontigo/` holds Brzesc's) and several clients
own multiple decks (Pracuj.pl has four), so counting folders or decks both give
the wrong answer.

The pass is mechanical on purpose. Whether an image depicts the RIGHT client is
the review's job (task 4) and needs eyes. This only removes material that cannot
serve as any client's own content:

  unmapped      the deck has no confidently identified client, so nothing in it
                can be offered as a named client's material (the generic
                `Finanse` credentials deck, the Medicover deck, Canva link PDFs)
  contaminated  the deck is a hybrid of two clients by inspection, so its images
                cannot be attributed either way — see CONTAMINATED_DECKS
  cross-client  the identical bytes appear in 2+ different clients' decks. Decks
                are authored by copying a previous client's deck, so this catches
                both template furniture (agency logomark, contact slide, platform
                icons, CLICK HERE badges) and genuine leftovers (the Laurastar
                garment steamer, which appears in three clients' decks). Either
                way it is unusable AS a given client's own material.
  tiny          min dimension < 100px — icon, bullet, UI glyph
  flat          near-uniform pixels — solid colour and black placeholder frames
  strip         aspect ratio beyond 12:1 — divider rules and edge bars
  dupe          byte-identical to an image already kept from the same client
  unreadable    PIL cannot decode it (.wdp JPEG-XR, .jb2e)

Thresholds were set by looking at the images, not by taste: contact sheets of
every image appearing in 3+ and 5+ folders were reviewed and found to be
template chrome with a single exception (the steamer), which the same rule
should also drop.

Usage:
  scripts/case-studies/pool_filter.py [--json OUT] [--sheets DIR]
"""

import hashlib
import json
import os
import sys
from collections import Counter, defaultdict

from PIL import Image, ImageStat

POOL_ROOT = os.environ.get("POOL_ROOT", "/mnt/work/goodone/.cs-pool")
AUDIT = os.environ.get("AUDIT_ROOT", "/mnt/work/goodone/.cs-audit")

CROSS_CLIENT_MIN = 2
MIN_DIM = 100
FLAT_STDDEV = 6.0
MAX_ASPECT = 12.0

# Decks judged hybrid by reading their slide text — recorded here rather than
# left to a heuristic, with the evidence, because excluding a whole pool is a
# decision that should be reviewable.
CONTAMINATED_DECKS = {
    # Opening slides are A1 Karting (GOKARTY, TORKARTINGOWY); from the client
    # section onward it is ED Invest's strategy deck, mentioning ED Invest nine
    # times. Its images cannot be attributed to either client.
    "ed-invest__a1-draft__pptx": "hybrid: A1 Karting front, ED Invest body",
}

# Flagged CONTAMINATED by map_decks.py but cleared by inspection — kept usable.
CLEARED_DECKS = {
    # MM Hygienic is a brand launched BY Mazurska Manufaktura Alkoholi, so the
    # opening section legitimately narrates the parent company. Not a leftover.
    "mmhygienic__mmhygienic__pptx": "Mazurska is MM Hygienic's parent company",
    # Misnamed, not misfiled: all 28 images are byte-identical to the sibling
    # Dynamic Development deck, and the body names Dynamic Development only.
    "dynamic-development__ed-invest-case-study__pptx": "misnamed copy of the DD deck",
}


def stats(path):
    """-> (width, height, stddev) or None if undecodable."""
    try:
        with Image.open(path) as im:
            w, h = im.size
            # Downscale before measuring spread: a full-size stat pass over
            # 3800 images is slow and the answer does not change.
            small = im.convert("L")
            small.thumbnail((64, 64))
            sd = ImageStat.Stat(small).stddev[0]
        return w, h, sd
    except Exception:
        return None


def main():
    out_path = None
    if "--json" in sys.argv:
        out_path = sys.argv[sys.argv.index("--json") + 1]
    sheets_dir = None
    if "--sheets" in sys.argv:
        sheets_dir = sys.argv[sys.argv.index("--sheets") + 1]

    dmap = json.load(open(os.path.join(AUDIT, "deck-map.json")))
    # deck -> client slug, only where the mapping is confident.
    client_of = {
        d["deck"]: d["best"] for d in dmap["decks"] if d["verdict"] == "CONFIDENT"
    }

    decks = sorted(
        d for d in os.listdir(POOL_ROOT) if os.path.isdir(os.path.join(POOL_ROOT, d))
    )

    # —— pass 1: measure every image, and count the clients each one appears in ——
    images = []
    md5_clients = defaultdict(set)
    for deck in decks:
        mdir = os.path.join(POOL_ROOT, deck, "media")
        if not os.path.isdir(mdir):
            continue
        client = client_of.get(deck)
        for name in sorted(os.listdir(mdir)):
            path = os.path.join(mdir, name)
            if not os.path.isfile(path):
                continue
            with open(path, "rb") as fh:
                md5 = hashlib.md5(fh.read()).hexdigest()
            st = stats(path)
            images.append(
                {
                    "deck": deck,
                    "client": client,
                    "file": name,
                    "path": path,
                    "md5": md5,
                    "bytes": os.path.getsize(path),
                    "w": st[0] if st else 0,
                    "h": st[1] if st else 0,
                    "stddev": round(st[2], 2) if st else None,
                }
            )
            if client:
                md5_clients[md5].add(client)

    # —— pass 2: verdicts ——
    kept_md5_per_client = defaultdict(set)
    reasons = Counter()
    per_client = defaultdict(lambda: {"keep": 0, "drop": Counter()})

    for im in images:
        spread = len(md5_clients[im["md5"]])
        im["clientSpread"] = spread
        reason = None
        if im["client"] is None:
            reason = "unmapped"
        elif im["deck"] in CONTAMINATED_DECKS:
            reason = "contaminated"
        elif im["stddev"] is None:
            reason = "unreadable"
        elif spread >= CROSS_CLIENT_MIN:
            reason = "cross-client"
        elif min(im["w"], im["h"]) < MIN_DIM:
            reason = "tiny"
        elif im["stddev"] < FLAT_STDDEV:
            reason = "flat"
        elif max(im["w"], im["h"]) / max(1, min(im["w"], im["h"])) > MAX_ASPECT:
            reason = "strip"
        elif im["md5"] in kept_md5_per_client[im["client"]]:
            reason = "dupe"

        im["verdict"] = "drop" if reason else "keep"
        im["reason"] = reason
        if reason:
            reasons[reason] += 1
            if im["client"]:
                per_client[im["client"]]["drop"][reason] += 1
        else:
            kept_md5_per_client[im["client"]].add(im["md5"])
            per_client[im["client"]]["keep"] += 1

    kept = [i for i in images if i["verdict"] == "keep"]
    print(f"{len(images)} extracted images across {len(decks)} decks")
    print(f"{len(kept)} usable, {len(images) - len(kept)} dropped")
    for r, n in reasons.most_common():
        print(f"    {r:13} {n:5}")

    clients = sorted(per_client)
    print(f"\nusable pool per client ({len(clients)} clients):")
    for c in clients:
        d = per_client[c]
        drops = " ".join(f"{k}:{v}" for k, v in sorted(d["drop"].items()))
        print(f"  {c:32} {d['keep']:4} usable   {drops}")

    thin = [c for c in clients if per_client[c]["keep"] < 4]
    if thin:
        print(f"\nclients with a thin pool (<4 usable) ({len(thin)}):")
        for c in thin:
            print(f"  {c:32} {per_client[c]['keep']}")

    if sheets_dir:
        os.makedirs(sheets_dir, exist_ok=True)
        by_client = defaultdict(list)
        for i in kept:
            by_client[i["client"]].append(i)
        for c, ims in by_client.items():
            listing = os.path.join(sheets_dir, f"{c}.txt")
            with open(listing, "w") as fh:
                for i in sorted(ims, key=lambda x: (x["deck"], x["file"])):
                    fh.write(f"{i['path']}\n")
        print(f"\nwrote per-client keep lists to {sheets_dir}")

    if out_path:
        with open(out_path, "w") as fh:
            json.dump(
                {
                    "thresholds": {
                        "crossClientMin": CROSS_CLIENT_MIN,
                        "minDim": MIN_DIM,
                        "flatStddev": FLAT_STDDEV,
                        "maxAspect": MAX_ASPECT,
                    },
                    "contaminatedDecks": CONTAMINATED_DECKS,
                    "clearedDecks": CLEARED_DECKS,
                    "totals": {
                        "images": len(images),
                        "kept": len(kept),
                        "dropped": len(images) - len(kept),
                        "byReason": dict(reasons),
                    },
                    "perClient": {
                        c: {
                            "keep": per_client[c]["keep"],
                            "drop": dict(per_client[c]["drop"]),
                        }
                        for c in clients
                    },
                    "images": [
                        {k: v for k, v in i.items() if k != "path"} for i in images
                    ],
                },
                fh,
                indent=2,
            )
        print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
