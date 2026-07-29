# Proposal — add-english-blog

## Why

The English locale (`add-english-locale`) deliberately shipped without the blog. That was a scope decision, not an oversight, and it is written into `openspec/specs/site-i18n/spec.md` in three places: a requirement that "the English menu, footer, and homepage SHALL contain no links to the blog or categories", a locale-toggle rule whose worked example is "a path with no English counterpart (e.g. a blog post)", and the parenthetical "the posts collection is not localized".

That decision has aged out. Every other content surface now exists in English — 12 industry pages, the services index plus seven service pages, 48 case studies (`add-case-study-en-translations`, archived 2026-07-28), the contact flow, the legal pages. The blog is the last Polish-only island, and it is the site's largest body of content: **79 published posts, 53,709 words of body prose** (measured against the live Payload documents, not the pre-repair WordPress HTML). An English visitor gets a full marketing site and then a menu with no blog in it.

This change reverses the exclusion and translates the corpus.

## What Changes

### Capability

- **`posts` becomes a localized collection.** `title`, `excerpt`, `content`, `slug`, and the `seo` group's `metaTitle`/`metaDescription` gain `localized: true`. `cover`, `category`, `author`, `publishedAt`, and `seo.ogImage` stay shared — a translation is a language change, not an editorial or media change.
- **`categories` gains localized `title` and `slug`**; `authors` gains localized `role` and `bio`.
- **Schema lands via a hand-reviewed migration, never via schema push.** `postgresAdapter` gets `push: false`. See design D1 — this is the highest-risk item in the change and the one that most needs review.
- **New English routes**: `/en/blog`, `/en/blog/page/{n}`, `/en/blog/{en-slug}`, `/en/blog/category/{en-slug}`, `/en/blog/category/{en-slug}/page/{n}`.
- **English chrome reversal**: BLOG enters the English mega-menu and footer, and `/en` renders the NewsLAMA latest-post section (`lib/content/home.en.ts` has no `news` export today).
- **The blog's shared components become locale-aware** rather than being duplicated — the same `chrome` + `basePath` + `locale` prop pattern `case-study-article.tsx` already established.

### Content

- **All 79 posts translated to English**, plus their titles, excerpts, meta descriptions, and a newly authored English slug each.
- **Translation runs as a batched agent workflow with independent verification** (design D4/D5): every post is translated by one agent and adversarially checked by a different agent that never saw the translation being produced, plus a mechanical structural gate in code between them.

### Explicitly not changing

- **No Polish URL moves.** `/{slug}`, `/blog`, `/category/*` are untouched. The WordPress parity constraint (`wp-import`, "slug (exact)") is preserved intact.
- **No media re-upload, no new creative decisions.** Covers, in-body images, and OG images are shared across locales by ID.
- **No editorial re-litigation.** English is a faithful rendering of approved Polish copy, not a rewrite.

## Capabilities

### New Capabilities

<!-- none — every affected capability already exists -->

### Modified Capabilities

- **`site-i18n`** — the blog-exclusion requirement is removed and replaced; the locale toggle now maps blog paths; the "posts collection is not localized" parenthetical is struck; the localized SEO surface grows blog URLs.
- **`payload-cms`** — the posts and categories collection requirements gain localization; a new requirement forbids destructive schema push for localization changes.
- **`blog-post-page`** — English post pages at `/en/blog/{en-slug}`, with locale-correct dates, anchors, and hreflang.
- **`blog-hub`** — English hub, pagination, and category listings.
- **`blog-content-integrity`** — the formatting audit becomes locale-aware (it silently passes English today), the Polish `nbsp` rule is scoped to Polish, and a new requirement governs translation structural fidelity.
- **`blog-structured-data`** — `inLanguage` and the breadcrumb follow the locale.
- **`blog-authors`** — localized role and bio; an English house byline.
- **`blog-hub-curation`** — curation slots are per-locale; English ships empty and degrades to the defaults the capability already requires.
- **`seo-url-parity`** — records explicitly that English URLs are out of the WordPress parity gate's scope and are covered by the locale-routing sweep instead.

## Impact

### Risk concentrated in one place

`migrations/20260722_203953_add_case_study_localization.ts:11` — the repo's only localization migration — opens with `TRUNCATE TABLE "case_studies", "_case_studies_v" CASCADE;`. Its own header comment records that this was safe because only three seeded rows existed. **There is no precedent in this repo for localizing a populated collection**, and `payload migrate:create` generates `CREATE TABLE` followed by `DROP COLUMN` with no data-copying step between them.

Compounding it, `payload.config.ts:26-30` constructs `postgresAdapter({ pool })` with no `push` key, so Payload defaults to `push: true` outside production. As the code stands, adding `localized: true` and booting any dev server drops `posts.title`, `posts.excerpt`, and `posts.content` with no backfill — 79 posts and their full version history, including the embed-link repair, the formatting repair, and the guest-author backfill.

The same migration localizes `categories` and `authors`, so it carries the same hazard for them. Losing `categories.slug` would be worse than it sounds: those slugs must match the live WordPress `/category/{slug}` paths exactly, and `posts.category` is a required relationship.

Turning push off has its own cost, discovered during review: the dev database's migration ledger holds 5 rows against 8 migration files, because push — not `payload migrate` — built its schema. With push disabled, `payload migrate` would try to re-apply three already-applied migrations and fail on "column already exists", leaving dev with no schema path at all. Reconciling that ledger is a phase-1 gate.

Phase 1 exists to close all of this before any field is touched.

### Content surface

- ~1,889 translatable blocks across the corpus (1,065 paragraphs, 416 headings, 388 list items, 20 quotes), carrying 184 links and 183 upload nodes that must survive byte-identical.
- 802 of 3,225 text nodes carry a non-zero format bitmask. Translating at text-node granularity would fragment a quarter of the prose across bold/italic boundaries — design D3 rejects that approach.

### Follow-ups deliberately left out

- **Newsletter segmentation.** `mailchimpSubscriptionAction` has no locale or list segment, so English sign-ups land in the Polish audience. Accepted for this change; worth a separate one.
- **`en` is not in the reserved-slug list.** A post slugged `en` is already permanently shadowed by `app/(frontend-en)/en/page.tsx` — a live latent bug that predates this change. Fixed here because this change touches that file anyway.
- **`o-nas` is also missing from `STATIC_ROUTES`.** Pre-existing, unrelated, flagged not fixed.

### Sequencing conflict

`add-industries-hub` is unarchived and carries a `site-footer` delta with the scenario "English footer omits blog surfaces", plus a `site-i18n` delta that retains the blog-post toggle fallback. Whichever change archives second must reconcile those two requirements. See design D9.

## Gates & Non-Goals

- **No English page ships until it is genuinely translated.** Payload's global `fallback: true` means an untranslated English field renders Polish — under `<html lang="en">`, with English OG tags, English JSON-LD `inLanguage`, a sitemap entry, and a reciprocal hreflang pair. That is the worst available SEO outcome and the change's primary gate exists to prevent it (design D6).
- **Non-goal**: English-only posts with no Polish original. Every English post is the counterpart of a Polish one in this change.
- **Non-goal**: author archive routes, in either locale.
- **Non-goal**: re-deriving or correcting Polish content. If a translation surfaces an error in the Polish original, it is reported, not silently fixed.
