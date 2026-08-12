# branze-pages — delta

## ADDED Requirements

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
