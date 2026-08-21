# Design — refresh-case-study-pillar-creatives

## Context

- Source of truth for the plan is the comparison sheet
  (`https://claude.ai/code/artifact/11c448c2-b04e-484b-9872-a6e328e431d4`),
  built from the dev DB (`dump-case-study-imagery.ts` + a pillar probe) and the
  18 Drive brand folders pulled with `rclone` by folder id (several folder
  names carry trailing spaces; `iRobot ` and `Mercator ` break path-based
  addressing). The owner approved it with two amendments: Pracuj cover ←
  `blur 2`, FM #EMPLOYERBRANDING ← man in a suit.
- The Drive files are flat: 1080×1350 / 1080×1080 Instagram exports
  (`<id>_n.jpg`) and 870–1260 px wide Mac screenshots of reels and posts.
  None is a device mockup, so `mockup_cutout.py` does not apply; they render
  through `.shot` with its CSS 18px radius, exactly like `breville-gallery-3`.
- The current creatives being displaced are mostly `*-cut.webp` phone cutouts.
  Each is referenced once (dump: "0 media documents referenced more than
  once"), so detaching leaves an orphan row; rows are kept, not deleted, per
  the existing spec.
- `approach` is localized as a whole array. PL and EN carry separate pillar
  copies pointing at the same media id; every write is done twice.
- All writes go through `lib/payload/media-ops.ts` (`begin`, `uploadMedia`,
  `repointRelation`, `finish`, `verifyLive`). The guard test fails the build
  on any direct `media` write elsewhere.
- Pillar tags differ per locale (`#SPRZEDAŻ` / `#SALES`). The plan keys on the
  PL tag and the script resolves the EN pillar by array index, asserting the
  EN pillar's tag matches the known pair from `edit-approach-creatives.ts`
  style tables.

## Goals / Non-Goals

**Goals:** one idempotent script that lands the whole reviewed plan on dev,
then on prod, with zero orphaned or renamed uploads, revalidated and
CDN-purged without human steps; every replaced creative encoded to the same
size/format family as its neighbours; alt text in both locales.

**Non-Goals:** re-cutting any surviving mockup; deleting orphan media rows;
the Breville logo; any stock cover; anything on the out-of-scope list in the
proposal; touching Pracuj pillars.

## Decisions

1. **Plan is data, keyed by `(slug, plTag, filename)`.** A `PLAN` table in the
   script lists per pillar: `keep: string[]`, `drop: string[]`, `add: {file,
   altPl, altEn, source}[]`. `repointRelation`'s `from` guard receives the full
   expected current set (`keep + drop`) so a pillar that changed since the
   sheet was built reports `stale` and is skipped, never written. Rejected:
   keying by array position alone (pillar order is editable in admin).

2. **Filenames follow the house pattern, numbered after the last existing.**
   `<slug>-gallery-<n>.jpg` continuing from the highest `n` on disk for that
   slug (Breville's highest is 6 → new files start at 7). Screenshots become
   `.jpg` too; PNG screenshots of photos are 1–2 MB for nothing. Rejected:
   keeping Drive ids as filenames (opaque, and the `_n.jpg` suffix is
   Instagram's, not ours).

3. **Encoding.** Longest side capped at 1350 px (already the case for IG
   exports), JPEG q82, sRGB, EXIF stripped. Screenshots are cropped to the
   creative before encoding: status bar, reel UI overlay, browser chrome. The
   crop is done by hand per file with a recorded box, not by heuristic; the
   `mockup_cutout.py` gate exists because heuristics ate FoodSaver's green
   plate once.

4. **Crops of surviving creatives (fm-logistics ×3, entelo-5, dolina-charlotty
   ×3, las-vegans ×2) update the existing media row in place** via `uploadMedia({replace:
   true})` on the same filename, the way `refresh-case-study-creatives.ts`
   does. Pillars reference by id; a new row would need a repoint for nothing.

5. **Pracuj cover: same in-place replace** of `pracuj-pl-cover.jpg` bytes with
   `blur 2`, encoded through `encode_cover.py` so the 1200×630 variant is
   regenerated. The cover id does not change.

6. **FM employer-branding slot is a stock swap, not a removal.** Candidates are
   sourced with `pexels_candidates.py` (query "man suit office"), shown at the
   pillar's portrait render box, one approved in the plan with URL + licence
   in `provenance.md`, uploaded as `fm-logistics-employerbranding-2.jpg`, alt
   written plainly ("A man in a dark suit at an office window"), no
   attribution to the client. Same rule the covers followed.

7. **Empty pillars stay.** a1-karting #VIDEO, engie #PERSONALBRANDING,
   power-elements #COMMUNITY, kontigo #LIVE, kbp (both) keep their copy and
   render through `pillarSolo`. Rejected: deleting the pillar (copy is content
   the owner did not ask to lose) and refilling with stock (the spec makes
   stock an explicit per-image approval, and none was given here).

8. **Two passes, one script.** `bun ./lib/payload/apply-pillar-refresh.ts`
   (report) → `--apply` (dev) → browser check on dev → `--apply --prod` →
   `verifyLive()` against the deployment → rerun `--prod` until it reports
   zero pending. `begin()` refuses prod while `media/` holds dev artefacts,
   so the dev run's files are removed first.

## Risks / Trade-offs

- **Las Vegans "dajmy większe".** Reducing to one screenshot per pillar does
  not change the render box; the crop to the article is what makes the
  legible part bigger. If that is still too small on the sand page, the fix is
  a `.shot` sizing rule for landscape-only pillars, raised as its own change,
  not media.

- **Interpretive calls baked into the plan.** Stadler gallery-5/6/7 (faceless,
  dropped under a literal reading), Mercator #MODERACJA, Personal Effect
  (no explicit list), ASUS "babka i facet obok siebie" read as the two
  adjacent cards. Each is marked `?` in the sheet; the owner approved the
  sheet as a whole. If Emilia disagrees, the fix is a repoint, not a rebuild.
- **Prod refs may differ from dev** for a field (it happened with the Pracuj
  and Brześć covers). The `from` guard turns that into a `stale` line in the
  prod report rather than a wrong write; those lines are resolved by hand
  before rerunning.
- **87 uploads against prod** at the Blob + Neon pace is a long run; the
  shell may return before it finishes. The rerun-until-zero rule covers it.
- **Faces in supplied files.** Volvo `konkurs 1`, Kohersen's two screenshots,
  Dynamic Development's four, Ariadna's four all show people. They come from
  Emilia's own folders, so they are treated as cleared; the change records
  that assumption rather than second-guessing it.
