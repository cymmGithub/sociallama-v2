# Homepage — Delta: why-team-stage

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

#### Scenario: Team stage beside supporting copy
- **WHEN** the why-that-works bottom row renders
- **THEN** the left media cell (aspect-ratio 4/3, radius 14px) renders a live CSS team stage — the plum grain-gradient stage recipe shared with the services and how-it-works panels (plum 160° gradient, orange glow blob, feTurbulence grain at soft-light 0.38) — with the 10 team avatar stickers scattered across its upper two-thirds (percentage-based positions, per-item rotations within ±6°, visible size variance, loose two-row cluster), each seated on a translucent glass bubble that leaves the sticker's own outline and head pop-out unclipped (user decision, 2026-07-16) and the DIMAQ professional and Meta Small Business Academy certificates as gently tilted (±3°) cream chips along the bottom; the supporting paragraphs and CTA sit at right; on mobile the row stacks (user decision, 2026-07-16)

#### Scenario: Team stage assets stay light
- **WHEN** the team stage renders at any viewport
- **THEN** avatars are served as optimized assets (≈400px WebP via the `Image` component, not the 810px source PNGs), certificate marks render unmodified (no recolor, distortion, or crop) on their chips, and the retired `why-team.jpg` is no longer shipped

#### Scenario: Big marquee accent
- **WHEN** the full-bleed marquee renders in the light chapter
- **THEN** the filled "THAT WORKS" row is the brand orange (not the chapter's plum contrast slot) and the outlined "WITH SOCIAL LAMA" row is unchanged

#### Scenario: Why-that-works never renders on the hero plum
- **WHEN** the user scrolls from the pinned hero into chapter 2 at any speed (including while the ~0.9s background morph is still in flight)
- **THEN** the why-that-works section shows its own sand ground continuous with the client-logos band — at no scroll position does its ink copy sit on the plum background
