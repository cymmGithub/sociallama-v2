## ADDED Requirements

### Requirement: Lead metric is the first result
For every case study the **lead metric** SHALL be the first entry of `results` in the rendering locale, and each result group's lead SHALL be that group's first entry in array order, where a group is the set of results sharing a `platform` value in order of first appearance. No other field or heuristic SHALL choose the lead; editors choose it by ordering the array. The `results` and `platform` admin descriptions SHALL state this.

#### Scenario: First result is the face
- **WHEN** a study's `results` begin with `TikTok / Wyświetlenia / 11 mln`
- **THEN** the hub card's numeral and the detail scoreboard's large numeral both read `11 mln` labelled `TikTok · Wyświetlenia`

#### Scenario: Group leads follow array order
- **WHEN** a study's results list `Facebook` entries, then `Instagram`, then `LinkedIn`
- **THEN** the scoreboard shows the Facebook lead large and the Instagram and LinkedIn leads small, in that order, and the results ledger orders its groups Facebook, Instagram, LinkedIn

#### Scenario: Study without results
- **WHEN** a study has no results
- **THEN** the hub card shows the cover on the stage with no numeral, and the detail hero renders the cover without a scoreboard; nothing renders a placeholder value

### Requirement: Platform normalization on read
The system SHALL derive a study's platforms by normalizing each `results[].platform` value (lower-cased, non-alphanumerics stripped) and keeping only the five keys the brand-icon set knows: `facebook`, `instagram`, `tiktok`, `linkedin`, `youtube`. Any other value SHALL be treated as a result group without a platform and SHALL NOT be rewritten or surfaced as a platform. A value that contains more than one platform name (`Facebook / Instagram`) SHALL match neither. Platforms SHALL label metrics — the brand mark beside a numeral, the hero's `Platformy` row, the ledger row's marks — and SHALL NOT drive the hub's filter, which is the study's industry.

#### Scenario: Brand group is not a platform
- **WHEN** a study's results include the group `FoodSaver` beside `Facebook` and `Instagram`
- **THEN** the study's platforms are `facebook` and `instagram`, and the `FoodSaver` group still renders in the results ledger and can be the lead metric

#### Scenario: Composite label matches nothing
- **WHEN** a result group is labelled `Facebook / Instagram (Niemcy)`
- **THEN** it contributes no platform mark; the study's place in the industry index is unaffected

#### Scenario: No known platform
- **WHEN** every result group of a study is a non-platform label
- **THEN** the study has no platform marks anywhere, and is still filed and filtered under its own industry

### Requirement: Parenthetical values render in two parts
A metric value whose text ends in a parenthesized suffix, such as `432 616 (+1 380%)` or `+50% (z 368 do 549)`, SHALL render the part before the parenthesis as the numeral and the parenthesized part as a secondary line in the accent color, on every surface that shows the value. The stored value SHALL NOT change and the accessible name of the metric SHALL remain the full string.

#### Scenario: Split on the ledger
- **WHEN** a lead metric's value is `432 616 (+1 380%)`
- **THEN** the numeral reads `432 616` and a secondary line reads `+1 380%`; the element's text content still contains the full value

#### Scenario: Plain value is untouched
- **WHEN** a value has no trailing parenthesis, such as `prawie 3 mln`
- **THEN** it renders as a single numeral

### Requirement: Detail scoreboard hero
The detail hero SHALL be two columns from the desktop breakpoint: the left column holds the breadcrumb, client logo, `h1`, lead paragraph and a meta rail; the right column holds the **scoreboard**, the cover image under a plum gradient carrying the first group's lead metric as a large accent numeral and up to two further groups' lead metrics as small numerals, each labelled with its group and, for a known platform, its brand mark. Below the desktop breakpoint the columns stack, scoreboard first after the title block. The full-width 16:9 cover below the hero SHALL be removed; the cover appears only inside the scoreboard.

The meta rail SHALL list, as label/value rows: `Platformy` (the study's normalized platforms with brand marks; omitted when none), `Branża` (the study's tags; omitted when none), and `Zakres` (the distinct `approach[].tag` values in order; omitted when none).

#### Scenario: Scoreboard shows group leads
- **WHEN** the iRobot study renders
- **THEN** the scoreboard shows `11 mln` large with the TikTok mark and `742 tys.` small with the YouTube mark, over the cover; no second copy of the cover renders on the page

#### Scenario: Meta rail derives from fields
- **WHEN** a study has TikTok and YouTube results, three tags and pillars tagged `#HUMOR`, `#EDUKACJA`, `#INNOWACJA`
- **THEN** the rail shows `Platformy` with two marks, `Branża` with three tag labels, and `Zakres` reading `#HUMOR · #EDUKACJA · #INNOWACJA`

#### Scenario: No cover
- **WHEN** a study has no cover
- **THEN** the scoreboard renders on the plum ground alone with the same numerals

### Requirement: Detail section rail
From the desktop breakpoint the article body SHALL be two columns: a sticky rail of in-page links to the section headings present on the page (`Nasz klient`, `Wyzwanie`, `Wyniki`, `Podejście`, `Galeria` when rendered), and the content column. The rail SHALL mark the section currently in view, SHALL use the sections' existing heading ids as link targets, and SHALL NOT render below the desktop breakpoint. The rail SHALL NOT carry a call-to-action; the header CTA and the closing CTA remain the page's two.

#### Scenario: Rail lists present sections only
- **WHEN** a study has no `client.about` and no gallery
- **THEN** the rail lists `Wyzwanie`, `Wyniki`, `Podejście` only

#### Scenario: Rail link scrolls to the section
- **WHEN** a visitor activates `Wyniki` in the rail
- **THEN** the results section heading scrolls into view under the fixed header and the rail marks `Wyniki` current

#### Scenario: Prev-page rail does not linger
- **WHEN** a visitor navigates from one study to another
- **THEN** the rail reflects the new study's sections and current-section state; nothing from the previous page's observer survives

### Requirement: Results ledger
The results section SHALL render each result group as a ledger block: a group heading (brand mark when the group is a known platform, then the label), the group's lead metric as a large numeral with an orange rule and its metric label beneath, and the remaining metrics as small numerals with labels in a row of up to four tracks that wraps. Metrics SHALL keep their array order. Numerals SHALL use tabular figures and the count-up behavior of the current tiles. No metric SHALL render on a filled tile.

#### Scenario: Twelve metrics, three groups
- **WHEN** the Julius Meinl study renders
- **THEN** three ledger blocks render (Facebook, Instagram, LinkedIn), each with one large numeral and three small ones, and no orange tile is present

#### Scenario: Single-metric group
- **WHEN** a group holds one metric
- **THEN** the block renders the large numeral alone with no empty small-metric row

### Requirement: Hub board card
Each hub card SHALL present, top to bottom: the cover under the plum stage gradient with the study's lead metric as one accent numeral and a one-line group label (brand mark when the group is a known platform), then the client logo (or name), the title, the tags, and the read link. The card SHALL NOT show the excerpt. Every card's numeral SHALL sit on the same baseline across a row regardless of how many groups the study has; the label SHALL be a single non-wrapping line, truncated with an ellipsis when too long.

#### Scenario: One numeral per card
- **WHEN** the iRobot and Volvo cards render side by side
- **THEN** iRobot shows `11 mln · TikTok · Wyświetlenia`, Volvo shows `+1000 · Facebook · Volvo Car Warszawa — nowi obserwatorzy` truncated to one line, and both numerals share a baseline

#### Scenario: Excerpt not on the card
- **WHEN** any card renders
- **THEN** the study's excerpt text is not present in the card

### Requirement: Case study industry
Every case study SHALL carry exactly one `industry`, chosen from a closed list whose keys are the `id` values of the site's own branże (`lib/content/branze.ts`) plus the categories that have no landing page yet. The field SHALL NOT be localized: one stored key names the same category in both locales, and its display name and route come from that locale's industry content. `tags` SHALL remain free descriptive labels and SHALL NOT drive any filter.

#### Scenario: One taxonomy, not two
- **WHEN** a study is filed under `automotive`
- **THEN** the Polish hub labels it `Motoryzacja` and the English hub `Automotive`, both reading the branża's own name, and both count the study under the same key

#### Scenario: Category without a page
- **WHEN** a study is filed under a category that has no `/branze` page yet, such as `retail`
- **THEN** the hub still lists and filters it, and offers no link to a page that does not exist

#### Scenario: Tags are not categories
- **WHEN** a study carries the tags `Supermarket`, `Retail`, `Moderacja`
- **THEN** none of them appears in the industry index; the study is filtered by its `industry` alone

### Requirement: Hub industry rail
The hub SHALL render an industry index listing `Wszystkie` and every industry that at least one published study carries, with the count of studies per entry, in the taxonomy's own order. Selecting an entry SHALL filter the grid to studies carrying it, composing with the text search (both must match). `Wszystkie` SHALL be selected by default. The filter SHALL be client state only: no route, no query parameter, no card image re-requested on change. From the desktop breakpoint the index SHALL be a sticky rail in the left column; below it, a horizontal chip row above the grid. Counts SHALL be computed at build from the published studies and SHALL NOT change while filtering. An industry with a published page SHALL offer a link to it while selected.

#### Scenario: Filter by industry
- **WHEN** a visitor selects `Motoryzacja`
- **THEN** only studies filed under `automotive` remain visible, in manual order, and the live region announces the count

#### Scenario: Industry and search compose
- **WHEN** `Nieruchomości i Deweloperzy` is selected and the visitor types `ed-invest`
- **THEN** only Ed-Invest remains; clearing the search keeps the industry filter

#### Scenario: Empty intersection
- **WHEN** an industry and a query match no study together
- **THEN** the search empty state renders and the industry selection remains

#### Scenario: Counts are honest
- **WHEN** the rail renders
- **THEN** each industry's count equals the number of published studies carrying it, and an industry no study carries is not listed — so no selection can produce an empty grid

#### Scenario: An unwritten page is not linked
- **WHEN** the visitor selects an industry whose `/branze` page has not been written
- **THEN** the rail filters the grid and shows no page link

### Requirement: Hub grid and ledger views
The hub SHALL offer a two-state view toggle, `Siatka` (default) and `Ledger`, from the desktop breakpoint only. The ledger view SHALL render one row per study: client logo (or name), title with the tags as a line beneath, the lead metric as a numeral with an orange rule and its label, the other groups' lead metrics as small numerals, the study's platform marks, and a link affordance; the whole row SHALL link to the study. Both views SHALL show the same filtered set in the same order; switching SHALL NOT change the URL or re-request card images.

#### Scenario: Toggle to ledger
- **WHEN** a visitor selects `Ledger`
- **THEN** the grid is replaced by rows, one per visible study, and the platform filter and search still apply

#### Scenario: Ledger row content
- **WHEN** the ENGIE row renders
- **THEN** it shows the ENGIE mark, the title, `Energetyka · Zrównoważony rozwój · Personal branding`, `263 996 · LinkedIn · Łączna liczba wyświetleń publikacji`, `69,1 tys.` as the Facebook lead, and LinkedIn + Facebook marks

#### Scenario: Not offered on mobile
- **WHEN** the hub renders below the desktop breakpoint
- **THEN** no view toggle renders and the grid is used

### Requirement: English hub and detail mirror the Polish surfaces
The `/en/case-studies` hub and `/en/case-studies/[slug]` detail SHALL render the same scoreboard, rail, ledger and view surfaces over English-resolved fields with English chrome copy (`Platforms`, `Industry`, `Scope`, `All`, `Grid`, `Ledger`, section names). Platform normalization and the industry key SHALL both be locale-independent.

#### Scenario: English chrome
- **WHEN** `/en/case-studies` renders
- **THEN** the rail reads `All` and the English branża names, the toggle reads `Grid` / `Ledger`, and every count equals the Polish hub's
