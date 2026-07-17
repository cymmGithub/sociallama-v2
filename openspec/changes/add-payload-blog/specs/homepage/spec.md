## MODIFIED Requirements

### Requirement: Content sections from typed data
All section copy (nav, hero, services, steps, client names, featured testimonial, footer, contact) SHALL come from `lib/content/home.ts`; components SHALL contain no hardcoded copy. Non-services copy SHALL match the verified content export verbatim; the three service bodies are instead trimmed to one short sentence each (~20 words) for the autoplay-tabs layout, with the original long-form texts preserved in the content module (commented or exported separately) for future `/uslugi/*` pages. FAQ and multi-post blog grid are excluded from v1. The NewsLAMA section is the exception to static sourcing: it SHALL render the latest published post fetched server-side from Payload's Local API (cover, category, `pl-PL`-formatted date, title, excerpt, link to the root-level post URL), with only its static labels (heading, read label) sourced from `lib/content/home.ts`; the hardcoded post object is removed from the content module. When no published post exists, the NewsLAMA section SHALL render nothing rather than a broken or placeholder card.

#### Scenario: Content fidelity
- **WHEN** the homepage renders
- **THEN** the five how-it-works steps, 13 client names, featured iRobot testimonial (Małgorzata Radomska), and footer contact details match the export exactly

#### Scenario: Trimmed service bodies
- **WHEN** the services section renders
- **THEN** each of the three service descriptions is a single short sentence sourced from `lib/content/home.ts`, and the original long-form texts remain available in the content module

#### Scenario: Excluded sections
- **WHEN** the homepage renders
- **THEN** no FAQ section exists and NewsLAMA shows exactly one large post card

#### Scenario: NewsLAMA shows the latest post
- **WHEN** the homepage renders with published posts in the CMS
- **THEN** NewsLAMA shows the newest published post's cover, category, date, title, and excerpt, linking to `/{slug}`, and updates automatically when a newer post is published (via revalidation, no redeploy)

#### Scenario: NewsLAMA with no published posts
- **WHEN** the homepage renders with zero published posts
- **THEN** the NewsLAMA section is omitted entirely and surrounding chapters render without layout breakage
