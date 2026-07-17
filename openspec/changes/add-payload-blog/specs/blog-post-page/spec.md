## ADDED Requirements

### Requirement: Root-level post URLs
Published posts SHALL be served at root-level paths `/{slug}` via a dynamic segment at `app/(frontend)/[slug]/`, giving exact URL parity with the live WordPress site (user decision, 2026-07-17). Static routes (`/blog`, `/category/*`, future pages) SHALL take precedence over the post segment. Unknown slugs SHALL return a 404 via `notFound()`.

#### Scenario: Live-site URL resolves
- **WHEN** a visitor requests `/linkedin-premium-czy-warto` and a published post has that slug
- **THEN** the post page renders with HTTP 200 at that exact path, with no redirect

#### Scenario: Unknown slug
- **WHEN** a visitor requests a root-level path matching no published post and no static route
- **THEN** the app's 404 page is returned

#### Scenario: Draft post URL
- **WHEN** a visitor without draft mode requests the slug of a draft-only post
- **THEN** the app's 404 page is returned

### Requirement: Single bespoke post template
All posts SHALL render through one design-system-native template styled with the existing brand tokens (chapter themes, display type, accent treatments) — no per-post layout variants. The template SHALL display: category, formatted publish date (`pl-PL`), title, cover image, and the rich-text body.

#### Scenario: Any post renders
- **WHEN** any published post is viewed
- **THEN** it uses the same template, with category, `pl-PL`-formatted date, title, cover, and body present

### Requirement: Lexical content rendered through design-system components
The Lexical rich-text body SHALL be rendered with `@payloadcms/richtext-lexical/react` using custom converters: upload nodes render via the project `Image` component, link nodes via the project `Link` component (internal links resolving to relative paths), and headings, lists, and quotes styled by the post template's CSS module. Unknown node types SHALL NOT crash the page.

#### Scenario: Rich content post
- **WHEN** a post body contains headings, links, lists, a quote, and embedded images
- **THEN** each renders through the mapped design-system component or styled element, and images use the optimized `Image` component

#### Scenario: Unhandled node type
- **WHEN** the body contains a node type without a custom converter
- **THEN** the page still renders, falling back to the library's default output for that node

### Requirement: Post SEO metadata
Each post page SHALL emit `generateMetadata` output: title (`metaTitle` fallback to title), description (`metaDescription` fallback to excerpt), canonical URL at the root-level path, and Open Graph/Twitter tags with `ogImage` falling back to the cover image. Published posts SHALL be included in `app/sitemap.ts` with their `lastModified`.

#### Scenario: Metadata fallbacks
- **WHEN** a post has no SEO fields filled
- **THEN** metadata falls back to the post title, excerpt, and cover image, and the canonical URL is the root-level post path

#### Scenario: Sitemap coverage
- **WHEN** the sitemap is generated
- **THEN** every published post appears with its root-level URL, and no draft appears

### Requirement: Draft preview
Editors SHALL be able to preview drafts from the admin panel: the post's preview button opens the post template in Next.js draft mode showing the draft version. Draft mode SHALL be inaccessible without going through the authenticated preview flow.

#### Scenario: Editor previews a draft
- **WHEN** an editor uses the preview action on a draft post
- **THEN** the real post template renders the draft content at its future URL

#### Scenario: Visitor cannot see drafts
- **WHEN** a visitor without an authenticated preview session requests a draft's URL
- **THEN** they receive a 404, not draft content
