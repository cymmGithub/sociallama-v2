# client-logos-marquee — delta: interactive hover card with author photo and Case study CTA

## ADDED Requirements

### Requirement: Case study CTA with placeholder tooltip
Each hover card SHALL end with a CTA row containing an orange pill button labeled "Case study →". Activating the button SHALL NOT navigate anywhere; it SHALL reveal a small ink-colored tooltip bubble above the button with the verbatim copy "waiting for case study :)", which SHALL auto-hide after approximately 2 seconds. Repeat activations SHALL restart the tooltip's hide timer rather than stack tooltips.

#### Scenario: CTA click shows the placeholder tooltip
- **WHEN** the user clicks "Case study →" in an open hover card
- **THEN** a small ink bubble reading "waiting for case study :)" appears above the button and fades away on its own after about 2 seconds, and the page does not navigate

#### Scenario: Rapid repeat clicks
- **WHEN** the user clicks the CTA again while the tooltip is still visible
- **THEN** the tooltip stays visible and its hide timer restarts (no duplicate bubbles)

### Requirement: Author photo with initials placeholder
Each hover card SHALL show an author footer of a circular photo beside the author name and company text. Entries whose testimonial carries an `image` path SHALL render that portrait; entries without one SHALL render a plum-gradient circle with the author's initials derived from the author name. The card SHALL NOT contain the brand's logo (the card is anchored to the hovered logo).

#### Scenario: Client with a delivered portrait
- **WHEN** the user hovers a logo whose testimonial has an author photo (e.g. Aquael)
- **THEN** the card's footer shows the portrait beside the author's name and company, and no brand logo appears inside the card

#### Scenario: Client without a portrait
- **WHEN** the user hovers a logo whose testimonial has no `image`
- **THEN** the footer shows a plum-gradient circle with the author's initials in place of a photo

## MODIFIED Requirements

### Requirement: Testimonial card on logo hover
Hovering a logo SHALL reveal a testimonial card positioned above that logo, containing the quote, an author footer (photo or initials placeholder beside author name and company), and a "Case study →" CTA row, with a caret pointing down at the logo. The card SHALL appear/disappear with a short fade-and-rise transition. While open, the card SHALL be interactive: it SHALL accept pointer events, and moving the cursor from the logo across the gap into the card SHALL keep the card open so its CTA can be clicked (an invisible hover bridge spans the gap). The card SHALL NOT use `role="tooltip"` (it contains interactive content). Cards SHALL not intercept pointer events when hidden and SHALL render above adjacent hero content (never clipped behind it).

#### Scenario: Hovering a logo with a testimonial
- **WHEN** the user hovers a logo
- **THEN** a card with that brand's quote, author footer, and CTA fades in above the logo with a caret pointing at the logo

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
