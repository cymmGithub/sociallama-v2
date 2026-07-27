## Why

The why-that-works ("o-nas") team stage currently scatters 10 avatar "stickers" on glass bubbles across a plum panel with two tilted certificate chips floating along the bottom. The user finds it fussy and wants a simpler, more legible presentation. Two new team members were also added (`avatar-11.png`, `Agnieszka-sl.png`), taking the team from 10 to 12 — which the scatter layout was hand-tuned for at exactly 10 and does not accommodate. The approved replacement ("Mock 2 · Plum Stage Mosaic") is a clean, uniform grid on the same plum stage, with the certificates promoted into the grid as cards and a spotlight hover interaction.

## What Changes

- Replace the scattered avatar-sticker + glass-bubble treatment with a uniform grid mosaic of 12 team medallions (6 columns × 2 rows on desktop, 3 columns on mobile), keeping the existing plum grain-gradient stage recipe (160° gradient, orange glow blob, feTurbulence grain at soft-light).
- Promote the two certificates (DIMAQ professional, Meta Small Business Academy) from floating tilted chips to two cream cards sitting inline in the mosaic grid — each spanning 2 columns on the bottom row, preceded by a "Certyfikaty" label cell — so team + proof read as one continuous block (matches the user's sketch).
- Add a spotlight hover: hovering a tile scales it up with an orange ring while sibling tiles dim; certificate marks still render unmodified (no recolor, distortion, or crop).
- Grow the roster from 10 to 12 avatars; the grid is data-driven off a filename list rather than a hand-tuned position array, so future roster changes are a one-line edit.
- Convert the two new source portraits (`avatar-11.png` ~535 KB, `Agnieszka-sl.png` ~473 KB) to optimized WebP matching the existing `avatar-NN.webp` convention (~12 KB each, ~40× smaller), so all 12 sources are uniform WebP and the heavy PNGs are no longer committed/served as source.
- Keep the existing left-media / right-copy two-column layout: the grid mosaic replaces the scattered-avatar image in the left cell (it does not go full-width). On desktop the copy column stretches to the grid's height so the paragraph and CTA align with the grid edges (user correction).

## Capabilities

### New Capabilities
<!-- None — this refines behavior already defined in the homepage capability. -->

### Modified Capabilities
- `homepage`: the "Section motion behaviors" requirement's team-stage scenarios change — the avatar-sticker scatter + floating cert chips become a 12-tile grid mosaic with inline cert cards and a spotlight hover; the roster count changes from 10 to 12; the two new portraits are optimized to WebP alongside the existing ten.

## Impact

- `app/(frontend)/(home)/sections/why-that-works/index.tsx` — replace `TEAM_SCATTER` / `CERT_CHIPS` arrays and the scattered-avatar / floating-chip markup with a grid mosaic driven by a 12-item filename list.
- `app/(frontend)/(home)/sections/why-that-works/why-that-works.module.css` — remove `.avatar` / glass-bubble / `.chips` / `.chip` scatter styles; add `.mosaic` grid, `.tile`, spotlight-hover, and inline `.cert` card styles; keep the shared plum-stage recipe (`.media`/stage).
- `public/assets/team/avatar-11.png`, `public/assets/team/Agnieszka-sl.png` — converted to optimized WebP; the source PNGs removed.
- `openspec/specs/homepage/spec.md` — the two team-stage scenarios updated via delta.
- No content/data changes to `lib/content/home.ts` copy (portraits remain decorative; the group label carries meaning).
