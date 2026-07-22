## MODIFIED Requirements

### Requirement: Case study detail page
A `/case-studies/[slug]` page SHALL render the study in semantic sections in this order: a hero (`h1` title, client + logo, tags, period), a client section, a challenge section, a results section, an approach section structured as content pillars (hashtag/label + heading + HTML copy + the campaign creatives that ran under it, at natural aspect), an optional image gallery with descriptive alt text (fallback for studies without extracted creatives), and a call-to-action linking to contact and to other case studies. The results section SHALL present the per-platform metrics in the page's editorial system: a metric list (each metric's value in accent display type with count-up, its label, and a platform micro-label), beside a phone lock screen whose wallpaper is the study's cover image under a dark scrim, filling with one push-style notification per metric (real network brand icon in its own brand colors, bundled inline with the component and matched via the metric's platform name or metric text, platform as sender, value emphasized in the message) with a staggered entrance. A quiet caption under the phone doubles as the replay control. The phone is the section's single bold element; the section otherwise uses the shared section-title and cream-ground vocabulary of the other sections. Notifications SHALL be a real semantic list readable by assistive technology; entrance animation and replay SHALL be disabled under `prefers-reduced-motion` (final state shown, caption as plain text). All section copy SHALL come from the localized chrome modules. Unknown slugs SHALL 404.

#### Scenario: Sections and headings
- **WHEN** a published case study detail page renders
- **THEN** the title is the page's single `h1`, each section is a labelled `h2`, the results band follows the challenge section and precedes the approach section, and every gallery image has non-empty alt text

#### Scenario: One notification per metric
- **WHEN** a study with N `results` entries renders
- **THEN** the phone shows exactly N notifications, each carrying its platform as sender, its value emphasized, and a brand-colored network icon matched from the platform name or metric text (with a neutral fallback tile when no network matches)

#### Scenario: Cover-driven wallpaper
- **WHEN** two different case studies render their results bands
- **THEN** each phone's wallpaper is that study's own cover image under a dark scrim

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** all notifications and the final badge count are visible immediately, nothing animates, and the replay control is not shown

#### Scenario: Unknown slug
- **WHEN** `/case-studies/<unknown>` is requested
- **THEN** the response is 404
