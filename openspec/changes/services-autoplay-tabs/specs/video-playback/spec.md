# video-playback (delta)

## MODIFIED Requirements

### Requirement: Seamless composite convention
Every clip composited bare onto a themed section (no visible frame — the clip's background is meant to read as the page background) SHALL have a flat background whose color equals the host section's theme background token, so the video edges are invisible against the page. Clips presented inside an intentional visible frame (e.g. a rounded phone-style panel on the services stage) are exempt from the background-match requirement; their edges are a deliberate design element.

#### Scenario: Clip background verification
- **WHEN** a new bare-composited clip is added for a plum-backed section
- **THEN** its corner pixels sample to `#892f53` within tolerance (ΔE < 3 or ±3 per RGB channel), verified via ffmpeg frame extraction before the clip is committed

#### Scenario: Mismatch remediation
- **WHEN** a generated bare-composited clip's background does not match the token
- **THEN** the clip is color-corrected (or regenerated) — the theme token is never adjusted to match a clip

#### Scenario: Framed clip exemption
- **WHEN** a clip renders inside a visible frame such as the services stage's phone panel
- **THEN** no background-match verification is required and real-footage backgrounds are permitted
