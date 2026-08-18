# Tasks — apply-final-verification-feedback

Staged inputs: `/mem/final-weryfikacja/{logos,asana,drive,video}`. Per-study verdicts: design.md table.

## 1. Frameless approach creatives (code)

- [x] 1.1 Strip chrome from `.shot` in `app/(frontend)/case-studies/[slug]/case-study.module.css` (border, background plate; keep radius/spacing per design decision 1); keep `.shotPortrait` sizing/stagger
- [x] 1.2 Visual check: media-heavy study (`irobot`) + `riviera` parity, desktop and mobile; screenshot the settled state (wipe-reveal clips overflow — rects lie)

## 2. Logo swaps (code + assets)

- [x] 2.1 Copy the three new raws into `assets-src/client-logos/raw/`; update `BRANDS` rows for `volvo` (→ Dom Volvo annotated mark), `engie` (→ new logo), `irobot` (→ new wordmark) in `scripts/client-logos/pipeline.py`
- [x] 2.2 Re-run the pipeline; diff outputs — belt: only volvo/engie/irobot; cards: those three plus 22 rescaled by the median shift the swap causes (accepted 2026-08-18, see design.md risks); verify belt screenshot (mono filter + hover color) per client-logo-assets spec
- [x] 2.3 Update `lib/content/clients.ts` volvo `name` → `'Dom Volvo'`; sync any alt/testimonial copy in `home.ts`/`home.en.ts` that names the brand; run `lib/content/clients.test.ts`
- [x] 2.4 Regenerate the case-study `-logo-mono.png` set and run `refresh-case-study-logos.ts` against dev DB for every changed slug (update-in-place; mind the `-1.png` bump gotcha)

## 3. Homepage kreacje clip (asset)

- [x] 3.1 Re-edit `public/clips/kreacje-pracuj.mp4`: cut/crop Paulina's shot, end on the Pracuj.pl logo; encode with smpte170m color tags; regenerate poster if its frame was cut
- [x] 3.2 Clear `.next/dev/cache/images` and verify the clip in the homepage kreacje rail (4th clip, dwell 11 s)

## 4. iRobot pillar removal (seed + DB)

- [x] 4.1 Delete the `#DLAKAŻDEGO / Akcje specjalne` pillar from `lib/payload/seed-case-studies.ts` (both locales if seeded per-locale)
- [x] 4.2 The seed is skip-if-exists and cannot remove the pillar from the live study — carry the removal as a pillar-removal op in the task-6 apply script (both locales, detach `irobot-gallery-5.jpg`, never delete); verify PL + EN after 6.3

## 5. Screenshot anonymization + image prep (assets)

- [x] 5.1 Dump current media per study (`dump-case-study-imagery.ts`) for: vistula, polomarket, pracuj-pl, engie, fm-logistics, volvo; match Anna/Emilia's references to media ids
- [x] 5.2 Produce anonymized versions (blur avatars, pseudonymize names consistently per thread, crop clocks/status bars) for the matched screenshots; verify each at rendered size
- [x] 5.3 Probe + rename extensionless Drive files (`drive/IMID/*`, `drive/Pracuj/*`); normalize all replacement filenames to `<slug>-<section>-<n>.<ext>`
- [x] 5.4 Checked first, as instructed: `media.mimeTypes` is `['image/*']` and neither `case-studies.ts` nor the article renderer has any video path — video is a schema change + migration, not a minimal extension. Decision 2026-08-18: ship a people-free still from each video, video support becomes its own change. Stills cut: volvo 28 s (art table), julius 2 s (Barista Cup stand)
- [x] 5.5 Source two Pexels business photos for FM's "pan" + employer-advocacy slots (browser-UA HTML search, not the API; mark-free; record page URLs in the PLAN; verify in-frame contrast at rendered size)
- [x] 5.6 Decks searched first (perceptual match): riviera = the same render at 800px, belvedere = the identical 787px file, vistula/asus absent — no better sources exist. Per P 2026-08-18: Pexels covers matched to each client's type (glass facade / lecture hall / laptop workspace / fine-dining table), mark-free, provenance in plan appendix B; applied to dev

## 6. DB imagery pass (dev first)

- [x] 6.1 Author the PLAN (per-image verdict rows: study, media id, verdict, reason, replacement) from design.md's table + the 5.1 dumps; every image of every touched study gets a row
- [x] 6.2 Run the apply script in report mode against dev DB; review the report against the PLAN
- [x] 6.3 Apply to dev DB (per-locale media arrays by id; detach never delete; upload replacements via findOrCreate); re-run until zero changes
- [x] 6.4 Browser-verify every touched study PL + EN on dev (frameless rendering live from task 1); screenshot-sample the anonymized screens — 14/14 stron PL+EN, broken=0; przy okazji złapane i naprawione nazwisko w nagłówku `riviera-gallery-2`
- [x] 6.5 Verified no-op: EN drafts carry only `tag/heading/body` (no media), and the one wholly-removed pillar (irobot) has no committed EN draft

## 7. Verify + prod

- [ ] 7.1 `bun run check` + e2e; production build
- [ ] 7.2 Prod DB pass after the code deploy: `BLOB_READ_WRITE_TOKEN` set, report → apply → re-run until zero (script outlives shell — never trust one pass); `refresh-case-study-logos.ts` + seed re-run against prod likewise
- [ ] 7.3 Browser-verify prod studies + homepage belt/clip; confirm no 404 media
- [ ] 7.4 Report done on the Asana task; note Brześć/Rabkoland/ASUS follow-ups remain with Anna/Emilia
