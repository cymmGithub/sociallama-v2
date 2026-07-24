## Why

The `case-studies` collection, its listing/detail routes, SEO surface, and bilingual rendering are already built (shipped in `add-case-studies`) — but only **three** studies exist (iRobot, Pracuj.pl, Volvo). We hold **46 client decks** (`/mem/claude-cs`, 27 PPTX + 19 PDF, one per brand) that can become case studies. Each new study should match the gold-standard the three set: `challenge` as intro + ordered objectives, `approach` as hashtagged content pillars carrying their own creatives, `results` as platform/metric/value tiles. More studies = more indexable, keyword-rich, internally-linked pages (the segment's primary goal is SEO growth) and real destinations for the ZAUFALI NAM hover-card CTAs.

This is a **content-import + authoring effort, not a feature change** — the schema and pages need no work. The weight is in extraction, curation, bilingual authoring, and creative handling.

## What Changes

- **No schema or route changes.** The `case-studies` collection, `/case-studies` listing, and `/case-studies/[slug]` detail pages are reused as-is.
- **Extraction pipeline**: a script set that turns each deck (PPTX/PDF) into a structured, per-brand *curated draft* — text mapped toward schema fields + extracted creative images — under a content staging directory. Deterministic, re-runnable, not published output.
- **Curated authoring**: each staged draft is authored up to the iRobot bar (real prose for `client.about`, `challenge`, pillar `body`; real `results` metrics; picked + cropped creatives with alt text). **Polish only this pass**; EN is deferred to a follow-up.
- **Landing = Payload CMS drafts.** Authored studies are created as **draft** docs (PL locale) via an idempotent import step that reuses the existing seed machinery (`richText`/`para`/`orderedList` helpers, media upload). Payload localization natively allows a PL-only doc, which the static TS seed's mandatory `en` field cannot. Each study is **published manually, per study**, only after the client-permission gate clears.
- **Pilot first (3–5 decks), then scale.** Prove the extraction→schema mapping and lock the quality recipe on a deliberately varied sample before batching the remaining ~41.

## Capabilities

### New Capabilities
<!-- none — no new capability; this adds content to the existing `case-studies` capability -->

### Modified Capabilities
- `case-studies`: the capability gains a documented **content-authoring pipeline** (deck → curated draft → PL draft doc) and the scale requirement of many studies; no behavioural change to routes, schema, or SEO surface.

## Impact

- **Content staging** (git-ignored or scratch): per-brand curated drafts + extracted images derived from `/mem/claude-cs`. Source decks are **not** committed.
- **Assets**: chosen creatives land in `public/case-studies/<slug>/` and the `media` collection (as the three existing studies do). Client logos rasterized to PNG (media collection rejects SVG).
- **Import step**: generalize `lib/payload/seed-case-studies.ts` machinery (or a sibling script) to create studies as PL-only **drafts** from curated drafts, idempotent by slug. No change to the collection definition, so **no migration and no schema push** — shared dev DB is safe (no `--isolated` worktree needed).
- **Locale**: PL authored now; EN parity queued as a separate follow-up change (the `Localized<>` chrome already exists; per-study EN fields stay empty until then).

## Gates & Non-Goals

- **Client-permission gate (blocking publish):** each brand's public metrics/creatives require SocialLama's confirmation the client is cleared for public display. Studies stay **draft** until cleared. This proposal does not assume any of the 46 are cleared.
- **Non-goal:** EN authoring, schema/route/SEO changes, wiring individual ZAUFALI NAM cards to slugs (separate follow-up), and publishing all 46 (only cleared studies publish).
- **Extraction is lossy per deck.** PDFs carry real text and PPTX carry text + embedded media (verified), but decks vary in structure; some may lack metrics or pillars. The pilot exists to surface these before scale.
