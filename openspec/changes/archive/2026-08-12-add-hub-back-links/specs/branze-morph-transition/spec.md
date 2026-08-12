# branze-morph-transition — delta

## ADDED Requirements

### Requirement: In-page hub links do not run the morph in reverse

Navigating from an industry page to the industries hub through any in-page link — the hero's back link or the menu's all-industries link — SHALL NOT engage the `branza-<id>` shared-element pair: the hub arrives at scroll zero, where the paired card may be off-screen, and a morph toward an off-screen target is the misdirected animation the degraded-mode requirement forbids. A plain full-page crossfade or an instant swap are both acceptable arrivals. The forward card→hero morph SHALL be unaffected.

#### Scenario: Back link arrives without a poster morph

- **WHEN** a visitor on a view-transition-capable browser activates an industry page's back link
- **THEN** the industries hub appears at the top with no hero-to-card poster animation, partial or complete

#### Scenario: The menu's hub link arrives without a poster morph

- **WHEN** a visitor on an industry page opens the menu and activates its all-industries link
- **THEN** the industries hub appears at the top with no hero-to-card poster animation, partial or complete

#### Scenario: Forward morph still runs afterwards

- **WHEN** the same visitor then clicks any industry poster card on the hub
- **THEN** the card→hero morph runs exactly as specified today
