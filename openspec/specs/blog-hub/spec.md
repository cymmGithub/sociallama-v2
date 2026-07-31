# blog-hub Specification

## Purpose
TBD - created by archiving change add-payload-blog. Update Purpose after archive.
## Requirements
### Requirement: Blog hub at /blog
A `/blog` page SHALL present published posts as a curated hub rather than a flat chronological list. It SHALL compose, in order: a statement header with category filters and search; the featured post alongside the editors' picks; the most-read post alongside a short list of further posts; the video spotlight when one is set; and the complete archive of published posts as a paginated grid, newest-first.

Every post card SHALL show cover, category, locale-formatted date, title, excerpt, and author byline, and SHALL link to the post URL for the rendering locale. The hub SHALL be styled with the design system (brand tokens, existing card language) and be indexable (no `noindex`), mirroring the live site's indexed `sociallama.pl/blog/` hub.

Posts occupying curation slots SHALL also appear in the archive grid; the grid SHALL remain the complete list of published posts available in the rendering locale.

#### Scenario: Hub lists posts
- **WHEN** a visitor opens `/blog` with published posts in the CMS
- **THEN** the curated sections render above a grid listing all published posts newest-first, each card linking to `/{slug}`

#### Scenario: Featured post also appears in the archive
- **WHEN** a post is set as the featured post
- **THEN** it appears both in the featured position and in its normal chronological place in the grid

#### Scenario: No posts yet
- **WHEN** `/blog` is opened with zero published posts
- **THEN** the page renders an intentional empty state (no crash, no broken layout) and no curated sections

### Requirement: Hub pagination
The hub SHALL paginate its archive grid with a fixed page size, exposing further pages at crawlable URLs. Out-of-range page numbers SHALL return 404. Page 1 SHALL be canonical at the hub URL (not `/page/1`).

Pages after the first SHALL present the archive grid, heading, category filters, and pagination only — the curated sections belong to page 1.

Hub pagination URLs SHALL appear in the sitemap in both locales, since they are crawlable and are how the archive beyond page 1 is discovered. A locale's page count SHALL follow that locale's own post count, so the two locales may expose different numbers of pages.

#### Scenario: Second page
- **WHEN** more posts exist than one page holds and the visitor navigates to page 2
- **THEN** the next set of posts renders at a crawlable URL with links to adjacent pages

#### Scenario: Later pages omit the curated sections
- **WHEN** a visitor opens `/blog/page/2`
- **THEN** no featured post, editors' picks, most-read block, or video spotlight is rendered

#### Scenario: Out-of-range page
- **WHEN** a visitor requests a page number beyond the last page
- **THEN** a 404 is returned

#### Scenario: Pagination is discoverable
- **WHEN** the sitemap is generated
- **THEN** it lists the hub pagination URLs for both locales, each locale's set matching its own page count

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

### Requirement: Searching the archive from the hub

The hub SHALL let a visitor filter the archive by text, matching against post titles and excerpts in the rendering locale. Matching SHALL be insensitive to case and to diacritics. Search SHALL NOT introduce a new route or a crawlable URL.

Result-count copy SHALL follow the rendering locale's own plural rules. The Polish three-form plural SHALL NOT be applied to English; English count copy is authored independently rather than translated from the Polish forms.

#### Scenario: Filtering by a phrase
- **WHEN** a visitor types a phrase matching words in some post titles or excerpts
- **THEN** the archive grid shows only the matching posts

#### Scenario: Diacritic-insensitive matching
- **WHEN** a visitor types a query without Polish diacritics, such as `wpisow`
- **THEN** posts containing the diacritic form, such as `wpisów`, are matched

#### Scenario: English search matches English text
- **WHEN** a visitor searches on `/en/blog`
- **THEN** matching runs against the English titles and excerpts, not the Polish ones

#### Scenario: English result count
- **WHEN** the English hub reports how many posts matched
- **THEN** the copy uses English singular/plural forms, never a Polish plural form

#### Scenario: No matches
- **WHEN** a query matches no posts
- **THEN** the grid shows an empty state explaining that nothing matched, and the query remains editable

#### Scenario: Pagination while filtering
- **WHEN** a search query is active
- **THEN** all matching posts are shown together and pagination controls are hidden

#### Scenario: Clearing the query
- **WHEN** a visitor clears the search field
- **THEN** the archive returns to its first page with pagination restored

### Requirement: English blog hub at /en/blog

An `/en/blog` page SHALL present translated posts using the same composition, layout, and card language as the Polish hub, rendered inside the English root layout with `<html lang="en">`. It SHALL list **only posts carrying genuine English translations** — the archive grid, the curated positions, the category filters, and the search index all draw from the translated set. Post cards SHALL show `en-US`-formatted dates and link to `/en/blog/{en-slug}`. English pagination SHALL live at `/en/blog/page/{n}`, with page 1 canonical at `/en/blog`.

The English hub SHALL be a single shared implementation with the Polish hub, parameterized by locale — not a duplicated component tree.

#### Scenario: English hub lists translated posts
- **WHEN** a visitor opens `/en/blog` with translated posts in the CMS
- **THEN** the hub renders with English chrome and copy, listing only translated posts newest-first, each card linking to `/en/blog/{en-slug}`

#### Scenario: Untranslated posts are absent
- **WHEN** the English hub renders while some posts have no English translation
- **THEN** those posts appear nowhere on the page — not in the grid, not in a curated slot, not in the search index — and no Polish text is shown

#### Scenario: Pagination counts only translated posts
- **WHEN** some posts are translated and others are not, and `/en/blog` renders
- **THEN** its page count and result count reflect the translated posts alone, every page is full up to the last, and no `/en/blog/page/{n}` exists beyond that count

#### Scenario: Fixed-size selections are never starved
- **WHEN** an English surface asks for a fixed number of posts — the latest post, up to three related posts, or the hub's candidate pool
- **THEN** it receives translated posts up to that number whenever enough exist, rather than being emptied by untranslated posts occupying the selection

#### Scenario: No translations yet
- **WHEN** `/en/blog` is opened before any post has been translated
- **THEN** the page renders its intentional empty state, with no crash, no broken layout, no Polish content, and no `/en/blog/page/{n}` route

#### Scenario: English dates
- **WHEN** an English post card renders
- **THEN** its date is formatted for `en-US`, not `pl-PL`

### Requirement: English category listing pages

English category pages SHALL exist at `/en/blog/category/{en-slug}` for each category, using its English name and English slug, listing that category's translated posts newest-first with the plain grid layout and pagination at `/en/blog/category/{en-slug}/page/{n}`. Unknown English category slugs SHALL return 404. English category pages SHALL be included in the sitemap and linked from the English hub. They SHALL NOT render the hub's curated sections.

#### Scenario: English category URL resolves
- **WHEN** a visitor requests an English category URL under `/en/blog/category/`
- **THEN** that category's translated posts render newest-first with HTTP 200, under the English category name

#### Scenario: Polish category slug is not an English URL
- **WHEN** `/en/blog/category/{pl-slug}` is requested for a category whose English slug differs
- **THEN** a 404 is returned

#### Scenario: Category with no translated posts
- **WHEN** an English category page is opened for a category whose posts are all untranslated
- **THEN** it renders its empty state rather than listing Polish posts

