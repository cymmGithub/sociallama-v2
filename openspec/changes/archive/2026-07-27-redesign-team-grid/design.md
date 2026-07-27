## Context

The why-that-works section (`app/(frontend)/(home)/sections/why-that-works/`) renders a plum grain-gradient "stage" with 10 avatar stickers scattered on glass bubbles (`TEAM_SCATTER` position array) and 2 tilted certificate chips (`CERT_CHIPS`). The stage sits in the left cell of a desktop two-column grid; supporting copy + CTA sit right. The current layout is hand-tuned for exactly 10 avatars.

Constraints that shaped the approved direction:
- **The portraits are medallions, not square headshots.** Each source file is a circular person cut-out on a baked-in pink radial glow (that is *why* the old design floated them as bubbles). A true edge-to-edge photo grid is impossible without re-cropping all 12 originals — so the design leans into the medallion look on the plum stage, where the pink radials read as intentional glowing tiles.
- **No name→photo mapping exists** (portraits are decorative; the group label carries meaning). Hover therefore cannot reveal names — it must be a purely visual interaction.
- The plum grain-stage recipe (160° gradient, orange glow blob, feTurbulence grain at soft-light 0.38) is shared by hand with `services` and `how-it-works`; it stays.

## Goals / Non-Goals

**Goals:**
- A simpler, uniform 12-tile grid mosaic on the existing plum stage, with a subtle spotlight hover.
- Certificates promoted into the mosaic as inline cream cards (matches the user's sketch), still shown unmodified.
- Data-driven roster (filename list) so 10→12, and future changes, are one-line edits.
- All 12 source portraits uniform, optimized WebP.

**Non-Goals:**
- No name/role captions or per-person data (none exists).
- No change to section copy in `lib/content/home.ts`.
- No new shared component or design token; this stays local to the section.
- Not re-cropping the medallion sources into square headshots.

## Decisions

**1. Keep the two-column layout; the grid replaces the image in the left cell.**
The mock was rendered full-width for approval, but the intent was to swap the scattered-avatar *image* for a grid in place — not to restructure the section (user correction). So the existing left-media / right-copy split stays: the plum stage with the mosaic occupies the left cell, the supporting copy + CTA stay on the right. At this narrower (~half) width the faces are small by design (the user asked for smaller avatars), so the grid is 6 columns × 2 rows on desktop. To keep the two cells balanced, the copy column stretches to the grid's height (`align-self: stretch`) and the supporting paragraph is sized (display scale, ~1.8vw) to fill that height top-aligned, so the copy occupies the grid's height instead of leaving empty space beside it (user correction). The size is tuned to sit just at/under the grid height — larger and the row grows to the taller copy, leaving empty plum under the faces. *Alternative rejected:* full-width stage with copy reflowed above/below — over-reached beyond "replace the image."

**2. Certs live inside the mosaic grid, not as a separate row.**
Desktop 6-column grid: rows 1–2 hold the 12 faces; row 3 is `[ "Certyfikaty" label — span 2 ] [ DIMAQ card — span 2 ] [ Meta card — span 2 ]`. This makes team + proof one continuous block (the sketch) and reuses the same grid gap/rhythm. On mobile (3 columns) the label and each cert card span the full 3 columns. *Alternative rejected:* a detached footer band (that was Mock 1's approach; the user chose the inline-cards mosaic).

**3. Spotlight hover is pure CSS, no JS.**
`.mosaic:hover .tile { opacity: .5 }` dims the field; `.mosaic .tile:hover { opacity: 1; transform: scale(1.07); box-shadow: 0 0 0 2px orange, … }` lifts the hovered one. Rationale: cheapest possible, no state, and it degrades correctly — touch devices never trigger `:hover`, so tiles stay at full opacity. Cert cards are excluded from the dim (they are not `.tile`). *Reduced motion:* under `prefers-reduced-motion: reduce`, drop the `transform` scale and keep only the opacity/ring change so the interaction stays legible without movement.

**4. Roster is a filename array; images go through the `Image` component.**
Replace `TEAM_SCATTER`/`CERT_CHIPS` with a flat `TEAM` filename list mapped to square tiles using `<Image fill objectFit="cover">` (desktop ~9vw, mobile ~30vw). Certs keep `objectFit="contain"` so the marks are never cropped or distorted. The `Image` component already serves optimized ~400px WebP regardless of source, so runtime weight is fine — but see decision 5 for the source files.

**5. Convert the two new PNGs to source WebP.**
`avatar-11.png` (~535 KB) and `Agnieszka-sl.png` (~473 KB) are ~40× heavier than the existing ~12 KB WebP ten. Convert both to WebP at the existing 811px source size (cwebp, quality ~80) and remove the PNGs, so all 12 sources are uniform WebP and the repo stops carrying half-megabyte portraits. Filenames stay meaningful (the grid reads an explicit array, not `avatar-${i}` index math), so no forced renaming.

## Risks / Trade-offs

- **The two new photos may not carry the identical baked pink-radial medallion background as the ten WebP.** A full-color mosaic exposes any mismatch (unlike Mock 1's unifying duotone). → Verified visually against the live mock; both new tiles read consistently. Document the implicit asset contract: new team portraits must be circular cut-outs on the pink radial, or they will look off in the grid.
- **Next image optimizer has shown width-specific color corruption on this project.** → Pixel-sample the rendered grid at desktop and mobile widths before calling it done (per project practice), don't trust CSS-only inspection.
- **14 grid cells revealing with per-item stagger could feel heavy.** → Keep the reveal subtle: reveal the stage as a single group (or a short, capped stagger), not a long 14-step cascade.
- **Deleting user-added source PNGs is destructive.** → Convert first, confirm the WebP renders identically in the grid, then remove the PNGs in the same step; the originals remain recoverable via git history.

## Migration Plan

1. Convert `avatar-11.png` + `Agnieszka-sl.png` → WebP; verify visually; remove the PNGs.
2. Rewrite `index.tsx` (filename array + mosaic markup) and `why-that-works.module.css` (mosaic/tile/cert/spotlight styles; delete scatter/glass/chip styles).
3. Verify: Biome + tsc clean, screenshot the live section at desktop + mobile, confirm hover and reduced-motion behavior.
Rollback: revert the section commit and restore the PNGs from git — no data or schema migration involved.

## Open Questions

- The height-match sizes the supporting paragraph down to fit the (now short) grid; if the roster grows or the copy changes, re-check that the copy still fits the grid height at desktop.
