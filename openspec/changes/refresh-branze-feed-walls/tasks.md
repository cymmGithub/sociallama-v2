## 1. Confirm the snapshot

- [ ] 1.1 Re-run `bun ./lib/payload/dump-case-study-imagery.ts --prod --json <scratch>/prod-imagery.json` and diff the PL pillar sets for the 10 walls' studies against the approved map (artifact "Branże Feed Re-point"); stop and report if any study changed since 2026-08-23
- [ ] 1.2 Get the health and alkohole tile sets confirmed on the artifact (design.md Open Questions); record the final filenames in design.md

## 2. Wall component and sizing

- [ ] 2.1 Add optional `creatives: readonly IndustryCreative[]` to `Industry` in `lib/content/branze.ts`; mirror the type in `branze.en.ts`
- [ ] 2.2 Lift the wall JSX from `ProofLayout` into a `CreativesWall` component taking `creatives` + `chrome`; `ProofLayout` passes `study.creatives`, `EditorialLayout` renders it after `IndustryBrief` when `industry.creatives` is non-empty
- [ ] 2.3 Set `data-landscape` on a tile when `width > height`; CSS: desktop `flex-basis: calc(28rem + var(--gap))`, mobile full width
- [ ] 2.4 CSS: `.wallItem:only-child` desktop `flex-basis: 22rem`, no stagger margin
- [ ] 2.5 Verify: `/branze/finanse` renders no wall section; `/branze/health` placeholder-free before content lands

## 3. Stale bytes

- [ ] 3.1 For each stale tile still on a wall (`irobot-edukacja-2-cut.webp`, `julius-meinl-gallery-3-cut.webp`, `dolina-charlotty-gallery-3-cut.webp`, `dolina-charlotty-gallery-4-cut.webp`, `ed-invest-gallery-1-cut.webp`, `ed-invest-gallery-4-cut.webp`) download the prod file from `/api/media/file/<name>` (pace ≥1 s apart), overwrite `public/case-studies/<study>/<name>`, confirm md5 equals prod
- [ ] 3.2 Append `?v=2` to those six `src` values in both content files; `rm -rf .next/dev/cache/images` locally

## 4. Re-point the walls (PL first, EN mirrors)

- [ ] 4.1 automotive: `volvo-gallery-3`, `volvo-gallery-1`, `volvo-event-ex30`, `volvo-event-noc`, `volvo-gallery-4`; real dimensions; alts from the study's PL/EN alt text
- [ ] 4.2 elektronika-i-agd: `irobot-humor-parrot`, `irobot-edukacja-1`, `irobot-edukacja-2-cut?v=2`, `irobot-innowacja-1` (landscape); drop the code comment that excluded landscape frames
- [ ] 4.3 beauty: replace `kontigo-gallery-4` with `kontigo-gallery-7`
- [ ] 4.4 health: industry-level `creatives` with the confirmed five tiles from imid-cmv / mercator / power-elements / fundacja-saventic; brand-naming alts
- [ ] 4.5 alkohole: confirmed mixed set (Faktoria Win + Mazurska Manufaktura Alkoholi); brand-naming alts
- [ ] 4.6 horeca: keep selection, bump `julius-meinl-gallery-3-cut` only
- [ ] 4.7 hotele-i-miejsca-wypoczynkowe: `dolina-charlotty-gallery-6`, `-3-cut?v=2`, `-4-cut?v=2`, `-5-cut` (check md5; bump if stale)
- [ ] 4.8 nieruchomosci-i-deweloperzy: `ed-invest-gallery-1-cut?v=2`, `-3-cut` (check md5; bump if stale), `-4-cut?v=2`, `-5`
- [ ] 4.9 rozrywka: single tile `skrzat-gallery-1`
- [ ] 4.10 petcare untouched; `branze.en.ts` walls made identical to PL file-for-file (fixes the Volvo fifth-tile drift); EN alts translated
- [ ] 4.11 Delete from `public/case-studies/` any file no wall or study references anymore only if `audit-case-study-orphans.ts` confirms it is unreferenced; otherwise leave it

## 5. Wall asset test

- [ ] 5.1 `lib/content/branze.test.ts`: for PL and EN, every `creatives[].src` (strip `?v=`) exists under `public/`, `sharp` metadata width/height equal the declared values, and PL/EN lists match file-for-file in order
- [ ] 5.2 Run `bun test lib/content`; make it pass

## 6. EN pillar sync script

- [ ] 6.1 Write `lib/payload/sync-en-pillar-media.ts` per design D6 on `media-ops.begin/finish`: slugs list (ariadna, dolina-charlotty, dynamic-development, entelo, getaway, personal-effect, riviera, skibooking, skrzat), dry-run default, `--apply`, `--prod` via `targetProdEnv()`, per-pillar `from → to` by filename, guards on pillar count and tags, idempotent
- [ ] 6.2 Dry-run on dev; `--apply` on dev; re-run reports zero pending
- [ ] 6.3 Dry-run `--prod`; paste the plan in the session; **wait for explicit per-run approval**
- [ ] 6.4 `--apply --prod`; re-run until zero pending; save the dry-run output into the change folder as the rollback record
- [ ] 6.5 Verify live `/en/case-studies/skrzat`, `/en/case-studies/getaway`, `/en/case-studies/riviera` show the PL creative sets (scroll before counting lazy images)

## 7. Verify and close

- [ ] 7.1 `bun run check` (lint, types, tests) green
- [ ] 7.2 Screenshot all ten walls at 1440 and 800 in Chromium and WebKit; confirm landscape iRobot tile, single Skrzat tile and the health wall read correctly; fix before asking
- [ ] 7.3 Publish the screenshot sheet as an Artifact for sign-off
- [ ] 7.4 After merge + deploy: `vercel cache purge --project sociallama-v2 --type cdn -y`; open a bumped tile in a real browser and confirm the new bytes
