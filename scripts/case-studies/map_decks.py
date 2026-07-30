#!/usr/bin/env python3
"""Tasks 2.1–2.5 — map each deck to a published case study by its CONTENT.

Folder names do not identify the client (`Dynamic Development/` holds ED Invest's
deck, `Kontigo/` holds Brzesc's, `Finanse/` holds three brands, and there are two
`ED Invest` folders differing by a trailing space). So every deck is scored by
how often each roster client's name actually appears in its extracted text, and
the folder name is reported only as a hint to disagree with.

Matching is done on a compacted form — diacritics stripped, non-alphanumerics
removed, lowercased — so "MM Hygienic" matches "MMHygienic" and "Las Vegan's"
matches "Las Vegans". ALIASES add the short forms decks actually use in prose
("Skrzat" for "Skrzat. Nowy poczatek", "Volvo" for the full dealership name).

A deck is reported CONFIDENT when its best-scoring client leads the runner-up by
MARGIN or more; otherwise it is AMBIGUOUS and gets listed for a human decision.
Decks whose title slide names one client and whose body names another in force
are flagged CONTAMINATED — the Medicover/Kontigo pattern — so the pool is not
trusted wholesale.

Usage: scripts/case-studies/map_decks.py [--json OUT]
"""

import json
import os
import re
import sys
import unicodedata

POOL_ROOT = os.environ.get("POOL_ROOT", "/mnt/work/goodone/.cs-pool")
ROSTER = os.environ.get(
    "ROSTER", "/mnt/work/goodone/.cs-audit/site-images.json"
)
MARGIN = 2
# Text from the first slides, used to detect a title/body client mismatch.
HEAD_CHARS = 700

ALIASES = {
    "a1-karting": ["a1karting", "a1kart"],
    "centrum-riviera": ["riviera"],
    "dolina-charlotty": ["dolinacharlotty", "charlotty"],
    "ed-invest": ["edinvest"],
    "fm-logistics": ["fmlogistic"],
    "fundacja-saventic": ["saventic"],
    "galeria-rondo-wiatraczna": ["rondowiatraczna", "galeriawiatraczna"],
    "imid-cmv": ["leczeniecmv", "cytomegali", "imid"],
    "kbp": ["kbp", "kongresbezpieczenstwa", "bezpieczenstwopolski"],
    "las-vegans": ["lasvegans", "lasvegan"],
    "mazurska-manufaktura-alkoholi": ["mazurska"],
    "mercator": ["mercator"],
    "mmhygienic": ["mmhygienic"],
    "n-energia": ["nenergia"],
    # The deck never writes the campaign name "O, ZGAsł?" — it calls the client
    # by its TikTok handle throughout.
    "ozgasl": ["ozgas", "warsztatsamochodowy"],
    "produkty-cukiernicze-brzesc": ["brzesc", "produktycukiernicze"],
    "riviera": ["riviera"],
    "skrzat": ["skrzat"],
    "volvo": ["volvo"],
}


# Needles used ONLY against the deck's filename. Filenames are short and
# deliberately named, so tokens too ambiguous for body prose are safe here:
# `A1 draft.pptx` identifies its client as "a1" and nothing else does.
FILE_ALIASES = {
    "a1-karting": ["a1"],
}


def compact(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    # Polish l-with-stroke has no combining decomposition.
    s = s.replace("ł", "l").replace("Ł", "L")
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    out_path = None
    if "--json" in sys.argv:
        out_path = sys.argv[sys.argv.index("--json") + 1]

    roster = json.load(open(ROSTER))
    studies = {s["slug"]: s["client"] for s in roster["studies"]}

    # slug -> list of compacted needles to count
    needles = {}
    for slug, client in studies.items():
        keys = {compact(client)}
        keys |= set(ALIASES.get(slug, []))
        keys |= set(ALIASES.get(compact(client), []))
        # Drop empties and anything too short to be distinctive on its own.
        needles[slug] = sorted(k for k in keys if len(k) >= 4)

    decks = sorted(
        d for d in os.listdir(POOL_ROOT) if os.path.isdir(os.path.join(POOL_ROOT, d))
    )

    results = []
    for deck in decks:
        tpath = os.path.join(POOL_ROOT, deck, "text.md")
        raw = open(tpath, encoding="utf-8", errors="replace").read() if os.path.exists(tpath) else ""
        # Strip the header lines this pipeline itself wrote, so the folder name
        # cannot leak into the content score.
        body = "\n".join(
            l for l in raw.splitlines() if not l.startswith(("#", ">"))
        )
        text = compact(body)
        head = compact(body[:HEAD_CHARS])

        scores = {}
        head_scores = {}
        for slug, keys in needles.items():
            scores[slug] = sum(text.count(k) for k in keys)
            head_scores[slug] = sum(head.count(k) for k in keys)

        ranked = sorted(scores.items(), key=lambda kv: -kv[1])
        best, best_n = ranked[0]
        second, second_n = ranked[1] if len(ranked) > 1 else ("", 0)

        head_ranked = sorted(head_scores.items(), key=lambda kv: -kv[1])
        head_best, head_best_n = head_ranked[0]

        # The deck's own FILENAME is a third opinion, and the most revealing one:
        # `Ed Invest /A1 draft.pptx` is named for A1 Karting but its body is ED
        # Invest's strategy deck with the opening slides overwritten. Neither the
        # folder nor the head-vs-body test catches that, because A1 Karting is
        # never named in its own opening slides — only in the filename.
        stem = compact(deck.split("__")[1] if "__" in deck else deck)
        name_hits = {
            slug: sum(
                1 for k in set(keys) | set(FILE_ALIASES.get(slug, [])) if k in stem
            )
            for slug, keys in needles.items()
        }
        name_ranked = sorted(name_hits.items(), key=lambda kv: -kv[1])
        name_best, name_best_n = name_ranked[0]

        if best_n == 0:
            verdict = "NO-MATCH"
        elif second_n == 0 or best_n - second_n >= MARGIN:
            # An uncontested single mention is not ambiguous — it is just a
            # terse deck. Ambiguity means two clients are both named.
            verdict = "CONFIDENT"
        else:
            verdict = "AMBIGUOUS"

        # Two independent leftover signals, both meaning "this deck's images
        # belong to more than one client and the pool cannot be trusted":
        #   head — the title slide names a different client than the body
        #          (the Medicover/Kontigo pattern)
        #   name — the filename names a different client than the body
        #          (the A1-draft-built-on-ED-Invest pattern)
        head_conflict = head_best_n > 0 and head_best != best
        name_conflict = name_best_n > 0 and name_best != best
        contaminated = verdict == "CONFIDENT" and (head_conflict or name_conflict)

        results.append(
            {
                "deck": deck,
                "folder": deck.split("__")[0],
                "format": deck.rsplit("__", 1)[-1],
                "verdict": verdict,
                "best": best if best_n else None,
                "bestScore": best_n,
                "second": second if second_n else None,
                "secondScore": second_n,
                "headBest": head_best if head_best_n else None,
                "headBestScore": head_best_n,
                "nameBest": name_best if name_best_n else None,
                "contaminated": contaminated,
                "headConflict": head_conflict,
                "nameConflict": name_conflict,
                "folderMatchesBest": compact(deck.split("__")[0]) == compact(best or ""),
                "chars": len(text),
                "top5": [(s, n) for s, n in ranked[:5] if n > 0],
            }
        )

    # —— report ——
    for r in results:
        flag = "" if r["folderMatchesBest"] else "  ⚠ folder≠content"
        if r["contaminated"]:
            flag += "  ⚠ CONTAMINATED"
        print(
            f"{r['verdict']:9} {r['deck']:66} -> {str(r['best']):30} "
            f"{r['bestScore']:4} (2nd {r['second']} {r['secondScore']}){flag}"
        )

    print()
    confident = [r for r in results if r["verdict"] == "CONFIDENT"]
    print(f"{len(confident)}/{len(results)} decks confidently mapped")

    for label in ("AMBIGUOUS", "NO-MATCH"):
        rows = [r for r in results if r["verdict"] == label]
        if rows:
            print(f"\n{label} ({len(rows)}):")
            for r in rows:
                print(f"  {r['deck']:66} top5={r['top5']}")

    mism = [r for r in results if not r["folderMatchesBest"] and r["best"]]
    if mism:
        print(f"\nfolder name disagrees with content ({len(mism)}):")
        for r in mism:
            print(f"  {r['folder']:32} -> {r['best']:32} ({r['deck']})")

    cont = [r for r in results if r["contaminated"]]
    if cont:
        print(f"\nCONTAMINATED — leftover material from another client ({len(cont)}):")
        for r in cont:
            why = []
            if r["headConflict"]:
                why.append(f"title slide says {r['headBest']}")
            if r["nameConflict"]:
                why.append(f"filename says {r['nameBest']}")
            print(f"  {r['deck']:66} body={r['best']} — {'; '.join(why)}")

    mapped = {r["best"] for r in results if r["verdict"] == "CONFIDENT"}
    orphan = sorted(set(studies) - mapped)
    if orphan:
        print(f"\npublished studies with NO confidently mapped deck ({len(orphan)}):")
        for s in orphan:
            print(f"  {s:32} {studies[s]}")

    if out_path:
        json.dump(
            {"margin": MARGIN, "decks": results, "orphanStudies": orphan},
            open(out_path, "w"),
            indent=2,
            ensure_ascii=False,
        )
        print(f"\nwrote {out_path}")


if __name__ == "__main__":
    main()
