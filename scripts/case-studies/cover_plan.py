#!/usr/bin/env python3
"""Render `cover-plan.md` and `pexels-provenance.md` from the decisions on disk.

Case-study content lives only in the database, so a cover write has no
`git revert`. The plan table IS the rollback instruction, which means it has to
be derived from the same inputs the apply script uses rather than hand-kept in
step with them — three files, all committed:

    picks.json        slug -> Pexels id, or "recrop" / "client"
    cover-alts.json   slug -> [alt PL, alt EN]
    candidates.json   the fetched Pexels metadata (working dir, not committed)

plus the dev and prod cover probes, so the table records what each row pointed
at BEFORE the run in each environment — dev and prod can differ.

    python3 scripts/case-studies/cover_plan.py --change DIR --pexels DIR \\
        --dev covers-dev.json --prod covers-prod.json
"""

import json
import os
import sys

# Covers this change produced itself rather than downloading. Kept here so the
# provenance file can state plainly why they carry no Pexels row.
LOCAL = {
    "recrop": "recrop of the existing cover (faces excluded)",
    "client": "client-supplied photo (2026-08-20)",
}
# Stock frames edited after download. The Pexels licence permits modification;
# recording it keeps the difference from the source auditable.
EDITED = {
    "a1-karting": "SODi marks blurred out (sidepod, nose plate, nose cone)",
}
DEFERRED = ("dolina-charlotty", "power-elements", "ed-invest")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    args, opts = sys.argv[1:], {}
    while args:
        # Two steps on purpose: `d[a.pop()] = a.pop()` evaluates the value
        # first, which swaps the flag and its argument.
        flag = args.pop(0)
        opts[flag.lstrip("-")] = args.pop(0)
    change, pexels = opts["change"], opts["pexels"]

    picks = load(os.path.join(change, "picks.json"))
    # What production actually stored, where getSafeFileName bumped the index.
    stored_path = os.path.join(change, "prod-stored-names.json")
    stored = load(stored_path) if os.path.exists(stored_path) else {}
    alts = load(os.path.join(change, "cover-alts.json"))
    cands = load(os.path.join(pexels, "candidates.json"))
    man = {(c["slug"], str(c["id"])): c for c in cands}
    dev = {r["slug"]: r for r in load(opts["dev"])["rows"]}
    prod = {r["slug"]: r for r in load(opts["prod"])["rows"]}

    missing = [s for s in picks if s not in alts]
    if missing:
        sys.exit("no alt text for: " + ", ".join(missing))

    plan = [
        "# Cover plan — refresh-case-study-covers",
        "",
        "One row per study. **This table is the rollback instruction**: case-study",
        "content is database-only, so there is no `git revert` for a cover write.",
        "The two `before` columns are what each database's row pointed at when it was",
        "probed on 2026-08-20 — restore that filename to undo. They differ where a",
        "study was repointed in one environment and not the other.",
        "",
        "The two `now` columns differ too, and that is not a mistake: Payload's",
        "`getSafeFileName` checks the local media directory for collisions even when",
        "the bytes go to Vercel Blob, so the production run — made from the same",
        "working copy as the development one — found every `-cover-2.jpg` already",
        "written locally and bumped each index by one (⚠). The bytes are identical in",
        "both environments; only the stored names diverge. `apply-cover-refresh.ts`",
        "carries the production names in its `stored` field, which is what lets a",
        "re-run report already-done rather than a stale plan.",
        "",
        f"Deferred for client material, untouched by this pass: {', '.join(DEFERRED)}.",
        "",
        "| study | verdict | dev before | prod before | dev now | prod now | alt PL / EN |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    prov = [
        "# Pexels provenance — refresh-case-study-covers",
        "",
        "Every stock cover written by this change, with its source. All Pexels images",
        "are used under the [Pexels licence](https://www.pexels.com/license/): free for",
        "commercial use, no attribution required, modification permitted. Attribution is",
        "recorded anyway so the source stays auditable.",
        "",
        "Candidates are fetched by `pexels_candidates.py` and judged at the card and hero",
        "crops on the review sheet, never as thumbnails. Covers that are not stock carry",
        "no row here by design — see the plan's verdict column for those.",
        "",
        "| study | file | Pexels id | page | photographer | edited |",
        "| --- | --- | --- | --- | --- | --- |",
    ]

    stock_rows = 0
    for slug, choice in sorted(picks.items()):
        new_name = prod[slug]["nextFree"]
        pl, en = alts[slug]
        verdict = LOCAL.get(str(choice), f"Pexels {choice}")
        on_prod = stored.get(slug, new_name)
        flag = "" if on_prod == new_name else " ⚠"
        plan.append(
            f"| `{slug}` | {verdict} | `{dev[slug]['cover']}` | `{prod[slug]['cover']}` "
            f"| `{new_name}` | `{on_prod}`{flag} | {pl} / {en} |"
        )
        c = man.get((slug, str(choice)))
        if c:
            prov.append(
                f"| `{slug}` | `{new_name}` | {choice} | {c['page']} | {c['photographer']} "
                f"| {EDITED.get(slug, '—')} |"
            )
            stock_rows += 1

    still_open = sorted((set(alts) | {"laurastar", "mercator"}) - set(picks))
    if still_open:
        plan += ["", "## Still open", "", "| study | note |", "| --- | --- |"]
        plan += [f"| `{s}` | awaiting a verdict |" for s in still_open]

    with open(os.path.join(change, "cover-plan.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(plan) + "\n")
    with open(os.path.join(change, "pexels-provenance.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(prov) + "\n")
    print(f"cover-plan.md: {len(picks)} settled, {len(still_open)} open")
    print(f"pexels-provenance.md: {stock_rows} stock rows")


if __name__ == "__main__":
    main()
