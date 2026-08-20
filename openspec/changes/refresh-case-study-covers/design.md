# Design — refresh-case-study-covers

## Context

Second imagery pass after `apply-final-verification-feedback` (archived 2026-08-18), which established everything this change reuses: `cover` ops in `lib/payload/apply-final-verification-imagery.ts` (unlocalized relation, filename-keyed, report-first, idempotent, dev → prod), `pexels-provenance.md` as the licence record, and the publisher's approval of mark-free Pexels stock where client material does not exist. Constraints that still bind:

- Case-study content is DB-only; the per-image plan is the rollback instruction. Media ids differ per database — key on filename.
- `cover` is NOT localized (one write serves PL+EN); `media.alt` IS localized (write both).
- A cover renders through three crops (card 2.10, hero 1.78, OG 1.90) — compose at ~1.9:1 with the subject in the common area (spec "A cover is composed for the crops it renders in").
- Card logos are emitted by `pipeline.py --case-studies` on a fixed 280×72 canvas; the CSS slot must keep that ratio. The card pass normalises optical mass with `correction = min(1.0, …)` — clamped at contain-fit, no per-brand override.
- `seed-case-studies.ts --reset` deletes a study + prefix-matched media but **refuses `--prod`** by design.
- `/branze/health` is one of the 12 canonical industries; its proof layout exists only because its content entry carries `numbers` + `caseStudy` taken verbatim from Adamed. The entry already has `collage`/`marquee`/`manifesto` content (`/branze/health/health-*.jpg`).
- Blocked inputs: dolina-charlotty, power-elements, ed-invest (Emilka/Ania to deliver).

Inputs on disk: `/home/cymm/Downloads/laurastar-iggi-16x9.png`, `/home/cymm/Downloads/mercator-nitrylex-16x9.png` (both 2752×1536, ~6 MB PNG). `PEXELS_API_KEY` will be handed over at apply time.

## Goals / Non-Goals

**Goals:** every listed cover replaced with an approved, crop-safe, mark-free image; pracuj mark at parity with its neighbours; subhead never splits the brand name; Adamed gone from every surface on dev and prod.
**Non-Goals:** redesigning the listing card or hero; touching approach/gallery creatives; the three deferred studies; any new Payload field or collection.

## Decisions

1. **Card-pass `boost`, not a CSS exception.** Add an optional per-slug `{"boost": x}` to the card pass mirroring the belt pass (`correction = min(boost, max(0.5, …) * boost)`), set for `pracuj-pl` only, tuned on the contact sheet until the pill's ink height sits in the engie/irobot band (~60–65% of canvas). Rejected: a `.cardLogo` width override for one slug — it would refit the mark with `object-fit: contain` and undo the normalisation for that card (the CSS comment already forbids this). The regenerated PNG ships via `refresh-case-study-logos.ts` (in-place row update) on dev then `--prod`, followed by `vercel cache purge --type cdn`.
2. **Subhead: string split, no `<br>` in content.** Keep `subhead` as one string; add a `subheadBreakBefore: '— '` convention? No — simpler: store `subhead` as a two-element tuple `[lead, tail]` in both content files and render `lead<br/>tail` in `listing-view.tsx`. Brand name tied with `Social Lama` in PL and EN tails. Rejected: `white-space: pre-line` with an embedded `\n` — invisible in the content file and fragile under Biome formatting.
3. **Candidates before verdicts.** `scripts/case-studies/pexels_candidates.py` queries the Pexels API (key from `.env.local`, `orientation=landscape`, 4 per study from a hand-written query table — e.g. skrzat "cinema seats", kbp "crowd in military uniform", mazurska "two whisky glasses"), downloads `w=1920` and renders one contact-sheet Artifact: each candidate shown **pre-cropped to the card box (2.10) and the hero box (1.78)** so the crop is judged, not the thumbnail, with the study's name and a reject checkbox note for visible third-party marks. The user picks one per study; picks become `pexels-provenance.md` rows (page URL, image URL, licence) and `cover-plan.md` verdict rows. Nothing is uploaded before picks. Rejected: auto-picking the top hit — the 08-18 pass rejected ~10 of 14 candidates for marks/orientation.
4. **Encode every new cover the same way.** Regardless of source (Pexels, Downloads PNG, stadler recrop): centre-crop to 1.9:1, longest edge 1920, JPEG q≈82 (WebP where alpha-free and smaller), target ≤ 350 KB; filename `<slug>-cover-<n>.jpg` with `n` = next free index on **prod** (probe prod refs first — dev/prod can reference different rows; `getSafeFileName` renames on local collision and logs the requested name, so the script reads the resulting filename back).
5. **stadler-form: recrop first.** Inspect the current cover; if the face can be excluded while a product-led 1.9:1 frame survives at 1150 px wide, upload the crop as a new row. Else it joins the Pexels table ("air humidifier on a table"). Decided at plan time, recorded in `cover-plan.md`.
6. **`apply-cover-refresh.ts`, cover ops only.** Clone the `cover` branch of `apply-final-verification-imagery.ts` into a smaller script: OPS table `{slug, from: filename, to: {file, altPl, altEn}}`, report-first, `--apply`, `--prod` via `targetProdEnv(…, {blob: true})`, upload-if-missing keyed on filename, repoint `cover`, leave the old row attached to nothing (detach-never-delete). Old→new pairs printed per run = rollback.
7. **Adamed: dedicated `delete-case-study.ts`, not `--reset`.** `--reset` is prefix-based and prod-forbidden for good reason. The new script takes exactly one slug, lists the study's media by **reference** (cover + every approach media id across locales), asserts each has no other referrer (`audit-case-study-orphans.ts` logic), prints the manifest, deletes the study then the media rows under `--apply`, refuses to run on a slug outside an allowlist of one. Dev first, `--prod` approved separately. Code side in the same branch: remove `numbers` + `caseStudy` from the `health` entry in `branze.ts`/`branze.en.ts` (page falls to editorial by the existing `caseStudy`-absent rule), remove `'adamed'` from `order-case-studies.ts`, delete `public/case-studies/adamed/`, drop adamed keys from `glossary.json`, `alts.en.json`, delete `content/case-studies/adamed/draft.en.json`. Deploy order: code first (so `/branze/health` stops referencing the slug), then DB delete.
8. **Covers carry honest alt.** New alt describes the photo ("Ziarna kawy na drewnianym blacie"), never attributes it to the client; EN alt written in the same op.

## Risks / Trade-offs

- [Normaliser median shift when pracuj grows] → only pracuj's correction changes (boost is per-slug, applied after the median); the contact sheet diff confirms the other 46 PNGs are byte-identical before `refresh-logos` runs.
- [Pexels hit shows a third-party mark (Apple, signage)] → screened on the contact sheet at crop size; rejected ids recorded in provenance as in the previous pass.
- [Pexels has nothing on-brief (Rabkoland, karting helmet)] → generic subject is acceptable per the list itself ("jak nie wyskoczy rabkoland"); if all 4 candidates fail, a second query round, never a silent keep.
- [Stock wall: ~30/47 covers become stock] → accepted by the publisher; provenance keeps it auditable.
- [Filename collision across dev/prod (`-cover-3` vs `-cover-2`)] → script reads back the stored filename and keys idempotency on the prod-resolved name; plan lists the intended name and the run log the stored one.
- [`/_next/image` + `/api/media/file` cache covers for a year] → `vercel cache purge --project sociallama-v2 --type cdn -y` after each prod media write; verify in a real browser, not curl.
- [Adamed media referenced elsewhere] → refcount assertion aborts the delete; the manifest names the other referrer.
- [Rate limiter 429s bulk media fetch during verification] → pace screenshots of the listing; one page load is ~47 images.

## Migration Plan

1. Branch + worktree (content work, shared dev DB — no `--isolated`).
2. Code: pipeline boost → regen → subhead → health entry → order list → public/content cleanup → `bun run check`.
3. Candidates → Artifact → user picks → `cover-plan.md` + `pexels-provenance.md`.
4. `apply-cover-refresh.ts` dev report → `--apply` → browser check PL+EN listing + 3 heroes → re-run to zero.
5. `delete-case-study.ts adamed` dev report → `--apply` → listing shows 47.
6. `refresh-case-study-logos.ts` dev → check pracuj card.
7. Merge/deploy code. Then, each with explicit approval: `refresh-logos --prod`, `apply-cover-refresh --prod`, `delete-case-study --prod`; each re-run to zero; CDN purge; browser verify on the deployed host.
8. Rollback: code via git; covers via the old→new pairs in the run log (repoint back); Adamed delete is **not** reversible beyond the seed (the PL draft is gone) — hence the manifest + dev-first.

## Open Questions

- Pexels query wording per study is mine to draft; the contact sheet is where the user corrects it.
- Whether the `health` editorial page's existing copy reads complete without the numbers band (check in the browser; copy edits are a follow-up, not this change).
