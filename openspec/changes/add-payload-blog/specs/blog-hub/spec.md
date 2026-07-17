## ADDED Requirements

### Requirement: Blog hub at /blog
A `/blog` page SHALL list published posts newest-first as cards showing cover, category, `pl-PL`-formatted date, title, excerpt, and a read link to the root-level post URL. The hub SHALL be styled with the design system (brand tokens, existing card language) and be indexable (no `noindex`), mirroring the live site's indexed `sociallama.pl/blog/` hub.

#### Scenario: Hub lists posts
- **WHEN** a visitor opens `/blog` with published posts in the CMS
- **THEN** posts appear newest-first, each card linking to `/{slug}`

#### Scenario: No posts yet
- **WHEN** `/blog` is opened with zero published posts
- **THEN** the page renders an intentional empty state (no crash, no broken layout)

### Requirement: Hub pagination
The hub SHALL paginate with a fixed page size, exposing further pages at crawlable URLs. Out-of-range page numbers SHALL return 404. Page 1 SHALL be canonical at `/blog` (not `/blog/page/1`).

#### Scenario: Second page
- **WHEN** more posts exist than one page holds and the visitor navigates to page 2
- **THEN** the next set of posts renders at a crawlable URL with links to adjacent pages

#### Scenario: Out-of-range page
- **WHEN** a visitor requests a page number beyond the last page
- **THEN** a 404 is returned

### Requirement: Category listing pages
Category pages SHALL exist at `/category/{slug}` for each category, matching the live site's indexed category URLs exactly (`marketing`, `reklama`, `seo`, `social-media`). Each SHALL list that category's published posts newest-first using the hub's card layout and pagination, display the category name, and return 404 for unknown category slugs. Category pages SHALL be included in the sitemap; the `/blog` hub SHALL link to them.

#### Scenario: Live category URL resolves
- **WHEN** a visitor requests `/category/social-media`
- **THEN** published posts in that category render newest-first with HTTP 200 at that exact path

#### Scenario: Unknown category
- **WHEN** a visitor requests `/category/nonexistent`
- **THEN** a 404 is returned
