# fix-case-study-covers

## Why

An audit of all 48 case-study covers, graded against the pixels the listing actually paints (headless Chromium at 1440×900, DPR 2), confirmed **7 defects**. Four are approved to fix here.

Two distinct causes, both already covered by the existing `case-studies` requirement *"A cover is composed for the crops it renders in"*:

- **Source too small.** `rabkoland` ships a 607×788 file into an 836×398 card box (1.38× stretch) and a 2300×1292 hero (3.79×). `kontigo`'s cover is a proven bicubic upscale of a smaller file — `kontigo-cover-3.jpg` (1200×630) round-trips to `kontigo-cover-2.jpg` (808×425) with 1.6/255 error and has *lower* gradient energy despite more pixels. `bioagris` has no plane of critical focus at all.
- **Square/portrait source handed to `objectFit: cover` unexamined.** `faktoria-win` is a 1200×1200 creative cropped to a 2.09:1 strip; the man is decapitated at the hairline and the "zgrana para" headline is cut away entirely. The spec already forbids this ("A portrait or square source SHALL be recropped for these boxes before it is used").

Audit: https://claude.ai/code/artifact/1b2ff2c3-e8d2-433a-985f-e2647bcde549
Upscaler results and evidence: https://claude.ai/code/artifact/3682e7ff-25e7-448c-ab3a-b0d108059f53

## What Changes

Four covers are replaced with **pre-cropped ~1.9:1 landscape derivatives**, so one composition serves the card (2.10), hero (1.78) and OG (1.90) boxes with no meaningful further crop.

| Slug | Source | Action |
|---|---|---|
| `faktoria-win` | its own existing 1200×1200 creative | recrop only — no new pixels needed |
| `rabkoland` | 607×788 → Higgsfield 4K upscale | recrop + replace |
| `kontigo` | 808×425 → Higgsfield 4K upscale | replace (already 1.905:1) |
| `bioagris` | 648×810 → Higgsfield 4K upscale, logo repaired | recrop + replace |

**No frontend code change.** An earlier draft of this change proposed wiring `focalPosition()` into the case-study components (as `2026-08-12-fix-blog-cover-focal-point` did for the blog). That was rejected for two reasons found while writing this proposal:

1. The spec already mandates recropping square/portrait sources rather than steering the crop engine at them.
2. That blog change established that a focal point **does not re-cut the derived `og` file** — Payload only re-runs the resizer for an upload carrying `uploadEdits`, so a Local API `update` leaves the share image on its old centered crop. `faktoria-win`'s OG would have stayed decapitated. A recropped source fixes all three boxes at once.

Wiring the focal point into case studies remains worth doing as its own change; it is a non-goal here.

## Non-goals

- `power-elements` — the upscaler **fabricated** the product label: the tub reads "Flavour: Blackcurrant/Cranberry" and "30-Day Power Supply"; the output reads "Power Dimoolersoúš Crudsemy" and "20-Dey Porrar Sapply", plus two invented columns of ingredient text. Needs a real asset from the client.
- `entelo` — the cover is a Facebook page screengrab whose bottom ~40% is page chrome. Already disqualified by the spec's "platform furniture disqualifies a screenshot" rule. Needs a real key visual.
- `produkty-cukiernicze-brzesc` — photo is sharp; the crop slices the Brześć wordmark. Deferred.
- Wiring `focalPosition()` into case studies.
- Third-party people in case-study **galleries** (unblurred child in `rabkoland-gallery-7.jpg`, ambassadors' full names in `kontigo-gallery-7.jpg`). Logged at the user's request; explicitly not acted on here.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `case-studies`: adds a requirement that a cover derived from a generative upscaler has its in-image text verified against the source before use, because such models rewrite small lettering into plausible nonsense rather than sharpening it.

## Impact

- **Database content only, no git rollback.** Four `media` rows added and four `case_studies.cover` relations repointed. `cover` is not localized, so one write serves PL and EN.
- Governed by the existing *"Imagery changes to published studies are reviewed before they are written"* requirement: per-image list approved first (done — see the artifacts above), script idempotent and report-by-default, dev database before production.
- Uploading media to a deployed database needs `BLOB_READ_WRITE_TOKEN_PROD` mapped onto the plugin's name for that one process only. Never assign it in a `.env` file.
- Provenance: three of the four covers are AI-upscaled, and `bioagris` additionally had its logo lockup composited back in from `public/case-studies/bioagris/bioagris-logo.png` because the model garbled the tagline ("Skuteczność z natury" → "Stuiea.mcês a.noluty"). `kontigo`'s face is subtly redrawn by the model — reviewed and accepted by the user; it is stock, not a named person.
