## ADDED Requirements

### Requirement: English post pages

A translated post SHALL be served at `/en/blog/{en-slug}` through the same template as its Polish counterpart, rendered inside the English root layout with `<html lang="en">`. A post lacking an English translation SHALL return 404 rather than rendering Polish text under an English URL, and SHALL be absent from the English route's static params and from the sitemap.

Untranslated posts SHALL be excluded **by the query that selects them**, not by filtering results after they are fetched. Every count, page total, and fixed-size result set on an English blog surface SHALL therefore be computed over the translated set alone.

#### Scenario: Translated post renders in English
- **WHEN** a translated post's `/en/blog/{en-slug}` URL is requested
- **THEN** it returns 200 with English title, lead, body, author card, and related posts, inside a document whose `<html lang>` is `en`

#### Scenario: Untranslated post is not an English page
- **WHEN** `/en/blog/` is requested for a post that has no English translation
- **THEN** the app's 404 page is returned, and no Polish text is served under an English URL

#### Scenario: English route with no translations at all
- **WHEN** the English blog routes render against a database where no post has been translated
- **THEN** every English blog surface renders as empty rather than as Polish, and no English post URL resolves

#### Scenario: Internal links stay in locale
- **WHEN** an English post body contains a link to another post or a category
- **THEN** that link resolves to the target's English URL, never to the Polish root-level URL

### Requirement: English related posts

An English post SHALL end with up to three related posts drawn only from posts that carry English translations, preferring the current post's category and topping up with the newest translated posts. Where fewer than three translated posts are available, the section SHALL show what exists rather than padding with untranslated posts.

#### Scenario: Related posts are all translated
- **WHEN** an English post's related section renders
- **THEN** every post shown has an English translation and links to its `/en/blog/` URL

#### Scenario: Too few translated posts
- **WHEN** fewer than three other translated posts exist
- **THEN** the section shows only those, and no untranslated post appears

## MODIFIED Requirements

### Requirement: Single bespoke post template
All posts SHALL render through one design-system-native template styled with the existing brand tokens (chapter themes, display type, accent treatments) — no per-post layout variants, and no per-locale layout variants. The template SHALL display: category, publish date formatted for the rendering locale (`pl-PL` on Polish pages, `en-US` on English pages), estimated reading time, title, cover image, and the rich-text body. The cover image is shared across locales.

The template's header SHALL be a plum grain stage using the site's established stage recipe — a plum-dark→plum gradient, an orange radial glow, and the feTurbulence grain overlay at `soft-light` — carrying the breadcrumb, title, lead, and meta, with the cover image contained within the stage.

#### Scenario: Any post renders
- **WHEN** any published post is viewed in either locale
- **THEN** it uses the same template, with category, locale-formatted date, reading time, title, cover, and body present

#### Scenario: Date follows the locale
- **WHEN** the same post is viewed at its Polish URL and at its English URL
- **THEN** the publish date renders in Polish format on the first and English format on the second, for the same underlying date

#### Scenario: Header carries the brand stage
- **WHEN** a post page is rendered
- **THEN** the header area displays the plum grain stage treatment, visually consistent with the homepage stage sections

#### Scenario: Post without a cover
- **WHEN** a published post has no cover image
- **THEN** the header stage still renders with its copy, and no empty media box is shown

### Requirement: Lexical content rendered through design-system components
The Lexical rich-text body SHALL be rendered with `@payloadcms/richtext-lexical/react` using custom converters: upload nodes render via the project `Image` component, link nodes via the project `Link` component (internal links resolving to relative paths **in the rendering locale**), and headings, lists, and quotes styled by the post template's CSS module. Unknown node types SHALL NOT crash the page.

Rendered `h2` and `h3` headings SHALL additionally carry a stable, unique `id` anchor supplied by the server-side table-of-contents walk, so that every table-of-contents link resolves to an element on the page. Anchors SHALL be derived from the heading text in the rendering locale, and the fallback anchor used for an unsluggable heading SHALL be in the rendering locale.

#### Scenario: Rich content post
- **WHEN** a post body contains headings, links, lists, a quote, and embedded images
- **THEN** each renders through the mapped design-system component or styled element, and images use the optimized `Image` component

#### Scenario: Unhandled node type
- **WHEN** the body contains a node type without a custom converter
- **THEN** the page still renders, falling back to the library's default output for that node

#### Scenario: Heading anchors match the table of contents
- **WHEN** a post with headings is rendered in either locale
- **THEN** every `id` emitted on a heading corresponds exactly to one table-of-contents entry, and every table-of-contents entry targets an existing heading

#### Scenario: Repeated heading text
- **WHEN** two headings in one post have identical text
- **THEN** each receives a distinct anchor and each table-of-contents entry targets its own heading

#### Scenario: Polish characters in a heading
- **WHEN** a heading contains Polish diacritics, for example "Co sprawdzamy?"
- **THEN** its anchor is an ASCII slug such as `co-sprawdzamy`, and the matching table-of-contents link resolves to it

#### Scenario: Unsluggable heading in English
- **WHEN** an English heading yields no usable slug and the fallback anchor is used
- **THEN** the anchor is an English fallback, not the Polish `sekcja`

### Requirement: Post SEO metadata
Each post page SHALL emit `generateMetadata` output for its own locale: title (`metaTitle` fallback to title), description (`metaDescription` fallback to excerpt), canonical URL at that locale's post path, Open Graph/Twitter tags with `ogImage` falling back to the shared cover image, and `hreflang` alternates to its counterpart where one exists, with `x-default` pointing at the Polish URL. Published posts SHALL be included in `app/sitemap.ts` with their `lastModified`; a post's English URL SHALL appear only once it carries an English translation.

#### Scenario: Metadata fallbacks
- **WHEN** a post has no SEO fields filled in the rendering locale
- **THEN** metadata falls back to that locale's post title, excerpt, and the shared cover image, and the canonical URL is that locale's post path

#### Scenario: Hreflang pair on a translated post
- **WHEN** a translated post renders at either of its URLs
- **THEN** it emits an alternate referencing the other URL and `x-default` referencing the Polish URL

#### Scenario: No English alternate before translation
- **WHEN** an untranslated post renders at its Polish URL
- **THEN** it emits no `hreflang="en"` alternate

#### Scenario: Sitemap coverage
- **WHEN** the sitemap is generated
- **THEN** every published post appears with its Polish URL, every translated post additionally appears with its English URL, and no draft or untranslated English URL appears
