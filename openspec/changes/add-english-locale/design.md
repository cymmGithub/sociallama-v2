# Design — add-english-locale

## D1. Routing: additive `/en` tree with a second root layout

Polish routes stay byte-identical. The EN tree is a **sibling route group with its own root layout**:

```
app/
├── (frontend)/            ← existing PL tree, root layout lang="pl"  (UNTOUCHED)
│   ├── (home)/ o-nas/ kontakt/ zostan-lama/ case-studies/ …
└── (frontend-en)/         ← NEW group, own root layout lang="en"
    └── en/
        ├── page.tsx                    → /en
        ├── about-us/page.tsx           → /en/about-us
        ├── contact/page.tsx            → /en/contact
        ├── become-a-lama/page.tsx      → /en/become-a-lama
        ├── case-studies/page.tsx       → /en/case-studies
        ├── case-studies/[slug]/page.tsx
        ├── privacy-policy/ terms/ cookies/   (static)
```

Multiple root layouts are a documented App Router pattern; navigation across them is a full document load — acceptable for locale switching, and it keeps `<html lang>` correct per tree with zero middleware and no dynamic-rendering cost. The EN root layout duplicates the PL one's shell (fonts, providers) with `lang="en"` and EN chrome data.

Rejected alternatives: `[locale]` segment restructure (moves every PL route; re-opens the Next 16 Activity-cache landmines already fought); `headers()`-based lang in one root layout (forces dynamic rendering sitewide).

## D2. Content: per-locale typed modules, compiler-enforced parity

House pattern extended, no library:

```ts
// lib/content/home.en.ts
import type { … } from './home'          // types stay in the PL module
export const hero = { … } satisfies typeof plHero
```

Each `.en.ts` exports the same shape `satisfies` the PL module's type — a missing key or wrong structure is a **build error**, which is the translation-parity gate. EN pages import from `*.en.ts`; PL pages keep importing `*.ts` unchanged. Components never learn about locales — they take content as props/imports exactly as today.

Message-catalog libraries (next-intl) were rejected: they'd rewrite every component to `t('key')` for zero gain at this page count and fight the repo's content-module convention.

## D3. Slug map: one module, three consumers

```ts
// lib/i18n/slug-map.ts
export const pathPairs = [
  ['/', '/en'],
  ['/o-nas', '/en/about-us'],
  ['/kontakt', '/en/contact'],
  ['/zostan-lama', '/en/become-a-lama'],
  ['/case-studies', '/en/case-studies'],        // + dynamic [slug] passthrough
  ['/polityka-prywatnosci', '/en/privacy-policy'],
  ['/regulamin', '/en/terms'],
  ['/cookies', '/en/cookies'],
] as const
```

Consumers: (1) the PL/EN toggle (current path → counterpart; unmapped paths → locale home), (2) `hreflang` alternates in metadata, (3) the sitemap. One source of truth; case-study slugs pass through unchanged (brand names).

## D4. Payload localization: case studies only, seed-first translations

- `payload.config.ts`: `localization: { locales: ['pl', 'en'], defaultLocale: 'pl', fallback: true }`.
- `collections/case-studies.ts`: `localized: true` on `title`, `excerpt`, `tags`, `period`, `client.about`, `challenge`, `approach` (tag/heading/body), `results` (platform/metric/value), `seo.*`. NOT localized: `slug`, `publishedAt`, uploads/relations.
- Queries: `getCaseStudies(locale)` / `getCaseStudyBySlug(slug, locale)` pass Payload's `locale` option; PL call sites keep default behavior.
- **Translations live in the seed script** (extend `seed-case-studies.ts` with an EN pass that updates each doc under `locale: 'en'`). Repo-reproducible, not admin-only state; the human-vibe pass edits the seed file.
- `fallback: true` means an untranslated field renders Polish rather than empty — safe failure mode.

## D5. Dev database isolation (the landmine)

Enabling localization restructures storage (`*_locales` tables) and dev runs `push: true` against the **shared** Neon dev DB, while three other checkouts (:3000/:3001/:3002) speak the old schema — any of their restarts would push-drop the new tables (documented clobber). Therefore:

1. **Before the first localized boot**: create a Neon **branch** of the dev DB; point `sl-i18n-en/.env.local`'s `DATABASE_URL` at it. This worktree pushes freely; nobody else sees the schema.
2. **Ship path**: generate a real migration (`payload migrate:create`), run it on prod (mind the dev-push-marker gotcha — clear dev markers or the migrate hangs), run the EN seed pass with the prod flag, then merge. After merge, the shared dev DB picks the new schema up normally.

## D6. EN chrome and the blog omission

EN menu/footer/nav data comes from `home.en.ts` and **simply doesn't contain** blog entries; the EN homepage composition omits `<NewsLama />`. No conditional logic in shared components — the EN pages compose what EN needs. The PL/EN toggle renders in both chromes: overlay menu utility row + footer bottom row, styled like existing utility links, current locale marked (`aria-current`).

## D7. Contact flow in EN

The server action gets an optional `locale: 'pl' | 'en'` (default `'pl'`): selects validation/toast/message strings and lead-email field labels from a per-locale strings object. The Turnstile/rate-limit/SMTP machinery is untouched. The lead email may mix locales (EN labels, whatever language the visitor wrote in) — fine, recipients are Polish.

## D8. SEO surface

- Every mapped page emits `alternates.languages` with its pair (`pl` ↔ `en` + `x-default` → PL).
- EN pages get their own `metadata` (title/description/OG) from the EN modules.
- Sitemap: EN URLs added with their `updatedAt`s; case-study EN entries derive from the same docs.
- EN case-study JSON-LD mirrors the PL implementation with localized strings, `inLanguage: 'en'`.
- The URL-parity gate is untouched (it asserts old-site URLs; EN URLs are additive) — verify it stays green anyway.
