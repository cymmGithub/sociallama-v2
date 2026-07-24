# Design — import-case-study-decks

## Context

The `case-studies` capability is complete (collection + routes + SEO + bilingual rendering). What's missing is *content*. We have 46 raw decks and one gold-standard pattern (the iRobot seed). The job is a repeatable path from deck → published-quality Polish study, proven on a pilot then scaled.

### Verified facts (probed 2026-07-24)
- `/mem/claude-cs`: 46 brand folders, one deck each — **27 PPTX + 19 PDF**. (Several folder names have trailing spaces; handle literally.)
- PDFs carry **extractable text** (not flattened images): Skrzat = 29 pp @ 1440×810, ~1.3k text chars in 3 pp.
- PPTX are ZIP archives: slide text in `ppt/slides/*.xml`, creatives in `ppt/media/*` (Rabkoland = 9 JPG + 10 PNG).
- Tools present: `pdftotext`, `pdfimages`, `pdfinfo`, `unzip`, `libreoffice`/`soffice`. **`python-pptx` is NOT installed** — use `unzip` for PPTX media + `soffice --headless --convert-to pdf` for a text/visual fallback, rather than adding a Python dep.

## Goals / Non-Goals

**Goals:** deterministic extraction to a curated intermediate; author PL studies to the iRobot bar; land them as Payload drafts; a proven recipe to scale from pilot to ~41 remaining.

**Non-Goals:** EN authoring, any schema/route/SEO change, publishing uncleared studies, committing source decks, wiring home cards to slugs.

## Pipeline

```
/mem/claude-cs/<Brand>/deck.(pptx|pdf)
        │  ① EXTRACT (deterministic, re-runnable)
        ▼
content/case-studies/<slug>/
   ├─ raw-text.md          ← slide/page text dump
   ├─ media/*.{jpg,png}    ← every embedded/rendered image
   └─ draft.json           ← ② CURATE: text mapped toward schema fields
        │                      + chosen media refs + alt text  (human/AI edited)
        ▼
   ③ AUTHOR: draft.json filled to iRobot quality (PL prose, real metrics,
             picked+cropped creatives → public/case-studies/<slug>/)
        │
        ▼
   ④ IMPORT: create Payload doc, locale=pl, _status=draft, idempotent by slug
        │
        ▼
   ⑤ PUBLISH (manual, per study) — only after client-permission gate
```

- **① Extract** — PPTX: `unzip` media from `ppt/media/`; pull slide text (parse `ppt/slides/*.xml` `<a:t>` runs, or `soffice`→pdf→`pdftotext`). PDF: `pdftotext` for text, `pdfimages -all` for creatives. Output is disposable staging, never the deliverable.
- **② Curate** — a `draft.json` skeleton shaped like `StudySeed` (slug, clientName, tags, period, excerpt, challenge, pillars[], results[], gallery) so authoring maps 1:1 to the schema. Auto-fill what's confidently extractable; leave prose fields as TODO stubs.
- **③ Author** — the human-in-the-loop step the quality bar demands. Extraction gives raw material; a person/AI writes the `challenge` (intro + ordered objectives), pillar `body` copy, picks the strongest creatives, crops them, writes Polish alt text, and transcribes real metrics. This is where each study earns the iRobot bar.
- **④ Import** — reuse `lib/payload/seed-case-studies.ts` helpers (`richText`, `para`, `orderedList`, media upload) via a sibling that reads `draft.json` and calls `payload.create`/`update`, **PL locale, `_status: 'draft'`, keyed by slug (idempotent — re-run overwrites the draft, never dupes).**
- **⑤ Publish** — manual per study, gated on client permission.

## Key decisions

### D1 — Land in Payload as drafts, not the static TS seed. **(recommended)**
The seed's `StudySeed.en` is mandatory; PL-first can't satisfy it without weakening the type for all studies. Payload localization allows a PL-only document. The collection already ships drafts/versions/admin. So authored studies become **draft docs**, editable in-admin, published individually. The static seed stays as the original-3 bootstrap; we do not grow it to 46. *Alternative rejected:* make seed `en` optional and append 46 entries — bloats one file, loses per-study draft/publish control, fights the EN-parity invariant.

### D2 — Idempotent by slug.
Import upserts on `slug`. Safe to re-run as drafts are refined. Never creates a second doc for the same brand.

### D3 — Pilot = 5 varied decks, chosen to stress the recipe.
Select across the axes that break extraction/mapping, confirmed during a triage pass (task 1). Tentative:
- **PPTX, media-rich** (e.g. Rabkoland — 9 JPG + 10 PNG) — tests creative extraction + pillar assembly.
- **PDF, long** (e.g. Skrzat, 29 pp) — tests PDF text + `pdfimages` path.
- **Marquee brand** (e.g. Asus / Medicover / ENGIE) — the studies most worth getting right first.
- **Metrics-forward** deck — tests `results` tile mapping.
- **Structurally atypical** deck (no clear pillars/metrics) — tests graceful degradation + where the schema strains.
Final five locked after triage; the recipe (commands + mapping notes + gotchas) is written up before scaling.

### D4 — Media conventions follow the existing three.
Creatives → `public/case-studies/<slug>/`, uploaded to the `media` collection; logos rasterized to PNG (SVG rejected — see memory). Alt text authored in Polish.

### D5 — Source decks are not committed.
`/mem/claude-cs` and `content/case-studies/**` staging stay out of git (add ignore rule if needed). Only chosen web-optimized assets under `public/` and the import script/data are tracked.

## Risks

- **Uneven deck quality** → some studies won't reach the bar; those stay draft/unpublished rather than dragging the segment down. Triage flags them early.
- **Permission gate is external** → publishing blocks on SocialLama confirming each client. Draft-by-default makes this safe.
- **Manual authoring is the bottleneck**, not extraction. The pilot calibrates real per-study effort before committing to ~41 more.
- **Shared dev DB**: import writes rows + media but **no schema push**, so no clobber risk; standard shared-DB worktree is fine.

## Migration / Rollout

No DB migration (no schema change). Rollout = per-study publish after clearance. Rollback = unpublish/delete the draft doc; assets removable from `public/`.
