# hero-tv-shell

## REMOVED Requirements

### Requirement: Retro TV frames the hero video
**Reason**: The retro TV direction is shelved (user decision, 2026-07-13); the hero reverts to the reference's bare right-anchored clip presentation.
**Migration**: Shell JSX/CSS and `public/assets/tv-shell.webp` are deleted. The generation brief, screen-rect measurement script, and source cutout PNG remain in `openspec/changes/archive/2026-07-13-hero-scroll-scrub/assets/` for any future revival.

### Requirement: Video aligned to the measured screen rect
**Reason**: No shell, no screen rect.
**Migration**: The video positions absolutely against the hero section (right-anchored, reference geometry) instead of a measured raster rect.

### Requirement: Screen overlays neutralize background drift
**Reason**: No shell, no glass overlays. Background drift is instead eliminated at the source: the clip is graded to the token and gated.
**Migration**: Seam handling moves to `hero-impressed-clip`'s seamless-composite gate requirement (post-tint + `verify-clip-bg.ts`).

### Requirement: Shell wraps every media state
**Reason**: No shell to wrap states in.
**Migration**: All media states (scrubbed video, pre-load poster, reduced-motion poster) render bare in the same right-anchored box — covered by the modified `homepage` hero requirement.

### Requirement: Hero clip exempt from seamless-composite gate
**Reason**: The exemption existed because the shell absorbed drift; with the shell gone, the exemption is revoked.
**Migration**: The hero clip is again subject to `verify-clip-bg.ts` against `#892f53` — now stated normatively in `hero-impressed-clip`'s encoding requirement. The exemption note in the script's docstring is removed.
