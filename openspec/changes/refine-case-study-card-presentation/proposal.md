## Why

The `/case-studies` grid presents 48 client brands and reads as sloppy. The cause is three stacked defects, only one of which is the colour problem it looks like:

**A — 19 of 48 logo assets carry a baked-in background.** An audit of every PNG under `public/case-studies/*/`:

| class | count | examples |
|---|---|---|
| transparent, clean | 20 | volvo, asus, breville, riviera |
| transparent, ink bleeds to frame edge | 8 | pracuj-pl, irobot, laurastar |
| **no alpha — baked LIGHT box** | **9** | vistula, rabkoland, ariadna, entelo, foodsaver, imid-cmv, kohersen, las-vegans |
| **no alpha — baked DARK box** | **8** | mercator, mazurska, a1-karting, engie, julius-meinl, kbp, polomarket, vobis |
| **alpha but mid-tone plate** | **2** | adamed, luisse |

On the warm-grey card (`--surface-2`) these render as raw white and black slabs. The detail page already concedes this in a comment at `case-study.module.css:56` — *"11 of the imported client logos are dark or coloured brand tiles whose light text can't be keyed out — rounding the tile makes them read as a deliberate lockup rather than an unremoved background."* Rounding the corners of a defect is a band-aid, and the listing card does not even apply it.

This was a **predicted** failure: the archived `2026-07-22-polish-case-study-cards` proposal listed as a verification risk *"the three seeded logos must read on the card surface; a white-knockout logo would vanish. Pixel-check each rendered card before sign-off."* Three logos passed that check; the 45 imported later did not get one. This change adds the gate that was missing.

**B — the sizing model is wrong, and it is the larger contributor.** `.cardLogo` locks `height: 1.5rem; width: auto`. Aspect ratios in this set run **0.69** (las-vegans, a portrait crest) to **7.38** (volvo) — a 10× spread — so optical weight varies roughly 5× across the grid. `components/ui/brand-belt` and the homepage marquee already use a fixed box with `object-fit: contain`; the case-study card is the only logo surface in the repo that does not.

**C — full-colour marks on warm grey** read as confetti rather than a set.

Separately, the covers are 48 unrelated stock-feeling photographs with no shared geometry, grade or furniture. They are authentic — which is the point of a portfolio — but nothing binds them into one body of work.

Both were resolved against interactive mocks built on all 48 real studies (see `design.md` for what the mocks disproved).

## What Changes

### Phase 1 — logo presentation

- **Re-cut every logo to a transparent, monochrome-black PNG.** A new committed pipeline at `assets-src/case-study-logos/monochrome.py` writes `<slug>-logo-mono.png` next to each colour original. The colour original is retained as the source of truth — for several clients it is the only copy the repo holds.
- **Ship the ski-booking logo.** `/mem/logo-ski-booking.svg` (300×60 viewBox, two paths, transparent) is rasterised and blackened. Skibooking is currently the one study with no logo at all and falls back to text. Payload's media collection rejects SVG uploads as `application/xml`, so rasterisation is mandatory, not a preference.
- **Replace height-locking with a fixed box + `object-fit: contain`**, aligning the card with `brand-belt` and the marquee, plus a per-logo optical-area scale factor so a dense wordmark and an airy crest carry comparable visual weight.
- **Card surface goes white; logos render black.** `--surface-2` is derived from the active theme via `color-mix`, so this introduces a proper token rather than a hardcoded `#fff`.
- **The detail page uses the same presentation**, and the `border-radius`/`overflow: hidden` tile-rounding hack at `case-study.module.css:60` is removed — it exists only to disguise baked backgrounds that no longer exist.

### Phase 2 — header treatment

- **Every cover renders on the homepage's grain-gradient stage**, with the real client photograph floating on top as a framed artefact carrying the study's headline metric. The backdrop is the existing stage recipe lifted verbatim from `why-that-works.module.css:74-125`: a 160° `--color-plum-dark → --color-plum 65%` ramp, an orange glow blob off the top-right, and the 700px `feTurbulence` grain tile at `opacity: .38` / `mix-blend-mode: soft-light`.
- **Nothing is generated.** An earlier direction used Higgsfield-generated backdrops; it was dropped after the mock showed the floating artefact covers nearly all of the backdrop, so a generated layer bought drift across 48 images and a per-regeneration credit cost in exchange for a corner gradient. The site's own stage does the same job deterministically and unifies the grid with the homepage.

**Phase 1 is independently shippable** and is the higher-value half. Phase 2 depends on it only because the card body in the new header composition renders the black logo. If the two need to be split into separate changes, split at the phase boundary.

## Capabilities

### Modified Capabilities
- `case-studies`: The listing cards and detail pages SHALL present client brand logos as transparent monochrome marks, optically normalised within a fixed slot, on a light card surface. The listing cards SHALL present each study's cover on the shared brand stage backdrop with the client artefact and headline metric composited on it.

## Non-Goals

- **No schema, collection, migration or query change.** `client.logo` and `cover` are already fetched at `depth: 2`. This is asset work plus presentation.
- **No change to which studies appear, their order, copy, tags, or the excerpt/title treatment.**
- **No colour-on-hover reveal.** The homepage marquee greys logos at rest and reveals brand colour on hover; the cards are not a hover surface and go monochrome unconditionally. Considered and rejected — see `design.md`.
- **No detail-page hero cover treatment.** The Phase 2 composition (rotated artefact, corner metric) is designed for a 16:10 card and does not translate to the detail page's full-measure 16:9 hero. Deferred pending its own decision; the detail hero keeps today's plain cover. **Open question for sign-off.**
- **No re-sourcing of the three logos that cannot be recovered automatically** (see Impact). They ship at current quality with a tracked follow-up.
- **No extraction of the shared stage recipe into a common class.** The repo's house convention is hand-duplication across `services` / `how-it-works` / `why-that-works`, each carrying a "keep in sync by hand" comment. This adds a fourth copy and follows the convention rather than breaking it mid-change. **Flagged for a decision.**

## Impact

- **New code**:
  - `assets-src/client-logos/raw/skibooking.svg` — staged vector source.
  - `public/case-studies/*/<slug>-logo-mono.png` — 48 generated assets.
- **Modified code**:
  - `scripts/client-logos/pipeline.py` — a `--case-studies` pass alongside the
    existing belt pass. Originally scoped as a new standalone script; see
    `design.md` Decision 6 for why it extends the merged pipeline instead.
  - `app/(frontend)/case-studies/case-study-card.tsx` — header composition.
  - `app/(frontend)/case-studies/case-studies.module.css` — logo slot, white card token, stage backdrop.
  - `app/(frontend)/case-studies/[slug]/case-study-article.tsx` + `case-study.module.css` — same logo slot, drop the tile-rounding hack.
  - `lib/payload/refresh-case-study-logos.ts` — prefer `-logo-mono.png` when present.
- **Reused**: the existing `refresh-case-study-logos.ts` upload path, `components/ui/image`, the `brand-belt` sizing pattern, the `why-that-works` stage recipe.
- **No new dependencies at runtime.** The pipeline needs Pillow + numpy locally; it is an asset script, not a build step. SVG rasterisation uses `inkscape`, already present.
- **English routes inherit both changes automatically** — `app/(frontend-en)/en/case-studies/` renders the same `CaseStudyCard` with a different `basePath`.

**Known residual defects** — 45 of 48 logos convert to production quality; three do not, and no keying heuristic recovers them because the information is not in the source file:

| slug | defect | resolution |
|---|---|---|
| `adamed` | residual plate edge — the source has soft alpha *over* a mid-tone plate, so `dematte` returns it untouched as "already transparent" | needs the client's vector |
| ~~`imid-cmv`~~ | ~~ghost of a pink circle below the mark~~ | **fixed** — re-sourced from the gDrive file `BRANDS` already selected for the belt |
| `vobis` | two-tone source: the V renders grey against a black OBIS | needs the client's vector |
| `kbp` | whole mark reads mid-grey: the source is dark green on black, so its ink is genuinely close to its background | needs the client's vector |

**Verification risk**: this change is entirely visual, and its predecessor shipped a visual regression precisely because a spot-check stood in for a full-set check. Sign-off requires all 48 cards inspected, not a sample — see `tasks.md` §4.

**Sequencing**: `case-studies` has one other in-flight change, `add-case-study-en-translations`, which only ADDs a requirement and does not touch `Requirement: Case studies listing`, so the spec deltas do not collide. No Payload schema change, so the shared dev DB is safe for parallel worktrees. `refresh-case-study-logos.ts` must be **run twice** per its own header comment — Payload's `getSafeFileName` bumps a name while `docWithFilenameExists` is true without excluding the document being updated.
