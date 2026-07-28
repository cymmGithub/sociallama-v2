# Tasks — add-case-study-en-translations

## 1. Tooling
- [x] 1.1 Define the translation-payload shape (assets excluded — translation never touches media): `title`, `excerpt`, `tags`, `clientAbout[]`, `challenge {intro, objectives[]}`, `pillars[] {tag, heading, body[]}`, `results[] {platform, metric, value}`. Shared by the `draft.pl.json` extract and the authored `draft.en.json` (per D1). Note: `period` was listed in the original draft of this task but **no such field exists** on the collection; `seo.metaTitle`/`seo.metaDescription` are localized but unset on all 48 documents (PL included), so EN leaves them unset for parity.
- [x] 1.2 Write `lib/payload/translate-case-study.ts` (sibling of `import-case-study.ts`) with two modes: `--extract <slug>` reads the live PL document and writes `draft.pl.json` (plain strings, inverting the importer's Lexical helpers) plus a `draft.en.json` stub; `<slug>` reads the authored `draft.en.json`, reuses `approach[i].media` per pillar index from the live document, and calls `payload.update({ locale: 'en', ... })` — **no `draft: true`**, per D5. Refuse un-authored stubs (same `TODO` guard as the PL importer). Idempotent by slug.
- [x] 1.3 Add a `payload:translate:case-study` package script. (Plus `payload:verify:case-study-en` → `lib/payload/verify-case-study-en.ts`, the check side that satisfies tasks 2.2/3.2: asserts one doc per slug, EN populated *and* differing from PL, pillar `media` byte-identical to PL, counts matched, and that the content is on the **published** version per D5.)

## 2. Pilot (5 studies, same D3 spread as the PL pilot)
- [x] 2.1 Extract and translate `riviera`, `skrzat`, `asus`, `ed-invest`, `n-energia` from their `draft.pl.json` to `draft.en.json`, matching the existing EN voice (iRobot/Pracuj/Volvo entries in `seed-case-studies.ts`).
- [x] 2.2 Run the translation step for each; verify via Local API (`locale: 'en'`) that translated fields return, PL fields are untouched, and pillar `media` arrays are unchanged from the PL `approach`.
- [x] 2.3 Spot-check `results.value` formatting per D3 (percentages translate directly; PL-formatted absolute numbers get English formatting without changing the underlying figure).
- [x] 2.4 Preview `/en/case-studies/<slug>` for the 5 pilots in the dev app; confirm they read as strong as the EN iRobot/Pracuj/Volvo pages.

## 3. Scale (remaining 40 studies)
- [x] 3.1 Translate the remaining 40 studies (45 imported documents total; `medicover` has no document and is out of scope) the same way, including the 3 thin studies (kbp/luisse/mmhygienic) at whatever quality their PL content supports.
- [x] 3.2 Run the translation step for each; verify idempotency (re-run updates, never duplicates) on at least one repeat.
- [x] 3.3 Generate `content/case-studies/STATUS.md` with a per-study EN translation column. (The original STATUS.md was lost with the import worktree's git-ignored staging — regenerate it from the live DB rather than extend it.)

## 4. Verification
- [x] 4.1 Spot-check a sample of `/en/case-studies/<slug>` pages across the batch for rendering, natural English phrasing, and correct pillar/media pairing.
- [x] 4.2 Confirm `hreflang="en"` now points to genuinely translated content (was previously PL-via-fallback) for the translated slugs.
- [x] 4.3 Verified the relevant SEO subset across all 45 EN pages: `<title>` and `<meta name="description">` match the authored EN title/excerpt, `canonical` points at the `/en/` URL, and the `Article` JSON-LD carries `inLanguage: "en"` with the English headline — same node set (Organization / Article / BreadcrumbList) as the Polish pages.
