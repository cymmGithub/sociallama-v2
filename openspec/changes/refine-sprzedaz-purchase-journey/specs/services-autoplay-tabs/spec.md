# services-autoplay-tabs — delta for refine-sprzedaz-purchase-journey

## MODIFIED Requirements

### Requirement: Per-tab stage media from typed descriptors
Each service item in `lib/content/home.ts` SHALL declare its stage media as a
typed union — `panels` (list of image panels, each optionally framed as a
device: laptop, phone, or tablet), `video` (list of framed clips), `journey`
(purchase-journey step content), or `placeholder` — and the stage SHALL render
each kind accordingly: unframed panels as floating rounded/shadowed cards
DOM-positioned over the gradient with a staggered entrance on tab activation;
device-framed panels inside CSS-built device bezels sharing the same
positioning and stagger vocabulary; video as phone-framed 9:16 `Video`
primitives centered in the stage (alternating tilts) with `autoPlay` bound to
the tab's active state; journey as five DOM-built UI vignette cards (social
post, CTA click chip, shop browser window, cart chip, order-confirmation
receipt) positioned over a decorative dashed SVG flow path rendered beneath
them, sharing the panels' positioning and stagger vocabulary so the steps
enter in order 01→05; placeholder as the styled gradient stage with no media
and no reserved empty panel space.

The video rail SHALL play exactly one clip at a time: the clip at index
`floor(count / 2)` by default (the middle clip; with four clips, the third),
while every non-playing clip renders dimmed with a centered play badge and a
full-card button labelled from the localized `playLabel` plus the clip's alt
text. Tapping a non-playing clip SHALL make it the playing clip; the
previously playing clip SHALL freeze on its current frame (not snap back to
its poster) and SHALL resume from that position if re-selected. The playing
clip SHALL render no button and no dimming.

Journey vignette content SHALL come from the stage descriptor as plain
strings rendered as HTML text (no text baked into raster assets), with icons
from lucide-react; each vignette SHALL carry a numbered step chip (01–05) and
a caption strip naming the agency's role in that step.

#### Scenario: Content tab panels
- **WHEN** the CONTENT tab activates
- **THEN** its seven 4:5 brand creatives (Burger King hero, Social Lama × DPD, Breville, pracuj.pl/iRobot/Vobis, Laurastar, Easy Egg, Kohersen — served from `public/assets/content-*.jpg`) enter as individually positioned floating panels with a visible stagger, in a seven-slot collage tuned for the uniform 4:5 ratio (center hero, inner flanks, corner slots; the low-res Kohersen occupies the smallest slot); on mobile only the first three (Burger King, DPD, Breville) render

#### Scenario: One clip plays while its tab is active
- **WHEN** the KREACJE I WIDEO tab is active with motion allowed on desktop/tablet
- **THEN** the rail shows four clips and only the default clip plays muted and looping while the other three sit dimmed behind play badges; **WHEN** another tab activates **THEN** no clip plays

#### Scenario: Four clips fit the rail at every desktop width
- **WHEN** the KREACJE I WIDEO tab renders at any viewport at or above the desktop breakpoint
- **THEN** all four phone frames fit inside the stage side by side without horizontal overflow or aspect-ratio distortion, keeping the alternating tilt rhythm across all four frames

#### Scenario: Tap switches the playing clip
- **WHEN** the user taps a dimmed clip's play button
- **THEN** that clip undims and plays, the previously playing clip dims and freezes on its current frame, and re-selecting the frozen clip later resumes it from that frame

#### Scenario: Sprzedaż purchase-journey collage on desktop
- **WHEN** the SPRZEDAŻ tab activates at or above the desktop breakpoint
- **THEN** five vignette cards — post (with product photo and HTML overlay pill + headline), "KUP TERAZ" click chip, shop browser window (packshot, product name, price, "DODAJ DO KOSZYKA"), cart chip with badge, and order-confirmation receipt — enter with the staggered entrance in step order over a dashed flow path, each showing its step chip and its role caption (TWORZYMY / CELUJEMY / PROWADZIMY / DOMYKAMY / MIERZYMY with their tails)

#### Scenario: Sprzedaż journey condensed on mobile
- **WHEN** the SPRZEDAŻ item renders in the mobile stacked stage
- **THEN** exactly three vignettes render — post (01), shop browser window (03), and order-confirmation receipt (05) — so the story arc completes from post to order rather than cutting off mid-funnel

#### Scenario: Placeholder stage kind
- **WHEN** any service declares the `placeholder` stage kind (supported for future tabs without assets)
- **THEN** the stage shows the deliberately styled gradient state with the service title as an outlined watermark (no broken/empty panel frames), and the tab participates in the autoplay loop like the others

## ADDED Requirements

### Requirement: Journey content is fictional, generic, and localized
The SPRZEDAŻ journey SHALL depict a fictional shop ("twojamarka") with no
real client brand, trademark, or logo visible anywhere in the stage; the only
raster assets SHALL be two committed crops of one brand-free stock photo
(Pexels photo 20336139: 4:5 post crop, square text-free packshot crop), and
every string in the journey (post caption, overlays, CTA, URL text, product
name and price, cart and receipt lines, role captions, step labels) SHALL
live in the localized content layer with a PL version in `home.ts` and an EN
version in `home.en.ts` that keep the two descriptors structurally identical.
The SPRZEDAŻ tab body copy SHALL be updated in both locales to the approved
"od posta do zamówienia" framing.

#### Scenario: No real brand in the journey stage
- **WHEN** the SPRZEDAŻ stage renders in either locale
- **THEN** no real product brand, trademark, or client name appears in the journey vignettes (the fictional "twojamarka" handle, domain text, and generic product photo are the only identities shown)

#### Scenario: Locale parity for journey strings
- **WHEN** the locale-parity test compares the PL and EN home content
- **THEN** the SPRZEDAŻ journey descriptors are structurally identical, with every journey string translated in `home.en.ts` (EN captions in the approved voice, e.g. WE CREATE / WE TARGET / WE DRIVE / WE CLOSE / WE MEASURE)

#### Scenario: Retired dashboard assets removed
- **WHEN** the change is complete
- **THEN** the six `public/assets/sprzedaz-*.png` device mockups are deleted and no reference to them remains in the codebase
