## MODIFIED Requirements

### Requirement: Listing routes answer the right HTTP status
The blog and category listing routes SHALL send their `notFound()` and `permanentRedirect()` on the response line rather than rendering them into an already-committed 200, while keeping the pages themselves prerendered.

This replaces the recorded-not-fixed requirement that `fix-case-study-404-status` left behind.

#### Scenario: Unknown category
- **WHEN** `/category/{unknown}` or `/en/blog/category/{unknown}` is requested with a slug no category owns
- **THEN** the response status is 404

#### Scenario: Out-of-range or malformed page number
- **WHEN** `/blog/page/999`, `/en/blog/page/999`, `/category/{slug}/page/999` or `/blog/page/abc` is requested
- **THEN** the response status is 404

#### Scenario: Page one redirects to its canonical URL
- **WHEN** `/blog/page/1` or `/category/{slug}/page/1` is requested
- **THEN** the response is a 308 to `/blog` or `/category/{slug}`, rather than a 200 rendering the non-canonical page with a `NEXT_REDIRECT` marker in the flight payload

#### Scenario: An empty collection still builds
- **WHEN** a collection has no published documents and the build prerenders whatever param `generateStaticParams` emits for it
- **THEN** the build succeeds, because no prerendered param reaches `notFound()`
