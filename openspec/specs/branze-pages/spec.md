# branze-pages

## Purpose

Define the per-industry (`/branze/*` and `/en/industries/*`) marketing pages: the canonical industry list that drives every surface, live routing in both locales, proof-vs-editorial variant selection, industry-specific approved copy, and the localized SEO surface for these pages.
## Requirements
### Requirement: Canonical industry list drives every surface

A single typed content module SHALL define the canonical industry list — order, PL/EN labels, PL/EN slugs — per the design D1 table (proof-first order, PL labels: Motoryzacja, Elektronika i AGD, Beauty, Zdrowie, Finanse, Zoologiczna, then Alkohole, Moda, Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy, Rozrywka; EN labels unchanged). The overlay menu BRANŻE column, the footer OFERTA column, `generateStaticParams`, and the sitemap SHALL all derive from this module in this order, in both locales. Labels are bare nouns or elliptical adjectives — no "Branża" prefix anywhere. PL slugs stay as originally shipped (`automotive`, `health`, `fashion`, `petcare`, …) — a label rename never changes a URL.

#### Scenario: One list, all surfaces

- **WHEN** the menu overlay, footer, and sitemap render in either locale
- **THEN** all three present the same 12 industries in the same canonical order with identical labels and hrefs

#### Scenario: Alcohol not first

- **WHEN** the industry list renders anywhere
- **THEN** Alkohole/Alcohol appears at position 7, never first

#### Scenario: Renamed labels keep their routes

- **WHEN** the Motoryzacja, Zdrowie, Moda or Zoologiczna item is activated anywhere in the PL chrome
- **THEN** it navigates to `/branze/automotive`, `/branze/health`, `/branze/fashion` or `/branze/petcare` respectively, each returning 200

### Requirement: Every industry resolves to a live page in both locales

Each of the 12 industries SHALL have a statically generated page at `/branze/<pl-slug>` and `/en/industries/<en-slug>`, and an index SHALL exist at `/branze` and `/en/industries` (see `industries-hub`). No industry link in the menu or footer may 404, and neither index path may 404. Footer OFERTA items SHALL link to these routes (replacing the current `/` placeholders).

#### Scenario: All 24 routes live

- **WHEN** any industry URL from the canonical list is requested
- **THEN** it returns 200 with that industry's page in the matching locale

#### Scenario: Footer links go live

- **WHEN** the footer renders
- **THEN** each OFERTA item navigates to its industry page, not to `/`

#### Scenario: Index routes live

- **WHEN** `/branze` or `/en/industries` is requested
- **THEN** it returns 200 with the industries index in the matching locale

### Requirement: Variant is selected by proof data

Both variants SHALL open with the shared industry hero (a per-industry background clip over a plum band, with a poster fallback; solid display wordmark; lead) followed by the under-hero brief. An industry whose content entry carries a `caseStudy` block SHALL then render the proof layout: wall of real feed creatives, numbers band, quote with case-study card linking to `/case-studies/<slug>` (locale-appropriate), CTA. An industry without one SHALL render the editorial layout: a photo collage strip beneath the brief, keyword marquee, manifesto with stat chips, CTA.

Blocks SHALL render from the data present rather than being reserved to one variant: a proof page SHALL also render its `collage`, `marquee` and `manifesto` when present, so promoting an industry to a proof page never silently drops its editorial copy. The proof block's `quote` SHALL be optional — a proof page without a collected client testimonial renders its creatives, numbers and case card and simply omits the blockquote, rather than carrying an invented quote. The numbers band SHALL read a dedicated `numbers` field (case-study metrics) distinct from the manifesto's `chips` (editorial value words), so a page carrying both renders each once.

Note (2026-07-24): the design evolved after the proposal — a shared video hero replaced the two divergent heroes (the editorial outline-wordmark and the plain proof band), the collage moved beneath the brief and dropped its duotone, the brief's icon motifs were removed, and the client-logo strip was cut entirely (no client logos on industry pages).

Note (2026-07-25): with 45 imported case studies available, every industry with a matching study became a proof page featuring its strongest match — ten of twelve. Only Finanse and Fashion, which have no honest match, remain editorial.

#### Scenario: Proof page renders evidence

- **WHEN** `/branze/automotive` renders
- **THEN** it shows real Volvo creatives, stats consistent with the published case study, and a card linking to the Volvo case study

#### Scenario: Editorial page renders without proof affordances

- **WHEN** an industry without a `caseStudy` block renders
- **THEN** it shows the editorial layout and no case-study card, with no empty proof placeholders

#### Scenario: Promotion preserves editorial copy

- **WHEN** an industry that has `collage`, `marquee` and `manifesto` gains a `caseStudy` block
- **THEN** it renders the proof blocks AND still renders its collage, marquee and manifesto

#### Scenario: Proof page without a testimonial

- **WHEN** a proof industry's `caseStudy` has no `quote`
- **THEN** the page renders the creatives wall, numbers band and case-study card, and omits the blockquote entirely

### Requirement: Industry pages link their related case studies

An industry content entry MAY carry a list of related case studies, each identified by a case-study `slug` and a locale-authored short `title`. When the list is present and non-empty, the industry page SHALL render a compact row of cards linking to `/case-studies/<slug>` in the page's own locale. The featured case study SHALL NOT be repeated in the row. A related-study card SHALL render title-only when its study has no logo asset, rather than a broken image. When the list is absent or empty, the page SHALL render no related-studies affordance and no empty placeholder.

#### Scenario: Related studies link out

- **WHEN** an industry with related case studies renders
- **THEN** it shows a row of cards linking to each study, excluding the one already featured in its proof block

#### Scenario: Industry without related studies shows nothing

- **WHEN** an industry has no related case studies configured
- **THEN** the page renders no related-studies row and no empty placeholder

#### Scenario: Links are locale-correct

- **WHEN** the English industry page for a mapped industry renders
- **THEN** each related-study card links to `/en/case-studies/<slug>` using the same non-localized slug

#### Scenario: Missing logo degrades gracefully

- **WHEN** a related study has no `<slug>-logo.png` asset
- **THEN** its card renders the title without attempting to load an image

### Requirement: Copy is industry-specific and user-approved

Every page SHALL carry copy written for that industry (hero claim, manifesto, marquee keywords, stat/value chips) in PL and EN — no shared boilerplate body across industries. Copy SHALL be reviewed by the user before ship. Proof-page statistics SHALL match the published case study verbatim.

#### Scenario: No cross-industry boilerplate

- **WHEN** any two industry pages are compared
- **THEN** their hero claims, manifestos, and marquee keyword sets differ beyond the industry name

### Requirement: Localized SEO surface for industry pages

Each page SHALL emit locale-correct metadata (title, description, OG), hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 24 detail URLs plus both index URLs SHALL appear in the sitemap. On the two industries with measured search demand, the Polish metadata title SHALL lead with the demand phrase and the page SHALL open with a lead paragraph matching that search intent: `hotele-i-miejsca-wypoczynkowe` targets "marketing hotelu" (with "social media dla hoteli" in title or description), and `nieruchomosci-i-deweloperzy` targets "marketing nieruchomości". The remaining ten industry pages are unchanged. Lead-paragraph copy falls under the existing user-approval requirement for industry copy.

#### Scenario: Hreflang pair

- **WHEN** `/branze/petcare` or `/en/industries/pet` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists all 12 PL and all 12 EN industry URLs, plus `/branze` and `/en/industries`

#### Scenario: Hotels page targets its demand phrase

- **WHEN** `/branze/hotele-i-miejsca-wypoczynkowe` renders
- **THEN** its metadata title leads with "Marketing hotelu" and its opening lead paragraph addresses hotel marketing intent

#### Scenario: Real-estate page targets its demand phrase

- **WHEN** `/branze/nieruchomosci-i-deweloperzy` renders
- **THEN** its metadata title leads with "Marketing nieruchomości" and its opening lead paragraph addresses real-estate marketing intent

#### Scenario: Other industries untouched

- **WHEN** any of the other ten industry pages renders
- **THEN** its metadata and copy are unchanged by this change

### Requirement: Industry pages link back to the industries hub

Each industry page's hero SHALL open with a back link to the industries hub, in the slot the section label occupies today: a left-arrow icon (lucide `ArrowLeft`, hidden from assistive technology) followed by the section label text, linking to `/branze` on Polish pages and `/en/industries` on English pages. The link SHALL be a deterministic hub link, not a history-based back action, and SHALL be keyboard-focusable with a visible focus style. The label text and its typographic treatment SHALL match the current section label so the hero composition is unchanged.

#### Scenario: Back link navigates to the hub

- **WHEN** a visitor activates the hero's section-label link on any `/branze/<slug>` or `/en/industries/<slug>` page
- **THEN** they navigate to that locale's industries hub

#### Scenario: Accessible name is the label

- **WHEN** assistive technology reads the back link
- **THEN** its accessible name is the section label text, with the arrow icon not separately announced

#### Scenario: Deep-linked visitors can go up

- **WHEN** a visitor lands directly on an industry page with no in-site history
- **THEN** the back link still navigates to the industries hub

### Requirement: Polish industry copy carries no standalone English phrases

PL industry content (labels, pillars, chips, marquee entries, briefs, manifestos, meta titles and descriptions) SHALL NOT contain list items or headings written entirely in English. Entrenched loanwords and trade terms of art used within Polish phrasing are permitted (e.g. Beauty, Horeca, B2B, fintech, storytelling, content, influencer marketing, social commerce, UGC). Meta titles SHALL use naturally declined Polish forms of the industry name.

#### Scenario: No all-English list items

- **WHEN** any PL industry page renders its pillars, chips or marquee
- **THEN** no entry is a standalone English phrase (the former „Thought leadership", „Community", „Community marketing", „Trend-driven content" render as their Polish replacements)

#### Scenario: Copy follows the renamed label

- **WHEN** the PL Zdrowie page renders its brief
- **THEN** the industry is referred to in Polish („branża zdrowotna"), not as „branża health"

#### Scenario: Meta titles decline the industry name

- **WHEN** the PL meta title renders for a renamed industry
- **THEN** it reads „Social media dla branży motoryzacyjnej / zdrowotnej / modowej / zoologicznej" for Motoryzacja / Zdrowie / Moda / Zoologiczna respectively

### Requirement: An industry that loses its featured study falls back to editorial
An industry whose featured case study is withdrawn SHALL have its `numbers` and `caseStudy` blocks removed from the content entry in both locales, so the page renders the editorial layout from its existing collage, marquee and manifesto content rather than carrying numbers and creatives from a study that no longer exists. The industry itself stays in the canonical list and at its route.

#### Scenario: Health renders editorial
- **WHEN** `/branze/health` and `/en/industries/health` render after the Adamed withdrawal
- **THEN** both return 200 with the editorial layout, show no Adamed creative or metric, and contain no link to the Adamed case study

### Requirement: Desktop brief orbit mirrors the GOOD ONE wheel structure
The desktop brief on an industry page SHALL position its pillar chips as direct children of the orbit box, using the same registered `--spin` transform chain as the GOOD ONE wheel on `/o-nas`, so that the chips render on the ring in WebKit and Chromium alike.

#### Scenario: Chips sit on the ring
- **WHEN** `/branze/elektronika-i-agd` is rendered at a desktop viewport in Chromium or WebKit
- **THEN** each pillar chip's bounding-box centre is at distance `--item-r` (±10%) from the hub centre, and no two chips share a centre

#### Scenario: List semantics survive the flat structure
- **WHEN** the orbit box is inspected in the accessibility tree
- **THEN** the chips are exposed as list items of one list, and the hub kicker text remains readable

#### Scenario: Mobile fallback unchanged
- **WHEN** the page is rendered below the desktop breakpoint
- **THEN** the orbit is not in the accessibility tree and the flat kicker + chip list renders as before

