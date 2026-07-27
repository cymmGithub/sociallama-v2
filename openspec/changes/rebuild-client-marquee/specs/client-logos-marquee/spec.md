## ADDED Requirements

### Requirement: Roster sourced from the approved client set
The belt roster SHALL be exactly the brands approved for the homepage in the `TOP MARKI na strone główną` source, and SHALL NOT include brands absent from it. Brands whose separate marks share a single case study SHALL be merged into one belt entry. Removing a brand from the roster SHALL NOT remove its testimonial from the homepage testimonial slider, which carries its own independent entries.

#### Scenario: Brand absent from the approved set
- **WHEN** the belt renders
- **THEN** no brand outside the approved client set appears in it

#### Scenario: Retired brand keeps its slider testimonial
- **WHEN** a brand with a verified quote is removed from the belt roster
- **THEN** its quote still appears in the homepage testimonial slider

#### Scenario: Two marks, one case study
- **WHEN** the approved set contains separate Dom Volvo and Volvo Car Warszawa marks that share the `volvo` case study
- **THEN** the belt shows a single merged VOLVO entry linking to that study

### Requirement: Three card states
Hovering a logo SHALL produce one of three outcomes, determined by what content that brand actually has. A brand with a testimonial SHALL show a quote card. A brand with no testimonial but a published case study SHALL show a numbers card. A brand with neither SHALL show no card at all, rendering as a bare logo. No entry SHALL carry placeholder or lorem-ipsum quote content.

#### Scenario: Brand with a verified testimonial
- **WHEN** the user hovers a logo whose brand has a testimonial
- **THEN** a quote card opens showing that quote and its author footer

#### Scenario: Brand with a case study but no testimonial
- **WHEN** the user hovers a logo whose brand has a published case study but no testimonial
- **THEN** a numbers card opens summarising the work in figures

#### Scenario: Brand with neither
- **WHEN** the user hovers a logo whose brand has no testimonial and no published case study
- **THEN** no card opens and the logo shows only the hover spotlight

#### Scenario: No placeholder content anywhere
- **WHEN** the belt content is inspected
- **THEN** no entry carries a lorem-ipsum quote or a placeholder author name

### Requirement: Numbers card summarises the work in figures
A numbers card SHALL lead with a concise authored sentence built around the brand's most impressive metric from its case study, in the locale being viewed. The sentence SHALL be authored content, not assembled mechanically from raw metric rows, so that it reads naturally and the chosen figure is a deliberate editorial pick.

Below the sentence the card SHALL present up to three supporting figures, each a value with a label naming its metric and channel, so the card carries substance rather than a single line. Supporting figures SHALL NOT repeat the figure the sentence already names. Where a case study reports too few metrics to fill three, the card SHALL show fewer rather than padding with weak ones.

#### Scenario: Numbers card copy
- **WHEN** a numbers card opens for a brand
- **THEN** it shows one short sentence containing that brand's headline figure, followed by that brand's supporting figures

#### Scenario: Supporting figures add to the sentence
- **WHEN** the sentence names a brand's headline metric
- **THEN** none of the supporting figures beneath it restates that same metric

#### Scenario: Case study with few reported metrics
- **WHEN** a brand's case study reports only one metric beyond its headline figure
- **THEN** the card shows that single supporting figure rather than padding to three

#### Scenario: Locale parity
- **WHEN** the numbers card opens on the English homepage
- **THEN** the sentence and every supporting figure appear in English, matching the Polish entry one-for-one

### Requirement: Case study CTA links to the published study
A card SHALL show the "Case study" CTA only when its brand has a published case study. Activating the CTA SHALL navigate to that study's page in the current locale. Brands without a case study SHALL show no CTA at all rather than a disabled or decorative one.

#### Scenario: Brand with a published case study
- **WHEN** the user activates the "Case study" CTA on a card
- **THEN** the browser navigates to that brand's case-study page

#### Scenario: Brand without a case study
- **WHEN** a card opens for a brand with no published case study
- **THEN** no "Case study" CTA is rendered

## MODIFIED Requirements

### Requirement: Testimonial card on logo hover
Hovering a logo SHALL reveal a card positioned above that logo whenever that brand has card content (see the three card states requirement), with a caret pointing down at the logo. A quote card SHALL contain the quote, an author footer (photo or initials placeholder beside author name and company), and — when a case study exists — a "Case study →" CTA row. A numbers card SHALL contain the brand's figure sentence, its supporting figures, and a "Case study →" CTA row. The card SHALL appear/disappear with a short fade-and-rise transition. While open, the card SHALL be interactive: it SHALL accept pointer events, and moving the cursor from the logo across the gap into the card SHALL keep the card open so its CTA can be clicked (an invisible hover bridge spans the gap). The card SHALL NOT use `role="tooltip"` (it contains interactive content). Cards SHALL not intercept pointer events when hidden and SHALL render above adjacent hero content (never clipped behind it).

#### Scenario: Hovering a logo with a testimonial
- **WHEN** the user hovers a logo whose brand has a testimonial
- **THEN** a card with that brand's quote, author footer, and CTA fades in above the logo with a caret pointing at the logo

#### Scenario: Hovering a logo with a numbers card
- **WHEN** the user hovers a logo whose brand has a case study but no testimonial
- **THEN** a card with that brand's figure sentence and CTA fades in above the logo with a caret pointing at the logo

#### Scenario: Cursor travels from logo into the card
- **WHEN** the user moves the pointer from the hovered logo up into the open card
- **THEN** the card stays open and its CTA button is clickable

#### Scenario: Card near the viewport edge
- **WHEN** the user hovers a logo close to the left or right viewport edge
- **THEN** the card shifts horizontally to remain fully inside the viewport (with a small safe margin) while the caret stays aligned over the logo

#### Scenario: Card overlaps hero content
- **WHEN** a card opens upward over the hero copy or video
- **THEN** the card renders fully on top of that content

#### Scenario: Hidden cards stay inert
- **WHEN** no logo is hovered
- **THEN** no card intercepts pointer events anywhere on the belt

### Requirement: Sand band with heading and muted logos
The client-logos belt SHALL render as a distinct sand band (`sand` token from `brand-theme`) inside the plum chapter, with a centered "ZAUFALI NAM" heading in the display face above the marquee, matching the reference build's treatment. At rest, logos SHALL render grayscale at reduced opacity and reduced brightness (`grayscale(1) brightness(0.8)` at ~0.75 opacity, raised from the previous ~0.55 so that optical-mass-normalized logos stay legible) — brand colors appear only on hover (no white-silhouette filter, no theme-dependent flip). Because the resting state is grayscaled, resting legibility is a luminance problem, so the belt's own resting brightness SHALL carry the contrast correction wherever it can; hovering SHALL clear the whole resting filter, not just its grayscale, so the revealed brand color is not left dimmed. The marquee's left and right ends SHALL dissolve via gradient overlays from the sand color to transparent, painted without clipping the cards. The heading text SHALL come from `lib/content/home.ts`, and the section SHALL expose exactly one accessible name (the heading and any `aria-label` MUST NOT duplicate each other for assistive technology).

#### Scenario: Reference fold
- **WHEN** the homepage's first viewport renders on desktop
- **THEN** the belt appears as a sand band at the bottom of the plum hero viewport, with the "ZAUFALI NAM" heading centered above muted grayscale logos

#### Scenario: Edge dissolve without card clipping
- **WHEN** a logo near the marquee's left or right end is hovered and its card opens
- **THEN** the track's ends fade into the sand background and the card still renders fully (not clipped by the fade overlays)

#### Scenario: Single accessible name
- **WHEN** assistive technology reads the client-logos section
- **THEN** "Zaufali nam" is announced once, not twice

#### Scenario: Normalized logos read at rest
- **WHEN** the belt renders at rest with the full roster
- **THEN** every logo is legible against the sand band, with no logo washed out or reading as a solid block

#### Scenario: Hover reveals undimmed brand color
- **WHEN** the user hovers a logo whose ink the resting treatment darkened
- **THEN** that logo shows its true brand color, not a dimmed version of it

### Requirement: Author photo with initials placeholder
Quote cards SHALL show an author footer of a circular photo beside the author name and company text. Entries whose testimonial carries an `image` path SHALL render that portrait; entries without one SHALL render a plum-gradient circle with the author's initials derived from the author name. The card SHALL NOT contain the brand's logo (the card is anchored to the hovered logo). Numbers cards have no author and SHALL NOT render an author footer.

#### Scenario: Client with a delivered portrait
- **WHEN** the user hovers a logo whose testimonial has an author photo
- **THEN** the card's footer shows the portrait beside the author's name and company, and no brand logo appears inside the card

#### Scenario: Client without a portrait
- **WHEN** the user hovers a logo whose testimonial has no `image`
- **THEN** the footer shows a plum-gradient circle with the author's initials in place of a photo

#### Scenario: Numbers card has no author footer
- **WHEN** a numbers card opens
- **THEN** no author photo, name, or initials circle is rendered

## REMOVED Requirements

### Requirement: All brands carry testimonial content
**Reason**: The roster is now sourced from the approved client set rather than hand-curated, and only one brand in that set has a verified quote. Requiring a testimonial per entry forced eight lorem-ipsum placeholders into production. Brands without a quote now show a numbers card or a bare logo instead.

**Migration**: Placeholder quotes and their TODO markers are deleted from `lib/content/home.ts` and `home.en.ts`. The four verified quotes for retired brands are already carried independently by the homepage testimonial slider and are unaffected. Card behaviour is now governed by the "Three card states" requirement.

### Requirement: Case study CTA with placeholder tooltip
**Reason**: The CTA was non-navigating because no case studies existed when the belt was built. 22 of the 31 roster brands now have a published case study, so a decorative tooltip actively hides real content.

**Migration**: The tooltip copy, its ~2s auto-hide timer, and the associated component state are removed. The CTA now renders only when the brand has a case study and navigates to it, per the "Case study CTA links to the published study" requirement.
