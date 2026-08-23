## Context

- Nine industries carry a `caseStudy.creatives` wall; the component renders each tile at its intrinsic aspect, 14rem wide on desktop, five-up. Health, finanse, fashion are editorial (no `caseStudy`), and `EditorialLayout` has no wall slot.
- Wall tiles point at `public/case-studies/<study>/<file>`. The study itself serves the same filenames from Payload media (`/api/media/file/<file>`), so a tile is "in sync" only when the name is on the study's current PL `approach[].media` **and** the bytes match. The 2026-08-23 audit (`dump-case-study-imagery.ts --prod` + md5 against `public/`) found 11 detached tiles and 8 stale-byte tiles.
- `approach` is a localized whole array. The August admin edits were PL-only, so prod EN on 9 studies still references the rows PL dropped. `media-ops.repointPillarMedia` writes both locales but asserts equal `from` sets, which these studies no longer have; it cannot be reused as-is.
- The artifact "Branże Feed Re-point" (same session) holds the approved tile choices; this design records them.

## Goals / Non-Goals

**Goals:**
- Every wall shows only what its study shows today, with identical bytes, in both locales.
- Health gets a wall from its related studies without becoming a proof page.
- Prod EN pillar media equals prod PL on the 9 diverged studies.
- A test pins wall assets to disk so the next repair cannot drift unnoticed.

**Non-Goals:**
- Adding creatives to Skrzat or Rabkoland (the rozrywka wall stays one tile).
- Re-cutting or re-radiusing any image.
- Touching covers, gallery fields, numbers, quotes or case cards.
- Finanse and fashion.

## Decisions

**D1. Industry-level `creatives`, rendered by both layouts.** Add optional `creatives: readonly IndustryCreative[]` to `Industry`. Lift the wall JSX out of `ProofLayout` into a `CreativesWall` component; `ProofLayout` passes `study.creatives`, `EditorialLayout` passes `industry.creatives` and renders it after the brief, before the marquee. Alternative rejected: give health a `caseStudy` block. The page would then need a card, numbers and a featured study, and the spec's "variant is selected by proof data" rule would flip it to proof with invented numbers.

**D2. Mixed walls need no schema.** Alkohole and health tiles simply point at other studies' files; alt text names the brand in the creative. The proof wall's heading and "100% realne kreacje" badge stay true. The case card under alkohole stays Faktoria; the wall no longer claims to be one client's feed, which the page copy never did.

**D3. iRobot keeps its landscape tile.** `irobot-innowacja-1.png` (2056×1164) breaks the 14rem phone rhythm. Rather than exclude it, render it at `flex-basis` twice the tile width plus the gap (`calc(28rem + var(--gap))`) on desktop, full width on mobile, via a `data-landscape` attribute set when `width > height`. The user asked for all four.

**D4. Single-tile wall.** `.wallItem:only-child` gets `flex-basis: 22rem` on desktop and no stagger offset. No new prop; the data already says it.

**D5. Stale bytes: copy, bump, never re-encode.** Download the prod file for each stale tile with `curl` (the md5s are the acceptance check), overwrite `public/` in place, and append `?v=2` to the `src` in both content files. The optimizer caches by URL for 30 days and CDN purge cannot reach it ([[public-image-replace-needs-url-bump]]). `images.localPatterns` already allows `/case-studies/**` with a search param; verify before relying on it.

**D6. EN sync script, not `repointPillarMedia`.** New `lib/payload/sync-en-pillar-media.ts` on `media-ops.begin/finish`. For each slug: load PL and EN drafts with `depth: 0`, `fallbackLocale: false`; abort the study if pillar counts differ or any PL pillar tag's EN counterpart is missing (tags are the guard that the arrays line up); otherwise set `en.approach[i].media = pl.approach[i].media` (ids) for every `i`, keeping EN heading, body and tag. Write once per study with `locale: 'en'`, draft-aware the same way `repointPillarMedia` is. Idempotent: equal arrays report `already-done`. Dry-run prints per pillar `from → to` by filename. `--prod` goes through `targetProdEnv()`; `finish` revalidates the case-study tags.

**D7. The wall test reads the content modules.** `lib/content/branze.test.ts`: for every industry in both locales, every `creatives[].src` (minus `?v=`) exists under `public/`, and `width`/`height` equal the file's pixel size (read via `sharp`, already a dependency). PL and EN walls reference the same files in the same order.

## Risks / Trade-offs

- [Prod EN draft vs published state] Skrzat's PL edit may sit in a draft while `_status` is published; writing EN from PL's draft could publish unreviewed PL text. → The script copies only `media` ids, never text, and reads PL with `draft: true` like every other ops script. It logs which version it read.
- [Pillar counts differ between locales] A PL pillar added or deleted in the admin breaks index alignment. → Hard abort per study with the tag diff printed; fix in the admin, re-run.
- [Landscape tile on the wall] The wall was designed for phone shapes; a 2:1 tile may look like a banner. → Ship it as asked, screenshot at 1440 and 800, and say so if it fights the section.
- [`?v=2` on `localPatterns`] If the allow-list rejects a query string, the optimizer 400s every bumped tile. → Check `next.config` before the bump; fall back to `-2` filename suffix if needed.
- [Strip re-run drift] The audit is a snapshot; another admin edit before merge re-diverges it. → Re-run the dump in the worktree before the final commit and diff against the map.

## Migration Plan

1. Content + component + CSS + test in the worktree; `bun run check`; screenshots of all 10 walls at 1440/800, WebKit too ([[safari-is-not-optional-verification]]).
2. `sync-en-pillar-media.ts` dry-run on dev, then `--apply` on dev, then dry-run `--prod`; show the plan; **explicit per-run OK** before `--apply --prod`. Re-run until zero pending. Verify `/en/case-studies/skrzat` live.
3. Merge, push (deploy), `vercel cache purge --type cdn`; verify a bumped tile in a real browser.

Rollback: content and bytes are git-revertable. The EN sync's dry-run output is the rollback instruction (old ids per pillar); keep it in the PR.

## Open Questions

- Health tile set (5 from ~30, proposed: `imid-cmv-edu-1`, `mercator-gallery-12`, `power-elements-gallery-12`, `fundacja-saventic-gallery-3`, `mercator-gallery-16`) and alkohole set (proposed: `faktoria-win-6`, `faktoria-win-2`, `mazurska-6`, `faktoria-win-3`, `mazurska-4`) are picks, not approvals yet; confirm on the artifact before task 1.
- "For /branze/automotive import all irobot images" was read as elektronika-i-agd (the iRobot page). Automotive follows the Volvo map.
