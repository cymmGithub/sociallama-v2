# site-i18n Specification

## Purpose
TBD - created by archiving change add-english-locale. Update Purpose after archive.
## Requirements
### Requirement: English locale routing
The site SHALL serve an English version of the marketing surface under the `/en` prefix with translated slugs — `/en`, `/en/about-us`, `/en/contact`, `/en/become-a-lama`, `/en/case-studies` (+ `/en/case-studies/<slug>`), `/en/privacy-policy`, `/en/terms`, `/en/cookies` — while every existing Polish URL remains unchanged and unprefixed. English pages SHALL render inside a root layout declaring `lang="en"`; Polish pages keep `lang="pl"`. The English tree SHALL be additive: no Polish route moves, and no automatic locale redirection (e.g. by `Accept-Language`) SHALL occur.

#### Scenario: English page serves with correct lang
- **WHEN** `/en/about-us` is requested
- **THEN** it returns 200 with the English content inside a document whose `<html lang>` is `en`

#### Scenario: Polish URLs untouched
- **WHEN** any pre-existing Polish URL is requested
- **THEN** it serves exactly as before the English locale existed, with `lang="pl"` and no redirect

#### Scenario: No auto-redirect
- **WHEN** a visitor with an English `Accept-Language` header requests `/`
- **THEN** the Polish homepage is served with no locale redirect

### Requirement: Per-locale typed content modules
English copy for the marketing pages SHALL live in per-locale content modules (`lib/content/*.en.ts`) that satisfy the same TypeScript types as their Polish counterparts, so that a missing or mis-shaped translation fails the build. Components SHALL remain locale-unaware, receiving content from the page layer; no message-catalog library SHALL be introduced.

#### Scenario: Parity enforced at build time
- **WHEN** an English module omits a field that exists in the Polish module's type
- **THEN** the TypeScript build fails

### Requirement: Locale toggle
The site chrome (overlay menu and footer) SHALL include a PL/EN toggle on both locales, marking the current locale (`aria-current`) and linking to the counterpart of the current path via the slug map. Section index pages SHALL be mapped pairs — `/uslugi` ↔ `/en/services` and `/branze` ↔ `/en/industries` — so the toggle lands on the counterpart index rather than the locale home. `/blog` ↔ `/en/blog` is a static pair. Post and category counterparts — `/{pl-slug}` ↔ `/en/blog/{en-slug}` and `/category/{pl-slug}` ↔ `/en/blog/category/{en-slug}` — SHALL be resolved from the document, since the slugs differ per locale, and SHALL be resolved on the server and supplied to the toggle. The client-side path map SHALL remain a static literal table; no per-post slug table may be shipped to the browser. For a path with no counterpart in the other locale — including a post that has not been translated — the toggle SHALL link to that locale's home.

#### Scenario: Toggle round-trips a mapped page
- **WHEN** a visitor on `/o-nas` activates EN and then PL
- **THEN** they land on `/en/about-us` and back on `/o-nas`

#### Scenario: Toggle round-trips the industries index
- **WHEN** a visitor on `/branze` activates EN and then PL
- **THEN** they land on `/en/industries` and back on `/branze`, never on the locale home

#### Scenario: Toggle round-trips a translated post
- **WHEN** a visitor on a translated Polish post activates EN and then PL
- **THEN** they land on that post's `/en/blog/{en-slug}` and back on its Polish root-level URL

#### Scenario: Untranslated post falls back to locale home
- **WHEN** a visitor on a Polish post with no English translation activates EN
- **THEN** they land on `/en`

### Requirement: Localized SEO surface
Every English page SHALL emit its own English metadata (title, description, OG). Every mapped page in BOTH locales — including the 12 industry pages (`/branze/*` ↔ `/en/industries/*`), the services index plus the seven service pages (`/uslugi/*` ↔ `/en/services/*`), and the blog hub, posts, and category listings — SHALL emit `hreflang` alternate links to its counterpart (with `x-default` pointing at the Polish version), and English URLs SHALL be included in the sitemap. A post with no English translation SHALL emit no English alternate and SHALL NOT appear in the sitemap under an English URL. The URL-parity gate for legacy Polish URLs SHALL remain green.

#### Scenario: Hreflang pairs on both sides
- **WHEN** `/kontakt` or `/en/contact` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Industry hreflang pairs
- **WHEN** any industry page renders in either locale
- **THEN** it emits alternates referencing its counterpart per the canonical slug mapping and `x-default` referencing the Polish URL

#### Scenario: Services hreflang pairs
- **WHEN** any service page or the services index renders in either locale
- **THEN** it emits alternates referencing its counterpart per the canonical slug mapping and `x-default` referencing the Polish URL

#### Scenario: Blog hreflang pairs
- **WHEN** a translated post, the hub, or a category listing renders in either locale
- **THEN** it emits alternates referencing its counterpart and `x-default` referencing the Polish URL

#### Scenario: Untranslated post emits no English alternate
- **WHEN** a Polish post with no English translation renders
- **THEN** it emits no `hreflang="en"` alternate, and no English URL for it appears in the sitemap

#### Scenario: Sitemap covers English
- **WHEN** the sitemap is generated
- **THEN** it lists the English marketing, legal, case-study, industry, services, and blog URLs alongside the Polish ones

#### Scenario: Machine-readable site summary covers English
- **WHEN** the site's machine-readable summary for language models is generated
- **THEN** it lists the English pages and the English URLs of translated posts and categories alongside the Polish ones, rather than describing a Polish-only site

### Requirement: Static English legal pages
`/en/privacy-policy`, `/en/terms`, and `/en/cookies` SHALL serve English translations of the corresponding Polish legal content as static routes (the Polish `regulamin` and `cookies` CMS documents are translated into static pages).

#### Scenario: English legal page serves
- **WHEN** `/en/terms` is requested
- **THEN** it returns 200 with the English translation of the regulamin content, `lang="en"`, and hreflang alternates to `/regulamin`

### Requirement: English contact flow
The `/en/contact` page SHALL present the contact form (including the optional phone field, next-steps strip, privacy note, and 24h-promise copy) in English, and the form's server action SHALL produce English validation messages and toasts for English submissions while labeling the delivered lead email's fields in English. Spam protection, rate limiting, and email transport SHALL be unchanged.

#### Scenario: English validation
- **WHEN** an English visitor submits the form with a missing required field
- **THEN** the inline error and any toast render in English

#### Scenario: English lead email
- **WHEN** a valid English submission is delivered
- **THEN** the lead email's field labels are English, with the visitor's message preserved verbatim

### Requirement: English chrome includes blog surfaces

The English menu and footer SHALL link to `/en/blog`, and the English homepage SHALL render the NewsLAMA latest-post section. Every post surfaced in English chrome SHALL be one that carries a genuine English translation — an untranslated post SHALL NOT appear in the English menu, footer, homepage, related-posts rail, or hub.

#### Scenario: English chrome reaches the blog

- **WHEN** any English page's chrome renders
- **THEN** a BLOG link is present in both the menu and the footer, and it resolves to `/en/blog` with HTTP 200

#### Scenario: English homepage shows latest posts

- **WHEN** `/en` renders
- **THEN** it includes the NewsLAMA section, populated only with posts that have English translations

#### Scenario: Untranslated post never surfaces in English

- **WHEN** a Polish post has no English translation and the English homepage, hub, or a related-posts rail renders
- **THEN** that post is absent from all of them, rather than appearing with Polish text

### Requirement: English blog URLs

English posts SHALL be served at `/en/blog/{en-slug}`, the English hub at `/en/blog` with pagination at `/en/blog/page/{n}`, and English category listings at `/en/blog/category/{en-slug}` with pagination at `/en/blog/category/{en-slug}/page/{n}`. English post and category slugs SHALL be authored English slugs, distinct from their Polish counterparts, not the Polish slug reused. Polish blog URLs — `/{slug}`, `/blog`, `/blog/page/{n}`, `/category/{slug}` — SHALL be unchanged.

#### Scenario: English post resolves at its English slug

- **WHEN** a translated post's English slug is requested under `/en/blog/`
- **THEN** it returns 200 with the English content inside a document whose `<html lang>` is `en`

#### Scenario: Polish slug is not an English URL

- **WHEN** `/en/blog/{pl-slug}` is requested for a post whose English slug differs
- **THEN** it returns 404, not the post

#### Scenario: Polish blog URLs untouched

- **WHEN** any Polish blog URL is requested
- **THEN** it serves exactly as before, with `lang="pl"` and no redirect

#### Scenario: English slug does not shadow an English page

- **WHEN** an editor sets an English post or category slug that collides with an existing English route segment or another English slug
- **THEN** validation fails with a message naming the conflict, and the post cannot be saved with that slug

### Requirement: Reciprocal sitemap hreflang clusters
Every PL↔EN URL pair in the sitemap SHALL carry the same hreflang cluster (`pl`, `en`, `x-default` → PL) on **both** locales' entries — statics, careers roles, posts with an English twin, categories with an English twin, case-study details, and services/industries section pages. A document without a counterpart in the other locale SHALL carry no `languages` alternates at all. Blog pagination entries (`/blog/page/N`, `/en/blog/page/N`) SHALL carry none, because the locale page sets differ. Alternate `href`s SHALL byte-match the paired entries' `<loc>` values (no trailing-slash divergence on the home pair).

#### Scenario: English entry lists its return link
- **WHEN** the sitemap renders the entry for `https://sociallama.pl/en/about-us`
- **THEN** it carries alternates `pl` → `/o-nas`, `en` → `/en/about-us`, and `x-default` → `/o-nas`, identical to the cluster on the `/o-nas` entry

#### Scenario: Case-study pair is annotated on both sides
- **WHEN** the sitemap renders `/case-studies/irobot` and `/en/case-studies/irobot`
- **THEN** both entries carry the same `pl`/`en`/`x-default` cluster for that slug

#### Scenario: Untranslated post stays bare
- **WHEN** a Polish post has no English version
- **THEN** neither a phantom EN entry nor `languages` alternates appear for it

#### Scenario: Home cluster matches its loc
- **WHEN** the sitemap renders the home pair
- **THEN** the `pl`/`x-default` href equals the home `<loc>` exactly (no trailing-slash mismatch)

