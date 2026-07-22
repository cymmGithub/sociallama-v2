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
The site chrome (overlay menu and footer) SHALL include a PL/EN toggle on both locales, marking the current locale (`aria-current`) and linking to the counterpart of the current path via the slug map. For a path with no English counterpart (e.g. a blog post), the toggle SHALL link to `/en`.

#### Scenario: Toggle round-trips a mapped page
- **WHEN** a visitor on `/o-nas` activates EN and then PL
- **THEN** they land on `/en/about-us` and back on `/o-nas`

#### Scenario: Unmapped page falls back to locale home
- **WHEN** a visitor on a Polish blog post activates EN
- **THEN** they land on `/en`

### Requirement: English chrome omits blog surfaces
The English menu, footer, and homepage SHALL contain no links to the blog or categories, and the English homepage SHALL NOT render the NewsLAMA section. Polish chrome is unchanged.

#### Scenario: No blog leakage on EN
- **WHEN** any English page's chrome renders
- **THEN** no BLOG link is present, and `/en` contains no latest-post section

### Requirement: Localized SEO surface
Every English page SHALL emit its own English metadata (title, description, OG). Every mapped page in BOTH locales SHALL emit `hreflang` alternate links to its counterpart (with `x-default` pointing at the Polish version), and English URLs SHALL be included in the sitemap. The URL-parity gate for legacy Polish URLs SHALL remain green.

#### Scenario: Hreflang pairs on both sides
- **WHEN** `/kontakt` or `/en/contact` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap covers English
- **WHEN** the sitemap is generated
- **THEN** it lists the English marketing, legal, and case-study URLs alongside the Polish ones

### Requirement: Static English legal pages
`/en/privacy-policy`, `/en/terms`, and `/en/cookies` SHALL serve English translations of the corresponding Polish legal content as static routes (the Polish `regulamin` and `cookies` CMS documents are translated into static pages; the posts collection is not localized).

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

