## ADDED Requirements

### Requirement: Searching the case-study listing
The `/case-studies` listing SHALL let a visitor filter the card grid by text, matching against each study's client name, title, tags and excerpt in the rendering locale. Matching SHALL be insensitive to case and to Polish diacritics. Search SHALL NOT introduce a new route, a query parameter, or a crawlable URL, and SHALL NOT re-request any card image when the query changes or clears.

The English listing at `/en/case-studies` SHALL offer the same search over the English-resolved fields with English copy. Result-count copy SHALL follow the rendering locale's own plural rules; the Polish three-form plural SHALL NOT be applied to English.

#### Scenario: Filtering by client name
- **WHEN** a visitor types a client's name, such as `breville`
- **THEN** only cards whose client name, title, tags or excerpt contain that text remain visible, in their original order

#### Scenario: Filtering by tag
- **WHEN** a visitor types text that appears only in some studies' tags
- **THEN** those studies' cards remain visible and all others are hidden

#### Scenario: Diacritic-insensitive matching
- **WHEN** a visitor types a query without Polish diacritics, such as `zywnosc`
- **THEN** studies whose matched fields contain the diacritic form, such as `żywność`, are shown

#### Scenario: Match count is announced
- **WHEN** the set of matching studies changes
- **THEN** a visually-hidden live region states how many studies match, in the rendering locale's plural form; while no query is active the region is empty

#### Scenario: No matches
- **WHEN** a query matches no study
- **THEN** every card is hidden and an empty state explains that nothing matched; the query remains editable

#### Scenario: Clearing the query
- **WHEN** a visitor clears the field, by deleting the text or by the clear button
- **THEN** every published study is visible again in manual order, without any card image being fetched anew

#### Scenario: English search matches English text
- **WHEN** a visitor searches on `/en/case-studies`
- **THEN** matching runs against the English title, tags and excerpt, and the input, clear button, count and empty state use English copy
