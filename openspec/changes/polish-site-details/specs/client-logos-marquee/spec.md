## ADDED Requirements

### Requirement: Adjacent belt brands come from different industries
Every roster brand SHALL carry an industry tag, and the belt order SHALL NOT place two brands with the same tag next to each other. Because the belt repeats its track, the seam from the last brand back to the first SHALL be treated as an adjacency like any other.

The rule governs **adjacency**, not spacing: with four property developers among 31 brands, some same-industry pairs necessarily sit a few positions apart, and that is acceptable. What is not acceptable is two of them touching.

The tag SHALL live on the roster data rather than in a comment, so the rule is machine-checkable. The roster order is no longer alphabetical, and without an automated check the next edit re-sorts it and silently reintroduces the defect.

#### Scenario: No same-industry pair touches
- **WHEN** the roster is walked in order, treating the last entry as adjacent to the first
- **THEN** no two consecutive entries share an industry tag

#### Scenario: The wrap seam counts
- **WHEN** the belt's repeated track brings the last brand alongside the first
- **THEN** those two brands do not share an industry tag

#### Scenario: Every brand is tagged
- **WHEN** the roster is inspected
- **THEN** every entry carries an industry tag, so no brand can bypass the adjacency check by being untagged

#### Scenario: The rule is enforced, not documented
- **WHEN** a brand is added, removed, or reordered such that two same-industry brands become adjacent
- **THEN** the roster's test suite fails, rather than the defect reaching review as a visual detail

#### Scenario: Contact-page bands inherit the order
- **WHEN** `/kontakt` and `/en/contact` render their client logo bands from the same roster
- **THEN** they show the same de-clustered order, because the order is a property of the roster and not of the belt component
