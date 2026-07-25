# services-pages

## Purpose

Define the services section (`/uslugi/*` and `/en/services/*`): the canonical service list that drives every surface, live routing in both locales, the ordered section-primitive composition model that lets each service declare its own page body, the page structures the client-documented services must follow, the CONTENT page's platform sections and their related-posts behaviour, topical blog links matched by category, graceful degradation of optional sections, and the localized SEO surface for these pages.

## Requirements

### Requirement: Every services route resolves in both locales

The six services SHALL each have a statically generated page at `/uslugi/<pl-slug>` and `/en/services/<en-slug>` (`strategia`/`strategy`, `content`/`content`, `sprzedaz`/`sales`, `kreacje-wideo`/`creative-video`, `audyt-i-konsultacje`/`audit-consulting`, `influencer-marketing`/`influencer-marketing`), plus an index at `/uslugi` and `/en/services`. No menu, footer, or homepage services-tab link may 404.

#### Scenario: All 14 routes live

- **WHEN** any services URL from the canonical list is requested
- **THEN** it returns 200 with that page in the matching locale

#### Scenario: Footer and homepage CTAs resolve

- **WHEN** a footer OFERTA link or a homepage services-tab "DOWIEDZ SIĘ WIĘCEJ" CTA is activated
- **THEN** it navigates to the corresponding live service page

### Requirement: Pages compose ordered section primitives

Each service SHALL declare an ordered list of typed section descriptors, and its page SHALL render exactly those sections in that order. The available kinds are `hero`, `platforms`, `triptych`, `partner`, `showreel`, `proof`, `checklist`, `timeline`, `banner`, `logoStrip`, and `posts`. Sections SHALL be dispatched by their declared kind, not by which properties they happen to carry, so that two kinds sharing a field name cannot be confused for one another. No service page may be forced into a fixed section sequence.

#### Scenario: Designed pages match their compositions

- **WHEN** `/uslugi/content` renders
- **THEN** it shows the hero followed by the platform sections, and no triptych, partner, or showreel section

#### Scenario: Distinct composition per service

- **WHEN** `/uslugi/kreacje-wideo` renders
- **THEN** it shows hero, triptych, partner, and showreel sections in that order

#### Scenario: Adding a section kind is additive

- **WHEN** a new section kind is added to the union and used by one service
- **THEN** other services' pages render unchanged

#### Scenario: Kinds sharing a field are not confused

- **WHEN** two section kinds declare a field of the same name and both appear in the section list
- **THEN** each renders with its own layout, and neither is swallowed by the other

### Requirement: Documented services follow their client page structure

The three services with client copy documents — Strategia, Influencer marketing, and Audyt i konsultacje — SHALL compose the page structure those documents specify, in both locales.

#### Scenario: Strategia composition

- **WHEN** `/uslugi/strategia` renders
- **THEN** it shows a hero, a four-item benefits triptych, a checklist of strategy contents, a four-step process timeline, and a standalone-strategy banner, in that order
- **AND** no proof section appears on the page

#### Scenario: Audyt composition

- **WHEN** `/uslugi/audyt-i-konsultacje` renders
- **THEN** it shows a hero with a call-to-action, a deliverables checklist, a strip of the six audited platform marks, a consultation banner, and a proof section
- **AND** no triptych appears on the page

#### Scenario: A proof case is not duplicated across services

- **WHEN** the service pages are taken together
- **THEN** no single case study appears as the proof case on more than one of them

#### Scenario: Influencer marketing carries the group framing

- **WHEN** `/uslugi/influencer-marketing` renders
- **THEN** its Folks partner block identifies Folks as part of Grupa Good One and closes with the group line "Jeden partner. Wiele kompetencji. BETTER WORKS."

#### Scenario: A four-item triptych leaves no orphan

- **WHEN** a triptych with four items renders at desktop width
- **THEN** the items are laid out without a single item stranded alone on its own row

### Requirement: The consultation booking step routes to contact

The audit page's consultation banner SHALL offer a single call to action that routes to the site's own contact page. No third-party scheduling widget or external calendar SHALL be embedded, and the call-to-action wording SHALL NOT promise a capability the destination does not provide.

#### Scenario: Booking call-to-action

- **WHEN** the consultation banner's call to action is activated
- **THEN** it navigates to the contact page

#### Scenario: No scheduler embedded

- **WHEN** the audit page loads
- **THEN** it requests no third-party scheduling or calendar script

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

### Requirement: Topical blog links match by category and omit when empty

A `posts` section SHALL list up to three published blog posts drawn from the categories it declares, queried read-only. When no posts match, the entire section — including its heading — SHALL be omitted. Because the blog is Polish-only, the section SHALL NOT render in the English locale.

#### Scenario: Category with matching posts

- **WHEN** a posts section declares a category that has published posts
- **THEN** up to three of them are listed as links to those posts

#### Scenario: Category with no matching posts

- **WHEN** a posts section's categories yield no published posts
- **THEN** neither its heading nor any empty link rows render

#### Scenario: English locale omits the section

- **WHEN** the English counterpart of a page carrying a posts section renders
- **THEN** no posts section appears

### Requirement: Optional sections degrade rather than render empty

Sections whose assets or data are unavailable — showreel clips, partner imagery, proof case studies — SHALL be omitted from the page rather than rendered as empty frames or placeholder boxes. Where a section's *media* is optional but its copy is not, the section SHALL render copy-only rather than reserving an empty media frame.

#### Scenario: Showreel without clips

- **WHEN** the showreel section has no clips available
- **THEN** the section is omitted entirely and no empty band renders

#### Scenario: Checklist without its graphic

- **WHEN** a checklist section has no accompanying graphic
- **THEN** its items render full-width and no empty image frame or placeholder box appears

### Requirement: Copy is service-specific

Every page SHALL carry copy written for that service in PL and EN — no boilerplate shared across services, and nothing carried over from the Figma placeholder text.

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
