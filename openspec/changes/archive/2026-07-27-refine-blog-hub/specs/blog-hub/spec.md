## MODIFIED Requirements

### Requirement: Blog hub at /blog
A `/blog` page SHALL present published posts as a curated hub rather than a flat chronological list. It SHALL compose, in order: a statement header with category filters and search; the featured post alongside the editors' picks; the most-read post alongside a short list of further posts; a newsletter sign-up block; the video spotlight when one is set; and the complete archive of published posts as a paginated grid, newest-first.

Every post card SHALL show cover, category, `pl-PL`-formatted date, title, excerpt, and author byline, and SHALL link to the root-level post URL. The hub SHALL be styled with the design system (brand tokens, existing card language) and be indexable (no `noindex`), mirroring the live site's indexed `sociallama.pl/blog/` hub.

Posts occupying curation slots SHALL also appear in the archive grid; the grid SHALL remain the complete list of published posts.

#### Scenario: Hub lists posts
- **WHEN** a visitor opens `/blog` with published posts in the CMS
- **THEN** the curated sections render above a grid listing all published posts newest-first, each card linking to `/{slug}`

#### Scenario: Featured post also appears in the archive
- **WHEN** a post is set as the featured post
- **THEN** it appears both in the featured position and in its normal chronological place in the grid

#### Scenario: No posts yet
- **WHEN** `/blog` is opened with zero published posts
- **THEN** the page renders an intentional empty state (no crash, no broken layout) and no curated sections

#### Scenario: Newsletter sign-up on the hub
- **WHEN** a visitor submits a valid address to the hub's newsletter block
- **THEN** the address is submitted through the site's existing subscription action and the visitor sees a confirmation

### Requirement: Hub pagination
The hub SHALL paginate its archive grid with a fixed page size, exposing further pages at crawlable URLs. Out-of-range page numbers SHALL return 404. Page 1 SHALL be canonical at `/blog` (not `/blog/page/1`).

Pages after the first SHALL present the archive grid, heading, category filters, and pagination only — the curated sections belong to page 1.

#### Scenario: Second page
- **WHEN** more posts exist than one page holds and the visitor navigates to page 2
- **THEN** the next set of posts renders at a crawlable URL with links to adjacent pages

#### Scenario: Later pages omit the curated sections
- **WHEN** a visitor opens `/blog/page/2`
- **THEN** no featured post, editors' picks, most-read block, or video spotlight is rendered

#### Scenario: Out-of-range page
- **WHEN** a visitor requests a page number beyond the last page
- **THEN** a 404 is returned

### Requirement: Category listing pages
Category pages SHALL exist at `/category/{slug}` for each category, matching the live site's indexed category URLs exactly (`marketing`, `reklama`, `seo`, `social-media`). Each SHALL list that category's published posts newest-first using the plain grid layout and pagination, display the category name, and return 404 for unknown category slugs. Category pages SHALL be included in the sitemap; the `/blog` hub SHALL link to them.

Category pages SHALL NOT render the hub's curated sections, which are scoped to `/blog`.

#### Scenario: Live category URL resolves
- **WHEN** a visitor requests `/category/social-media`
- **THEN** published posts in that category render newest-first with HTTP 200 at that exact path

#### Scenario: Category page layout
- **WHEN** a category page is rendered
- **THEN** it shows the category name, filters, the post grid, and pagination, with no featured post, editors' picks, most-read block, or video spotlight

#### Scenario: Unknown category
- **WHEN** a visitor requests `/category/nonexistent`
- **THEN** a 404 is returned

## ADDED Requirements

### Requirement: Searching the archive from the hub

The hub SHALL let a visitor filter the archive by text, matching against post titles and excerpts. Matching SHALL be insensitive to case and to Polish diacritics. Search SHALL NOT introduce a new route or a crawlable URL.

#### Scenario: Filtering by a phrase
- **WHEN** a visitor types a phrase matching words in some post titles or excerpts
- **THEN** the archive grid shows only the matching posts

#### Scenario: Diacritic-insensitive matching
- **WHEN** a visitor types a query without Polish diacritics, such as `wpisow`
- **THEN** posts containing the diacritic form, such as `wpisów`, are matched

#### Scenario: No matches
- **WHEN** a query matches no posts
- **THEN** the grid shows an empty state explaining that nothing matched, and the query remains editable

#### Scenario: Pagination while filtering
- **WHEN** a search query is active
- **THEN** all matching posts are shown together and pagination controls are hidden

#### Scenario: Clearing the query
- **WHEN** a visitor clears the search field
- **THEN** the archive returns to its first page with pagination restored
