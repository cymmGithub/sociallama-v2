## 1. Sources

- [ ] 1.1 Pull the 18 brand folders by id from Drive root `19Ti6Y3DOf7kZraG95q1AVb14TqtN1b33` with `rclone copy --drive-root-folder-id <id> goodone-gdrive: <dir>` into a scratch dir (folder names have trailing spaces; address by id). Skip `iRobot`, `IMID`, `Pracuj` except `pracuj/blur 2`.
- [ ] 1.2 Write `plan.md` in the change dir from `plan-source.py` (the approved sheet's mapping): one row per affected media — study, PL tag, verdict (keep / drop / add / crop / replace-bytes), current filename, new filename, Drive file, alt PL, alt EN. Every current creative on each touched study gets a row.
- [ ] 1.3 Source the FM #EMPLOYERBRANDING stock candidate (`scripts/case-studies/pexels_candidates.py`, "man suit office"), render 3 candidates at the portrait `.shot` box, publish as an Artifact, get one approved, record URL + licence in `provenance.md`.

## 2. Encode

- [ ] 2.1 Add `scripts/case-studies/encode_pillar.py`: longest side ≤ 1350, JPEG q82, sRGB, EXIF stripped, optional `--crop x,y,w,h`; writes to `public/case-studies/<slug>/<slug>-gallery-<n>.jpg` numbered after the highest existing `n`.
- [ ] 2.2 Encode the 87 Drive files per `plan.md`; for the ~25 Mac screenshots record the crop box that removes status bar / reel UI / browser chrome in `plan.md`.
- [ ] 2.3 Hand-crop the nine surviving creatives (fm-logistics greensupplychain-1, gallery-3, crossdock-2; entelo gallery-5; dolina-charlotty gallery-3/4/5; las-vegans gallery-7/8 to the article body and headline) to the inner graphic, overwriting the existing files in `public/case-studies/`.
- [ ] 2.4 Re-encode `pracuj-pl-cover.jpg` from `pracuj/blur 2` through `encode_cover.py` (hero + 1200×630).
- [ ] 2.5 Contact sheet of every new/cropped file on the sand background, published as an Artifact, eyeballed for chrome remnants and wrong crops.

## 3. Script

- [ ] 3.1 `lib/payload/apply-pillar-refresh.ts` on `media-ops.ts`: `PLAN` table from `plan.md`; per pillar `repointRelation` with `from = keep + drop`, `upload` for adds (filename asserted), detach for drops, both locales via index with EN-tag assertion; `replace: true` in-place uploads for the seven crops and the Pracuj cover; `finish()` with `case-studies` + every `case-study:<slug>`.
- [ ] 3.2 Report mode prints per study: pending / already-done / stale counts and the stale values; `--apply` writes; a row with no `source` is refused (spec).
- [ ] 3.3 `bun run test` passes, including `media-ops.test.ts` (no direct media writes).

## 4. Apply

- [ ] 4.1 Report run against dev; resolve any `stale` by hand.
- [ ] 4.2 `--apply` on dev; rerun until zero pending; check all 24 studies in the browser (both locales, empty pillars render via `pillarSolo`, no frame around new flat creatives).
- [ ] 4.3 `rm -rf media/` (dev artefacts), then `--apply --prod` with explicit per-run approval; rerun `--prod` until zero pending.
- [ ] 4.4 `verifyLive()` against the deployment for the 24 slugs; confirm CDN purge happened; spot-check in a real browser (Chrome + WebKit).

## 5. Close

- [ ] 5.1 Update `plan.md` with the applied state and `provenance.md` with the stock row; memory note for the Drive root id and the Emilia/Ania Pracuj conflict.
- [ ] 5.2 `bun run check`, archive into the feature commit, ff-merge, push.
