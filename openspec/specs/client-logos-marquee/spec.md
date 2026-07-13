# client-logos-marquee Specification

## Purpose
TBD - created by archiving change hero-client-logos-hover. Update Purpose after archive.
## Requirements
### Requirement: Belt visible in the first viewport
The homepage's first `100svh` viewport SHALL contain both the hero (headline + video) and the client-logo belt, with the belt pinned at the bottom of the viewport. On viewports too short to fit both without compressing the hero headline, the belt SHALL drop below the fold rather than shrink the hero content.

#### Scenario: Standard desktop viewport
- **WHEN** the homepage loads on a viewport of typical height (≥ ~800px)
- **THEN** the client-logo belt is fully visible at the bottom of the first screen without scrolling, below the hero headline and video

#### Scenario: Short viewport
- **WHEN** the homepage loads on a short viewport (e.g. landscape phone, ~660px height)
- **THEN** the hero content retains its minimum readable height and the belt overflows below the fold instead of crushing the headline

### Requirement: Belt pauses on hover
The marquee belt SHALL pause its scrolling animation while a mouse-like pointer is over the marquee, and resume when the pointer leaves. This behavior SHALL apply only on devices matching `(hover: hover) and (pointer: fine)`; touch devices SHALL keep the plain scrolling belt with no hover interactions.

#### Scenario: Pointer enters the belt
- **WHEN** a user with a mouse hovers anywhere over the marquee
- **THEN** the belt stops scrolling until the pointer leaves, then resumes

#### Scenario: Touch device
- **WHEN** the page is used on a touch-only device
- **THEN** the belt scrolls continuously and no spotlight or testimonial card is ever shown

### Requirement: Testimonial card on logo hover
Hovering a logo SHALL reveal a testimonial card positioned above that logo, containing the quote, author name, and company, with a caret pointing down at the logo. The card SHALL appear/disappear with a short fade-and-rise transition and SHALL not intercept pointer events when hidden. Cards SHALL render above adjacent hero content (never clipped behind it).

#### Scenario: Hovering a logo with a testimonial
- **WHEN** the user hovers a logo
- **THEN** a card with that brand's quote, author, and company fades in above the logo with a caret pointing at the logo

#### Scenario: Card near the viewport edge
- **WHEN** the user hovers a logo close to the left or right viewport edge
- **THEN** the card shifts horizontally to remain fully inside the viewport (with a small safe margin) while the caret stays aligned over the logo

#### Scenario: Card overlaps hero content
- **WHEN** a card opens upward over the hero copy or video
- **THEN** the card renders fully on top of that content

### Requirement: All brands carry testimonial content
All 13 client entries in `lib/content/home.ts` SHALL carry a `testimonial` (quote, author, company). The 4 brands with verified quotes (Funtronic, Intrum Justitia, Uniphar, Aquael) SHALL use them verbatim from the content export; the remaining 9 SHALL use lorem-ipsum placeholder quotes attributed to "Imię Nazwisko, {company}", each marked in source with a TODO comment identifying it as a pre-launch placeholder. No content SHALL come from a CMS.

#### Scenario: Brand with a real quote
- **WHEN** the user hovers the Funtronic logo
- **THEN** the card shows Piotr Treszczotko's verified quote

#### Scenario: Brand with a placeholder
- **WHEN** the user hovers a logo whose brand has no verified quote (e.g. Roche)
- **THEN** the card shows a lorem-ipsum quote attributed to "Imię Nazwisko" and that entry is marked with a placeholder TODO comment in `lib/content/home.ts`

### Requirement: Accessibility and motion fallbacks
Duplicated marquee copies SHALL remain hidden from assistive technology (only one copy exposed), and the belt SHALL respect reduced-motion preferences at least as well as the current implementation.

#### Scenario: Screen reader traversal
- **WHEN** assistive technology reads the client-logos section
- **THEN** each client appears exactly once (duplicate marquee copies are aria-hidden)

#### Scenario: Reduced motion preference
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** the belt does not auto-scroll (or matches the current marquee's reduced-motion behavior, whichever is stricter)

### Requirement: Sand band with heading and muted logos
The client-logos belt SHALL render as a distinct sand band (`sand` token from `brand-theme`) inside the plum chapter, with a centered "ZAUFALI NAM" heading in the display face above the marquee, matching the reference build's treatment. At rest, logos SHALL render grayscale at reduced opacity (reference: `grayscale(1)` at ~0.55) — brand colors appear only on hover (no white-silhouette filter, no theme-dependent flip). The marquee's left and right ends SHALL dissolve via gradient overlays from the sand color to transparent, painted without clipping the testimonial cards. The heading text SHALL come from `lib/content/home.ts`, and the section SHALL expose exactly one accessible name (the heading and any `aria-label` MUST NOT duplicate each other for assistive technology).

#### Scenario: Reference fold
- **WHEN** the homepage's first viewport renders on desktop
- **THEN** the belt appears as a sand band at the bottom of the plum hero viewport, with the "ZAUFALI NAM" heading centered above muted grayscale logos

#### Scenario: Edge dissolve without card clipping
- **WHEN** a logo near the marquee's left or right end is hovered and its testimonial card opens
- **THEN** the track's ends fade into the sand background and the card still renders fully (not clipped by the fade overlays)

#### Scenario: Single accessible name
- **WHEN** assistive technology reads the client-logos section
- **THEN** "Zaufali nam" is announced once, not twice

### Requirement: Hover spotlight with brand-color reveal
While a logo is hovered on a mouse-like pointer, the hovered logo SHALL reveal its original brand colors at full opacity while all other logos dim to a markedly lower opacity, focusing attention on it and its testimonial card. No chip is involved — brand colors are legible directly on the sand band.

#### Scenario: One logo hovered
- **WHEN** the user hovers a single logo
- **THEN** that logo shows its brand colors at full opacity and every other logo dims

#### Scenario: Hover ends
- **WHEN** the pointer leaves the logo and the marquee
- **THEN** all logos return to their resting opacity

