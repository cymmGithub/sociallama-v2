## MODIFIED Requirements

### Requirement: Content sections from typed data
All section copy (nav, hero, services, steps, client names, featured testimonial, footer, contact) SHALL come from `lib/content/home.ts`; components SHALL contain no hardcoded copy. Non-services copy SHALL match the verified content export verbatim; the three service bodies are instead trimmed to one short sentence each (~20 words) for the autoplay-tabs layout, with the original long-form texts preserved in the content module (commented or exported separately) for future `/uslugi/*` pages. FAQ and multi-post blog grid are excluded from v1. The NewsLAMA section is the exception to static sourcing: it SHALL render the latest published post fetched server-side from Payload's Local API (cover, category, `pl-PL`-formatted date, title, excerpt, link to the root-level post URL), with only its static labels (heading, read label) sourced from `lib/content/home.ts`; the hardcoded post object is removed from the content module. When no published post exists, the NewsLAMA section SHALL render nothing rather than a broken or placeholder card.

The how-it-works `steps` surface SHALL additionally carry, per step, the proof copy and attribution the process section presents: an eyebrow label, a headline, a supporting sentence, an optional client key, and a case-study path. This proof content SHALL live in the same typed content module as the rest of the homepage copy and SHALL NOT be sourced from Payload. The five step sentences themselves SHALL remain verbatim.

#### Scenario: Content fidelity
- **WHEN** the homepage renders
- **THEN** the five how-it-works steps, 13 client names, featured iRobot testimonial (Małgorzata Radomska), and footer contact details match the export exactly

#### Scenario: Trimmed service bodies
- **WHEN** the services section renders
- **THEN** each of the three service descriptions is a single short sentence sourced from `lib/content/home.ts`, and the original long-form texts remain available in the content module

#### Scenario: Proof copy is typed content, not CMS content
- **WHEN** the how-it-works section renders its per-step proof
- **THEN** every headline, sentence, label and link path comes from the typed content module, and no query is made to Payload to render the section

### Requirement: Section motion behaviors
The homepage SHALL implement: client-logo marquee and full-bleed "THAT WORKS / WITH SOCIAL LAMA" marquee via `<Marquee>`; the why-that-works heading scrubbed word-by-word by scroll progress with its lead and paragraphs scrubbing as manifesto text (words fill from faint to full via `ProgressText`); how-it-works pinned via `<Fold>` with the five steps activating sequentially by scroll progress, each activation swapping the exhibit presented beside the step rail; below-fold sections other than services revealing on first viewport entry via `useReveal` — the services section's motion is owned by the autoplay-tabs component (see `services-autoplay-tabs`). Every "THAT WORKS" occurrence on the homepage SHALL render bold in the orange accent, mirroring the hero headline (user decision, 2026-07-13) — except the why-that-works heading, where "THAT WORKS" fills with the static orange-dominant grain-gradient (gggrain variant: base `#f09b39`, `#892f53` falloff, `feTurbulence` 0.55, soft-light) clipped to the letters, and "WHY" fills to the ink text color (user decisions, 2026-07-13). The big marquee's filled row remains flat orange.

#### Scenario: Pinned how-it-works scrub
- **WHEN** the user scrolls through the how-it-works section
- **THEN** the section content stays pinned while steps 01–05 activate in order tied to scroll progress, and unpins after the last step

#### Scenario: Each activation changes what is shown
- **WHEN** a step becomes active during the pinned scrub
- **THEN** the exhibit beside the rail changes to that step's evidence, so each scroll beat reveals content rather than only changing a highlight
