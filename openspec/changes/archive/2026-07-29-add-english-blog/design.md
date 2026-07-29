# Design — add-english-blog

## Context

`add-english-locale` built the English tree and deliberately excluded the blog. `add-case-study-en-translations` then proved a four-stage translation pipeline at scale — extract → author → write → verify — across 45 case studies. This change reuses that pipeline's *shape* while replacing its *engine*, because blog bodies are structurally nothing like case-study bodies.

### Verified facts

*(measured 2026-07-28 against the live Payload documents on `ep-polished-grass…` via the Local API, and against the working tree at `4ee01e7`.)*

- **79 posts, all `_status: 'published'`.** Body prose totals **53,709 words**; per post min 37 / p25 353 / median 584 / p75 931 / max 2,684.
  An earlier count of 54,576 words was taken against *live WordPress HTML*, i.e. before `apply-heading-fixes.ts` deleted lead paragraphs on 38 posts. **53,709 is the figure to scope against.**
- **Lexical node census across all 79 bodies**: `text` 3225, `paragraph` 1065, `heading` 416, `listitem` 388, `link` 184, `upload` 183, `linebreak` 125, `list` 108, `quote` 20, `horizontalrule` 4.
- **802 of 3,225 text nodes (25%) carry a non-zero `format` bitmask.** These exist only because an inline bold/italic run splits a sentence.
- **`format` is overloaded** (`lib/payload/post-formatting-rules.ts:17-26`): on an element node it is an alignment *string* (`'justify'`, `'center'`, `''`); on a text node it is a style *bitmask* (`IS_BOLD = 1`).
- **Internal links carry a document relationship, not a URL** (`app/(frontend)/[slug]/rich-text.tsx:31-42`). The href is built at render time from `/{slug}` or `/category/{slug}` — both hardcoded to the Polish shape.
- **4 categories** (Social media, SEO, Reklama, Marketing) and **1 author** (Łukasz Płociński, Polish bio). `categories.title`/`slug` and `authors.role`/`bio` are all unlocalized.
- **`push` is armed**: `payload.config.ts:26-30` passes `postgresAdapter({ pool })` with no `push` key. Payload defaults `push: true` outside production.
- **The only localization migration in the repo is destructive**: `migrations/20260722_203953_add_case_study_localization.ts:11` opens `TRUNCATE TABLE "case_studies", "_case_studies_v" CASCADE;`.
- **`_posts_v` already carries `snapshot` and `published_locale`** (created in migration 3). This *may* defuse the interactive drizzle rename prompt recorded in the `payload-localization-push-hang` note — but it is unverified, and D1 makes the question moot.
- **`counterpartPath('/jakis-wpis-na-blogu') === '/en'` is an asserted test**: `lib/i18n/slug-map.test.ts:81`.
- **`lib/content/blog.ts` is the only section content module with no `.en.ts` twin.** Its `postsPlural` (L82–92) implements the Polish three-form plural rule.
- **`lib/utils/format-date.ts:6`** is the single hardcoded `pl-PL`, with four call sites.
- **`lib/blog/heading-slug.ts:16`** falls back to the Polish literal `'sekcja'` for an unsluggable heading.
- **`audit-post-formatting.ts:139-144`** calls `payload.find` with no `locale`, so it audits the default locale only.

## Goals / Non-Goals

**Goals**: an English blog at `/en/blog` with English URLs, reachable from English chrome, carrying faithful English renderings of all 79 Polish posts; a translation pipeline whose output is independently verifiable; a schema change that cannot lose content.

**Non-Goals**: English-only posts; author archives; editorial rewrites; newsletter list segmentation; any change to a Polish URL; correcting errors found in Polish originals (report, don't fix).

## Decisions

### D1 — Schema push is disabled before any field is localized; the migration is hand-spliced.

`postgresAdapter` gains `push: false` in `payload.config.ts` **as the first commit of this change**, before `localized: true` appears anywhere. This makes dev agree with prod, which already runs `payload migrate` (`package.json:14`).

The migration is then generated with `payload migrate:create` and **hand-edited**, because the generated file will contain the two `CREATE TABLE` statements and the `DROP COLUMN` statements with nothing between them:

```sql
-- generated
CREATE TABLE "posts_locales" (
  "title" varchar, "excerpt" varchar, "content" jsonb, "slug" varchar,
  "seo_meta_title" varchar, "seo_meta_description" varchar,
  "id" serial PRIMARY KEY, "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);
CREATE TABLE "_posts_v_locales" ( /* version_* mirrors, same tail */ );

-- HAND-ADDED — migrate:create never emits this
INSERT INTO "posts_locales" (title, excerpt, content, slug,
                             seo_meta_title, seo_meta_description,
                             _locale, _parent_id)
SELECT title, excerpt, content, slug,
       seo_meta_title, seo_meta_description, 'pl', id
FROM "posts";
INSERT INTO "_posts_v_locales" ( ... ) SELECT ... , 'pl', id FROM "_posts_v";

-- generated, and correct only AFTER the inserts above
ALTER TABLE "posts" DROP COLUMN "title", DROP COLUMN "excerpt", ... ;
```

The `_locales` enum and the `_posts_v.snapshot` / `published_locale` columns already exist and must not be recreated.

**The same splice is required for `categories` and `authors`.** Task 2.2 localizes `categories.title`/`slug` and `authors.role`/`bio`, which puts `ALTER TABLE "categories" DROP COLUMN "title", DROP COLUMN "slug"` into the *same* generated migration. Neither collection has a versions table, so neither needs a `_v_locales` twin, but both need their own `INSERT … SELECT … 'pl'`. An unbackfilled `categories_locales` is not a cosmetic loss: `categories.slug` must match the live WordPress `/category/{slug}` paths exactly (`collections/categories.ts:9-11`) and `posts.category` is `required: true` (`collections/posts.ts:71`), so losing it destroys live Polish category URLs and every category pill in both locales.

Structurally this is *easier* than the case-studies migration: posts have no `posts_rels` / `posts_texts` join tables and no localized arrays. Two new tables for posts, one each for categories and authors, no join-table retrofit.

**The dev database cannot receive this migration as-is.** `sociallama_dev` (Docker `:5434`) has 5 rows in `payload_migrations` while `migrations/` holds 8 files — its schema is current because *push* built it, not because migrate ran. `payload migrate` runs every file absent from the ledger and rethrows on error (`node_modules/payload/dist/database/migrations/migrate.js:17-53`), so it will attempt `20260726_212614_add_author_role`, die on "column already exists", and never reach the new migration. Once push is off there is no other path to dev. **Reconciling the ledger is a phase-1 task, gated on `payload migrate` reporting a clean no-op**, and it must happen before any field is localized.

Rehearsal order, non-negotiable: **snapshot → reconcile the dev ledger → rehearse on a throwaway Neon branch cloned from prod → assert all 79 posts, 4 categories, and the author still carry their fields under `locale: 'pl'` → apply to dev → apply to prod.** The `down` migration must restore the columns and copy `pl` rows back for all three collections.

*Alternatives rejected:*
- **Plain `titleEn` / `contentEn` columns.** Purely additive, zero data-loss risk, and genuinely tempting. Rejected because it is not localization: no `locale: 'en'` query, no fallback, no admin locale switcher, a manual branch at all 14 query sites, and it diverges from the case-studies convention the repo already committed to. The risk it avoids is avoidable by other means (D1's rehearsal); the divergence it creates is permanent.
- **Drop and reseed**, the remedy in the `payload-localization-push-hang` note. Unavailable: no seed script exists for posts, only repair/audit scripts. The content is not reproducible.

### D2 — English posts live at `/en/blog/{en-slug}`, with `slug` localized.

Polish posts sit at root level purely for WordPress URL parity (`wp-import`: "slug (exact)"; `blog-post-page`: "user decision, 2026-07-17"). **English inherits no legacy URLs, so it inherits no reason to mirror that shape.**

`/en/blog/{slug}` avoids a root-level English catch-all whose posts would be **silently shadowed by** `/en/about-us`, `/en/services`, `/en/industries` and every future English segment. The direction matters: static segments win over dynamic ones in the App Router, so the static page renders and the post simply never does. That is the exact failure `RESERVED_SLUGS` exists to convert into a validation error (`lib/payload/reserved-slugs.ts:7-11`; `blog-post-page` base spec: "Static routes … SHALL take precedence over the post segment"). Namespacing under `/blog` removes the collision surface entirely, so `RESERVED_SLUGS` never has to grow as the English tree does.

`slug` is localized, so English posts get real English slugs (`/en/blog/is-linkedin-premium-worth-it`, not `/en/blog/linkedin-premium-czy-warto`). Payload enforces uniqueness per locale natively. Consequences, all of which are tasks:

- the English post resolver queries `where: { slug: { equals } }` under `locale: 'en'` with fallback off;
- `validate-slug.ts` / `reserved-slugs.ts` become locale-aware;
- `rich-text.tsx`'s internal-link href builder must resolve a related post's slug **in the current locale** — an English post linking to another post must land on `/en/blog/<en-slug>`, never on the Polish root URL;
- English slugs are authored content and are verified like any other translated string, with the added rule that a slug collision or a non-URL-safe slug is a hard failure, not a warning.

`categories.slug` is localized for the same reason: `/en/blog/category/advertising`, not `/en/blog/category/reklama`.

### D3 — Translation happens at *block* granularity over an inline-markup projection, never at text-node granularity and never by flatten-and-rebuild.

Three candidate engines, two rejected:

```
  ✗ flatten to plain strings, rebuild        (translate-case-study.ts:55-120)
      Its own comment L90-92 states the precondition: "the stored node set
      is exactly what the helpers above emit". FALSE for blog posts.
      Applied here it silently drops 183 images, 184 links, and every
      inline bold/italic run.

  ✗ translate each of 3,225 text nodes independently
      802 of them are format-run fragments with no sentence context.
      Polish is inflected and free-word-order; English reorders. The
      translator cannot see where the emphasis belongs because it never
      sees the whole sentence.

  ✓ project each BLOCK to inline markup, translate, re-parse
```

The projection covers the ~1,889 blocks that hold prose — `paragraph`, `heading`, `listitem`, `quote`:

```
  extract    "Reklama jest <b>tańsza</b> niż <a1>Google Ads</a1>."
  translate  "Advertising is <b>cheaper</b> than <a1>Google Ads</a1>."
  re-parse   text("Advertising is ", fmt 0)
             text("cheaper", fmt IS_BOLD)
             text(" than ", fmt 0)
             link(children=[text("Google Ads")], fields restored from PL by id)
             text(".", fmt 0)
```

**Block-level vs inline-leaf nodes are not the same exclusion.** `upload` and `horizontalrule` are root-level siblings and never enter the projection. `linebreak` and `tab` are inline leaves *inside* the blocks being projected — the repo's own walker treats them that way (`post-formatting-rules.ts:53-55` returns `'\n'` for a mid-block `linebreak`; `:296-299` emits a non-mutable `'\n'` leaf while collecting a block's text leaves), and the census counts 125 of them. Excluding them from the projected string would leave the re-parser no information about where they sat, so they would be dropped or re-appended in the wrong place — an intra-block change that D5's block-count/type/order assertions cannot catch.

They therefore get **explicit tokens** in the grammar, which the structural gate counts and positions:

```
  grammar (the complete token set — anything else is a gate failure)
    <b>…</b>      IS_BOLD            <s>…</s>   strikethrough
    <i>…</i>      IS_ITALIC          <code>…</code>
    <u>…</u>      underline          <sub>/<sup>
    <aN>…</aN>    link, N = index into the out-of-band link table
    <br/>  <tab/>                    inline leaves, counted and positioned

  composed bits nest, outermost = lowest bit:
    format 3 (BOLD|ITALIC)  ⟶  <b><i>text</i></b>     never <i><b>…
    round-trip is asserted on the PL side before translation begins:
    project(node) → parse(…) must equal the original node, byte for byte.
```

Text-node metadata that is not emphasis — `detail`, `mode`, `style` — is carried out-of-band per leaf alongside the format bitmask and restored positionally, never inferred from the markup.

Further rules the engine enforces mechanically, before anything reaches the database:

- `link` node `fields` (including `linkType: 'internal'` doc relationships) are held out-of-band and restored by tag id. A translated block missing an `<aN>` tag, or inventing one, fails.
- Element-level `format` (the alignment string) and `heading.tag` are copied verbatim. Losing `tag` silently kills the table-of-contents rail (`blog-content-integrity`: rail renders at ≥3 `h2`/`h3` entries).
- Block count, block types, and block order must match the Polish tree exactly; so must each block's `<br/>` / `<tab/>` count.
- `MAX_HEADING_LENGTH = 85` (`post-formatting-rules.ts:348`) applies to English headings too.
- **The projection is validated against itself first.** Before any post is translated, `parse(project(block))` must reproduce the Polish block exactly, for all ~1,889 blocks. A grammar that cannot round-trip Polish will not survive English.

The engine to copy is **`repair-post-formatting.ts`**, not `translate-case-study.ts`: `--prod` env swap before the config import (L57–66), dynamic `import('@payload-config')` (L79–82), deep copy before mutation (L124–127), in-place `walkNodes` (L136–161), **ambiguity reported and skipped rather than guessed** (L163–168), one `payload.update` per post (L199–203), dry-run by default with `--apply` to write (L42).

From `translate-case-study.ts` only the *harness* carries over: two-mode `--extract` CLI, a per-slug on-disk review artifact, the `TODO` stub-refusal guard, and structural count assertions before writing.

#### D3 amendment — measured against the corpus, and wrong in three places

D3 was written from a census that this change re-ran against all 79 posts. The
re-run reproduces D3's own headline figures exactly — **1,889 projected blocks**
and **3,225 text nodes** — which is the reason to trust it where it disagrees.
It disagrees on three points, and the implementation follows the corpus:

- **`quote` is a container of paragraphs, not a leaf block.** 18 `paragraph`
  nodes sit directly inside a `quote`. D3 lists `quote` alongside `paragraph`
  and `heading` as if it held prose itself.
- **`listitem` is sometimes a container too** — 5 `heading`, 2 `list` and, flatly
  contradicting D3's "`upload` … never enter[s] the projection", **2 `upload`**
  nodes sit inside one. 27 nodes in total are direct children of a projected
  block with no grammar token to represent them. (A looser count of 31 also
  counts the 4 `listitem`s inside those 2 nested lists; they are themselves
  projected blocks, so the tighter 27 is the number that matters to the
  grammar.)
- **The unit of translation is therefore not "a block".** `post-projection.ts`
  projects a *maximal run of adjacent inline children*, and holds every other
  node aside whole. That is what makes a container block representable at all,
  and it is why all 1,875 runs round-trip byte-identically.

Two grammar tokens are also untestable by construction: `<code>`, `<sub>` and
`<sup>` have **zero** occurrences in the corpus (the only format masks present
are 0, 1, 2, 3, 4, 8 and 9), so task 8.2's round-trip cannot exercise them. The
mitigation is already in place rather than planned — `post-projection.ts:159`
throws on any bit outside the known set, so an unexpected mask fails the gate
instead of being silently projected as unformatted text.

### D4 — The translation batch is a workflow: translate, gate in code, verify in a fresh context.

`blog-content-integrity` already requires that replacement copy be reviewed before it is written to the database. The pipeline satisfies that with an independent verifier rather than a rubber stamp — the verifying agent never sees the translating agent's reasoning, only the Polish source and the English result.

```
  pipeline(posts, translate, structuralGate, verify)   ← no barrier between stages

    ┌── stage 1 ── translate ────────────────────────────────────┐
    │  in:  draft.pl.json (block projection) + voice guide        │
    │       + glossary + the post's category                      │
    │  out: draft.en.json — blocks, title, excerpt, meta, slug    │
    └─────────────────────────────────────────────────────────────┘
                 ↓
    ┌── stage 2 ── structural gate (CODE, not an agent) ─────────┐
    │  block count / types / order match PL                       │
    │  per block: <br/> and <tab/> counts and positions match PL   │
    │  every <aN> present exactly once, none invented             │
    │  markup balanced; only grammar tokens; nesting bit-ordered   │
    │  slug URL-safe, unique in EN, not reserved                  │
    │  heading length ≤ 85                                        │
    │  → cheap, deterministic, catches ~all mechanical failures    │
    │  SOFT: Polish diacritics outside the proper-noun allowlist   │
    └─────────────────────────────────────────────────────────────┘
                 ↓  (fail → back to stage 1 with the gate's report)
    ┌── stage 3 ── verify (FRESH agent, sees PL + EN only) ──────┐
    │  fidelity   — no meaning added, dropped, or softened        │
    │  fluency    — reads as English, not as translated Polish    │
    │  register   — playful-but-clean, American spelling          │
    │  terms      — brand names intact; Polish-market concepts     │
    │               explained rather than dropped                  │
    │  SEO        — title/meta lengths; slug matches the title     │
    │  soft-flag  — "correct English, but locally scoped"          │
    │  verdict: pass | revise(reasons) | soft-flag(note)           │
    └─────────────────────────────────────────────────────────────┘
```

The diacritic check is **soft in both stages, never a hard gate**. Polish proper nouns legitimately survive translation — "Łukasz Płociński", "Pracuj.pl", Polish company and place names — so a hard reject would contradict the glossary rule that brand names are preserved. The gate maintains an allowlist seeded from the glossary and the `authors` collection, and flags only diacritics appearing outside it.

Pipeline, not barrier: post *A* verifies while post *B* is still translating. Max two revise loops per post; a third failure is reported and left for a human rather than retried into the ground.

**Where the batch runs matters.** The Docker dev DB holds 15 fixture posts, not the corpus — the 79 real posts exist only on Neon. So the pilot has nowhere non-live to run unless one is created. It is: the rehearsal branch from D1 is cloned from prod and kept, and the pilot plus at least one full wave run against it before anything touches prod. Combined with D7 (writes land on the published version immediately), running the first execution of a brand-new translation engine against live content would otherwise be the single most dangerous step in the change.

The soft-flag channel is what makes "all 79" a safe scope. 15 posts are sub-300-word 2017–18 platform news items whose English versions will be correct but of little search value. The verifier flags them; the flags land in `STATUS.md`; triage is a content decision made *after* the batch from a complete scoreboard, not a guess made before it.

**Batching**: run as waves — a 5-post pilot verified end-to-end by a human, then waves of ~20 — mirroring the pilot-then-scale sequencing that `add-case-study-en-translations` used. This is also a practical necessity: 79 posts × 2 agents is ~158 agents, well above this session's "medium / under 15" workflow-size guideline, so either the waves stay small or the guideline gets raised in `/config` first.

### D5 — Verification is a script with a machine verdict, not a reading pass.

`lib/payload/verify-post-en.ts`, modeled on `verify-case-study-en.ts`, run with `--all --status`. It reads English with **`fallbackLocale: false`**, so a pass means genuinely translated rather than falling back to Polish. Per post it asserts:

- exactly one document per Polish slug (idempotency);
- English `title` / `excerpt` / `content` present **and differing from** Polish;
- English `slug` present, differing from Polish, URL-safe, unique, not reserved;
- body block count, block types, and block order identical to Polish;
- every `upload` node's media ID identical to Polish, in the same position;
- every `link` node's `fields` identical to Polish;
- heading `tag` sequence identical, so the table of contents survives;
- English content sits on the **published** version (D7);
- `content` contains no Polish diacritics outside quoted proper nouns (soft).

Exits non-zero on any failure and writes `content/posts/STATUS.md`.

### D6 — Untranslated posts do not exist in English. The gate is a **query predicate**, not `fallbackLocale`.

Payload's global `fallback: true` (`payload.config.ts:60-64`) is the trap: the moment `localized: true` lands, an English post query returns Polish text and it renders as finished English — `<html lang="en">`, English OG locale, English JSON-LD `inLanguage`, a sitemap entry, and a reciprocal hreflang pair. 79 duplicate pages declaring a language they are not written in is a worse outcome than having no English blog.

**`fallbackLocale: false` cannot implement this gate.** It is applied in Payload's `afterRead` field pass (`node_modules/payload/dist/fields/hooks/afterRead/promise.js:46-68`) — *after* the SQL has selected and counted rows. `fallbackLocale` never reaches the database layer at all (`grep fallbackLocale node_modules/@payloadcms/drizzle/dist/find/ queries/` returns nothing), so it provably cannot affect `WHERE`, row selection, or `COUNT`. It turns Polish text into `null`; it does not remove the row.

The consequences, if it were used as the gate:

```
  findPostsPage  ──▶  limit: POSTS_PER_PAGE, page   (queries.ts:118-143)
                      totalDocs/totalPages come from countDistinct(where)
                      → /en/blog reports 79 docs / 9 pages
                      → each page returns 9 rows, most with title: null
                      → post-hoc JS filtering gives short pages, a wrong page
                        count, and /en/blog/page/2..9 with no content

  limit-N queries are worse — they take the newest N BEFORE any filter:
    findLatestPost      limit 1     (L91)   ┐  can return ZERO English
    findRelatedPosts    limit 3     (L372)  ├─ results while 20 translated
    findBlogHub         pool 12     (L544)  ┘  posts exist
    findPostsForPlatform (L317), findPostsForCategories (L343)
```

Only `findPublishedPostSlugs` (L74–88) and `findPostsForSitemap` (L175–191) would happen to work, because they use `pagination: false, limit: 0` and can be filtered afterwards. An earlier draft of this design named exactly those two — i.e. the two cases where the wrong mechanism accidentally works, and none of the seven where it does not.

**The gate is therefore a `where` predicate.** Every English post query adds, under `locale: 'en'`:

```ts
where: { and: [ …existing, { title: { exists: true } } ] }
```

`exists` maps to `isNotNull` in the adapter (`node_modules/@payloadcms/drizzle/dist/queries/operatorMap.js:6`, sanitized at `sanitizeQueryValue.js:216`), and `buildQuery` scopes localized-field predicates to the active locale, so the predicate joins `posts_locales` on `_locale = 'en'`. Since D1's backfill inserts only `'pl'` rows, an untranslated post has no `en` row at all and is excluded from selection **and from `countDistinct`** — which is what makes pagination arithmetic correct.

`fallbackLocale: false` is still threaded, but only as a belt-and-braces read guard so that a partially translated document cannot render half-Polish.

Every one of these must carry the predicate, not just the enumerators: `findPostBySlug`, `findPublishedPostSlugs`, `findLatestPost`, `findPostsPage`, `findPostsForSitemap`, `findPostsForLlms`, `findPostsForPlatform`, `findPostsForCategories`, `findRelatedPosts`, `findSearchIndex`, `findBlogHub`.

A post with no English row **does not exist** in English: 404 from the route, absent from `generateStaticParams`, the sitemap, hreflang, related posts, the hub pool, and NewsLAMA on `/en`. The English route also needs its own empty-CMS placeholder for Cache Components, matching `app/(frontend-en)/en/case-studies/[slug]/page.tsx:22-28`.

*Alternative rejected:* an unlocalized `enPublished` checkbox. It adds a field an editor must remember to tick, and it can disagree with reality — a ticked box on an untranslated post reintroduces exactly the failure the gate exists to prevent. Deriving the gate from the content itself cannot drift.

### D11 — The locale toggle and hreflang resolve blog counterparts **server-side**; `slug-map.ts` stays literal-only.

`lib/i18n/slug-map.ts` is a synchronous, pure module, and its own header (L28–36) records why: it "reaches the browser through `<LocaleToggle>`". `counterpartPath` (L135–147) resolves from `as const` literal tables, and `components/layout/locale-toggle/index.tsx` is `'use client'`, calling it on `usePathname()` during render with no data access.

So "map blog paths through the document" cannot happen inside `counterpartPath`. Worse, `/{pl-slug}` is a bare root path indistinguishable from any other unmapped root path — the toggle cannot even tell it is looking at a post without shipping all 79 slug pairs to the browser, which is precisely the bundle cost the module's comment exists to avoid.

**Mechanism**: the post and category routes already load the document server-side and therefore already know both slugs. Each route resolves its own counterpart and passes it down:

- into `<LocaleToggle>` via the existing `ChromeProvider`, as an explicit override;
- into `generateMetadata`'s `alternates`, directly — not via `alternatesForPath`, which is built on the same synchronous `counterpartPath` (L157–179).

`counterpartPath` gains an optional override parameter and otherwise keeps its current behaviour, including returning the locale home when nothing maps. `pathPairs` gains only the one genuinely static pair, `['/blog','/en/blog']`. No per-post table ever reaches the client bundle.

This also gives the untranslated case for free: a route with no counterpart passes no override, and the toggle falls back to `/en` exactly as it does today.

### D7 — The English write targets the published document; no `draft: true`.

All 79 posts are published and the collection has drafts enabled (`posts.ts:30-37`). `payload.update({ draft: true })` would write a draft version while the live English page kept rendering the published one — the translation would appear to land and change nothing. Same conclusion, same reasoning, as `add-case-study-en-translations` D5.

Consequence: a translation is live the moment it is written. Mitigated by the structural gate and independent verification happening *before* the write, and by the pilot wave.

### D8 — Blog components become locale-aware; they are not duplicated.

The pattern is already established at `app/(frontend)/case-studies/[slug]/case-study-article.tsx:35-41`: a shared view under `(frontend)/` taking `chrome`, `basePath`, `contactHref`, and `locale` props, imported by both locales' routes. Applied to `listing.tsx`, `post-card.tsx`, `pagination.tsx`, `hub-*.tsx`, `post-rail.tsx`, `post-share.tsx`, `author-card.tsx`, `rich-text.tsx`, `json-ld.tsx`.

**The post page itself is part of that list, and has no shared view today.** `app/(frontend)/[slug]/page.tsx` holds Polish and Polish URLs that live in none of the child components: `aria-label="Ścieżka nawigacji"` (L168), the `Blog` crumb pointing at `/blog` (L169), the category crumb built as `/category/${slug}` (L173), `{readingTime} min czytania` (L194), and the mobile table-of-contents `<summary>W tym wpisie</summary>` (L225) — plus `shareUrl` (L129), `alternates.canonical` (L93), and `openGraph.url` (L99), all built from `/${post.slug}`. A `post-article.tsx` has to be extracted the way `case-study-article.tsx` was, or the English route would compose locale-aware children inside a Polish frame.

`components/blog/newsletter.tsx` is on the list too — it renders on the hub *and* after every post body, so leaving it out puts a Polish slab on every English blog surface.

Three supporting pieces:
- `lib/content/blog.en.ts` — the missing twin. `postsPlural` is **replaced, not translated**: Polish's three-form rule has no English analogue.
- `lib/utils/format-date.ts` takes a locale; `pl-PL` → `en-US` at the four call sites.
- `lib/blog/heading-slug.ts`'s `FALLBACK = 'sekcja'` becomes locale-aware, or English anchors get Polish fragments.

`reading-time.ts`'s 200 wpm is documented as tuned for Polish prose. **Kept shared.** English reads faster, but the output is rounded to whole minutes and the difference is under one minute for all but the longest posts — not worth a second constant.

### D9 — Two spec conflicts must be reconciled at archive time, not silently.

`add-industries-hub` is unarchived and collides with this change in **three** places, not two. Both changes modify the same `Locale toggle` requirement, and both deltas are written against the base at `4ee01e7`, so whichever archives second silently deletes what the first added unless the text is merged deliberately.

1. `add-industries-hub/specs/site-footer/spec.md` — scenario "English footer omits blog surfaces". Directly contradicted; must be removed when this change archives.
2. `add-industries-hub/specs/site-i18n/spec.md:4` — adds to `Locale toggle`: *"Section index pages SHALL be mapped pairs — `/uslugi` ↔ `/en/services` and `/branze` ↔ `/en/industries` — so the toggle lands on the counterpart index rather than the locale home."* This change's replacement text omits that sentence. It is not dead text: `lib/i18n/slug-map.ts:52-55` still has `/branze` at `hasIndex: false`, so the clause specifies a pending behaviour change.
3. The same requirement's worked example — "e.g. a blog post" — which this change replaces with "including a post that has not been translated".

**Pre-merged text**, so whoever archives second pastes rather than reconstructs:

> The site chrome (overlay menu and footer) SHALL include a PL/EN toggle on both locales, marking the current locale (`aria-current`) and linking to the counterpart of the current path. Section index pages SHALL be mapped pairs — `/uslugi` ↔ `/en/services` and `/branze` ↔ `/en/industries` — so the toggle lands on the counterpart index rather than the locale home. `/blog` ↔ `/en/blog` is likewise a static pair. Post and category counterparts — `/{pl-slug}` ↔ `/en/blog/{en-slug}` and `/category/{pl-slug}` ↔ `/en/blog/category/{en-slug}` — SHALL be resolved from the document, since the slugs differ per locale, and SHALL be resolved on the server and supplied to the toggle. The client-side path map SHALL remain a static literal table; no per-post slug table may be shipped to the browser. For a path with no counterpart in the other locale — including a post that has not been translated — the toggle SHALL link to that locale's home.

### D12 — Cache invalidation is part of the batch, not an afterthought.

`app/api/revalidate/route.ts:12-20` documents the trap in its own header: a maintenance script writing straight to the database "runs outside any Next request scope, where `revalidateTag` throws and the hook swallows it, so the data changes and the pages keep serving the old cache". The swallowing `try/catch` is `lib/payload/revalidate.ts:25-33`, and every blog query uses `cacheLife('days')`.

`translate-post.ts` is exactly that maintenance script. Without an explicit invalidation step after each wave, the spot-checks in phase 10 would read a days-old cache and report English pages as missing when they are actually written — a false negative that would send someone debugging the translation engine instead of the cache.

Each wave therefore ends with a POST to `/api/revalidate` for the `posts`, `categories`, and `blog-hub` tags, against the deployment being checked, before any verification of rendered pages.

### D13 — `push: false` has a blast radius outside this change, and it is not only other people's worktrees.

`lib/scripts/worktree.ts:207` documents the isolated bootstrap: *"isolated DB: create + dev-push/seed. The first seed's Payload init pushes the schema (dev mode) — clean on an empty DB, no destructive prompt."* It then creates an empty database and runs the seed scripts (`:234-240`) with no `payload migrate` anywhere in the path.

With push off, those seeds hit a schema-less database and fail — which breaks the `--isolated` worktree that this change's own risk table prescribes for doing the schema work. Task 1.1 cannot catch it, because its check runs against the already-populated shared dev DB.

`payload migrate` therefore goes into the worktree bootstrap before the seed loop, in the same commit as `push: false`, and task 1.1's acceptance becomes "a fresh `bun run worktree:new --isolated` provisions and seeds successfully" rather than "the dev server boots".

### D10 — The formatting audit is locale-aware, and the Polish `nbsp` rule stays Polish.

`audit-post-formatting.ts:139-144` queries without a `locale`, so English content passes it vacuously — `blog-content-integrity`'s "machine-verifiable" requirement would be satisfied in name only. The audit takes a locale and runs over both.

Separately, `blog-content-integrity` requires a non-breaking space after a **Polish** one- or two-letter word (`post-formatting-rules.ts:192-282`). English has no orphan-word convention of that kind. Mechanically inheriting Polish `nbsp` positions into English produces wrong output that the audit *counts* but cannot *language-check*. The rule is therefore scoped to `pl`, and English asserts the opposite: no inherited `nbsp` at Polish positions.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **Migration drops 79 posts, 4 categories, and the author row.** The generated SQL is destructive by default and `push: true` is armed today. | D1: `push: false` lands first, as its own commit. Snapshot before, rehearse on a throwaway branch, assert all three collections intact under `locale: 'pl'`, then dev, then prod. The three hand-added `INSERT … SELECT` statements are the review focus. |
| **`payload migrate` fails on dev** — its ledger is 3 files behind because push built the schema. With push off, dev has no schema path at all and the whole build phase stalls. | Phase-1 ledger reconciliation, gated on `payload migrate` reporting a clean no-op, before any field is localized. |
| **The pilot runs against production**, because the dev DB holds fixtures rather than the corpus, and D7 writes to the published version. | The D1 rehearsal branch is cloned from prod and *kept*; the pilot and one full wave run there. Prod cutover is its own explicit task, not a footnote in the migration plan. |
| **`push: false` breaks other in-flight work.** Three changes are open (`add-industries-hub`, `add-contact-page`, `replace-hero-wardrobe-dissolve`) and the worktree bootstrap assumes dev auto-syncs schema. | Task 1.1 is deliberately its own commit so the blast radius is visible and revertible in isolation, and the worktree bootstrap docs are updated in the same commit. |
| **`blog-hub` localization is a second schema change**, landing in phase 6 after push is off, and localizing `picks` (hasMany) adds a `locale` column to `blog_hub_rels` leaving existing rows `NULL` — invisible in both locales. | Folded into the phase-2 migration with its own backfill, rather than discovered in phase 6. |
| **A worktree dev server on the old schema clobbers the new tables** on a shared DB (documented incident). | Do the schema work in an `--isolated` worktree. With `push: false` the blast radius is already much smaller. |
| **Translation drops an image, a link, or a bold run** — silently, since the page still renders. | D3's projection excludes structural nodes entirely; D5 asserts upload media IDs and link `fields` byte-identical, in position. |
| **Fluent-sounding mistranslation** passes a mechanical gate. | D4 stage 3: a fresh agent that sees only Polish source and English result, prompted to find fidelity failures rather than to approve. |
| **English slug collisions or typos** — a slug error is a broken URL, not awkward prose. | Structural gate checks URL-safety, EN-locale uniqueness, and the reserved list before the write; D5 re-checks after. |
| **Untranslated posts leak into English** mid-batch. | D6: derived gating, no flag to forget. Both enumeration points explicitly covered. |
| **Internal links point at Polish URLs from English posts.** | D2: `rich-text.tsx` resolves the related document's slug in the current locale. Verified per post in the batch. |
| **English hub features an untranslated post** via Polish curation. | Curation slots are per-locale and English ships empty, degrading to the defaults `blog-hub-curation` already requires — and the default set is drawn from translated posts only. |
| **All-79 scope produces thin English pages** for 15 short 2017–18 news items. | Accepted, with the soft-flag channel (D4) surfacing them in `STATUS.md` for a post-batch content decision. |

## Migration Plan

1. `push: false` (no schema change yet) — verifiable in isolation.
2. Snapshot dev and prod. Record the pre-migration baseline: 79 posts, 4 categories, 1 author.
3. Reconcile the dev migration ledger; gate on `payload migrate` reporting a clean no-op on dev.
4. Localize fields across `posts`, `categories`, `authors`, and the `blog-hub` global; `payload migrate:create`; hand-splice **four** backfills plus the `blog_hub_rels` locale update; write `down`.
5. Rehearse on a Neon branch cloned from prod. Assert every collection intact under `locale: 'pl'`, byte-identical to the baseline. **Keep this branch** — it is where the pilot runs.
6. Apply to dev, regenerate types, verify `locale: 'pl'` reads unchanged.
7. Build capability (routes, chrome, locale-aware components) against dev with zero translations — every English blog surface must correctly render as *empty*, not as Polish, and `/en/blog/page/2` must not exist.
8. Point the worktree at the rehearsal branch. Run the pilot wave and one full wave there; verify.
9. Apply the migration to prod.
10. Run the remaining waves with `--prod`, verifying each before the next.

**Rollback**: clearing the English locale fields returns each post to Polish-only, and D6's gating removes it from the English tree automatically — no route, sitemap, or chrome change needed. Reverting the *schema* requires the `down` migration, which is why `down` must restore the columns and copy `pl` rows back rather than being a stub.

## Resolved during review

- **Localized `relationship` fields on a Payload global: yes, they work.** Globals go through the same `buildTable` path as collections (`node_modules/@payloadcms/drizzle/dist/schema/buildRawSchema.js:75-91`). The consequence is the real finding: localizing `featured`/`popular` moves `featured_id`/`popular_id` out of `blog_hub` into `blog_hub_locales` (they are base-table columns today — `migrations/20260726_220833_add_blog_hub.ts:5-15`), and localizing `picks` adds a `locale` column to `blog_hub_rels` (`schema/build.js:477-483`) that leaves every existing row `NULL`. Both need backfills, and both belong in the phase-2 migration rather than in phase 6.

## Open Questions

- **Does the interactive drizzle rename prompt still trigger for `posts`?** `_posts_v.snapshot` and `published_locale` already exist from migration 3, which may defuse it. D1 makes it moot, but confirming during the branch rehearsal is worth the two minutes.
- **`en_US` vs `en_GB` for `format-date`.** The EN voice note specifies American spelling; `en-US` follows, but the audience is European. Flagging rather than assuming.
- **How long does the kept rehearsal branch live?** It holds a full prod clone including the corpus. Cheap while the batch runs; worth deciding when it gets torn down.
