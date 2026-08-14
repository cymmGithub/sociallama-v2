# uslugi-morph-transition Specification

## Purpose
TBD - created by archiving change add-uslugi-poster-morph. Update Purpose after archive.
## Requirements
### Requirement: The poster pair is the only named pair

The transition name (`usluga-<id>`) SHALL be carried by the poster artwork on both sides — the card's artwork on the hub, the hero's artwork on the service page — not by the card or hero containers. Scrims, labels, CTAs, and hero copy SHALL NOT participate in the pair. Poster ambient animation SHALL NOT fight the morph: loops on the arriving hero run only after the transition settles, so the poster is a stable shared layer throughout.

#### Scenario: Chrome around the poster crossfades

- **WHEN** the morph runs
- **THEN** only the poster artwork morphs; the card's scrim and label and the hero's scrim, title and lead crossfade with the page rather than traveling with the poster

#### Scenario: Ambient motion waits for arrival

- **WHEN** a morph completes on a service page
- **THEN** the hero poster's ambient loop begins (or resumes) only after the transition has settled, with no flash or double-exposure during the transition itself

### Requirement: Both live morph sections keep working

The shared poster-morph machinery SHALL serve `/branze` and `/uslugi` simultaneously: transition names remain section-prefixed (`branza-<id>`, `usluga-<id>`) so identifiers can never collide, and the branze card→hero morph SHALL behave exactly as before this change.

#### Scenario: Branze morph unaffected

- **WHEN** a visitor on a view-transition-capable browser clicks an industry poster card after this change ships
- **THEN** the branze card→hero morph runs exactly as it did before

### Requirement: Absence of the morph is an instant, correct navigation

The navigation SHALL complete as an instant arrival at the top of the service page wherever the morph cannot run — unsupported browsers, `prefers-reduced-motion`, or any state where the shared element cannot participate. A plain page crossfade without the element morph is an accepted degraded mode; a partial or misdirected animation is not.

#### Scenario: Reduced motion gets no animation

- **WHEN** a visitor with `prefers-reduced-motion: reduce` clicks a poster card
- **THEN** the service page appears at scroll zero with no morph and no crossfade

#### Scenario: Unsupported browser degrades to today's navigation

- **WHEN** a visitor on a browser without the View Transitions API clicks a poster card
- **THEN** the navigation behaves exactly as before this change, landing at the top of the service page

### Requirement: In-page hub links do not run the morph in reverse

Navigating from a service page to the services hub through any in-page link — the hero's back link or the menu's all-services link — SHALL NOT engage the `usluga-<id>` shared-element pair: the hub arrives at scroll zero, where the paired card may be off-screen, and a morph toward an off-screen target is the misdirected animation the degraded-mode requirement forbids. A plain full-page crossfade or an instant swap are both acceptable arrivals. The forward card→hero morph SHALL be unaffected.

#### Scenario: Back link arrives without a poster morph

- **WHEN** a visitor on a view-transition-capable browser activates a service page's back link
- **THEN** the services hub appears at the top with no hero-to-card poster animation, partial or complete

#### Scenario: The menu's hub link arrives without a poster morph

- **WHEN** a visitor on a service page opens the menu and activates its all-services link
- **THEN** the services hub appears at the top with no hero-to-card poster animation, partial or complete

#### Scenario: Forward morph still runs afterwards

- **WHEN** the same visitor then clicks any service poster card on the hub
- **THEN** the card→hero morph runs exactly as specified today

### Requirement: Card poster morphs into the destination hero

Navigating from any poster card on the services hub SHALL, on browsers supporting same-document view transitions, animate the card's poster into the destination page's hero poster as a shared-element morph while the rest of the viewport crossfades — the seven services and the SEO landing alike, since both are addressed by the same `usluga-<id>` pair. This applies to `/uslugi` and `/en/services` alike. The morph SHALL target the hero at its final on-screen position: the arriving page is at scroll position zero in the state the browser captures, regardless of how far down the hub was scrolled at click time.

#### Scenario: Morph runs on a supported browser

- **WHEN** a visitor on a view-transition-capable browser clicks a poster card
- **THEN** the card's poster visibly expands into that page's hero artwork, and the page behind it crossfades

#### Scenario: Arrival is at the top of the page

- **WHEN** the transition's new state is captured after clicking a card on a scrolled hub
- **THEN** the destination page is at scroll position zero — the morph never animates toward an off-screen or mid-page target

