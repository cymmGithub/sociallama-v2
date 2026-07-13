# homepage (delta)

> Depends on `services-autoplay-tabs` archiving first — this restates the same requirement inclusive of that change's wording.

## MODIFIED Requirements

### Requirement: Section motion behaviors
The homepage SHALL implement: client-logo marquee and full-bleed "THAT WORKS / WITH SOCIAL LAMA" marquee via `<Marquee>`; the why-that-works heading scrubbed word-by-word by scroll progress with its lead and paragraphs scrubbing as manifesto text (words fill from faint to full via `ProgressText`); how-it-works pinned via `<Fold>` with the five steps highlighting sequentially by scroll progress; below-fold sections other than services revealing on first viewport entry via `useReveal` — the services section's motion is owned by the autoplay-tabs component (see `services-autoplay-tabs`). Every "THAT WORKS" occurrence on the homepage SHALL render bold in the orange accent, mirroring the hero headline (user decision, 2026-07-13) — except the why-that-works heading, where "THAT WORKS" fills with the static orange-dominant grain-gradient (gggrain variant: base `#f09b39`, `#892f53` falloff, `feTurbulence` 0.55, soft-light) clipped to the letters, and "WHY" fills to the ink text color (user decisions, 2026-07-13). The big marquee's filled row remains flat orange.

#### Scenario: Pinned how-it-works scrub
- **WHEN** the user scrolls through the how-it-works section
- **THEN** the section content stays pinned while steps 01–05 activate in order tied to scroll progress, and unpins after the last step

#### Scenario: Heading fill scrub with grain gradient
- **WHEN** the "WHY THAT WORKS" heading passes through the viewport
- **THEN** its words fill progressively — "WHY" to ink, "THAT WORKS" revealing the grain-gradient clipped inside the letters, continuous across words and line wraps

#### Scenario: Manifesto copy scrub at display scale
- **WHEN** the why-that-works manifesto (one sentence-case display-scale statement split mid-sentence: bold ink opening, muted gray closer — Azurio treatment, user decision 2026-07-13) and the supporting paragraphs (display font, bold, reading scale, same ink→muted split) pass through the viewport
- **THEN** their words fill from faint (~0.33 opacity) to full opacity proportionally to scroll, each statement flows as a single paragraph across its strong/muted chunks, and the CTA link enters via reveal

#### Scenario: Brand media beside supporting copy
- **WHEN** the why-that-works bottom row renders
- **THEN** the generated brand media (photoreal llama recording a reel; clip with the photo as its poster once the showreel lands) fills the left cell with the two supporting paragraphs and CTA at right; on mobile the row stacks

#### Scenario: Big marquee accent
- **WHEN** the full-bleed marquee renders in the light chapter
- **THEN** the filled "THAT WORKS" row is the brand orange (not the chapter's plum contrast slot) and the outlined "WITH SOCIAL LAMA" row is unchanged

#### Scenario: Why-that-works never renders on the hero plum
- **WHEN** the user scrolls from the pinned hero into chapter 2 at any speed (including while the ~0.9s background morph is still in flight)
- **THEN** the why-that-works section shows its own sand ground continuous with the client-logos band — at no scroll position does its ink copy sit on the plum background

## ADDED Requirements

### Requirement: Progressive bottom blur
The site layout SHALL render a fixed progressive blur strip at the viewport's bottom edge (stacked `backdrop-filter` layers with increasing radii and staggered masks) so departing content melts into frost, and SHALL hide it (fade) while any `[data-blur-edge-gate]` element intersects the viewport. The client-logos belt carries the gate attribute so the brand marquee is never frosted at page start (user decision, 2026-07-13).

#### Scenario: Marquee never frosted
- **WHEN** the page loads at the top with the client-logos belt on screen
- **THEN** the blur strip is fully transparent; **WHEN** the user scrolls past the belt **THEN** the blur fades in and bottom-edge content blurs progressively

#### Scenario: Pointer transparency
- **WHEN** the blur strip overlays interactive content near the viewport bottom
- **THEN** it never intercepts pointer events
