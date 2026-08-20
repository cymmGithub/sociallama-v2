#!/usr/bin/env python3
"""Write every approved cover into `public/case-studies/<slug>/`, ready to upload.

`apply-cover-refresh.ts` uploads by path, so this is the step that turns the
decision files into bytes on disk. It is idempotent and safe to re-run: the
output is a pure function of the picks, the anchors below, and the sources.

Two kinds of source:

- **Pexels** — the downloaded frame, cropped and encoded here.
- **Staged** — a frame this change produced by hand because a crop-and-encode
  could not make it: the client's own photos, the Stadler Form recrop, and the
  A1 Karting frame with its SODi marks blurred. Those are built by their own
  named commands (recorded in `cover-plan.md`) and only copied here.

    python3 scripts/case-studies/build_covers.py --change DIR --pexels DIR \\
        --staged DIR --prod covers-prod.json [--apply]
"""

import glob
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from encode_cover import encode  # noqa: E402

# Vertical crop anchor for frames whose subject is not centred. 0.5 centres;
# lower keeps more of the top. Only slugs that need it appear here.
# Matches encode_cover's own target; repeated here only to flag the overshoot.
BUDGET_KB = 350

ANCHORS = {
    # The steamer stands in the upper half; a centre crop clipped its nozzle.
    "laurastar": 0.35,
    # The robot sits low against the sofa base.
    "irobot": 0.62,
}


def main():
    args, opts = sys.argv[1:], {}
    apply_ = "--apply" in args
    args = [a for a in args if a != "--apply"]
    while args:
        flag = args.pop(0)
        opts[flag.lstrip("-")] = args.pop(0)

    change, pexels, staged = opts["change"], opts["pexels"], opts["staged"]
    with open(os.path.join(change, "picks.json"), encoding="utf-8") as f:
        picks = json.load(f)
    with open(os.path.join(pexels, "candidates.json"), encoding="utf-8") as f:
        man = {(c["slug"], str(c["id"])): c for c in json.load(f)}
    with open(opts["prod"], encoding="utf-8") as f:
        prod = {r["slug"]: r for r in json.load(f)["rows"]}

    built, copied, problems, heavy = 0, 0, [], []
    for slug, choice in sorted(picks.items()):
        name = prod[slug]["nextFree"]
        dest_dir = os.path.join("public", "case-studies", slug)
        dest = os.path.join(dest_dir, name)
        # Glob rather than assume `-cover-2`: the staged filename and the
        # prod-resolved one agree today only by coincidence, and eight slugs
        # already resolve to -3 or -4.
        stages = sorted(
            glob.glob(os.path.join(staged, f"{slug}-cover-*.jpg"))
        )
        if len(stages) > 1:
            problems.append(f"{slug}: {len(stages)} staged files, expected one")
            continue
        stage = stages[0] if stages else None
        source = man.get((slug, str(choice)))

        if stage:
            kind, note = "staged", os.path.basename(stage)
            if apply_:
                os.makedirs(dest_dir, exist_ok=True)
                shutil.copy(stage, dest)
            copied += 1
        elif source:
            kind, note = "pexels", f"id {choice}"
            if apply_:
                os.makedirs(dest_dir, exist_ok=True)
                encode(os.path.join(pexels, source["file"]), dest,
                       ay=ANCHORS.get(slug, 0.5))
            built += 1
        else:
            problems.append(f"{slug}: no staged file and no candidate for {choice!r}")
            continue

        kb = os.path.getsize(dest) // 1024 if os.path.exists(dest) else 0
        # The encoder steps quality down to hit its budget and gives up at its
        # quality floor rather than wrecking a detailed frame. Say so out loud —
        # a silent overshoot is how a 600KB cover reaches production.
        if kb > BUDGET_KB:
            heavy.append(f"{slug} ({kb}KB)")
        print(f"{slug:<32}{kind:<8}{note:<28}{name:<38}{kb or '-'}KB"
              f"{'  !over budget' if kb > BUDGET_KB else ''}")

    print(f"\n{built} encoded + {copied} copied = {built + copied} covers"
          f"{'' if apply_ else '  (report only — pass --apply to write)'}")
    if heavy:
        print(f"over the {BUDGET_KB}KB budget: {', '.join(heavy)}")
    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print("  " + p)
        sys.exit(1)


if __name__ == "__main__":
    main()
