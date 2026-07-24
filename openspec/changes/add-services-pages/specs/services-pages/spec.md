## ADDED Requirements

### Requirement: Every services route resolves in both locales

The six services SHALL each have a statically generated page at `/uslugi/<pl-slug>` and `/en/services/<en-slug>` (`strategia`/`strategy`, `content`/`content`, `sprzedaz`/`sales`, `kreacje-wideo`/`creative-video`, `audyt-i-konsultacje`/`audit-consulting`, `influencer-marketing`/`influencer-marketing`), plus an index at `/uslugi` and `/en/services`. No menu, footer, or homepage services-tab link may 404.

#### Scenario: All 14 routes live

- **WHEN** any services URL from the canonical list is requested
- **THEN** it returns 200 with that page in the matching locale

#### Scenario: Footer and homepage CTAs resolve

- **WHEN** a footer OFERTA link or a homepage services-tab "DOWIEDZ SIĘ WIĘCEJ" CTA is activated
- **THEN** it navigates to the corresponding live service page

### Requirement: Pages compose ordered section primitives

Each service SHALL declare an ordered list of typed section descriptors, and its page SHALL render exactly those sections in that order. The available kinds are `hero`, `platforms`, `triptych`, `partner`, `showreel`, and `proof`. No service page may be forced into a fixed section sequence.

#### Scenario: Designed pages match their compositions

- **WHEN** `/uslugi/content` renders
- **THEN** it shows the hero followed by the platform sections, and no triptych, partner, or showreel section

#### Scenario: Distinct composition per service

- **WHEN** `/uslugi/kreacje-wideo` renders
- **THEN** it shows hero, triptych, partner, and showreel sections in that order

#### Scenario: Adding a section kind is additive

- **WHEN** a new section kind is added to the union and used by one service
- **THEN** other services' pages render unchanged

### Requirement: Hero follows the shipped homepage treatment

Every service page hero SHALL use the site's existing minimal header, a flat brand-plum ground with no gradient, the shared llama render, the service title, and an intro paragraph. The stale header, gradient, footer, and marquee shown in the Figma source SHALL NOT be reproduced; the shipped footer and marquee components are used instead.

#### Scenario: No gradient hero

- **WHEN** any service page hero renders
- **THEN** its background is flat brand plum and the page uses the shipped header, footer, and marquee components

### Requirement: Platform sections cover seven platforms with cubes

The CONTENT page SHALL present seven platform sections — Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, YouTube — each with its levitating-cube asset, platform name, service copy, and a related-posts block. Cube media placement SHALL alternate sides down the page. All seven cube assets SHALL be web-optimized.

#### Scenario: Seven platforms present

- **WHEN** `/uslugi/content` renders
- **THEN** all seven platform sections appear, each with its own cube asset, and media sides alternate

#### Scenario: Cubes are optimized

- **WHEN** the CONTENT page loads
- **THEN** no single cube asset is served at the unoptimized ~600 KB–1 MB source weight

### Requirement: Related posts auto-match and omit when empty

A platform section SHALL show up to three blog posts matching that platform, queried read-only from Payload. When no posts match, the entire related-posts block — including its heading — SHALL be omitted rather than rendering empty slots.

#### Scenario: Platform with matching posts

- **WHEN** a platform has matching posts
- **THEN** up to three are listed as links to those posts

#### Scenario: Platform with no matching posts

- **WHEN** a platform has zero matching posts
- **THEN** no "PRZECZYTAJ RÓWNIEŻ" heading or empty link rows render for that section

### Requirement: Optional sections degrade rather than render empty

Sections whose assets or data are unavailable — showreel clips, partner imagery, proof case studies — SHALL be omitted from the page rather than rendered as empty frames or placeholder boxes.

#### Scenario: Showreel without clips

- **WHEN** the showreel section has no clips available
- **THEN** the section is omitted entirely and no empty band renders

### Requirement: Copy is service-specific and user-approved

Every page SHALL carry copy written for that service in PL and EN — no boilerplate shared across services, and nothing carried over from the Figma placeholder text. Copy SHALL be reviewed by the user before ship.

#### Scenario: No placeholder copy ships

- **WHEN** any service page renders
- **THEN** its body copy differs per service and per platform, and contains none of the repeated Figma placeholder paragraphs

### Requirement: Localized SEO surface for service pages

Each page SHALL emit locale-correct metadata, hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 14 URLs SHALL appear in the sitemap.

#### Scenario: Hreflang pair

- **WHEN** `/uslugi/kreacje-wideo` or `/en/services/creative-video` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists the index and all six service URLs in both locales
