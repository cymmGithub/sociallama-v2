## 1. Sources

- [x] 1.1 Pull the 18 brand folders by id from Drive root `19Ti6Y3DOf7kZraG95q1AVb14TqtN1b33` with `rclone copy --drive-root-folder-id <id> goodone-gdrive: <dir>` into a scratch dir (folder names have trailing spaces; address by id). Skip `iRobot`, `IMID`, `Pracuj` except `pracuj/blur 2`.
- [x] 1.2 Write `plan.md` in the change dir from `plan-source.py` (the approved sheet's mapping): one row per affected media — study, PL tag, verdict (keep / drop / add / crop / replace-bytes), current filename, new filename, Drive file, alt PL, alt EN. Every current creative on each touched study gets a row.
- [x] 1.3 Source the FM #EMPLOYERBRANDING stock candidate (`scripts/case-studies/pexels_candidates.py`, "man suit office"), render 3 candidates at the portrait `.shot` box, publish as an Artifact, get one approved, record URL + licence in `provenance.md`.

## 2. Encode

- [x] 2.1 Add `scripts/case-studies/encode_pillar.py`: longest side ≤ 1350, JPEG q82, sRGB, EXIF stripped, optional `--crop x,y,w,h`; writes to `public/case-studies/<slug>/<slug>-gallery-<n>.jpg` numbered after the highest existing `n`.
- [x] 2.2 Encode the 87 Drive files per `plan.md`; for the ~25 Mac screenshots record the crop box that removes status bar / reel UI / browser chrome in `plan.md`.
- [x] 2.3 Hand-crop the surviving creatives to the inner graphic, overwriting the existing files in `public/case-studies/`. Seven, not nine: the owner cancelled the las-vegans re-cut on 2026-08-21, so gallery-7/8 keep their original bytes. Done: fm-logistics greensupply-1, gallery-3, crossdock-2; entelo gallery-5; dolina-charlotty gallery-3/4/5.
- [x] 2.4 ~~Re-encode `pracuj-pl-cover.jpg` from `pracuj/blur 2`~~ — struck by the owner on 2026-08-21 ("why did you propose new cover? i didnt mention that"). The re-encode was reverted before any database saw it. Replaced by: encode the owner-supplied `power-elements-cover-2.jpg` through `encode_cover.py` and repoint the study's cover.
- [x] 2.5 Contact sheet of every new/cropped file on the sand background, published as an Artifact, eyeballed for chrome remnants and wrong crops.

## 3. Script

- [x] 3.1 `lib/payload/apply-pillar-refresh.ts` on `media-ops.ts`: `PLAN` table from `plan.md`; per pillar `repointRelation` with `from = keep + drop`, `upload` for adds (filename asserted), detach for drops, both locales via index with EN-tag assertion; `replace: true` in-place uploads for the seven crops and the Pracuj cover; `finish()` with `case-studies` + every `case-study:<slug>`.
- [x] 3.2 Report mode prints per study: pending / already-done / stale counts and the stale values; `--apply` writes; a row with no `source` is refused (spec).
- [x] 3.3 `bun run test` passes, including `media-ops.test.ts` (no direct media writes).

## 4. Apply

- [x] 4.1 Report run against dev; resolve any `stale` by hand.
- [x] 4.2 `--apply` on dev; rerun until zero pending; check all 24 studies in the browser (both locales, empty pillars render via `pillarSolo`, no frame around new flat creatives).
- [x] 4.3 `rm -rf media/` (dev artefacts), then `--apply --prod` with explicit per-run approval; rerun `--prod` until zero pending.
- [x] 4.4 `verifyLive()` against the deployment: 27/27 pages clean (24 studies + the listing + three EN pages), every image decoded, no 429s, no 5xx. CDN purge confirmed in the run log. Spot-checked in Chromium and WebKit against production, asserting the NEW filenames are the ones served rather than trusting "an image decoded".

## 5. Close

- [x] 5.1 Update `plan.md` with the applied state and `provenance.md` with the stock row; memory note for the Drive root id and the Emilia/Ania Pracuj conflict.
- [ ] 5.2 `bun run check`, archive into the feature commit, ff-merge, push.

## 6. Added after the plan was approved

- [x] 6.1 `power-elements` cover ← an owner-supplied green-powder texture
  (`power-elements-cover-2.jpg`, 814×428 — the largest the source allows).
- [x] 6.2 `pracuj-pl` refilled: the owner ruled on the standing Emilia/Ania
  conflict — every file in the Drive folder except `blur 1`, spread across
  three pillars, cover untouched. Five creatives, both locales, dev and prod.
- [ ] 6.3 ~~`kbp` cover swap~~ — handed back to the owner. The pick (Pexels
  2774556) was made and encoded, but the scripted repoint hit a filename
  collision: production already owned `kbp-cover-3.jpg` (holding the old masked
  photograph, from the pre-`media-ops` covers run that bumped ~27 names), so the
  repoint compared current against target, found them equal and reported
  `already-done` — writing nothing. The row was removed from the plan and the
  three covers (kbp, entelo, dolina-charlotty) were handed over as encoded files
  for a manual upload under names free on both databases.
