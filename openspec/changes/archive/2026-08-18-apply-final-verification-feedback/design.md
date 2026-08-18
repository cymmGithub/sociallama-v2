# Design — apply-final-verification-feedback

## Context

Anna's audit (Asana 1217405077214092, 2026-08-16) + Emilia's dispositions (2026-08-17) + Przemek's decisions (2026-08-18) resolve every open thread. Constraints that shape the design:

- Case-study content is **DB-only** (PL drafts gitignored); every content edit goes through a Payload script with no git rollback. The `case-studies` spec mandates: per-image plan approved before writes, report-first idempotent script, detach-not-delete, dev DB verified before prod, prod writes with `BLOB_READ_WRITE_TOKEN` set.
- `approach` is a whole-array **localized** field: `pl` and `en` hold separate `media` arrays. Match by media **id**, never index (see `apply-case-study-imagery.ts` header).
- Stock on proof surfaces was forbidden; this change relaxes it (Przemek approved 2026-08-18, source: Pexels) to **per-image-approved, mark-free, provenance-recorded** stock where the client's own material cannot fill a slot. Client-own material still wins whenever it exists.
- Belt logos are generated (`scripts/client-logos/pipeline.py`, fixed 280×88 canvas, optical-mass normalized); never hand-place a PNG into `public/assets/clients/`.
- Video re-encodes must carry `smpte170m` color tags or browsers hue-shift them.

**Staged inputs** (`/mem/final-weryfikacja/`): `logos/` (Dom volvo.png, irobot.png, ENGIE `Logo 800x800px (1) (1).png`), `asana/` (13 renamed attachments), `drive/` (IMID×7, Pracuj×5, POLO×1), `video/` (`volvo-konkurs-podsumowanie.mp4`, `julius-eventy.mov`).

## Goals / Non-Goals

**Goals:** clear every launch-blocking wizerunek/legal item; truthful logos; frameless creatives; clean screenshots; sharp covers.
**Non-Goals:** Brześć + Rabkoland content (awaiting Anna), further ASUS material from Emilia (follow-up batch through the same flow), any redesign of the case-study layout beyond removing frames.

## Decisions

1. **Frameless = CSS removal, not a flag.** Strip border/background/plate from `.shot`; keep `.shotPortrait` flex sizing and stagger (that's layout, not chrome). No per-study opt-in — Emilia's instruction is global. Alternative (a `frameless` field on the collection) rejected: nobody would ever set it back.
2. **Logo swaps go through the pipeline.** New raws → `assets-src/client-logos/raw/` → edit the three `BRANDS` rows → re-run `pipeline.py` → verify against the belt background (existing requirement). `lib/content/clients.ts` volvo entry: `name` → `'Dom Volvo'` (alt/hover must match the mark). Case-study-side logos (`public/case-studies/<slug>/<slug>-logo*.png`) regenerate too, then `refresh-case-study-logos.ts` updates the media docs in place (update, never delete+recreate).
3. **Screenshot anonymization is an image-editing pass, not CSS.** Blur avatars + replace names (plausible Polish pseudonyms, consistent within a thread) + crop clocks in an editor/script; upload the edited file as a new media doc and swap by id. Applies to: Vistula & POLOmarket moderation threads, Pracuj filter-use screenshot (clock), ENGIE & FM screens (clocks/avatars), Volvo screens with Olga's icon **where the icon is peripheral — crop/blur; where she is the subject, remove**.
4. **`kreacje-pracuj.mp4`:** trim/crop so Paulina's shot is gone and the clip ends on the Pracuj.pl logo (Emilia's "przyciąć Paulinę i dać samo logo"). ffmpeg, `-color_primaries/-color_trc/-colorspace smpte170m`; regenerate poster from the new final frame if the old poster frame was cut.
5. **iRobot pillar removal is seed *plus* script.** Delete the `#DLAKAŻDEGO` pillar from `seed-case-studies.ts` (PL `approach` and the EN `pillars` block) so a fresh seed never recreates it. That edit alone does not reach the database: the seed is **skip-if-exists** — for an existing slug it logs `= case study exists` and writes nothing — and its `--reset <slug>` escape deletes the study plus every `<slug>-*` media row and is explicitly forbidden with `--prod`. The live removal therefore rides in this change's imagery apply script as a pillar-removal op: report-first, idempotent, written per locale, and identical on dev and prod. (Superseded the original "re-run the seed" plan at implementation; the seed edit still earns its place as the guard against reintroduction.)
6. **Videos as creatives:** convert `julius-eventy.mov` (80 MB QuickTime) to a web mp4 (H.264, smpte170m, sane bitrate) before upload; `volvo-konkurs-podsumowanie.mp4` re-encode likewise if needed. Follow the existing `video-playback` component conventions on the proof surface — if approach media only accepts images, place the videos via the same mechanism Riviera-class studies use or extend minimally; do not build a new player.
7. **Pexels sourcing without an API key** (FM slots): search HTML with a browser UA yields direct CDN URLs — `api.pexels.com` 401s and plain curl 403s (established recipe). Screen candidates on in-frame contrast against the study's rendered context, no visible third-party marks; record the Pexels page URL per image in the PLAN.
8. **Pixelated covers:** re-export from the best available source at the hero's rendered size (see "A cover is composed for the crops it renders in"); where the deck is the only source, upscale is a last resort and must be visually verified.

## Per-study plan (the approved per-image list skeleton)

Verdicts from Anna (A), Emilia (E), Przemek (P). The apply script's PLAN must enumerate every image of each study with a verdict; rows below are the approved deltas — everything not listed is `keep`.

| Study (slug) | Actions |
|---|---|
| `skrzat` | Remove film-set photos with children (A). Actors elsewhere cleared (P: "już wiem że możemy"). |
| `vistula` | Re-export pixelated cover (A). Moderation screens: anonymize (P) instead of removing. |
| `volvo` | Remove/crop screens showing Olga's icon (A). Remove piknik-modelarski kids photo; add `volvo-konkurs-podsumowanie.mp4` as the konkurs creative (E). Logo → Dom Volvo everywhere. |
| `engie` | Crop clock times / Kornelia's icon from screens (A/E). Logo → new mark (`asana/engie-logo-800.png`). |
| `fm-logistics` | Remove FM employee photos (A). Slot in `asana/fm-operator-pierwszego-wyboru.png` + `asana/fm-second.png`; swap second cross-docking graphic → `asana/fm-crossdock-swap.png` (E). The "pan" graphic + employer-advocacy graphic → **Pexels business photos** (E's suggestion, P approved): mark-free, provenance recorded in the PLAN, honest alt. Crop clocks. |
| `belvedere` | Re-export pixelated cover (photo is from client's gallery — cleared, A). Remove chef photo (A). Further content: Anna owns, follow-up. |
| `irobot` | Delete `#DLAKAŻDEGO` pillar (seed). Crop Spotify bar from laptop shot (E). Swap edukacja-i-technologia photos → `asana/irobot-edu-tech-{1,2}.png`. Pick one of `asana/irobot-yt-{1,2,3}.png` for the horizontal slot (choose sharpest at rendered size). Cover stays (profile shot, no recognizable face). Logo → new wordmark. |
| `julius-meinl` | Main banner → `asana/julius-main-banner.png`. Eventy: `asana/julius-eventy-{1,2}.png` + `video/julius-eventy.mov` (converted). Lifestyle → `asana/julius-lifestyle.png`. Remove remaining wizerunek photos (A). |
| `riviera` | Re-export cover. Remove "pan" graphic at the wzruszające-wideo section; crop the big-egg graphic to hide the player bar + former employee (E). |
| `jw-construction` | Swap main photo; remove ekspercki-content graphic; identyfikacja wizualna: keep left enlarged, drop right (E). |
| `polomarket` | Moderation screens: anonymize (P). Zwiększanie-zaangażowania graphic → `drive/POLO/Zrzut…16.00.05.png`. |
| `pracuj-pl` | Autorski filtr: remove the girl on the right; crop clock from filter-use screenshot. EDU/FUNNY creatives → `drive/Pracuj/*` (5 files). |
| `asus` | Crop the copywriter graphic to bare creatives (drop post texts); remove remaining wizerunek graphics; re-export cover. Emilia may deliver video/ss later — leave sections shorter now (spec: shorter beats substitute). |
| `imid-cmv` | Swap creatives → `drive/IMID/*` (7 files, some extensionless — probe type and rename on upload). |
| _all studies_ | Re-export any cover with visible pixelation (standing instruction from Emilia). |

## Risks / Trade-offs

- [Ambiguous image references — comments name sections, not media ids] → the apply session dumps each study's media (`dump-case-study-imagery.ts`), matches rows visually, and records id-level verdicts in the PLAN before writing; anything unmatchable is flagged back to Przemek, not guessed.
- [Anonymization quality — a bad blur reads worse than removal] → verify each edited screenshot at rendered size on the dev site; fall back to removal per the delta spec.
- [Prod media without Blob token creates 404 rows] → `BLOB_READ_WRITE_TOKEN` is part of the prod-run checklist; re-run until the script reports zero.
- [Logo regeneration shifts optical normalization for all brands] → pipeline is deterministic per brand; diff only the three target outputs, verify belt screenshot per the client-logo-assets spec.
- [`julius-eventy.mov` is 80 MB] → must be transcoded/downscaled before upload; never upload the raw .mov.
- [Frameless CSS may orphan rules] → remove only chrome properties; run the visual check on a media-heavy study (irobot) and on riviera for parity.
- [Belt-logo mass normalisation is roster-relative] → the Dom Volvo lockup carries far less ink at contain-fit than the bare VOLVO wordmark, which moves the card pass's median and rescales every unclamped card logo by ~4%. Accepted at implementation (2026-08-18): the drift is the normaliser working as designed, so all 25 regenerated card logos ship and all 25 media rows refresh. The lockup also needed a new pipeline option, `lead`, which keeps every line and collapses the artwork's interior blank bands instead of dropping one.
- [A plan keyed on media ids breaks on the second database] → ids are per-database (`fm-logistics-gallery-4.jpg` is 155 on dev and 493 on prod), so the PLAN names targets by **filename** and resolves the id per run, exactly as `apply-case-study-imagery.ts` does. Matching *within* a locale's array is still by id, never index.

## Migration Plan

Dev DB first: run the imagery apply in report mode → review → apply → browser-verify PL+EN → then prod with token, re-run to zero. Code changes (CSS, logos, seed, video) ship in the same branch; the prod DB pass happens after the deploy that carries the frameless CSS so anonymized screenshots aren't shown framed. Rollback: code via git revert; DB via the PLAN file (it records every detach/replace pair).

## Open Questions

- Which of the three iRobot YT candidates goes in (pick at implementation, sharpest wins).
- Whether approach media accepts video uploads as-is or needs a minimal extension (check `media` collection mime handling before converting Julius/Volvo videos).
