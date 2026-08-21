## ADDED Requirements

### Requirement: An industry that loses its featured study falls back to editorial
An industry whose featured case study is withdrawn SHALL have its `numbers` and `caseStudy` blocks removed from the content entry in both locales, so the page renders the editorial layout from its existing collage, marquee and manifesto content rather than carrying numbers and creatives from a study that no longer exists. The industry itself stays in the canonical list and at its route.

#### Scenario: Health renders editorial
- **WHEN** `/branze/health` and `/en/industries/health` render after the Adamed withdrawal
- **THEN** both return 200 with the editorial layout, show no Adamed creative or metric, and contain no link to the Adamed case study
