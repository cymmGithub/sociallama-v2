# client-logos-marquee

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Spotlight with brand-color reveal on hover
**Reason**: The belt reverts to the reference treatment (user decision, 2026-07-13): logos sit muted grayscale on a light sand band at rest, so the white-silhouette resting state, the cream reveal chip, and the theme-dependent silhouette flip are all obsolete — brand colors are legible on sand without a chip.
**Migration**: The hover reveal + dim-others behavior survives in the new "Hover spotlight with brand-color reveal" requirement; the resting presentation is defined by "Sand band with heading and muted logos". The `brightness(0) invert()` filters, `html[data-theme]` flip rule, and `.item::before` chip are deleted from `client-logos.module.css`.
