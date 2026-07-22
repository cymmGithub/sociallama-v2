## 1. Dev DB isolation (BEFORE any localized boot)

- [x] 1.1 Create a Neon branch of the dev database; set `DATABASE_URL` in `sl-i18n-en/.env.local` to the branch. Verify with a throwaway boot that the worktree connects to the branch, not the shared dev DB.

## 2. i18n scaffolding

- [x] 2.1 Add `lib/i18n/slug-map.ts` (PL↔EN path pairs per design D3) with helpers: counterpart-of-path (unmapped → locale home) and hreflang-pairs-for-path.
- [x] 2.2 Create the `(frontend-en)` route group with its own root layout (`lang="en"`, same shell/fonts/providers as the PL root layout, EN chrome data).
- [x] 2.3 Build the PL/EN toggle component (overlay menu utility row + footer bottom row, `aria-current` on the active locale, slug-map driven); wire it into BOTH chromes (PL and EN).

## 3. EN content modules (machine translation + human-vibe pass)

- [x] 3.1 `lib/content/site.en.ts` — site metadata strings; `satisfies` parity with `site.ts` types.
- [x] 3.2 `lib/content/home.en.ts` — full homepage + chrome copy (hero rotator, sections, menu, footer) WITHOUT blog entries; parity-typed. Keep the brand's EN display headlines as-is; vibe-pass the playful lines (no corporate mush).
- [x] 3.3 `lib/content/o-nas.en.ts` and `lib/content/contact.en.ts` — parity-typed EN copy (contact keeps the 24h promise + RODO note in EN).

## 4. EN pages

- [x] 4.1 `/en` homepage — composes the PL homepage's sections from EN content, minus `<NewsLama />`.
- [x] 4.2 `/en/about-us`, `/en/contact` (form posts with `locale: 'en'`), `/en/become-a-lama` (inline EN copy mirroring the PL page's pattern).
- [ ] 4.3 Static EN legal pages: `/en/privacy-policy` (translate the static PL page), `/en/terms` + `/en/cookies` (translate the two WP-imported CMS docs' content into static pages).
- [x] 4.4 Contact server action: `locale` param selecting validation/toast strings + lead-email labels (per design D7).

## 5. Case-studies localization (Payload)

- [x] 5.1 `payload.config.ts`: add the `localization` block (pl default, en, fallback true).
- [x] 5.2 `collections/case-studies.ts`: mark content fields `localized: true` per design D4 (slug NOT localized); boot against the Neon branch and let push restructure it.
- [x] 5.3 Extend `seed-case-studies.ts` with an EN pass (machine-translated + vibe-passed copy for all 3 studies) writing under `locale: 'en'`; run against the branch and verify in the admin.
- [x] 5.4 Queries: locale parameter on the case-study reads (`getCaseStudies`, `getCaseStudyBySlug`, sitemap variant); PL call sites unchanged.
- [x] 5.5 `/en/case-studies` listing + `/en/case-studies/[slug]` detail pages reusing the PL components with EN content and localized JSON-LD (`inLanguage: 'en'`).

## 6. SEO surface

- [ ] 6.1 `alternates.languages` hreflang pairs (+ `x-default` → PL) on every mapped page, both directions, driven by the slug map.
- [ ] 6.2 EN metadata (title/description/OG) per page from EN modules; EN URLs added to the sitemap.
- [ ] 6.3 Confirm the URL-parity gate stays green (EN is additive; no PL URL changes).

## 7. Verification

- [ ] 7.1 Typecheck + Biome clean; every `.en.ts` module `satisfies` its PL type (parity gate compiles).
- [ ] 7.2 Drive on :3003: every EN URL from the map returns 200 with `lang="en"`, PL pages unchanged with `lang="pl"`; toggle round-trips PL↔EN on every mapped page; unmapped (blog post) toggles to `/en`.
- [ ] 7.3 EN chrome shows no BLOG links anywhere; `/en` has no NewsLAMA section.
- [ ] 7.4 Case studies: all 3 EN detail pages render translated content (fallback shows no raw empty fields); EN contact form submits with EN validation messages and delivers a lead email with EN labels (or graceful-failure path if SMTP unset).
- [ ] 7.5 View-source spot check: hreflang pairs present on both locales' pages; sitemap contains EN URLs; JSON-LD `inLanguage` correct.
- [ ] 7.6 Native-speaker-style read-through of all EN surfaces (the "human vibe" pass is part of done).
