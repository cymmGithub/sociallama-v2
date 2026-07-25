# Design — add-case-study-en-translations

## Context

`import-case-study-decks` landed 44 studies as Polish-only `case-studies` documents (drafts, some now published locally). The collection already supports an `en` locale with Polish fallback (`add-case-studies`), and the pattern for populating it is proven: `lib/payload/seed-case-studies.ts` translates the original iRobot/Pracuj/Volvo studies via a second `payload.update(..., locale: 'en', ...)` call per study, reusing each pillar's already-uploaded Polish media by array index.

This change repeats that pattern at scale (44 studies) via a new sibling script that reads the same curated source each study was authored from — not a fresh translation-from-scratch effort, but a faithful English rendering of already-approved Polish copy.

### Verified facts
- The PL `draft.json` for every imported study is still on disk under `content/case-studies/<slug>/draft.json` (git-ignored staging, not deleted after import) — it holds the exact authored PL prose (`title`, `excerpt`, `clientAbout`, `challenge`, pillar `body`, `results`) that translation should be faithful to.
- The live `case-studies` document's PL `approach` array (media IDs per pillar, in order) is queryable via the Payload Local API — translation doesn't need to re-derive media associations, only mirror the existing PL pillar order.
- `results.value` fields are often numeric/percentage/currency strings (`"306% rocznego KPI"`, `"1,28 mln"`) that need locale-aware number formatting, not literal translation (e.g. `"1,28 mln"` → `"1.28M"`), verified per study rather than assumed.

## Goals / Non-Goals

**Goals:** translate all localized text fields for the 44 studies to natural, idiomatic English matching the existing EN voice (iRobot/Pracuj/Volvo entries in `seed-case-studies.ts`); land them via `locale: 'en'` updates to the existing documents; keep it re-runnable/idempotent per slug.

**Non-Goals:** any new creative/media decision (covers, logos, pillar images — reused as-is by index); re-triage of `medicover` (still blocked) or the 3 thin studies (kbp/luisse/mmhygienic — translated like the rest, no special-casing, since PL content already exists for them); any change to publish/draft status; any change to the collection schema, routes, or SEO surface.

## Decisions

### D1 — Translate from the staged `draft.json`, not from the live DB's PL Lexical JSON.
The staged `content/case-studies/<slug>/draft.json` holds the authored PL prose as plain strings (paragraphs, objectives, pillar body arrays) — the same shape the PL importer read. Translating from this plain-string source is far cheaper and more reliable than round-tripping through Lexical rich-text JSON. *Alternative rejected:* extracting text from the live document's `richText` JSON — adds a parse/reserialize step for no benefit, since the staged source is authoritative and already git-ignored (not lost).

### D2 — A sibling script, `lib/payload/translate-case-study.ts`, mirroring `import-case-study.ts`'s shape.
Reads `content/case-studies/<slug>/draft.json` **plus** a new `content/case-studies/<slug>/draft.en.json` (the authored English translation, same shape minus media/logo/cover fields — those aren't needed for an update-only locale write). Looks up the existing PL document by slug, reuses its `approach[i].media` array per pillar index, and calls `payload.update({ locale: 'en', ... })`. Idempotent: re-running overwrites the `en` locale fields on the same document.

### D3 — `results.value` translation is a per-study judgment call, not automatic.
Percentages and currency-agnostic multipliers (`"306% rocznego KPI"` → `"306% of annual KPI"`) translate directly. Absolute Polish-formatted numbers (`"1,28 mln"`, comma decimal) get English formatting (`"1.28M"` or `"1.28 million"`) where it aids readability, but the underlying figure is never altered — this is a formatting/language change, not a re-verification against the source deck (that already happened during PL authoring).

### D4 — No delta to the base `case-studies` spec's existing localization requirement; add a new requirement instead.
The base spec (`openspec/specs/case-studies/spec.md`) already states the collection is locale-aware with PL-fallback — that requirement doesn't change. The unarchived `import-case-study-decks` change's delta separately states imported studies start "with English fields left untranslated" (a still-accurate description of the moment right after import, before this change runs). Rather than modify a requirement that isn't yet merged into the base spec, this change adds a new requirement describing what happens once translation runs — safe to archive independently of `import-case-study-decks`'s own archival timing.

## Risks / Trade-offs

- **Translation quality drift across 44 studies** → mitigated by working from the same fixed template/voice reference (the 3 seeded EN entries) and spot-checking a sample before batching, same QA pattern used for the PL pilot.
- **`content/case-studies/<slug>/draft.json` is git-ignored staging** — if a worktree is wiped, the PL source-of-truth for translation is gone (though the *live DB* PL content remains; only the plain-string staging convenience is lost). Low risk: this worktree's staging is intact.
- **`results.value` mistranslation risk** (numbers) → mitigated by D3's per-study formatting-only rule; no re-derivation from source decks needed since PL values are already verified.
- **Shared dev DB**: pure locale-field updates to existing documents, no new collections/media/schema — same low-risk profile as the PL import; no `--isolated` worktree needed.

## Migration Plan

No DB migration (no schema change). Rollout: run the translation script per slug (or batched), verify via `locale=en` Local API reads, spot-check rendered `/en/case-studies/<slug>` pages. Rollback: re-running PL-only import is unaffected (EN is an additive locale write); to revert a translation, either re-run with corrected content or clear the `en` locale fields via admin/API (falls back to PL automatically).

## Open Questions

- Should the 3 "thin" studies (kbp/luisse/mmhygienic) get EN translations at the same bar as the rest, or be explicitly deprioritized? Proposal defaults to "translate like the rest" (user confirmed thin studies are acceptable content); revisit if translation effort is disproportionate for near-empty PL content.
