## MODIFIED Requirements

### Requirement: Every services route resolves in both locales

The seven services SHALL each have a statically generated page at `/uslugi/<pl-slug>` and `/en/services/<en-slug>` (`strategia`/`strategy`, `content`/`content`, `sprzedaz`/`sales`, `kampanie-reklamowe`/`ad-campaigns`, `kreacje-wideo`/`creative-video`, `audyt-i-konsultacje`/`audit-consulting`, `influencer-marketing`/`influencer-marketing`), plus an index at `/uslugi` and `/en/services`. No menu, footer, or homepage services-tab link may 404.

#### Scenario: All 16 routes live

- **WHEN** any services URL from the canonical list is requested
- **THEN** it returns 200 with that page in the matching locale

#### Scenario: Footer and homepage CTAs resolve

- **WHEN** a footer OFERTA link or a homepage services-tab "DOWIEDZ SIĘ WIĘCEJ" CTA is activated
- **THEN** it navigates to the corresponding live service page

#### Scenario: The new service is reachable from the menu

- **WHEN** the USŁUGI mega-menu column renders at desktop width in either locale
- **THEN** it lists the ad-campaigns page directly after the sales page, and the link resolves

### Requirement: Localized SEO surface for service pages

Each page SHALL emit locale-correct metadata, hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 16 URLs SHALL appear in the sitemap. Where a page's navigation label omits the terms the page is primarily about, its metadata title SHALL name them.

#### Scenario: Hreflang pair

- **WHEN** `/uslugi/kreacje-wideo` or `/en/services/creative-video` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists the index and all seven service URLs in both locales

#### Scenario: Title carries terms the label drops

- **WHEN** `/uslugi/kampanie-reklamowe` renders
- **THEN** its metadata title names SEO and Google Ads, which its navigation label does not

### Requirement: Optional sections degrade rather than render empty

Sections whose assets or data are unavailable — showreel clips, partner imagery, proof case studies — SHALL be omitted from the page rather than rendered as empty frames or placeholder boxes. Where a section's *media* is optional but its copy is not, the section SHALL render copy-only rather than reserving an empty media frame. A checklist MAY instead carry a decorative backdrop loop in place of a graphic; when it does, its copy SHALL invert to stay legible against the darkened ground, and the section SHALL remain fully readable from its copy alone.

#### Scenario: Showreel without clips

- **WHEN** the showreel section has no clips available
- **THEN** the section is omitted entirely and no empty band renders

#### Scenario: Checklist without its graphic

- **WHEN** a checklist section has no accompanying graphic
- **THEN** its items render full-width and no empty image frame or placeholder box appears

#### Scenario: Checklist with a backdrop

- **WHEN** a checklist section declares a backdrop loop
- **THEN** the loop plays muted behind a scrim, is exposed to assistive technology as decorative rather than as content, and the heading, intro, and ticked items render in the inverted palette

## ADDED Requirements

### Requirement: The ad-campaigns page presents the group's search offer

`/uslugi/kampanie-reklamowe` and its English counterpart SHALL present six capability tiles — SEO, ADS, content marketing, SEO audits, websites, and analytics & reporting — followed by a partner section identifying SEOFly as part of Grupa Good One. Tiles SHALL NOT be numbered, since they describe parallel capabilities rather than a sequence.

#### Scenario: Six capability tiles

- **WHEN** the ad-campaigns page renders
- **THEN** all six tiles appear, each with its own blurb

#### Scenario: Tiles are unnumbered

- **WHEN** the capability tiles render
- **THEN** no ordinal number is shown on any tile

#### Scenario: Partner section carries the group framing

- **WHEN** the ad-campaigns page renders
- **THEN** its partner section identifies SEOFly as part of Grupa Good One and closes with the group line "Jeden partner. Wiele kompetencji. BETTER WORKS."

#### Scenario: Partner section carries the SEOFly mark

- **WHEN** the ad-campaigns page's partner section renders
- **THEN** it shows the SEOFly logo in a light-on-dark lockup, and where no logo asset is available it renders the wordmark instead, with no empty logo frame

### Requirement: Paid social and search are separated and cross-linked

Advertising services SHALL be divided by channel: the sales page owns paid social, and the ad-campaigns page owns search and the website. The ad-campaigns page SHALL NOT claim paid-social platforms as its own. Because the mega-menu shows labels only and cannot distinguish the two, each page SHALL link to the other, and the services index SHALL describe them in contrasting terms.

#### Scenario: The ADS tile does not claim paid social

- **WHEN** the ad-campaigns page's ADS tile renders
- **THEN** it describes search advertising and does not present Meta or TikTok advertising as this page's offer

#### Scenario: Reciprocal cross-links

- **WHEN** either the sales page or the ad-campaigns page renders
- **THEN** it links to the other as the place to find the advertising channels it does not cover

#### Scenario: Index summaries contrast

- **WHEN** the `/uslugi` index renders
- **THEN** the sales card's summary names social platforms and the ad-campaigns card's summary names search, so the two are distinguishable without opening either page
