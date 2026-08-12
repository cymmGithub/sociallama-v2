# services-pages — delta

## ADDED Requirements

### Requirement: Service pages link back to the services hub

Each service page's hero SHALL open with a back link to the services hub, in the slot the section label occupies today: a left-arrow icon (lucide `ArrowLeft`, hidden from assistive technology) followed by the section label text, linking to `/uslugi` on Polish pages and `/en/services` on English pages. The link SHALL be a deterministic hub link, not a history-based back action, and SHALL be keyboard-focusable with a visible focus style. The label text and its typographic treatment SHALL match the current section label so the hero composition is unchanged.

#### Scenario: Back link navigates to the hub

- **WHEN** a visitor activates the hero's section-label link on any `/uslugi/<slug>` or `/en/services/<slug>` page
- **THEN** they navigate to that locale's services hub

#### Scenario: Accessible name is the label

- **WHEN** assistive technology reads the back link
- **THEN** its accessible name is the section label text, with the arrow icon not separately announced

#### Scenario: Deep-linked visitors can go up

- **WHEN** a visitor lands directly on a service page with no in-site history
- **THEN** the back link still navigates to the services hub
