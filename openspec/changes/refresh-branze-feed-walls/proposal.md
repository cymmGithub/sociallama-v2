## Why

The "TAK TO WYGLĄDA W FEEDZIE" walls on `/branze/*` are hardcoded `public/case-studies/` paths, and the case-study imagery they mirror was edited on prod PL in August 2026 (pillar refresh, cover refresh, corner re-cut). Audit on 2026-08-23 (artifact "Branże Feed Re-point"): 5 of 9 walls show creatives the linked study has since detached (TikTok creators, an employee at her desk, an employee's name on an events list, phone mockups), 8 `-cut.webp` tiles are stale byte copies of files prod re-cut in place, and the EN wall already differs from PL on one Volvo tile. Separately, the same PL-only edits left prod EN pillar media behind on 9 studies, so `/en/case-studies/*` still shows the images the review removed.

## What Changes

- Re-point the walls in `lib/content/branze.ts` and `branze.en.ts` (PL as source, EN mirrors it) per the approved map:
  - `automotive` (Volvo): drop the two anonymised IG screenshots and the workshop table; add `volvo-gallery-3`, `volvo-gallery-1`, `volvo-gallery-4`.
  - `elektronika-i-agd` (iRobot): drop the two TikTok-creator tiles; carry **all four** prod creatives, including the landscape `irobot-innowacja-1.png`.
  - `beauty` (Kontigo): `kontigo-gallery-4` → `kontigo-gallery-7`.
  - `hotele-i-miejsca-wypoczynkowe` (Dolina Charlotty): drop the two phone mockups; add `dolina-charlotty-gallery-6`; wall is 4 tiles.
  - `nieruchomosci-i-deweloperzy` (ED Invest): drop `ed-invest-gallery-2-cut`; wall is 4 tiles.
  - `rozrywka` (Skrzat): one tile, `skrzat-gallery-1`, rendered larger.
  - `alkohole`: wall mixes Faktoria Win and Mazurska Manufaktura Alkoholi creatives (the page copy is not Faktoria-specific).
  - `petcare`, `horeca`: selection unchanged (horeca refreshes one tile's bytes).
  - `finanse`, `fashion`: untouched, no wall.
- Add a creatives wall to `/branze/health`, an editorial page, drawn from its five related studies (imid-cmv, mercator, power-elements, fundacja-saventic, mmhygienic). Needs an industry-level `creatives` field the editorial layout renders without a case card or numbers.
- A single-tile wall renders that tile wider than the five-up size.
- Copy the re-cut bytes from prod into `public/` for every stale tile still on a wall, with a URL bump so the image optimizer does not keep serving the old corner.
- `lib/payload/sync-en-pillar-media.ts`: make prod EN `approach[].media` equal PL's for the 9 diverged studies (ariadna, dolina-charlotty, dynamic-development, entelo, getaway, personal-effect, riviera, skibooking, skrzat). EN keeps its own text and tags; only media ids move. Dry-run by default, `--apply`, `--prod`; revalidates after writing. Getaway ends with zero creatives in both locales, which is what PL already shows.
- A test that every wall `src` exists under `public/` and has the declared dimensions, so the next imagery repair cannot drift silently.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `branze-pages`: a wall SHALL carry only creatives its source study currently shows; an editorial industry MAY carry a standalone creatives wall; a proof wall MAY mix related studies when the page copy is not study-specific; a single-tile wall renders larger; wall tiles are byte-identical to the study's file.
- `case-studies`: EN pillar media SHALL mirror PL pillar media; a locale-only edit is a defect with a scripted repair.

## Impact

- `lib/content/branze.ts`, `lib/content/branze.en.ts`: wall data, new optional `creatives` on `Industry`.
- `app/(frontend)/branze/[slug]/industry-page.tsx`, `industry.module.css`: editorial layout renders the wall when present; `:only-child` tile size.
- `public/case-studies/{irobot,julius-meinl,dolina-charlotty,ed-invest}/`: 6 byte replacements.
- `lib/payload/sync-en-pillar-media.ts` (new), built on `media-ops` `begin`/`finish`; a prod write, gated on explicit per-run approval.
- `lib/content/branze.test.ts` (new or extended): wall asset assertions.
- No schema or migration changes. No DB writes outside the EN sync.
