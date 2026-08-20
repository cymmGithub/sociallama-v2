#!/usr/bin/env python3
"""Fetch cover candidates from Pexels, one query per case study.

Nothing here decides anything: it downloads four landscape candidates per study
into a working directory and writes a manifest. The picks are made by the
publisher on the review sheet that `cover_review_sheet.py` builds from that
manifest, because the previous imagery pass rejected roughly ten of fourteen
top hits for third-party marks or an orientation that dies at the crop.

The key is read from `.env.local` and never committed. Usage:

    python3 scripts/case-studies/pexels_candidates.py [--out DIR] [SLUG ...]
"""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# Cloudflare fronts api.pexels.com and 403s (error 1010) on urllib's default
# `Python-urllib/3.x` agent even with a valid key — the key alone is not enough.
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PER_STUDY = 4

# One query per study. The first round was drafted from each EN draft (client,
# tags, excerpt); the publisher rewrote fifteen of them on the review sheet, and
# those briefs are the ones below — a query is a judgement about what the cover
# should SHOW, and the publisher owns it. Rounds accumulate: fetching a subset
# merges into the existing manifest rather than replacing it.
#
# Subject over brand throughout: a cover may not carry a third-party mark, so
# the brief is "what the work is about", never "the client's product on a shelf".
QUERIES = {
    "engie": "wind turbines green field sunrise",
    "fm-logistics": "semi truck on the highway",
    "julius-meinl": "roasted coffee beans close up",
    "breville": "dessert on a plate",
    "foodsaver": "fresh fruit",
    "polomarket": "grocery shelves with fruit and vegetables",
    "kontigo": "two women applying makeup together",
    "aquael": "glass aquarium tank in a living room",
    "ariadna": "paper questionnaire and pencil",
    "entelo": "children's desk and chair in a bedroom",
    "faktoria-win": "wine bottles on a store shelf",
    "skrzat": "empty cinema seats",
    "mazurska-manufaktura-alkoholi": "two whisky glasses on a bar",
    "kohersen": "plate of food on a table",
    "a1-karting": "karting helmet",
    "rabkoland": "amusement park carousel",
    "skibooking": "ski slope mountains winter",
    "dynamic-development": "architectural blueprints and house plans",
    "n-energia": "solar panels on a house roof",
    "produkty-cukiernicze-brzesc": "bowl of soup on a table",
    "ozgasl": "car repair workshop mechanic",
    "personal-effect": "empty therapy room with armchairs",
    "kbp": "conference audience in an auditorium",
    "stadler-form": "air humidifier on a table",
}


def api_key():
    """Read PEXELS_API_KEY out of `.env.local` (or the environment)."""
    if os.environ.get("PEXELS_API_KEY"):
        return os.environ["PEXELS_API_KEY"]
    path = os.path.join(ROOT, ".env.local")
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            m = re.match(r"\s*PEXELS_API_KEY\s*=\s*(.+?)\s*$", line)
            if m:
                return m.group(1).strip("'\"")
    sys.exit("PEXELS_API_KEY not found — add it to .env.local (never commit it)")


def get(url, key, attempts=3):
    """GET with a short retry: the API 500s intermittently on perfectly good
    queries, and a 24-study run should not die on one blip."""
    for n in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"Authorization": key, "User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code < 500 or n == attempts - 1:
                raise
            time.sleep(2 * (n + 1))
    raise AssertionError("unreachable")


def search(query, key):
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": query, "orientation": "landscape", "per_page": PER_STUDY, "size": "large"}
    )
    return get(url, key)["photos"]


def download(photo, dest):
    # `original` plus Pexels' own resize params: the named `src` sizes crop to
    # fixed boxes, and a cover has to be cropped to 1.9:1 by us, from the whole
    # frame.
    url = photo["src"]["original"] + "?auto=compress&cs=tinysrgb&w=1920"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())


def main():
    args, out, slugs = sys.argv[1:], ROOT, []
    while args:
        a = args.pop(0)
        if a == "--out":
            out = args.pop(0)
        else:
            slugs.append(a)
    slugs = slugs or list(QUERIES)
    unknown = [s for s in slugs if s not in QUERIES]
    if unknown:
        sys.exit("no query for: " + ", ".join(unknown))

    key = api_key()
    # Rounds accumulate. A re-query for a handful of slugs replaces only those
    # slugs' rows, so the studies already picked keep their provenance instead
    # of vanishing from the manifest the review sheet is built from.
    kept, manifest_path = [], os.path.join(out, "candidates.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as f:
            kept = [c for c in json.load(f) if c["slug"] not in slugs]

    manifest, failed = [], []
    for slug in slugs:
        query = QUERIES[slug]
        folder = os.path.join(out, slug)
        os.makedirs(folder, exist_ok=True)
        try:
            photos = search(query, key)
        except urllib.error.HTTPError as e:
            failed.append(slug)
            print(f"{slug:<32}FAILED — Pexels returned {e.code}; re-run for this slug")
            continue
        if not photos:
            failed.append(slug)
            print(f"{slug:<32}0 hits for {query!r} — needs a second query round")
            continue
        for photo in photos:
            path = os.path.join(folder, f"{photo['id']}.jpg")
            if not os.path.exists(path):
                download(photo, path)
            manifest.append(
                {
                    "slug": slug,
                    "query": query,
                    "id": photo["id"],
                    "file": os.path.relpath(path, out),
                    "page": photo["url"],
                    "src": photo["src"]["original"],
                    "photographer": photo["photographer"],
                    "photographer_url": photo["photographer_url"],
                    "alt": photo.get("alt") or "",
                    "width": photo["width"],
                    "height": photo["height"],
                }
            )
        print(f"{slug:<32}{len(photos)} candidates   {query}")

    merged = kept + manifest
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print(f"\n{len(manifest)} new + {len(kept)} kept -> {manifest_path}")
    if failed:
        print("no candidates for: " + ", ".join(failed))


if __name__ == "__main__":
    main()
