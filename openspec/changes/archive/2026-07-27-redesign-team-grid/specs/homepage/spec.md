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

#### Scenario: Team grid mosaic on the plum stage
- **WHEN** the why-that-works team block renders
- **THEN** the plum grain-gradient stage — the recipe shared with the services and how-it-works panels (plum 160° gradient, orange glow blob, feTurbulence grain at soft-light 0.38) — replaces the former scattered-avatar image in the left cell of the two-column supporting row (stage left, supporting copy and CTA right), presenting the 12 team portraits as a uniform grid mosaic of small square medallion tiles (6 columns × 2 rows on desktop, 3 columns on mobile, consistent gap), and the DIMAQ professional and Meta Small Business Academy certificates as two cream cards placed inline in the grid on the row below the faces (a full-width "Certyfikaty" eyebrow, then two cards each taking half the cert row; on mobile the eyebrow and each card span the full row); on desktop the copy column stretches to the grid's height and the supporting paragraph is sized (display scale) to fill it top-aligned, so the copy occupies the grid's height rather than leaving empty space, and on mobile the row stacks (stage above copy)

#### Scenario: Team tile spotlight hover
- **WHEN** a pointer hovers one team tile (motion allowed)
- **THEN** the hovered tile scales up with an orange ring while the sibling tiles dim, and the certificate cards are excluded from the dimming; under `prefers-reduced-motion: reduce` the scale is dropped and only the dim and ring convey focus; on touch devices with no hover the tiles render at full opacity

#### Scenario: Team assets stay light and uniform
- **WHEN** the team stage renders at any viewport
- **THEN** all 12 portraits are optimized WebP sources served through the `Image` component (the two newest portraits, previously ~0.5 MB source PNGs, are converted to WebP matching the existing ~12 KB medallions; no source PNGs remain), certificate marks render unmodified (no recolor, distortion, or crop) via `objectFit: contain`, and the retired `why-team.jpg` is not shipped

#### Scenario: Big marquee accent
- **WHEN** the full-bleed marquee renders in the light chapter
- **THEN** the filled "THAT WORKS" row is the brand orange (not the chapter's plum contrast slot) and the outlined "WITH SOCIAL LAMA" row is unchanged

#### Scenario: Why-that-works never renders on the hero plum
- **WHEN** the user scrolls from the pinned hero into chapter 2 at any speed (including while the ~0.9s background morph is still in flight)
- **THEN** the why-that-works section shows its own sand ground continuous with the client-logos band — at no scroll position does its ink copy sit on the plum background
