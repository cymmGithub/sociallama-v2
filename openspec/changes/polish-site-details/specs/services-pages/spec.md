## ADDED Requirements

### Requirement: A proof card names its client once
A `proof` section's case card SHALL identify its client through the client's logo, and its title SHALL NOT repeat the client's name. The card renders the logo at full colour directly beneath the title, so a title that opens with the same brand states it twice in the space of two lines.

Where the brand is woven into the title's grammar rather than prefixed to it, the title SHALL be rewritten to read correctly without it, not left with a gap.

#### Scenario: Title does not repeat the logo
- **WHEN** a proof card renders with a client logo
- **THEN** its title does not contain the client's brand name

#### Scenario: A grammatically embedded brand is rewritten
- **WHEN** a title names the brand inside a sentence rather than as a leading prefix
- **THEN** the title is rewritten so it still reads as a correct sentence without the brand, rather than having the word deleted in place

### Requirement: A proof card's accessible name identifies its client
The whole proof card is a single link, so its accessible name is composed from its contents. Because the title no longer carries the brand, the client's logo SHALL carry the brand name as its alternative text rather than being marked decorative. A card whose accessible name does not identify the client is a link to a case study that never says whose.

#### Scenario: Screen reader hears the client
- **WHEN** assistive technology reads a proof card link
- **THEN** the announced name includes the client's brand name

#### Scenario: Logo is not decorative
- **WHEN** a proof card renders its client logo
- **THEN** the image carries the brand name as its alternative text, not an empty one

#### Scenario: Images unavailable
- **WHEN** the card renders with images suppressed or failed
- **THEN** the client is still identifiable from the logo's alternative text
