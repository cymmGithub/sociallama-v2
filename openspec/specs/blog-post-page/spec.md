# blog-post-page Specification

## Purpose
TBD - created by archiving change add-payload-blog. Update Purpose after archive.
## Requirements
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
All posts SHALL render through one design-system-native template styled with the existing brand tokens (chapter themes, display type, accent treatments) — no per-post layout variants. The template SHALL display: category, formatted publish date (`pl-PL`), estimated reading time, title, cover image, and the rich-text body.

The template's header SHALL be a plum grain stage using the site's established stage recipe — a plum-dark→plum gradient, an orange radial glow, and the feTurbulence grain overlay at `soft-light` — carrying the breadcrumb, title, lead, and meta, with the cover image contained within the stage.

#### Scenario: Any post renders
- **WHEN** any published post is viewed
- **THEN** it uses the same template, with category, `pl-PL`-formatted date, reading time, title, cover, and body present

#### Scenario: Header carries the brand stage
- **WHEN** a post page is rendered
- **THEN** the header area displays the plum grain stage treatment, visually consistent with the homepage stage sections

#### Scenario: Post without a cover
- **WHEN** a published post has no cover image
- **THEN** the header stage still renders with its copy, and no empty media box is shown

### Requirement: Lexical content rendered through design-system components
The Lexical rich-text body SHALL be rendered with `@payloadcms/richtext-lexical/react` using custom converters: upload nodes render via the project `Image` component, link nodes via the project `Link` component (internal links resolving to relative paths), and headings, lists, and quotes styled by the post template's CSS module. Unknown node types SHALL NOT crash the page.

Rendered `h2` and `h3` headings SHALL additionally carry a stable, unique `id` anchor supplied by the server-side table-of-contents walk, so that every table-of-contents link resolves to an element on the page.

#### Scenario: Rich content post
- **WHEN** a post body contains headings, links, lists, a quote, and embedded images
- **THEN** each renders through the mapped design-system component or styled element, and images use the optimized `Image` component

#### Scenario: Unhandled node type
- **WHEN** the body contains a node type without a custom converter
- **THEN** the page still renders, falling back to the library's default output for that node

#### Scenario: Heading anchors match the table of contents
- **WHEN** a post with headings is rendered
- **THEN** every `id` emitted on a heading corresponds exactly to one table-of-contents entry, and every table-of-contents entry targets an existing heading

#### Scenario: Repeated heading text
- **WHEN** two headings in one post have identical text
- **THEN** each receives a distinct anchor and each table-of-contents entry targets its own heading

#### Scenario: Polish characters in a heading
- **WHEN** a heading contains Polish diacritics, for example "Co sprawdzamy?"
- **THEN** its anchor is an ASCII slug such as `co-sprawdzamy`, and the matching table-of-contents link resolves to it

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

### Requirement: Sticky post rail
On desktop viewports the post page SHALL display a sticky rail beside the article body containing, in order: the table of contents and share links. The rail SHALL remain visible while the body scrolls and SHALL be offset below the fixed site header.

The rail SHALL NOT carry author identity — that belongs to the author card after the body, which is the page's single attribution surface (see the `blog-authors` capability).

#### Scenario: Rail persists while reading
- **WHEN** a visitor scrolls through a long post on desktop
- **THEN** the rail remains visible and does not slide beneath the fixed header

#### Scenario: Rail on mobile
- **WHEN** a post is viewed below the desktop breakpoint
- **THEN** no sticky rail is rendered; the table of contents appears as a collapsed disclosure above the body, and share links appear after the body

#### Scenario: Post with no table of contents
- **WHEN** a post with fewer than three headings is viewed on desktop
- **THEN** no rail is rendered at all and the share links appear after the body, so no empty gutter is left beside the article

#### Scenario: Share links
- **WHEN** the rail is displayed
- **THEN** it offers share actions for LinkedIn and Facebook and a copy-link action, each with an accessible name

### Requirement: Table of contents with active-section tracking
Posts with three or more `h2`/`h3` headings SHALL display a table of contents listing those headings in document order, with `h3` entries visually subordinate to `h2` entries. The entry corresponding to the reader's current position SHALL be marked as current. Activating an entry SHALL scroll to its heading.

#### Scenario: Reader scrolls through sections
- **WHEN** a visitor scrolls a post so that a new section heading passes the top of the viewport
- **THEN** the table-of-contents entry for that section becomes the current entry and earlier entries do not

#### Scenario: Jumping to a section
- **WHEN** a visitor activates a table-of-contents entry
- **THEN** the page scrolls to that heading, positioned clear of the fixed header, and the address bar reflects the heading's anchor

#### Scenario: Landing on an anchor directly
- **WHEN** a visitor opens a post URL that already includes a heading anchor
- **THEN** the page lands with that heading positioned clear of the fixed header

#### Scenario: Short post
- **WHEN** a post has fewer than three `h2`/`h3` headings
- **THEN** no table of contents is rendered, and no rail is rendered either — the share links move below the body

### Requirement: Estimated reading time
Each post page SHALL display an estimated reading time in minutes, derived from the post's own content at render time. No editor-entered field SHALL be required.

#### Scenario: Reading time shown
- **WHEN** a post is viewed
- **THEN** its header meta includes an estimated reading time in minutes

#### Scenario: Very short post
- **WHEN** a post's body contains only a few sentences
- **THEN** the reading time reads at least one minute rather than zero

#### Scenario: Content is edited
- **WHEN** an editor substantially lengthens a published post
- **THEN** the displayed reading time reflects the new length without any additional editor action

### Requirement: In-article call to action and newsletter block
The post page SHALL render a call-to-action block within the article and a newsletter sign-up block after the article, both using the plum grain stage treatment. The newsletter block SHALL submit through the site's existing Mailchimp subscription action and SHALL report success and failure to the reader.

#### Scenario: Newsletter sign-up succeeds
- **WHEN** a visitor submits a valid address to the post page's newsletter block
- **THEN** the address is submitted through the existing subscription action and the visitor sees a confirmation

#### Scenario: Newsletter sign-up fails
- **WHEN** the subscription action returns an error
- **THEN** the visitor sees a message explaining what went wrong, and the entered address is preserved

### Requirement: Related posts
The post page SHALL end with up to three related published posts, excluding the current post. Selection SHALL prefer posts sharing the current post's category and SHALL top up with the newest published posts when the category yields fewer than three.

#### Scenario: Category has enough posts
- **WHEN** a post's category contains at least three other published posts
- **THEN** three posts from that category are shown, and the current post is not among them

#### Scenario: Sparse category
- **WHEN** a post's category contains fewer than three other published posts
- **THEN** the remaining slots are filled with the newest published posts from any category

#### Scenario: Related lookup fails
- **WHEN** the related-posts query fails
- **THEN** the post renders without the related section rather than returning an error page

