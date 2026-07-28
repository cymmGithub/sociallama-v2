# Design — add-case-study-en-translations

## Context

`import-case-study-decks` landed 45 studies as Polish-only `case-studies` documents, all of which are now published. The collection already supports an `en` locale with Polish fallback (`add-case-studies`), and the pattern for populating it is proven: `lib/payload/seed-case-studies.ts` translates the original iRobot/Pracuj/Volvo studies via a second `payload.update(..., locale: 'en', ...)` call per study, reusing each pillar's already-uploaded Polish media by array index.

This change repeats that pattern at scale (45 studies) via a new sibling script — not a fresh translation-from-scratch effort, but a faithful English rendering of already-approved Polish copy.

### Verified facts
*(re-verified 2026-07-28 against the dev DB at `localhost:5434` via the Payload Local API; two facts asserted in the original draft of this design turned out to be false and are corrected here.)*

- **The staged `content/case-studies/<slug>/draft.json` files no longer exist.** The directory is git-ignored (`.gitignore:90`) and is empty in this worktree and in every sibling worktree — the staging died with the import worktree. The **live PL document is now the only surviving copy** of the authored Polish prose. (The original design asserted the opposite; D1 below is rewritten accordingly.)
- **The `case-studies` collection holds 48 documents: 3 already-translated seeds (`irobot`, `pracuj-pl`, `volvo`) and 45 untranslated imports.** `medicover` has no document at all, so it is not among the 45 — the earlier "44" figure double-counted the block. Scope is **45 studies**.
- **All 45 imported documents are `_status: 'published'`,** not drafts. The collection has `versions.drafts` enabled (`lib/payload/collections/case-studies.ts:53-54`), so the write mode matters — see D5.
- The PL rich text uses only a flat node set — `root`, `paragraph`, `list`, `listitem`, `text` — exactly what `import-case-study.ts:68-77` emits. Extracting plain strings back out is a direct inverse of those helpers, not a general Lexical parse.
- The live document's PL `approach` array (media IDs per pillar, in order) is queryable via the Local API — translation doesn't need to re-derive media associations, only mirror the existing PL pillar order.
- `results.value` fields are often numeric/percentage/currency strings (`"306% rocznego KPI"`, `"3 mln+"`) that need locale-aware number formatting, not literal translation, verified per study rather than assumed.

## Goals / Non-Goals

**Goals:** translate all localized text fields for the 45 studies to natural, idiomatic English matching the existing EN voice (iRobot/Pracuj/Volvo entries in `seed-case-studies.ts`); land them via `locale: 'en'` updates to the existing documents; keep it re-runnable/idempotent per slug.

**Non-Goals:** any new creative/media decision (covers, logos, pillar images — reused as-is by index); re-triage of `medicover` (still blocked) or the 3 thin studies (kbp/luisse/mmhygienic — translated like the rest, no special-casing, since PL content already exists for them); any change to publish/draft status; any change to the collection schema, routes, or SEO surface.

## Decisions

### D1 — Translate from the live PL document, extracted back to plain strings. *(revised — supersedes "translate from the staged `draft.json`")*
The staged `draft.json` files are gone (see Verified facts), so the live document is the only source. The script extracts the PL prose into a plain-string `content/case-studies/<slug>/draft.pl.json` by inverting `import-case-study.ts`'s Lexical helpers — the stored node set is flat (`paragraph`, `list`/`listitem`, `text`), so this is a direct unwrap, not a general Lexical parser. Translation is then authored against that extract as `draft.en.json`.

This is strictly better than the snapshot it replaces: `draft.json` was a point-in-time artifact, whereas the live document reflects any edits made in the Payload admin since import — translating from the snapshot would have silently rendered stale text into English.

*Alternative rejected:* re-deriving the Polish from the original source decks — redoes the PL authoring pass and risks drifting from the prose that was actually approved and published.

### D2 — A sibling script, `lib/payload/translate-case-study.ts`, mirroring `import-case-study.ts`'s shape.
Two modes:
- `--extract <slug>` — reads the live PL document, writes `content/case-studies/<slug>/draft.pl.json` (plain strings) and, if absent, a `draft.en.json` stub with `TODO` markers for authoring.
- `<slug>` (default) — reads `content/case-studies/<slug>/draft.en.json`, looks up the existing document by slug, reuses its `approach[i].media` array per pillar index, and calls `payload.update({ locale: 'en', ... })`.

Refuses un-authored stubs with the same `TODO` guard as the PL importer. Idempotent: re-running overwrites the `en` locale fields on the same document, creates no document and uploads no media.

### D3 — `results.value` translation is a per-study judgment call, not automatic.
Percentages and currency-agnostic multipliers (`"306% rocznego KPI"` → `"306% of annual KPI"`) translate directly. Absolute Polish-formatted numbers (`"1,28 mln"`, comma decimal) get English formatting (`"1.28M"` or `"1.28 million"`) where it aids readability, but the underlying figure is never altered — this is a formatting/language change, not a re-verification against the source deck (that already happened during PL authoring).

### D5 — The EN write targets the published document directly; no `draft: true`. *(new)*
All 45 imported documents are published and the collection has drafts enabled, so `payload.update({ draft: true })` would write a *draft version* while the live `/en/case-studies/<slug>` page kept rendering the published version — i.e. the translation would appear to land and change nothing on the site. Omitting the flag matches the proven precedent in `seed-case-studies.ts:934-952`, which updates the published document directly.

Consequence, already anticipated by the proposal's Gates section: a translation is live the moment it is written. Accepted — the site is pre-launch, and the client-permission gate governs *publication of the study*, which this change does not touch. Rollback is a re-run with corrected content, or clearing the `en` fields to fall back to Polish.

### D4 — No delta to the base `case-studies` spec's existing localization requirement; add a new requirement instead.
The base spec (`openspec/specs/case-studies/spec.md`) already states the collection is locale-aware with PL-fallback — that requirement doesn't change. The unarchived `import-case-study-decks` change's delta separately states imported studies start "with English fields left untranslated" (a still-accurate description of the moment right after import, before this change runs). Rather than modify a requirement that isn't yet merged into the base spec, this change adds a new requirement describing what happens once translation runs — safe to archive independently of `import-case-study-decks`'s own archival timing.

## Risks / Trade-offs

- **Translation quality drift across 45 studies** → mitigated by working from the same fixed template/voice reference (the 3 seeded EN entries) and spot-checking a sample before batching, same QA pattern used for the PL pilot.
- **The extract/authoring staging is still git-ignored** — `draft.pl.json`/`draft.en.json` live under `/content/case-studies/` and will vanish with this worktree exactly as the original `draft.json` did. Accepted: after D1 the extract is *regenerable on demand* from the live document, so losing it costs a re-run rather than the content itself. The authored English, however, is only recoverable from the DB once written — which is what makes the `en` locale write, not the staging file, the artifact of record.
- **Writing to published documents (D5)** — a bad translation is immediately live rather than caught in a draft. Mitigated by the pilot-then-batch sequencing: 5 studies verified end-to-end before the remaining 40 run.
- **`results.value` mistranslation risk** (numbers) → mitigated by D3's per-study formatting-only rule; no re-derivation from source decks needed since PL values are already verified.
- **Shared dev DB**: pure locale-field updates to existing documents, no new collections/media/schema — same low-risk profile as the PL import; no `--isolated` worktree needed.

## Migration Plan

No DB migration (no schema change). Rollout: run the translation script per slug (or batched), verify via `locale=en` Local API reads, spot-check rendered `/en/case-studies/<slug>` pages. Rollback: re-running PL-only import is unaffected (EN is an additive locale write); to revert a translation, either re-run with corrected content or clear the `en` locale fields via admin/API (falls back to PL automatically).

## Open Questions

- Should the 3 "thin" studies (kbp/luisse/mmhygienic) get EN translations at the same bar as the rest, or be explicitly deprioritized? Proposal defaults to "translate like the rest" (user confirmed thin studies are acceptable content); revisit if translation effort is disproportionate for near-empty PL content.
