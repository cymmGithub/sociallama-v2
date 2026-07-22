## Why

The site is Polish-only (`lang="pl"` hardcoded, zero i18n infrastructure), which closes the door on international prospects — the exact audience case studies like Volvo and iRobot could impress. All copy lives in two well-defined places (typed content modules in `lib/content/`, ~1,100 lines; Payload CMS documents), so a second locale is addable without a framework migration.

Scope decided 2026-07-22 (T2): English versions of the marketing pages (home, o-nas, kontakt, zostan-lama), the legal pages, and the case studies (listing + 3 detail pages via Payload localization). Blog stays Polish-only and is omitted from the EN chrome entirely (T3, explicitly deferred). Translation approach: machine-translate, then a human-vibe pass to keep the playful voice — no external review gate.

## What Changes

- **`/en/*` route tree with its own root layout.** Polish URLs stay exactly as they are (no `/pl/` prefix, zero SEO disruption). English lives under `/en/` with translated slugs. A sibling route group carries a second root layout with `lang="en"` — Next's multiple-root-layouts pattern — so no `[locale]` restructure, no proxy hacks, no dynamic-rendering penalty. Crossing locales is a full page load (acceptable for a rare action).
- **URL map**: `/en`, `/en/about-us`, `/en/contact`, `/en/become-a-lama` (keeps the brand joke), `/en/case-studies` + `/en/case-studies/[slug]` (same slugs — brand names), `/en/privacy-policy`, `/en/terms`, `/en/cookies`.
- **Per-locale content modules.** `home.en.ts`, `o-nas.en.ts`, `contact.en.ts`, `site.en.ts` — each `satisfies` the same TypeScript type as its Polish twin, so the compiler enforces translation parity (a missed field fails the build). Pages take their content by locale; components stay untouched. No message-catalog library.
- **Static EN legal pages.** `/regulamin` and `/cookies` are WP-imported CMS posts; rather than dragging the posts collection into localization for two near-immutable documents, all three EN legal pages (`privacy-policy`, `terms`, `cookies`) are static routes with translated copy, mirroring the existing static `polityka-prywatnosci` pattern. Polish CMS versions untouched.
- **Payload localization for case studies only.** `localization: { locales: ['pl', 'en'], defaultLocale: 'pl' }` in the config; `localized: true` on the case-study content fields (title, excerpt, tags, period, client.about, challenge, approach, results labels, seo). EN translations are written into the repo's seed script (extending the established `seed-case-studies` pattern) — machine-translated with a human-vibe pass — so they are reproducible, not admin-only state. Slugs are NOT localized.
- **EN chrome.** Menu, footer, and nav render from the EN modules; BLOG links and the NewsLAMA section are omitted on EN (no Polish-content leakage). A **PL/EN toggle** in the overlay menu and footer maps the current path to its counterpart via a slug-map module; pages without a counterpart (blog posts) link to `/en`.
- **Localized SEO surface.** Per-page EN metadata, `hreflang` alternate pairs on both sides, EN URLs in the sitemap, localized OG data. The contact form's server action gains a locale parameter (validation messages, toasts, email field labels in the lead email).

## Capabilities

### New Capabilities

- `site-i18n`: English locale under `/en` with translated slugs and `lang="en"` root layout; per-locale typed content modules with compiler-enforced parity; PL/EN toggle in the site chrome; EN chrome omits blog surfaces; localized metadata with hreflang pairs and sitemap coverage; static EN legal pages; EN contact flow end-to-end.

### Modified Capabilities

- `case-studies`: The collection's content fields become Payload-localized (pl default, en second locale) with EN translations seeded from the repo; the listing and detail pages are additionally served in English under `/en/case-studies` with localized metadata and JSON-LD.

## Non-Goals

- **No blog translation (T3).** Posts, categories, NewsLAMA, and the `[slug]` catch-all stay Polish-only; EN chrome simply omits them.
- **No `[locale]` route restructure.** Polish routes do not move; the EN tree is additive.
- **No auto-redirect by Accept-Language.** The toggle is manual; search engines and users always get the URL they asked for.
- **No posts-collection localization.** Regulamin/cookies get static EN pages instead.
- **No visual or component redesign.** EN pages reuse the exact components; only content and chrome wiring differ.

## Impact

- **New code**: `/en` route tree (route group + root layout `lang="en"`, ~8 pages), `lib/content/*.en.ts` modules, a slug-map module (PL↔EN path pairs) powering the toggle + hreflang, the locale toggle component, static EN legal pages, `/en/zostan-lama`-equivalent page (`become-a-lama`, copy inline like its PL twin).
- **Modified code**: `lib/payload/payload.config.ts` (localization block), `lib/payload/collections/case-studies.ts` (`localized: true` fields), `lib/payload/queries.ts` (locale-aware case-study queries), `lib/payload/seed-case-studies.ts` (EN locale pass), contact server action (locale param), sitemap + metadata utilities (hreflang pairs), menu/footer components (toggle slot; EN chrome data comes from modules).
- **⚠️ Database**: field-level localization **restructures case-study storage** (`*_locales` tables). The shared Neon dev DB runs `push: true` from every worktree — main (:3000), hero (:3001), services (:3002) all speak the old schema and would push-drop the localization tables (the documented clobber). **Decision 2026-07-22: this worktree develops against its own Neon DB branch** — set `DATABASE_URL` in `sl-i18n-en/.env.local` to the branch BEFORE the first dev-server boot with localization enabled. Prod ships via a real migration + the EN seed pass.
- **Translation deliverable**: ~1,100 lines of module copy + 3 case studies + 3 legal pages, machine-translated with a human-vibe pass (approved approach). Voice risk is real (playful Polish → flat English); the vibe pass is part of the definition of done, not optional.
- **Sequencing**: independent of `sl-hero-montage` and `sl-services-media` at the file level except `lib/content/home.ts` — this change only *reads* its types (new `.en.ts` files), so no conflict expected. Worktree `sl-i18n-en` on PORT 3003.
- **No new runtime dependencies.**
