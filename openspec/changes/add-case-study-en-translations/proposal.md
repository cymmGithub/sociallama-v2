## Why

The `import-case-study-decks` change landed 44 client decks as Polish `case-studies` documents (45 imported; `medicover` blocked on a corrupted source deck). Their English locale currently has no translated content — the `/en/case-studies/[slug]` route works because the collection's Polish-fallback behavior renders the PL text — but nothing there is actually in English. That's correct-but-incomplete: the `Localized<>` chrome, the EN listing/detail routes, and the fallback contract already exist (shipped in `add-case-studies` and reused throughout `import-case-study-decks`); the gap is translated content, not capability.

## What Changes

- **No schema, route, or SEO changes.** The `case-studies` collection's `en` locale, `/en/case-studies` listing, and `/en/case-studies/[slug]` detail pages are reused as-is — the same surface the original iRobot/Pracuj/Volvo EN pass already exercises.
- **EN authoring pass**: for each of the 44 non-blocked studies, translate the localized fields — `title`, `excerpt`, `tags`, `period`, `client.about`, `challenge` (intro + ordered objectives), each pillar's `heading` + `body`, and `results` metric labels (`platform`/`metric` — `value` is usually numeric/unit and often needs no translation, verified per study) — to the same voice/quality bar as the Polish original.
- **Import via `payload.update(..., locale: 'en')`**, mirroring `lib/payload/seed-case-studies.ts`'s existing EN pass: pillar media is **reused by index** from the already-uploaded Polish creatives — no new media decisions, no re-upload, no re-cropping.
- **Idempotent, re-runnable**: re-running an EN update for a slug overwrites that locale's fields, never creates a duplicate document (same doc, second locale).
- **Scope**: all 44 studies currently live with a `pl` locale document (i.e. every imported study except `medicover`, which has no document to translate). Draft/published status is inherited from the existing PL document — this change does not alter it.

## Capabilities

### New Capabilities
<!-- none — no new capability -->

### Modified Capabilities
- `case-studies`: the capability's existing locale/fallback requirement ("English translations SHALL be maintained in the repo's seed script") extends in practice to the import path — this change is the first time it's exercised for imported (not statically seeded) studies. No requirement text changes; this is content, not a spec-level behavior change. No delta spec needed.

## Impact

- **Content**: an EN-translation pass per study, authored to match the Polish original's meaning and the existing EN voice (see the iRobot/Pracuj/Volvo EN entries in `lib/payload/seed-case-studies.ts` for tone reference — plain, direct, no transliteration artifacts).
- **Import step**: a sibling script (or an extension of `lib/payload/import-case-study.ts`) that reads a translated payload and `payload.update`s the existing PL document under `locale: 'en'`, reusing pillar media indices from the PL `approach` array already on the document.
- **No new assets, no new Payload writes to `media`.**
- **No migration, no schema push** — pure locale-field writes to existing documents, same low-risk profile as the PL import (shared dev DB is safe, no `--isolated` worktree needed).

## Gates & Non-Goals

- **No new publish gate.** A study's draft/published status already reflects the client-permission gate from `import-case-study-decks`; adding an EN translation to an unpublished draft does not publish it, and adding one to an already-published study takes effect immediately (same as any other field edit).
- **Non-goal**: re-opening creative/media decisions (pillar images, cover, logo) — those were finalized during PL authoring and are reused as-is. Re-triage of the 3 "thin" studies (kbp, luisse, mmhygienic) or re-attempt of the blocked `medicover` — out of scope here, tracked separately.
