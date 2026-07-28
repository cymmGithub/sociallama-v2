## ADDED Requirements

### Requirement: Homepage FAQ section
The homepage SHALL present a set of frequently-asked questions as an expand/collapse list within the closing (`plum-deep`) chapter, positioned after the testimonial and **before** the join call to action. Each entry SHALL consist of a question, always visible, and an answer, revealed on expansion. Entries SHALL be numbered in sequence. The section SHALL render a display heading consistent with the homepage's other two-line display headings, and a supporting eyebrow line in the page's own language.

The section SHALL be present on both the Polish and English homepages, in the same position within the chapter.

#### Scenario: FAQ appears between the testimonial and the CTA
- **WHEN** the Polish homepage is rendered
- **THEN** the FAQ section appears after the testimonial section and before the join call-to-action section, within the same chapter

#### Scenario: English homepage carries the section too
- **WHEN** the English homepage is rendered
- **THEN** the FAQ section appears in the same position, in English

#### Scenario: Questions are visible without interaction
- **WHEN** the FAQ section is rendered and nothing has been clicked
- **THEN** every question is visible, each with its sequence number

#### Scenario: The first entry starts expanded
- **WHEN** the FAQ section is first rendered
- **THEN** the first entry is expanded and its answer visible, and the remaining entries are collapsed

#### Scenario: Chapter background morph is unaffected
- **WHEN** the homepage is scrolled from top to bottom after the section is added
- **THEN** the background transitions across all three chapters exactly as before, and the FAQ section renders on the closing chapter's ground

### Requirement: Answers are served in the initial HTML
Every answer SHALL be present in the HTML served by the server, in full, regardless of whether its entry is expanded or collapsed, and without requiring client-side JavaScript to execute. Collapsing SHALL be a presentational state only, never a condition of the content's presence in the document.

#### Scenario: Collapsed answers are in the raw response
- **WHEN** the homepage HTML is fetched directly, without executing scripts
- **THEN** the full text of all answers appears in the response body, including those belonging to collapsed entries

#### Scenario: Answers survive with JavaScript disabled
- **WHEN** the homepage is loaded with JavaScript disabled
- **THEN** all questions are visible and every answer is reachable

### Requirement: FAQ structured data
The homepage SHALL emit `FAQPage` structured data describing the questions and answers it displays. The structured data SHALL be generated from the same content source as the rendered section, so the two cannot diverge. Each locale SHALL describe the entries that locale actually shows. The structured data SHALL be rendered server-side and SHALL NOT depend on hydration.

#### Scenario: Structured data matches visible content
- **WHEN** the homepage's `FAQPage` structured data is compared against the rendered FAQ entries
- **THEN** the questions and answer text correspond exactly, with no entry present in one and absent from the other

#### Scenario: Structured data validates
- **WHEN** the homepage's structured data is validated against schema.org's `FAQPage` type
- **THEN** it parses without errors and every entry carries a question and an accepted answer

#### Scenario: Each locale describes its own entries
- **WHEN** the English homepage's structured data is inspected
- **THEN** it describes the English entries, and does not describe entries shown only on the Polish page

### Requirement: Disclosure interaction
Entries SHALL expand and collapse independently — expanding one SHALL NOT collapse another. Each entry's control SHALL be reachable and operable by keyboard, carry a visible focus indicator, and expose its expanded or collapsed state to assistive technology. Expansion SHALL be animated where the browser supports animating to an intrinsic size, and SHALL fall back to an un-animated state change where it does not. Motion SHALL be suppressed when the user has requested reduced motion.

#### Scenario: Entries are independent
- **WHEN** one entry is expanded and a second entry is then expanded
- **THEN** both are expanded, and the first entry's answer remains visible

#### Scenario: Keyboard operation
- **WHEN** a user tabs to an entry's control and activates it
- **THEN** the entry toggles, the control shows a visible focus indicator, and its expanded state is exposed to assistive technology

#### Scenario: Unsupported animation degrades cleanly
- **WHEN** an entry is expanded in a browser that cannot animate to an intrinsic size
- **THEN** the answer appears immediately, fully laid out, with no clipped or collapsed content

#### Scenario: Reduced motion is respected
- **WHEN** a user who has requested reduced motion expands an entry
- **THEN** the answer appears without a height transition

### Requirement: Expanded answers are never clipped
The section's entrance animation SHALL NOT leave a clipping region in place once settled. Content that grows after the entrance animation completes SHALL render in full.

#### Scenario: Answer expanded after the reveal settles
- **WHEN** the section's entrance animation has completed and an entry is then expanded
- **THEN** the full answer is visible, with no part of it cut off at the section's boundary

### Requirement: Localised FAQ content
FAQ copy SHALL live alongside the homepage's other static copy, with a per-locale source, following the existing pattern by which a section receives its content as a prop defaulting to the Polish copy. The English set SHALL be a localisation rather than a literal translation: entries whose value depends on Polish-market specifics SHALL be replaced with an equivalent question serving the English-speaking audience, rather than translated.

#### Scenario: Section defaults to Polish copy
- **WHEN** the FAQ section is rendered without content supplied
- **THEN** it renders the Polish entries

#### Scenario: English page supplies its own copy
- **WHEN** the English homepage renders the FAQ section
- **THEN** the section renders the English entries supplied to it

#### Scenario: Locally-specific entry is replaced, not translated
- **WHEN** the English entry set is compared with the Polish one
- **THEN** the entry about the agency's geographic reach addresses working with brands outside Poland, rather than translating the Polish cities and regional-client detail
