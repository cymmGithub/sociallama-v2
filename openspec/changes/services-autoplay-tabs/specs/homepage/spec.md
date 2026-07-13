# homepage (delta)

## MODIFIED Requirements

### Requirement: Content sections from typed data
All section copy (nav, hero, services, steps, client names, featured testimonial, blog card, footer, contact) SHALL come from `lib/content/home.ts`; components SHALL contain no hardcoded copy. Non-services copy SHALL match the verified content export verbatim; the three service bodies are instead trimmed to one short sentence each (~20 words) for the autoplay-tabs layout, with the original long-form texts preserved in the content module (commented or exported separately) for future `/uslugi/*` pages. FAQ and multi-post blog grid are excluded from v1.

#### Scenario: Content fidelity
- **WHEN** the homepage renders
- **THEN** the five how-it-works steps, 13 client names, featured iRobot testimonial (Małgorzata Radomska), and footer contact details match the export exactly

#### Scenario: Trimmed service bodies
- **WHEN** the services section renders
- **THEN** each of the three service descriptions is a single short sentence sourced from `lib/content/home.ts`, and the original long-form texts remain available in the content module

#### Scenario: Excluded sections
- **WHEN** the homepage renders
- **THEN** no FAQ section exists and NewsLAMA shows exactly one large post card ("LinkedIn Premium — czy warto?")

### Requirement: Section motion behaviors
The homepage SHALL implement: client-logo marquee and full-bleed "THAT WORKS / WITH SOCIAL LAMA" marquee via `<Marquee>`; why-that-works heading fill scrubbed by scroll progress; how-it-works pinned via `<Fold>` with the five steps highlighting sequentially by scroll progress; below-fold sections other than services revealing on first viewport entry via `useReveal` — the services section's motion is owned by the autoplay-tabs component (see `services-autoplay-tabs`). Every "THAT WORKS" occurrence on the homepage SHALL render bold in the orange accent, mirroring the hero headline (user decision, 2026-07-13): the big marquee's filled row is orange, and the why-that-works heading fills "WHY" to the ink text color (user decision, 2026-07-13) and "THAT WORKS" to orange.

#### Scenario: Pinned how-it-works scrub
- **WHEN** the user scrolls through the how-it-works section
- **THEN** the section content stays pinned while steps 01–05 activate in order tied to scroll progress, and unpins after the last step

#### Scenario: Heading fill scrub
- **WHEN** the "WHY THAT WORKS" heading passes through the viewport
- **THEN** its fill progresses proportionally to scroll from unfilled to fully colored — "WHY" to ink, "THAT WORKS" to orange

#### Scenario: Big marquee accent
- **WHEN** the full-bleed marquee renders in the light chapter
- **THEN** the filled "THAT WORKS" row is the brand orange (not the chapter's plum contrast slot) and the outlined "WITH SOCIAL LAMA" row is unchanged

#### Scenario: Why-that-works never renders on the hero plum
- **WHEN** the user scrolls from the pinned hero into chapter 2 at any speed (including while the ~0.9s background morph is still in flight)
- **THEN** the why-that-works section shows its own sand ground continuous with the client-logos band — at no scroll position does its ink copy sit on the plum background

## REMOVED Requirements

### Requirement: Service cards with clip previews
**Reason**: Superseded by the autoplay-tabs services section (user decision, 2026-07-13: the generic Higgsfield hover clips do not survive). The three-card hover-clip design (D5) is replaced by one shared stage with real-asset media per tab.
**Migration**: Behavior is defined by the new `services-autoplay-tabs` capability; `public/clips/service-*` assets are deleted and `lib/content/home.ts` service items switch from `poster`/`clip` fields to typed `stage` media descriptors.
