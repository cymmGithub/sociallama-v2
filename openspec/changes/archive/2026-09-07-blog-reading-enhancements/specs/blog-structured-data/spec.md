## ADDED Requirements

### Requirement: FAQPage structured data for strict-shape FAQ sections
A post page whose body ends with a strict-shape FAQ section (an `h2` starting with `FAQ` followed only by `h3`+paragraph pairs, as defined in `blog-post-page`) SHALL emit one additional `application/ld+json` block of `@type` `FAQPage`, with one `Question` per pair whose `name` is the question text and whose `acceptedAnswer.text` is the answer's plain text, in document order, in the rendering locale. Pages without such a section SHALL emit no `FAQPage` block.

#### Scenario: FAQ post emits FAQPage
- **WHEN** `reklama-na-facebooku` is served
- **THEN** its markup contains a `FAQPage` block with exactly three `Question` entries matching the three `h3` questions and their answers, alongside the `BlogPosting` block

#### Scenario: Post without FAQ
- **WHEN** a post with no strict-shape FAQ section is served
- **THEN** no `FAQPage` block is present

#### Scenario: English page
- **WHEN** a translated post with a strict-shape FAQ section is served at its English URL
- **THEN** the `FAQPage` questions and answers are the English text
