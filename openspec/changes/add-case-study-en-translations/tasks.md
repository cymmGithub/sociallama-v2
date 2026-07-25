# Tasks — add-case-study-en-translations

## 1. Tooling
- [ ] 1.1 Define the `draft.en.json` shape (mirrors `draft.json` minus `logo`/`cover`/pillar `media`/`extractedMedia` — translation doesn't touch assets): `title`, `excerpt`, `tags`, `period`, `clientAbout[]`, `challenge {intro, objectives[]}`, `pillars[] {tag, heading, body[]}`, `results[] {platform, metric, value}`.
- [ ] 1.2 Write `lib/payload/translate-case-study.ts` (sibling of `import-case-study.ts`): reads `content/case-studies/<slug>/draft.en.json`, looks up the existing PL document by slug, reuses `approach[i].media` per pillar index from the live document, `payload.update({ locale: 'en', draft: true, ... })`. Refuse un-authored stubs (same `TODO` guard as the PL importer). Idempotent by slug.
- [ ] 1.3 Add a `payload:translate:case-study` package script.

## 2. Pilot (5 studies, same D3 spread as the PL pilot)
- [ ] 2.1 Translate `riviera`, `skrzat`, `asus`, `ed-invest`, `n-energia` from their staged `draft.json` to `draft.en.json`, matching the existing EN voice (iRobot/Pracuj/Volvo entries in `seed-case-studies.ts`).
- [ ] 2.2 Run the translation step for each; verify via Local API (`locale: 'en'`) that translated fields return, PL fields are untouched, and pillar `media` arrays are unchanged from the PL `approach`.
- [ ] 2.3 Spot-check `results.value` formatting per D3 (percentages translate directly; PL-formatted absolute numbers get English formatting without changing the underlying figure).
- [ ] 2.4 Preview `/en/case-studies/<slug>` for the 5 pilots in the dev app; confirm they read as strong as the EN iRobot/Pracuj/Volvo pages.

## 3. Scale (remaining 39 studies)
- [ ] 3.1 Translate the remaining 39 non-blocked studies (all imported studies except `medicover`, which has no document) the same way, including the 3 thin studies (kbp/luisse/mmhygienic) at whatever quality their PL content supports.
- [ ] 3.2 Run the translation step for each; verify idempotency (re-run updates, never duplicates) on at least one repeat.
- [ ] 3.3 Extend `content/case-studies/STATUS.md` with an EN column tracking translation completion per study.

## 4. Verification
- [ ] 4.1 Spot-check a sample of `/en/case-studies/<slug>` pages across the batch for rendering, natural English phrasing, and correct pillar/media pairing.
- [ ] 4.2 Confirm `hreflang="en"` now points to genuinely translated content (was previously PL-via-fallback) for the translated slugs.
- [ ] 4.3 Re-run `/seo-audit` (or the relevant subset) on the EN detail template to confirm the English pages carry the same on-page/structured-data quality as the Polish pass.
