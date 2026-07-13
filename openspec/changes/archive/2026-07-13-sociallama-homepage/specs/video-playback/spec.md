# video-playback

## ADDED Requirements

### Requirement: Video UI component
The system SHALL provide `@/components/ui/video` accepting `src`, `poster`, and optional `mobileSrc`/`posterMobile` props, rendering a muted, inline, looping video that does not download media until needed (`preload="none"`, poster paints first).

#### Scenario: Lazy playback
- **WHEN** the video element enters the viewport
- **THEN** playback starts; **WHEN** it leaves the viewport **THEN** playback pauses

#### Scenario: Responsive source
- **WHEN** the viewport matches the mobile breakpoint at mount and `mobileSrc` is provided
- **THEN** the mobile source and mobile poster are used instead of the desktop ones

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the component renders the poster through `@/components/ui/image` and no video element is created

#### Scenario: Storybook coverage
- **WHEN** `bun storybook` runs
- **THEN** a `Video` story exists demonstrating poster, playback, and reduced-motion states

### Requirement: Seamless composite convention
Every clip placed on a themed section SHALL have a flat background whose color equals the host section's theme background token, so the video edges are invisible against the page.

#### Scenario: Clip background verification
- **WHEN** a new clip is added for a plum-backed section
- **THEN** its corner pixels sample to `#892f53` within tolerance (ΔE < 3 or ±3 per RGB channel), verified via ffmpeg frame extraction before the clip is committed

#### Scenario: Mismatch remediation
- **WHEN** a generated clip's background does not match the token
- **THEN** the clip is color-corrected (or regenerated) — the theme token is never adjusted to match a clip
