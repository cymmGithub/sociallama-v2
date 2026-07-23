## Context

`/o-nas` is built section-by-section, each reading typed data from `lib/content/o-nas.ts` (repo rule: components never hardcode strings). `o-nas.en.ts` is a shape-locked twin (`satisfies LocalizedONas`) — TypeScript CI fails if the PL/EN shapes diverge. Two sections are still placeholder: the team slider (3 lorem members) and the projects grid (3 stubs). The real inputs now exist: an 11-person bio doc, 8 raw photos, and 3 live case studies in Payload.

The homepage `why-that-works` `TEAM` array (11 members, "leadership first") is the ordering source of truth. The 8 new photos map 1:1 to the 8 roster members who are not yet in the slider; the 3 current members already have transparent cutouts. 3 + 8 = 11 = the full roster.

## Goals / Non-Goals

**Goals:**
- Team slider shows all 11 members, homepage order, real bios, transparent crop-matched cutouts.
- Projects grid shows iRobot / Pracuj.pl / Volvo with real images, linked to their detail pages.
- PL and EN both ship, shapes identical.
- Biome + TypeScript CI green.

**Non-Goals:**
- No redesign of the slider or projects components beyond what "real image + link" requires.
- No change to the homepage grid, the case-study detail pages, or Payload seed data.
- No CMS-ification of the projects list — it stays static content (the three studies are curated, not queried).

## Decisions

**D1 — Projects stay static content, not a Payload query.** The three featured studies are a curated editorial choice, and the section renders identically for both locales from `oNasProjects`. Querying Payload would add a DB dependency, a `use cache` boundary, and an ordering problem for three hand-picked items. Alternative (query the `case-studies` collection) rejected: more moving parts for zero benefit at three fixed items. Consequence: the worktree DB only needs to boot Payload, not hold case-study rows.

**D2 — `oNasProjects.items` gains `image` + `href`; `Projects` component becomes a link.** Today the component ignores `item.image` and always draws the `ImageIcon` placeholder. Adding real images + navigation means: content gains `image` (path under `/public/case-studies/<slug>/`) and `href`; the component renders `next/image` in the media slot and wraps each card body in a link. Both PL and EN shapes change together (D2 of the existing i18n design). Alternative (link the whole `<li>` vs a nested `<a>`) — use a nested anchor over the caption/media so the reveal animation and list semantics are preserved.

**D3 — Cutout pipeline: bria-rmbg + decontam, then crop-match to the existing 3.** Per the project's matte-pipeline experience, `bria-rmbg` + a decontamination pass removes the halo that `u2net`/`isnet` leave. Raws are wildly heterogeneous (Canon 6000×4000, a 1080² square, one already-RGBA), so background removal is necessary but not sufficient — each cutout is then cropped/scaled to match the head+torso framing and orientation of the 3 existing slider PNGs, and exported as an optimized transparent PNG (~300 KB). Verification is visual, not programmatic: all 11 viewed together in the slider on `:3001`.

**D4 — Role labels reconcile to the site.** The bio doc says "Head of Social Lama" and "Content Creator"; the site says "Head of Social Media" and "Wideo Content Creator". The site wins — it's the already-shipped, deliberate wording. Bios themselves come verbatim from the doc (lightly trimmed to slider length if needed).

**D5 — EN bios are translated in this pass.** Per the user decision, both locales ship together. Translation follows the established EN locale voice (playful-but-clean, American spelling). This keeps content parity, not just shape parity.

**D6 — Worktree `sl-onas-polish` on `:3001`, Docker Postgres `:5434`.** Standard parallel-dev setup (bun install, PORT env, no symlinked node_modules). Port 3001 is confirmed free.

## Risks / Trade-offs

- **[Cutout inconsistency — the main risk]** 11 portraits from different cameras/crops can read as a ransom note in one slider. → Mitigate by matching every new cutout to the existing 3's framing and scale, and reviewing all 11 side-by-side on `:3001` before calling it done; re-crop outliers.
- **[Already-RGBA / square source (kornelia, katarzyna)]** may already have alpha or a tight square that fights the head+torso crop. → Treat per-photo, don't assume the pipeline is uniform.
- **[Bio length overflow]** Bios vary from 2 lines to a full paragraph; the slider caption area has a fixed treatment. → Trim long bios to a consistent length; verify no clipping/overflow on desktop and mobile.
- **[PL/EN shape drift]** Adding `image`/`href` to one locale and not the other breaks CI. → Edit both `oNasProjects` shapes in the same commit; let `satisfies LocalizedONas` catch mismatches.
- **[Project year unknown]** The bio doc / seed may not carry a project year; placeholder says 2025. → Confirm the year per study with the user during apply, or omit the year treatment if unavailable.
- **[Hero-image choice]** Each study has many slides; the "hero" per card is an editorial pick. → Propose one per study during apply for quick sign-off (screenshot-sampling verification).

## Open Questions

- **Project year** per card (iRobot / Pracuj.pl / Volvo) — real values or keep 2025?
- **Hero image** per card — which slide from each `/public/case-studies/<slug>/` set?
- Are the source raws' resolutions high enough for the slider's largest render size after crop? (Verify during cutout, re-request only if a portrait is too small.)
