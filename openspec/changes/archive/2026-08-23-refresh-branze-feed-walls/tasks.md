## 1. Confirm the snapshot

- [x] 1.1 Re-run `bun ./lib/payload/dump-case-study-imagery.ts --prod --json <scratch>/prod-imagery.json` and diff the PL pillar sets for the 10 walls' studies against the approved map (artifact "Branże Feed Re-point"); stop and report if any study changed since 2026-08-23
- [x] 1.2 Get the health and alkohole tile sets confirmed on the artifact (design.md Open Questions); record the final filenames in design.md

## 2. Wall component and sizing

- [x] 2.1 Add optional `creatives: readonly IndustryCreative[]` to `Industry` in `lib/content/branze.ts`; mirror the type in `branze.en.ts`
- [x] 2.2 Lift the wall JSX from `ProofLayout` into a `CreativesWall` component taking `creatives` + `chrome`; `ProofLayout` passes `study.creatives`, `EditorialLayout` renders it after `IndustryBrief` when `industry.creatives` is non-empty
- [x] 2.3 Set `data-landscape` on a tile when `width > height`; CSS: desktop `flex-basis: calc(28rem + var(--gap))`, mobile full width
- [x] 2.4 CSS: `.wallItem:only-child` desktop `flex-basis: 22rem`, no stagger margin
- [x] 2.5 Verify: `/branze/finanse` renders no wall section; `/branze/health` placeholder-free before content lands

## 3. Stale bytes

- [x] 3.1 For each stale tile still on a wall (`irobot-edukacja-2-cut.webp`, `julius-meinl-gallery-3-cut.webp`, `dolina-charlotty-gallery-3-cut.webp`, `dolina-charlotty-gallery-4-cut.webp`, `dolina-charlotty-gallery-5-cut.webp`, `ed-invest-gallery-1-cut.webp`, `ed-invest-gallery-3-cut.webp`, `ed-invest-gallery-4-cut.webp` — eight, not six: the two 4.7/4.8 "check md5" tiles were stale too) download the prod file from `/api/media/file/<name>` (pace ≥1 s apart), overwrite `public/case-studies/<study>/<name>`, confirm md5 equals prod
- [x] 3.2 Append `?v=2` to those eight `src` values in both content files; `rm -rf .next/dev/cache/images` locally

## 4. Re-point the walls (PL first, EN mirrors)

- [x] 4.1 automotive: `volvo-gallery-3`, `volvo-gallery-1`, `volvo-event-ex30`, `volvo-event-noc`, `volvo-gallery-4`; real dimensions; alts from the study's PL/EN alt text
- [x] 4.2 elektronika-i-agd: `irobot-humor-parrot`, `irobot-edukacja-1`, `irobot-edukacja-2-cut?v=2`, `irobot-innowacja-1` (landscape); drop the code comment that excluded landscape frames
- [x] 4.3 beauty: replace `kontigo-gallery-4` with `kontigo-gallery-7`
- [x] 4.4 health: industry-level `creatives` with the confirmed five tiles from imid-cmv / mercator / power-elements / fundacja-saventic; brand-naming alts
- [x] 4.5 alkohole: Faktoria Win `-6`, `-3` + Mazurska `-2`, `-1`, `-3`; brand-naming alts. The first pass used Mazurska `-6` and `-7`, which are a HoReCa Trends press-article screenshot and a Good One results slide rather than feed creatives; both were swapped out so every tile under the "100% realne kreacje" badge is one
- [x] 4.6 horeca: keep selection, bump `julius-meinl-gallery-3-cut` only
- [x] 4.7 hotele-i-miejsca-wypoczynkowe: `dolina-charlotty-gallery-6`, `-3-cut?v=2`, `-4-cut?v=2`, `-5-cut` (check md5; bump if stale)
- [x] 4.8 nieruchomosci-i-deweloperzy: `ed-invest-gallery-1-cut?v=2`, `-3-cut` (check md5; bump if stale), `-4-cut?v=2`, `-5`
- [x] 4.9 rozrywka: single tile `skrzat-gallery-1`
- [x] 4.10 petcare untouched; `branze.en.ts` walls made identical to PL file-for-file (fixes the Volvo fifth-tile drift); EN alts translated
- [x] 4.11 Nothing deleted, and nothing should be: every dropped tile is still referenced by `lib/payload/pillar-refresh-plan.ts` (its `fromPath` seed source) and `content/media/alts.en.json`, so `public/case-studies/` is the upload corpus, not a render cache. (`audit-case-study-orphans.ts` is a Polish orphan-WORD typography audit, not a file-reference audit — the task named the wrong tool; a repo-wide grep is the check that applies.)

## 5. Wall asset test

- [x] 5.1 `lib/content/branze.test.ts`: for PL and EN, every `creatives[].src` (strip `?v=`) exists under `public/`, `sharp` metadata width/height equal the declared values, and PL/EN lists match file-for-file in order
- [x] 5.2 Run `bun test lib/content`; make it pass

## 6. EN pillar sync script

- [x] 6.1 Write `lib/payload/sync-en-pillar-media.ts` per design D6 on `media-ops.begin/finish`: slugs list (ariadna, dolina-charlotty, dynamic-development, entelo, getaway, personal-effect, riviera, skibooking, skrzat), dry-run default, `--apply`, `--prod` via `targetProdEnv()`, per-pillar `from → to` by filename, guards on pillar count and tags, idempotent
- [x] 6.2 Dry-run on dev; `--apply` on dev; re-run reports zero pending. Dev started out with **all nine already in sync**, so a plain dry run would only have exercised the early return; a deliberate divergence was seeded on `skrzat` EN pillar 1 first, and the script found it, named it by tag, wrote it, and printed the reversed rollback line
- [x] 6.3 Dry-run `--prod` saved as `en-sync-prod-plan.txt` (9 studies, 21 pillars, 0 stale, 0 missing); plan reviewed and **approved per-run 2026-08-23**. Sequencing note for next time: `media-ops.begin` calls `assertCleanWorkingCopy` on `--apply --prod`, so the worktree had to be COMMITTED first (2d1baa5f) — that reverses steps 1 and 2 of the design's migration plan
- [x] 6.4 `--apply --prod` written 2026-08-23: 9 studies, 21 pillars, `9 pending, 0 already done, 0 stale, 0 missing`, 10 tags revalidated. Re-run confirms `0 pending, 9 already done`. Rollback record: `en-sync-prod-plan.txt`
- [x] 6.5 Verified live against the deployed site, scrolling first so lazy images load: `skrzat` EN 7 creatives -> 1 (`skrzat-gallery-1.jpg`, same as PL); `getaway` EN 3 -> 0 (same as PL); `riviera` EN now carries PL's exact 7-file set, with `riviera-gallery-1.jpg` gone and `riviera-gallery-9.jpg` in its place

## 7. Verify and close

- [x] 7.1 `bun run check` (lint, types, tests) green — biome 0 errors / 47 pre-existing warnings, tsc clean, 691 tests pass, manifest up to date
- [x] 7.2 Screenshot all ten walls at 1440 and 800 in Chromium and WebKit; landscape iRobot tile, single Skrzat tile and the health wall all read correctly. One fix came out of it: the prod alt for `irobot-edukacja-2-cut.webp` says "MAX 705" but the creative itself says "MAX 775", so the repo's original wording was restored and prod's alt is left flagged as a separate defect
- [x] 7.3 Publish the screenshot sheet as an Artifact for sign-off — "Branże Wall Proof Sheet", https://claude.ai/code/artifact/d7e7445f-e020-4b26-b7f1-11474d45d736
- [ ] 7.4 After merge + deploy: `vercel cache purge --project sociallama-v2 --type cdn -y`; open a bumped tile in a real browser and confirm the new bytes
