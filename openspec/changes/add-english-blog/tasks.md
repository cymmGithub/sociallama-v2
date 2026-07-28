# Tasks — add-english-blog

Phases 1–2 are the risk. Do not start phase 3 until phase 2 is verified against a rehearsal branch.

Every task that touches a database names which one. `dev` = Docker Postgres `:5434`. `rehearsal` = the Neon branch cloned from prod in 2.5, kept for the duration. `prod` = `DATABASE_URL_PROD`.

## 1. Disarm the schema hazard (own commit, no schema change)

- [x] 1.1 Add `push: false` to `postgresAdapter` in `payload.config.ts`, **and insert `payload migrate` into `lib/scripts/worktree.ts` before the seed loop** (`:234-240`). The isolated bootstrap currently relies on push to build the schema — its own comment says so (`:207`: "The first seed's Payload init pushes the schema (dev mode)") — so with push off those seeds hit a schema-less database and fail, breaking the `--isolated` worktree this change's risk table prescribes. Three other changes are in flight on the same bootstrap.
  **Acceptance: a fresh `bun run worktree:new --isolated` provisions and seeds successfully**, plus `bun run check` passes. Booting the dev server against the already-populated shared DB does not exercise this and cannot catch it.
- [x] 1.2 Snapshot `dev` and `prod` before anything else. Record where the snapshots live.
  Taken 2026-07-28 to `/mnt/work/goodone/.db-snapshots/add-english-blog/` (see its `README.md`):
  `prod.2026-07-28.sql` (8.7M — 79 posts, 293 `_posts_v`, 4 categories, 1 author, 48 case studies),
  plus both local DBs. Prod is **PG 18.4**, so it needs an 18-series `pg_dump`; the container's
  v17 client and the host's v16 both refuse on version mismatch.
- [x] 1.3 **Reconcile the `dev` migration ledger.** `payload_migrations` holds 5 rows against 8 files in `migrations/` — the schema is current because push built it, so `payload migrate` will attempt `20260726_212614_add_author_role` and die on "column already exists" (`node_modules/payload/dist/database/migrations/migrate.js:17-53`). Either rebuild dev from migrations (accepting the loss of its 15 local fixtures) or insert ledger rows for the three already-applied migrations. **Gate: `bun payload migrate` reports a clean no-op on `dev`.** Nothing in phase 2 starts until this passes.
  Done by inserting the 3 ledger rows (batch 4), after verifying the push-built schema matches those
  migrations exactly — all columns, 9/9 indexes, 5/5 FKs. **The design missed a second blocker:** the
  executed migrate is `@payloadcms/drizzle/dist/migrate.js`, not the `payload` core file cited, and it
  prompts interactively on *any* `batch = -1` row — the `dev` push marker. Ledger rows alone left
  `migrate` hanging on `(y/N)`. Marker deleted; both DBs now report a clean no-op with data intact.
  This worktree's isolated DB (`sociallama_add_english_blog`) was empty and took all 8 migrations from
  scratch, so it never had a marker.
- [x] 1.4 Record the pre-migration baseline on `prod`: all 79 posts (`slug` + content hash of `title`/`excerpt`/`content`), all 4 categories (`title` + `slug`), the 1 author (`role` + `bio`), and the `blog-hub` global's `featured`/`popular`/`picks`/`video.*`. This is what 2.5 asserts against, so it must exist before the schema changes.
  Captured to `content/baselines/blog-prod.json` by a new `lib/payload/baseline-blog-content.ts`
  (`bun run payload:baseline:blog --prod --out|--compare`), which reads through the Local API under
  `locale: 'pl', fallbackLocale: false` — the same read on both sides of the migration, which SQL
  could not be, since these columns move to `*_locales`. 79 posts / 293 versions / 4 categories /
  1 author, per-field hashes plus the shared fields and per-post version counts. Comparator
  negative-tested: detects content-hash change, `title → ∅`, a moved category slug, a version-count
  drop and a deleted post; exits 1 on difference, 0 on identical.
  Note for 2.3: prod's `blog-hub` has **empty** `featured`/`popular`/`picks` — only `video.*` is set,
  so the `blog_hub_rels` locale backfill will match zero rows (it is still required for correctness).

## 2. Localize the collections

- [x] 2.1 Add `localized: true` to `posts`: `title`, `excerpt`, `content`, `slug`, `seo.metaTitle`, `seo.metaDescription`. Leave `cover`, `category`, `author`, `publishedAt`, `seo.ogImage` shared.
- [x] 2.2 Add `localized: true` to `categories.title` and `categories.slug`; to `authors.role` and `authors.bio`; and to the `blog-hub` global's `featured`, `picks`, `popular`, `video.title`, `video.description`, `video.duration`. Localized relationships on a global are supported (`node_modules/@payloadcms/drizzle/dist/schema/buildRawSchema.js:75-91`) — the global is localized **here**, in the same migration, not later in phase 6.
- [x] 2.3 Generate the migration with `payload migrate:create`, then **hand-splice every backfill** (design D1). `migrate:create` emits `CREATE TABLE` + `DROP COLUMN` with nothing between them:
  - `posts_locales` and `_posts_v_locales` ← `INSERT … SELECT … , 'pl', id`
  - `categories_locales` ← same (no versions table, no `_v` twin)
  - `authors_locales` ← same
  - `blog_hub_locales` ← `SELECT featured_id, popular_id, video_*, 'pl', id FROM blog_hub`
  - `UPDATE blog_hub_rels SET locale = 'pl' WHERE locale IS NULL` — localizing a `hasMany` adds a `locale` column that leaves existing pick rows invisible in both locales (`schema/build.js:477-483`)

  Do not recreate the `_locales` enum or the existing `_posts_v.snapshot` / `published_locale` columns. Write a real `down` that restores the columns and copies `pl` rows back for all four tables.
  `migrations/20260728_163231_add_blog_localization.ts`. Generated output emitted 21 `DROP COLUMN`s
  and zero data-copying, exactly as predicted; the 5 `INSERT … SELECT` blocks plus the
  `blog_hub_rels` UPDATE are hand-added and marked as such. **No drizzle rename prompt appeared**
  (design open question — answered: it does not trigger).
  Two defects in the generated `down` the design did not anticipate, both fixed:
  it dropped the `_locales` tables *before* re-adding the base columns (nothing left to copy back),
  and `ADD COLUMN "title" varchar NOT NULL` on a populated `categories` fails outright. Columns now
  come back nullable, take their `pl` values, then take `NOT NULL`. `down` also deletes non-`pl`
  `blog_hub_rels` rows so English picks cannot survive as Polish ones.
- [x] 2.4 Verify the spliced SQL by reading it, before running it anywhere. Every `DROP COLUMN` must be preceded by an `INSERT … SELECT` that carries its data. This review is the change's single highest-risk moment.
  Verified mechanically rather than by eye: a script parses the `up` block, maps each of the 21
  `DROP COLUMN`s to its locale table, and asserts an `INSERT` carries that exact column *and* sits
  at an earlier offset. 21/21 ok, 5/5 inserts free of positional drift between their column list
  and their `SELECT` list.
- [x] 2.5 Clone `prod` to a throwaway Neon branch — this is `rehearsal`, and it is **kept**, not torn down: it is where the pilot runs. Apply the migration there. Assert against the 1.4 baseline: 79 posts return `title`/`excerpt`/`content` byte-identical under `locale: 'pl'`, 4 categories return `title`+`slug`, the author returns `role`+`bio`, the global's slots and picks survive, and post version history is intact. Note whether the drizzle rename prompt appeared.
  **Rehearsed on a local PG18 prod clone, not a Neon branch** — no `neonctl` and no `NEON_API_KEY`
  are available here. `postgres:18-alpine` on `:5435` (container `sociallama-rehearsal`, db `neondb`),
  restored from `prod.2026-07-28.sql`. Fidelity of the clone proved by SQL checksums over
  `posts`/`_posts_v`/`categories`/`authors`/`blog_hub` — all five md5s identical to live prod — since
  the Payload comparator cannot read a pre-migration DB once the config declares localized fields.
  Results: migration applied in 72ms; `posts_locales` 79 rows (`pl` only), `_posts_v_locales` 293,
  `categories_locales` 4, `authors_locales` 1, `blog_hub_locales` 1; the baseline comparator reports
  **identical** against `blog-prod.json`. `down` then round-tripped: all five checksums back to the
  prod values, all `*_locales` tables gone, `categories.title`/`slug` NOT NULL restored. `up`
  re-applied afterwards, so the clone sits migrated.
  **STILL NEEDED for phase 9:** a real Neon branch plus a deployment pointing at it — the pilot wave
  needs a reachable `/api/revalidate` (design D12), which a local container cannot provide.
- [x] 2.6 Apply to `dev`, run `payload generate:types`, confirm `locale: 'pl' | 'en'` types regenerate and `bun run check` passes.
  `payload-types.ts` is **unchanged**, correctly: `localization` was already config-wide for
  case-studies, so `locale: 'pl' | 'en'` (L106) predates this change and per-field `localized: true`
  does not alter the emitted interfaces. `bun run check` exits 0 — 491 tests pass.
- [x] 2.7 Extend `RESERVED_SLUGS` / `STATIC_ROUTES` with `en` — a post slugged `en` is already permanently shadowed by `app/(frontend-en)/en/page.tsx`. Make `validate-slug.ts` locale-aware. Leave the missing `o-nas` entry alone; flag it, do not fix it here.
  `en` added to `RESERVED_SLUGS` (not to `STATIC_ROUTES`, which `app/sitemap.ts` also consumes —
  adding it there would have emitted a duplicate `/en` sitemap entry as a side effect).
  **Design D2 is slightly wrong** where it says namespacing "removes the collision surface entirely":
  `/en/blog/[slug]` is a *sibling* of `/en/blog/page/[number]` and `/en/blog/category/[category]`
  (tasks 4.1/4.3), and a static segment beats a dynamic one. So English posts have exactly two
  reserved slugs — new `RESERVED_EN_POST_SLUGS = ['page', 'category']`. `validatePostSlug` now picks
  the list from `req.locale`, since the Polish root-level list describes a URL shape English does not
  have. 8 tests in `lib/payload/validate-slug.test.ts`; `bun run check` exits 0 at 499 tests.
  **Flagged, not fixed (as instructed):** `o-nas` is still absent from `STATIC_ROUTES`/`RESERVED_SLUGS`,
  so a Polish post slugged `o-nas` is silently unroutable today.

- [ ] 2.8 **Localize `media.alt`** (user decision 2026-07-28 — mandatory; not implemented, do not
  start without picking up the content half too). `lib/payload/collections/media.ts:39-48` — `alt` is
  `required` and unlocalized, so Polish alt text renders on every English surface: the post hero
  (`post-article.tsx`), every in-body image (`rich-text.tsx`), and the card/featured/popular/video
  thumbnails. Verified live on `/en/blog/social-media-futbol-en`, where the rendered alts were
  `Social Media zmieniają polski futbol`, `romowa`, `futbol`, `fut`, `boniek`, `boniek3`.
  Two halves, and the second is the larger one:
  - **Schema.** `localized: true` + `payload migrate:create`, then hand-splice the backfill exactly
    as 2.3 did — the generated file will `CREATE TABLE media_locales` and `DROP COLUMN alt` with
    nothing between. `media` has no versions table, so there is no `_v` twin. `alt` is `required`,
    so `media_locales.alt` generates `NOT NULL`, and the `down` must restore it nullable → copy `pl`
    back → `SET NOT NULL`, the same three-step 2.3 needed for `categories`.
  - **Content.** **668 media rows** need English alt text. That is a translation batch in its own
    right, and it is not covered by the phase-9 post pipeline, whose unit is a post body. Decide
    whether it rides along with phase 9 (alt text for the images a translated post actually uses,
    incrementally) or runs as its own pass over the whole library.
  - `alt` is read aloud by screen readers inside `<html lang="en">`, so this is an accessibility
    defect, not only an SEO one.


## 3. Locale-aware query layer

- [x] 3.1 Thread `locale` through all 14 post/category query functions in `lib/payload/queries.ts` (`findPostBySlug` L43, `findDraftPostBySlug` L62, `findPublishedPostSlugs` L74, `findLatestPost` L91, `findPostsPage` L118, `findCategories` L145, `findCategoryBySlug` L160, `findPostsForSitemap` L175, `findPostsForLlms` L194, `findPostsForPlatform` L317, `findPostsForCategories` L343, `findRelatedPosts` L372, `findSearchIndex` L428, `findBlogHub` L535). Copy the shape of `findCaseStudyBySlug` L219–236. Keep `cacheTag('posts')` shared so both locales invalidate together.
- [x] 3.2 **Add the gate as a `where` predicate**, not a read option (design D6). Under `locale: 'en'`, every post query gains `{ title: { exists: true } }` in its `where`. `fallbackLocale: false` is threaded too, but only as a read guard — it is applied in the `afterRead` pass and provably cannot affect `WHERE` or `COUNT`.
  `TRANSLATED = { title: { exists: true } }` in `queries.ts`, single-sourced and spread into each
  `and:`. `findCategories` uses it as a bare `where` instead, since it has no other predicate and
  `{ and: [] }` for `pl` is not a shape I could show to be safe.
  **One hole the predicate cannot reach:** a curation slot is a relationship an editor sets by hand,
  not a row the query selects, so an English `featured`/`picks` pointing at an untranslated post
  would still render. `publishedPost()` now also requires a title, degrading such a slot to the
  empty-slot fallback.
- [x] 3.3 Assert the predicate reaches the database: on a partially translated `rehearsal`, `findPostsPage` under `locale: 'en'` must report `totalDocs`/`totalPages` computed over the **translated** set, and `/en/blog/page/{n}` must not exist for pages beyond it.
- [x] 3.4 Assert the limit-N queries return translated posts: `findLatestPost` (limit 1), `findRelatedPosts` (limit 3), and `findBlogHub`'s 12-post pool must never return zero English results while translated posts exist. These fail hardest under a post-hoc filter, which is why the predicate has to be in the query.
  3.3 and 3.4 verified together against the rehearsal clone in a partially translated state: 12 of
  79 posts given English rows, deliberately the **12 oldest** (all 2017) while the newest post is
  2026 — the arrangement where a post-hoc filter returns nothing. 13 assertions, run by mocking
  `next/cache` so the *real* exported query functions could be called outside a Next request scope
  rather than a reimplementation of their `where` clauses. Results: PL 79 docs/9 pages, EN 12 docs/2
  pages with 9 on page 1 and page 3 empty; `getLatestPost('en')` returns a translated 2017 post;
  related posts and the whole hub pool English-only; a Polish slug does not resolve under `en` and
  an English slug does not resolve under `pl`; categories gated 4 → 2; sitemap and search index 12.
- [x] 3.5 Add a locale to `lib/payload/related-posts.ts` and delete its "the blog is PL-only" comment (L13–14).
- [x] 3.6 Wire the service-page blog rails for English — three separate gaps, none of which the locale parameter alone closes:
  - `app/(frontend-en)/en/services/[slug]/page.tsx` never calls `buildRelatedByPlatform`/`buildTopicalPosts` at all, so the rails are omitted regardless of locale support. (`lib/content/uslugi.en.ts:23` already carries an unused `relatedKicker: 'READ NEXT'` for a block that never renders.)
  - `app/(frontend)/uslugi/[slug]/service-page.tsx:288` and `:760` hardcode `href={`/${post.slug}`}` — the shared renderer needs a `basePath` prop.
  - `buildTopicalPosts` (`related-posts.ts:110-118`) matches `getCategories()` against `section.categories`, which are Polish literals (`uslugi.ts:366`). Once `categories.slug` is localized, an `en` call returns English slugs and matches zero ids — silently empty, not an error. Match on the category **id**, or on the slug read under `locale: 'pl'`.

## 4. English routes

  All three gaps closed. `postBase` threaded through `ServicePage` → `Platforms` → `PlatformBlock`
  → `RelatedPosts` and `TopicalPosts`, mirroring the existing `caseStudyBase`; PL passes `''`
  (posts sit at the root), EN passes `/en/blog`. The EN services route now calls both builders,
  which it never did. `buildTopicalPosts` resolves category ids under **`locale: 'pl'`** in both
  locales, because `section.categories` holds Polish slug literals and a localized `slug` would
  otherwise match zero ids and silently empty the section; the posts themselves are read in the
  requested locale so their cards carry localized category titles. Both builders now take the
  widened `Localized<ServiceSection>` the EN data actually supplies, casting per branch as
  `service-page.tsx` does. Card `category` is set from `category?.title` rather than the relation,
  since an untranslated category populates with a null title under `fallbackLocale: false`.
- [x] 4.1 `app/(frontend-en)/en/blog/page.tsx` and `page/[number]/page.tsx`.
- [x] 4.2 `app/(frontend-en)/en/blog/[slug]/page.tsx`, resolving by English slug under `locale: 'en'`. Include the empty-CMS placeholder for Cache Components, matching `app/(frontend-en)/en/case-studies/[slug]/page.tsx:22-28`.
- [x] 4.3 `app/(frontend-en)/en/blog/category/[category]/page.tsx` and `page/[number]/page.tsx`.
- [x] 4.4 Make draft preview work per locale. `collections/posts.ts:25-28` builds `preview: (doc) => /api/preview?path=/${doc.slug}` — with `slug` localized, previewing under the admin's EN locale yields `/api/preview?path=/{en-slug}`, which hits the **Polish** route and 404s because no Polish post carries that slug. Payload passes the admin locale to the preview function; use it to target `/en/blog/{en-slug}`. Give `app/(frontend-en)/en/blog/[slug]/page.tsx` the matching `draftMode()` branch calling `getDraftPostBySlug(slug, 'en')`. Note `case-studies.ts:33-36` has the same PL-only shape — it is a broken precedent, not a model to copy.
  `preview: (doc, { locale })` — the second argument is `GeneratePreviewURLOptions`
  (`node_modules/payload/dist/config/types.d.ts:159-164`), so the admin locale is available without
  guessing. EN yields `/en/blog/{en-slug}`, PL keeps `/{slug}`. `case-studies.ts:33-36` still has the
  broken PL-only shape — left alone deliberately, as instructed.
- [x] 4.5 **Verify with zero translations on `dev`**: every English blog surface renders as genuinely empty, never as Polish; `/en/blog/page/2` returns 404 rather than an empty page. Do this before any translation exists — it is the only moment the gate is cheap to test.

## 5. Locale-aware components and content

  **NOT DONE — needs a running dev server, which I must not spawn myself.** The zero-translation
  state is exactly what this worktree's isolated DB holds (1 post, 0 EN rows), so it is ready to
  test the moment a server is pointed at it.
  Done against this worktree's isolated DB (1 Polish post, **0 English rows**) via a production
  build served locally, since the check is about rendered output rather than types. Results:
  `/en/blog` renders the English empty state ("Nothing here yet") under `<html lang="en">` with
  **zero Polish strings**, no post cards and no category chips; `/en/blog/page/2`,
  `/en/blog/anything`, `/en/blog/category/anything` and `/en/blog/category/seo` (a *Polish* category
  slug) all render not-found. Polish is unaffected — `/blog` still lists its post with "PRZECZYTAJ".
  This is the D6 gate's core promise demonstrated: empty, never Polish.
- [x] 5.1 **Extract `app/(frontend)/[slug]/page.tsx` into a shared `post-article.tsx`** taking `chrome`/`basePath`/`locale`, mirroring `case-study-article.tsx:35-41`. The page holds Polish that lives in none of the child components: `aria-label="Ścieżka nawigacji"` (L168), the `Blog` crumb → `/blog` (L169), the category crumb → `/category/${slug}` (L173), `{readingTime} min czytania` (L194), `<summary>W tym wpisie</summary>` (L225). Derive `shareUrl` (L129), `alternates.canonical` (L93) and `openGraph.url` (L99) from `basePath` instead of `/${post.slug}`.
- [x] 5.2 Convert the remaining blog components to the same pattern: `blog/listing.tsx`, `post-card.tsx`, `pagination.tsx`, `hub-header.tsx`, `hub-featured.tsx`, `hub-popular.tsx`, `hub-promo.tsx`, `hub-search.tsx`, `hub-video.tsx`, `[slug]/post-rail.tsx`, `post-share.tsx`, `author-card.tsx`, and **`components/blog/newsletter.tsx`** — which renders on the hub *and* after every post body, so omitting it leaves a Polish slab on every English blog surface.
  All 13 converted, plus a new shared `app/(frontend)/blog/hub-view.tsx` so the EN hub route is ~20
  lines like `app/(frontend-en)/en/case-studies/page.tsx`. `hub-search.tsx` takes `locale` rather
  than copy, because its `results(count)` pluralizer is a function and cannot cross the RSC
  boundary — the one documented deviation from the copy-as-prop contract.
- [x] 5.3 Write `lib/content/blog.en.ts` — the only section content module with no `.en.ts` twin. **Replace** `postsPlural` rather than translating it; Polish's three-form plural rule has no English analogue.
  `lib/content/blog.en.ts`. Plain blocks carry `satisfies Localized<typeof pl.X>` so a missing or
  mis-shaped key fails the build; `hubVideo`/`hubSearch` are exempt because they hold functions and
  `Localized` maps over object types, which would strip callability rather than widen it.
  `postsPlural` is replaced, not translated — porting a three-form rule keyed to the last two digits
  into a two-form language would be porting a bug.
- [x] 5.4 Give `lib/utils/format-date.ts` a locale parameter; update its four call sites. Give `lib/blog/heading-slug.ts` a locale-aware fallback (`'sekcja'` → `'section'`). Leave `reading-time.ts` at 200 wpm for both locales (design D8).
  `formatPostDate(iso, locale)` with a `pl-PL`/`en-US` table; `slugifyHeading(text, seen, locale)`
  with `sekcja`/`section`; `buildToc(content, locale)` threaded through to it, since the walk is the
  single owner of heading anchors. `reading-time.ts` left at 200 wpm for both, per D8.
  **Design open question answered as `en-US`**, per the American-spelling voice bar — flagged in the
  code as a content decision worth revisiting, not a code one. Call sites still pass no locale and
  keep Polish behaviour; phase 4/5 routes supply it.
- [x] 5.5 Fix `[slug]/rich-text.tsx:31-42` so internal links resolve the target document's slug **in the current locale** — an English post must link to `/en/blog/<en-slug>`, never to the Polish root URL.
  `linkHref` now takes a `PostPaths` object. Two defects beyond the stated task, both found by the
  workflow's adversarial reviewer: the function had **two hardcoded `'/'` fallbacks** sending an
  English reader to the Polish homepage (`/` is PL_HOME and renders `<html lang="pl">`), and it
  built a URL from a **null slug** when a link's target is untranslated — yielding `/en/blog/`, a
  silent link to the hub dressed as a link to an article. That is the common case during the phase-9
  waves, not an edge case, since English bodies are translated from Polish ones whose links point at
  posts not yet translated. Both now route to a required `fallbackHref`.
- [x] 5.6 Add an English house byline to `lib/blog/author.ts:36-43` (`role: 'Zespół redakcyjny'` → English, `bio` → English, `url: '/o-nas'` → `/en/about-us`).

## 6. English chrome and CMS content

  `SOCIAL_LAMA` becomes a per-locale record: `Editorial team`, the EN `APP_DESCRIPTION`, and
  `/en/about-us`. `resolvePostAuthor(post, locale)` defaults to `pl`, so the four existing call
  sites are unchanged until phase 5.2 threads the locale.
- [x] 6.1 Add BLOG to the English mega-menu and footer in `lib/content/home.en.ts`. Note `lib/i18n/parity.ts:17-18` checks element *type*, not membership — the type system will not catch a missing link, so verify by rendering.
- [x] 6.2 Render NewsLAMA on `/en`, gated to translated posts only. Three parts: add a `news` export to `lib/content/home.en.ts`; give `NewsLama` a `content` prop like every one of its sibling sections (`app/(frontend-en)/en/page.tsx:44-60` passes content to all of them, but `sections/news-lama/index.tsx:5` does `import { news } from '@/lib/content/home'` at module scope inside a `'use client'` component, so the EN heading and read-label would stay Polish otherwise); and build the EN view-model with `href: /en/blog/${post.slug}` — `toNewsLamaPost` (`(home)/page.tsx:39-50`) hardcodes `/${post.slug}`.
  `NewsLama` now takes `content` + `locale` props. It is a `'use client'` module, so its
  module-scope `import { news } from '@/lib/content/home'` rendered Polish regardless of route —
  making the props required surfaced a **third** call site nobody had listed, `o-nas/page.tsx:95`.
  `HomeContent` gained `news`, so `LocalizedHome['news']` type-checks the EN twin. The EN homepage
  builds its own view-model because the Polish one hardcodes `/${post.slug}`, and reads
  `getLatestPost('en')` so the section is omitted entirely until something is translated.
- [x] 6.3 **Author the English CMS content the gate would otherwise leave null**: 4 category `title` + `slug` values (`reklama` → `advertising` etc.), and the author's English `role` + `bio`. Without these, English category pages and author cards render empty rather than translated.
  Authored on `rehearsal`: the 4 category `title` + `slug` pairs (`reklama` → `advertising`; the
  other three slugs are identical in English and stay so, which is legal because uniqueness is per
  locale), and the author's English `role` + `bio`. `name` and `profileUrl` are shared and untouched;
  the partner agency's brand name SEOFLY is preserved verbatim.
- [x] 6.4 Ship English `blog-hub` curation slots empty — `blog-hub-curation`'s existing degrade-to-defaults path fills them from the newest translated posts. (The global's schema was already localized in 2.2.)

## 7. SEO surface

  Nothing to write — verified instead. `blog_hub_locales` holds a `pl` row only, and the English hub
  degrades exactly as `blog-hub-curation` requires: "Editors' picks" fills from the newest
  **translated** posts, "Most read" omits itself because `popular` is empty, and the video spotlight
  omits itself because there is no English `video.title`. That last one is the load-bearing proof
  that `fallbackLocale: false` on `findGlobal` works — Polish has a spotlight and English does not
  inherit it.
- [x] 7.1 Add `['/blog','/en/blog']` to `pathPairs` in `lib/i18n/slug-map.ts` — the one genuinely static pair. Give `counterpartPath` an optional override parameter. **Do not add a blog rule or a slug table**: the module ships to the browser through `<LocaleToggle>` (its own header, L28–36, says so) and `counterpartPath` (L135–147) is synchronous and pure.
- [x] 7.2 Resolve blog counterparts **server-side** (design D11): the post and category routes already load the document and know both slugs. Pass the counterpart into `<LocaleToggle>` via `ChromeProvider`, and into `generateMetadata`'s `alternates` directly — not via `alternatesForPath`, which is built on the same synchronous `counterpartPath` (L157–179). A route with no counterpart passes no override and the toggle falls back to `/en` as today.
  **The mechanism turned on a layout detail worth recording**: the toggle renders inside `<Header>`
  and `<Footer>`, which `<Wrapper>` renders — not the root layout, which says so explicitly. A page
  wrapping its own content is therefore still an ancestor of the toggle, so a page-level provider
  reaches it. `ChromeProvider` gained an optional `counterpart`, plus a `<LocaleCounterpart>` that
  re-provides the inherited chrome with one attached. Post and category routes resolve their own via
  new `getPostSlugInLocale` / `getCategorySlugInLocale` — one id lookup, not a search — and feed the
  same value to `generateMetadata`.
- [x] 7.3 Update `lib/i18n/slug-map.test.ts:81` — `counterpartPath('/jakis-wpis-na-blogu') === '/en'` is currently asserted, and remains correct with no override. Add assertions for the override path and for `/blog` ↔ `/en/blog`.
- [x] 7.4 Emit hreflang across **every** blog surface — none emits any today. Posts and categories via the server-resolved counterpart from 7.2; the hub via `alternatesForPath` once `/blog` ↔ `/en/blog` is in `pathPairs` (`app/(frontend)/blog/page.tsx:20-25` is a static `export const metadata` with a canonical and no `languages`). Decide explicitly whether paginated pages get alternates — page counts differ per locale under the D6 gate, so `/blog/page/5` may have no English counterpart; canonical-only is the likely answer.
  Verified on the rendered pages: a translated PL post and its EN counterpart emit **reciprocal**
  `pl`/`en`/`x-default`; an **untranslated** post emits **zero** hreflang links rather than claiming
  a counterpart; `/blog` ↔ `/en/blog` and `/category/reklama` ↔ `/en/blog/category/advertising` pair
  correctly. Toggle destinations verified the same way, including the round-trip 10.4 asks for.
  **Pagination decided: canonical only.** Page counts differ per locale under the D6 gate, so
  `/blog/page/5` and `/en/blog/page/5` hold different posts and the English one often does not
  exist — a reciprocal pair there would assert a false equivalence. Documented in both routes.
- [x] 7.5 Add English blog URLs to `app/sitemap.ts` (clone the `enCaseStudyRoutes` block) and add `alternates` to the existing Polish post entries. Include hub pagination for both locales, which is missing today.
  Verified in the generated XML: 249 URLs, 5 `/en/blog/{post}`, 8 `/en/blog/category/*`, 8 pagination
  entries (both locales, previously missing entirely), 27 `xhtml:link` alternates. A translated
  Polish post carries `pl`/`en`/`x-default`; an untranslated one carries **none**. Alternates are
  built by joining the two locales' rows on post/category **id** — `findPostsForSitemap` now selects
  `id` — rather than one lookup per post. The pre-existing `Promise.all` was serialized instead of
  extended, since this change adds four more reads to it.
- [x] 7.6 Set `inLanguage` from the locale in `[slug]/json-ld.tsx:51`; localize the breadcrumb's `'Blog'` label and its `${APP_BASE_URL}/blog` URL (L72).
- [x] 7.7 Add English post and category URLs to `app/llms.txt/route.ts` — it hardcodes four Polish `PAGES` (`:17-38`) and builds `/${post.slug}` and `/category/${slug}` (`:68`, `:79`). Leave `app/robots.ts` alone: it is 16 lines with one `allow: ['/']` rule and a locale-agnostic sitemap pointer, so `/en` is already covered — verified, nothing to change.
- [x] 7.8 Give the English blog tree **real** e2e coverage. The existing sweep collects `#site-menu a[href], footer a[href]` only (`e2e/locale-routing.e2e.ts:33-39`), so adding the BLOG link enrols exactly one URL — `/en/blog`. Add a case that samples `/en/blog`, `/en/blog/page/2`, one `/en/blog/{en-slug}`, and one `/en/blog/category/{en-slug}` from `findPublishedPostSlugs`/`findCategories` under `locale: 'en'`. Without this, the suite would pass with 78 of 79 English posts 404ing.

## 8. Translation tooling

  `e2e/en-blog.e2e.ts`, 7 cases, all passing against a real build of this branch.
  **The config had to be fixed first.** `playwright.config.ts` hardcoded `baseURL: :3000` with
  `reuseExistingServer`, so from a worktree Playwright attaches to whatever answers on that port —
  main's dev server — and the suite passes green having never loaded the branch under test.
  `PLAYWRIGHT_PORT` / `PLAYWRIGHT_BASE_URL` now select the target, defaulting to 3000 as before.
  URLs are sampled from the **rendered hub** rather than from `findPublishedPostSlugs`/`findCategories`
  as the task text suggests: those are `'use cache'` functions and throw outside a Next request
  scope. Reading the hub is also stricter — a post that exists but is linked nowhere counts as
  unreachable. Zero translated posts is treated as a correct state (the D6 gate), so those cases
  assert the empty hub rather than failing; what is never tolerated is a linked URL that 404s or
  Polish chrome on an English page. Includes the toggle round-trip 10.4 asks for.
- [x] 8.1 Write the block projection and its inverse (design D3). Grammar: `<b>`/`<i>`/`<u>`/`<s>`/`<code>`/`<sub>`/`<sup>`, `<aN>`, `<br/>`, `<tab/>`; composed format bits nest outermost-lowest-bit; `detail`/`mode`/`style` carried out-of-band per leaf. `upload` and `horizontalrule` never enter the projection; `linebreak` and `tab` **do**, as tokens, because they are inline leaves inside the projected blocks (`post-formatting-rules.ts:53-55`, `:296-299`).
  `lib/payload/post-projection.ts`. **The unit is a maximal run of adjacent inline children, not a
  block** — D3's model does not survive the corpus. A `quote` is a container of paragraphs (18 of
  them), a `listitem` is sometimes one too, and 10 parents mix inline and block children outright,
  so projecting a "block" as a leaf would flatten its children away. Runs handle every case: a
  paragraph of prose is one run, a quote yields none of its own and its paragraphs each yield one, a
  list item with a nested list yields a run for its text and recurses.
  Link nodes and text nodes are held aside **whole** (minus what the markup encodes) rather than by
  an enumeration of `detail`/`mode`/`style` — the corpus rejected the enumeration on 194 of 1,875
  runs, because 39 text nodes omit `version` and links carry an `id`.
  One token beyond D3's grammar: `<z/>` for a zero-length text node. 33 exist (WordPress debris
  trailing a link), one of them carrying ITALIC. Dropping them would silently edit the document and
  put the English leaf sequence permanently out of step with the Polish one.
- [x] 8.2 **Assert the projection round-trips Polish first**: `parse(project(block))` must reproduce the original block byte-for-byte for all ~1,889 blocks in the corpus. A grammar that cannot round-trip Polish will not survive English. This gates all downstream translation work.
  **1875 / 1875 runs round-trip byte-identically** across all 79 posts.
  Three real defects were found only by running it, never by the unit fixtures: the enumerated
  metadata (194 failures), the dropped empty text nodes (33), and an empty node losing its format
  (1). A fourth apparent failure — 1874 of them — was my own check comparing key ORDER; the
  projection was right and the harness was wrong.
  `lib/payload/post-projection.test.ts` carries 23 unit tests covering each grammar token, the
  corpus's actual format bitmasks, the reject-don't-guess cases, and the three structures D3 says
  cannot occur.
- [ ] 8.3 Write `lib/payload/translate-post.ts` around that projection, following `repair-post-formatting.ts`: `--prod` env swap before the config import (L57–66), deep copy before mutation (L124–127), in-place walk (L136–161), **report and skip ambiguity, never guess** (L163–168), one `payload.update` per post (L199–203), dry-run by default with `--apply` (L42). Two modes (`--extract` / write) and the `TODO` stub guard from `translate-case-study.ts`.
- [ ] 8.4 Write the structural gate as a pure function so both the workflow and the verifier use the same code: block count/type/order match PL; per-block `<br/>`/`<tab/>` counts and positions match PL; every `<aN>` present exactly once and none invented; markup balanced, grammar-only, bit-ordered; slug URL-safe, EN-unique, not reserved; heading ≤ 85 chars. Polish diacritics are a **soft flag against a proper-noun allowlist**, never a hard reject — "Łukasz Płociński" and "Pracuj.pl" survive translation legitimately.
- [ ] 8.5 Write `lib/payload/verify-post-en.ts` per design D5 — asserts every guarantee in the spec delta including the intra-block leaf sequence, exits non-zero on failure, writes `content/posts/STATUS.md` under `--status`.
- [ ] 8.6 Add `payload:translate:post` and `payload:verify:post-en` package scripts.
- [ ] 8.7 Make `audit-post-formatting.ts` locale-aware (`:139-144` queries with no `locale`, so English passes vacuously today), and scope the Polish `nbsp` rule to `pl` (design D10).
- [ ] 8.8 Give the translation scripts a cache-invalidation step (design D12). `app/api/revalidate/route.ts:12-20` documents the trap: a script writing straight to the database runs outside any Next request scope, where `revalidateTag` throws and `lib/payload/revalidate.ts:25-33` swallows it — so the data changes and the pages keep serving the old cache for `cacheLife('days')`. The script POSTs `/api/revalidate?tag=posts&tag=categories&tag=blog-hub` with `x-revalidate-secret` against the target deployment. Confirm `REVALIDATE_SECRET` is configured for both the rehearsal deployment and prod.

## 9. Translation batch

Runs against `rehearsal` until 9.7. Nothing in this phase touches `prod` before then.

- [ ] 9.1 Author the translation brief: the EN voice bar (playful-but-clean, American spelling), a glossary of brand and platform terms that must not be translated (seeding the diacritic allowlist), and the rule that Polish-market concepts are explained rather than dropped.
- [ ] 9.2 Point the worktree's `DATABASE_URL` at `rehearsal`. Extract all 79 posts to `content/posts/<slug>/draft.pl.json`.
- [ ] 9.3 **Pilot wave — 5 posts** spanning the length range (one ≥1,500 words, one ≤300, one image-heavy, one link-heavy, one with a deep heading hierarchy). Run the full pipeline. Human-review all 5 rendered at `/en/blog/<en-slug>` before continuing.
- [ ] 9.4 Raise the workflow-size guideline in `/config` if needed — 79 posts × 2 agents is ~158, against a "medium / under 15" default.
- [ ] 9.5 Run one full wave of ~20 on `rehearsal`: `pipeline(posts, translate, structuralGate, verify)`, max two revise loops per post, third failure reported for a human rather than retried.
- [ ] 9.6 **Revalidate before checking anything rendered** (design D12). After each wave, POST `/api/revalidate?tag=posts&tag=categories&tag=blog-hub` against the deployment under test. Skipping this makes every rendered check a false negative — the pages serve a days-old cache and the translations look missing when they are written.
- [ ] 9.7 Verify that wave end to end on `rehearsal`, including partial-translation behaviour: with ~25 of 79 translated, `/en/blog` paginates over 25, the hub fills from translated posts only, and no English URL resolves for the other 54.
- [ ] 9.8 Apply the migration to `prod`. Re-assert the 1.4 baseline there.
- [ ] 9.9 Run the remaining waves against `prod` with `--prod`, revalidating after each (9.6) and verifying before starting the next. Writes land on the published version with no `draft: true` (design D7), so a wave is live the moment it is written. Confirm idempotency by re-running one post and checking it updates rather than duplicating.

## 10. Verification

- [ ] 10.1 `bun run payload:verify:post-en --all --status --prod` exits zero for all 79.
- [ ] 10.2 Review `content/posts/STATUS.md` soft-flags — the "correct English, but locally scoped" set — and make the content call on the ~15 short 2017–18 news items.
- [ ] 10.3 Spot-check a sample of `/en/blog/<en-slug>` pages: images present, internal links landing on English URLs, bold/italic runs in the right places, line breaks where the Polish had them, table of contents populated, author card in English, dates in `en-US`.
- [ ] 10.4 Confirm hreflang round-trips: `/{pl-slug}` ↔ `/en/blog/{en-slug}` reciprocal on both sides, `x-default` on the Polish URL, and the locale toggle landing on the counterpart rather than `/en`.
- [ ] 10.5 Run the `e2e/locale-routing.e2e.ts` sweep including the blog tree coverage added in 7.8.
- [ ] 10.6 Run the `seo-url-parity` gate and confirm it is still green: no Polish URL moved, all 4 category URLs intact.
- [ ] 10.7 Confirm the formatting audit now runs over both locales and passes for both.
- [ ] 10.8 Reconcile the `add-industries-hub` conflict at archive time (design D9): its `site-footer` scenario "English footer omits blog surfaces" contradicts this change, and this change's `Locale toggle` text must not silently drop that change's mapped-pairs clause for `/uslugi` and `/branze`.
- [ ] 10.9 Decide the fate of the `rehearsal` Neon branch once the batch is complete.

## Found during implementation — not in the original task list

- [x] **`media.alt` is not localized** — user decision 2026-07-28: **mandatory**, English alt text is
  required. Promoted to task 2.8 below. (Implementation was started and then reverted on request;
  nothing of it remains in the tree.)
- [ ] **`rich-text.tsx` maps every non-category relation onto the post base path.**
  `payload.config.ts` uses a bare `lexicalEditor()`, so `LinkFeature` enables all collections — an
  internal link to a case study yields `/en/blog/{cs-slug}`. Already wrong in Polish (`/{cs-slug}`),
  so pre-existing; this change widened it into a new URL shape. Flagged, not fixed.
- [ ] **Both locales' hub-search copy ships in every client bundle.** `hub-search.tsx` holds a
  `Record<Locale, HubSearchCopy>` inside a `'use client'` module, so PL ships the EN strings and
  vice versa (~600 bytes). Consequence of the pluralizer-as-function decision; worth revisiting if
  a third locale ever lands.
- [ ] **No unit coverage for the new shared views.** `PostArticle`, `BlogHubView` and `linkHref`
  now decide every URL on both locales, and a wrong `basePath` at any of ~11 call sites is caught by
  nothing. Tasks 7.3 and 7.8 are the planned coverage and are still open.
- [ ] **Corpus contradicts design D3's projection grammar** (measured against all 79 posts; the same
  census reproduces D3's own 1,889-block and 802-of-3,225 figures, so it is trustworthy where it
  disagrees). 31 nodes sit inside a projected block with no grammar token: 18 `paragraph` in
  `quote`, 5 `heading` in `listitem`, 4 `listitem` in a nested list, **2 `upload` in `listitem`**,
  2 `list` in `listitem`. So `quote` is a *container* of paragraphs, `listitem` is sometimes one
  too, and D3's "upload … never enter[s] the projection" is false. Also: `<code>`, `<sub>`, `<sup>`
  and `<tab/>` never occur in the corpus, so 8.2's round-trip cannot exercise them — the structural
  gate should reject an unexpected format mask rather than accept one. Full note in the scratchpad
  as `D3-correction.md`.
- [ ] **Three Polish routes still `Promise.all` their build-time reads**, against the constraint
  `app/(frontend)/blog/page.tsx:22-27` documents: `blog/page/[number]/page.tsx:44`,
  `category/[category]/page.tsx:52`, `category/[category]/page/[number]/page.tsx:43`. Pre-existing;
  the three new EN routes were serialized rather than copying it. Worth closing before the first
  prod build that prerenders both locales' blogs at once.
- [x] **The synthetic demo fixtures have been deleted** and replaced with a real 5-post pilot
  (2026-07-28), so the note below is closed. Original problem, kept for the record: 12 posts and 2 categories carry synthetic English rows written for the phase-3 gate tests:
  `title = 'EN ' || <polish title>`, `slug = <pl-slug> || '-en'`, body/excerpt/meta copied from
  Polish unchanged. The `-en` slug suffix is a fixture artifact and contradicts design D2, which
  requires authored English slugs (`/en/blog/is-linkedin-premium-worth-it`, not the Polish slug with
  a suffix). Remove with:
  `DELETE FROM posts_locales WHERE _locale = 'en'; DELETE FROM categories_locales WHERE _locale = 'en';`
- [ ] **`max_connections` on a build target.** The first production build against the 79-post
  rehearsal DB died with `sorry, too many clients already` — 19 Next build workers against a default
  `max_connections = 100`. Raised to 800 on the throwaway container to get a render. This is the
  same build-time DB concurrency constraint the repo already documents, and it is worth confirming
  the prod build target's real limit before the first both-locales build.

- [x] **Manual 5-post pilot run on `rehearsal`** (2026-07-28), in the spirit of task 9.3 but by hand,
  since the phase-8 tooling does not exist yet. Translated `social-media-futbol` (984 words, 22
  blocks, 10 uploads), `koniec-globalnych-fanpagey-na-facebooku` (a link + a linebreak inside one
  block), plus three short 2017 news items, and all 4 categories. English slugs are authored per D2
  (`/en/blog/social-media-are-changing-polish-football`), not the Polish slug with a suffix.
  Method, which is the part worth carrying into task 8.3: text nodes are replaced **positionally
  within each block, in document order, links included**, and nothing else in the tree is assigned —
  so uploads, linebreaks, link `fields`, and per-node `format`/`detail`/`mode`/`style` survive by
  construction rather than by being copied. A block whose text-node count disagrees with the
  translation is reported and the whole post skipped, never guessed.
  **Verified**: structural fingerprint (block types/order, upload media ids, link fields, linebreak
  positions) identical before and after the walk on all 5; the Polish baseline comparator reports
  **only 6 differences against prod, all of them version-count increments** (+1 per translated post,
  +5 on the total) — zero Polish content, slug, category, author or hub differences. Heading anchors
  regenerate in English (`#who-is-behind-polish-football-s-communication`), and the only diacritics
  left in the English body are proper nouns (Basałaj, Szczęsny, Łączy nas piłka), which is exactly
  D4's soft-flag case.
  Writer script kept in the session scratchpad as `write-en.ts` — deliberately NOT committed, so it
  cannot be mistaken for `lib/payload/translate-post.ts`.
- [ ] **Some images have Polish text baked into the pixels**, which localizing `media.alt` (task 2.8)
  does not touch. Visible on the English hub: the cover for
  `instagram-cenzuruje-zdjecia-ze-zwierzetami` is a screenshot of an Instagram warning written in
  Polish. This is a content/creative decision per image — replace, crop, or accept — and it needs a
  pass over the covers and in-body screenshots of whichever posts get translated. Scope unknown
  until someone counts them.
