# branze-morph-transition Delta

## ADDED Requirements

### Requirement: Card poster morphs into the industry hero

Navigating from a poster card SHALL, on browsers supporting same-document
view transitions, animate the card's poster into its industry page's hero
poster as a shared-element morph — the two surfaces present the identical
image file — while the rest of the viewport crossfades. This applies to
`/branze` and `/en/industries` alike. The morph SHALL target the hero at its final
on-screen position: the arriving page is at scroll position zero in the
state the browser captures, regardless of how far down the hub was scrolled
at click time.

#### Scenario: Morph runs on a supported browser

- **WHEN** a visitor on a view-transition-capable browser clicks an
  industry's poster card
- **THEN** the card's poster visibly expands into that industry page's
  full-bleed hero, and the page behind it crossfades

#### Scenario: Arrival is at the top of the page

- **WHEN** the transition's new state is captured after clicking a card on
  a scrolled hub
- **THEN** the industry page is at scroll position zero — the morph never
  animates toward an off-screen or mid-page target

### Requirement: The poster pair is the only named pair

The transition name (`branza-<id>`) SHALL be carried by the poster media on
both sides — the card's image on the hub, the hero's poster image on the
industry page — not by the card or hero containers. Scrims, labels, the CTA
and the hero's video element SHALL NOT participate in the pair. The hero's
video loop SHALL keep its existing behavior — fading in only once actually
playing, after arrival — so the poster remains the stable shared layer
throughout the transition.

#### Scenario: Chrome around the poster crossfades

- **WHEN** the morph runs
- **THEN** only the poster image morphs; the card's scrim and copy and the
  hero's scrim, wordmark and lead crossfade with the page rather than
  traveling with the poster

#### Scenario: Video does not fight the morph

- **WHEN** the industry page's hero video begins playing after a morph
  arrival
- **THEN** it fades in over the settled poster exactly as on a direct
  visit, with no flash or double-exposure during the transition itself

### Requirement: Absence of the morph is an instant, correct navigation

The navigation SHALL complete as an instant arrival at the top of the
industry page wherever the morph cannot run — unsupported browsers,
`prefers-reduced-motion`, or any state where the shared element cannot
participate. A plain page crossfade without the element morph
is an accepted degraded mode; a partial or misdirected animation is not.

#### Scenario: Reduced motion gets no animation

- **WHEN** a visitor with `prefers-reduced-motion: reduce` clicks a poster
  card
- **THEN** the industry page appears at scroll zero with no morph and no
  crossfade

#### Scenario: Unsupported browser degrades to today's navigation

- **WHEN** a visitor on a browser without the View Transitions API clicks a
  poster card
- **THEN** the navigation behaves exactly as before this change, landing at
  the top of the industry page
