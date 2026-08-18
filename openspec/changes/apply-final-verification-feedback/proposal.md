# Apply final verification feedback

## Why

The final pre-launch verification of the site (Asana task "Finalna weryfikacja strony www <3", 1217405077214092) by Anna Ozga and Emilia Metryka surfaced launch-blocking problems: image-rights (wizerunek) violations across the case-study proof surfaces (former employees, children, uncleard third parties), an outdated ENGIE logo and a Volvo mark that overstates the engagement, sloppy screenshots (visible clock times, employee avatars), pixelated hero covers, and a media framing treatment Emilia rejected. Every open question from the thread was resolved by Przemek on 2026-08-18; all replacement assets are already staged at `/mem/final-weryfikacja/`.

## What Changes

**Code / repo assets:**

- Approach-pillar creatives render **frameless** — the phone-frame treatment (`.shot` border/surface/stagger) is removed so graphics display plain, as on Riviera.
- Client belt + case-study logo swaps, regenerated through the logo pipeline:
  - Volvo → the **"Dom Volvo"** annotated mark (we ran sub-brand accounts, not global Volvo; the annotated logo is the only truthful one).
  - ENGIE → the current (post-rebrand) logo.
  - iRobot → the refreshed green wordmark.
- Homepage kreacje clip `kreacje-pracuj.mp4` re-edited: the shot featuring Paulina (former colleague) is cropped/trimmed so the clip ends on the Pracuj.pl logo. Poster regenerated.
- iRobot's `#DLAKAŻDEGO / Akcje specjalne` pillar deleted from `seed-case-studies.ts` (the seed is the source of truth for that study).

**Case-study content (database, via the existing audited-imagery flow):**

- Per-study removals, replacements, crops, and anonymization across ~14 published studies, per the approved per-image plan (see design.md): Skrzat, Vistula, Volvo, ENGIE, FM Logistics, Belvedere, iRobot, Julius Meinl, Riviera, JW Construction, POLOmarket, Pracuj.pl, ASUS, IMID.
- Moderation screenshots are **anonymized instead of removed**: commenter avatars blurred, real names replaced with plausible pseudonyms, clock times cropped (approved decision).
- Replacement material is the client's own first (staged attachments + Drive files, incl. two videos). For FM's two illustrative slots Emilia's stock suggestion **is** followed (approved 2026-08-18): Pexels-sourced business photography, which requires amending the imagery-integrity requirement — stock on a proof surface becomes permissible only per-image-approved, mark-free, with recorded provenance and honest alt text.
- Pixelated covers re-exported at proper resolution wherever observed (standing instruction: fix without waiting).

**Out of scope (blocked on client input):** Brześć and Rabkoland content (Anna has not responded), any additional ASUS material Emilia may still deliver. These land as a follow-up batch through the same imagery flow.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `case-studies`: approach creatives SHALL render frameless (no device-frame chrome); third-party screenshots MAY satisfy the imagery-integrity requirement through anonymization (blurred avatars, pseudonymized names, cropped timestamps) rather than removal; the imagery-integrity requirement is relaxed to admit explicitly-approved, provenance-recorded stock on proof surfaces where the client's own material cannot fill a slot.
- `client-logos-marquee`: the roster SHALL show the mark of the entity actually serviced — Volvo appears as the annotated "Dom Volvo" mark; brand logos SHALL be the brand's current identity (ENGIE post-rebrand, refreshed iRobot).

## Impact

- **Rendering:** `app/(frontend)/case-studies/[slug]/case-study.module.css` (`.shot`, `.shotPortrait`), `app/(frontend)/case-studies/[slug]/case-study-article.tsx`.
- **Logo pipeline:** `scripts/client-logos/pipeline.py` (BRANDS rows for engie/irobot/volvo), `assets-src/client-logos/raw/`, regenerated `public/assets/clients/*.png` and `public/case-studies/<slug>/<slug>-logo*.png`, `lib/content/clients.ts` (Volvo display name), `lib/payload/refresh-case-study-logos.ts` for the DB-side client logos.
- **Video:** `public/clips/kreacje-pracuj.mp4` + poster (ffmpeg re-edit; smpte170m color tags required).
- **Seed:** `lib/payload/seed-case-studies.ts` (iRobot pillar removal).
- **Database:** `case-studies` docs across ~14 slugs via `lib/payload/apply-case-study-imagery.ts`-style plan — per-locale `approach[].media` arrays matched by media id, detach-not-delete, report-first, dev DB verified before prod (prod needs `BLOB_READ_WRITE_TOKEN`).
- **Staged inputs:** `/mem/final-weryfikacja/{drive,asana,logos,video}` — 28 files pulled from the Drive folder, the Asana task attachments, and Przemek's uploads.
