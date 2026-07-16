# Design — Why Team Stage

## Context

The why-that-works section (`app/(home)/sections/why-that-works/`) renders a two-column bottom row: a `.media` box (`aspect-ratio: 4/3`, `border-radius: 14px`, `overflow: hidden`) with a static team JPG, and supporting copy at right. The row reveals via `useReveal` with `data-reveal-item` children.

Two other homepage sections already implement a "stage panel" backdrop: `services.module.css` (`.backdrop` + `.blob*` + `.grain`) and `how-it-works.module.css` (`.stage` with `::before` glow / `::after` grain and a `--grain` feTurbulence data-URI custom property). The recipe: `linear-gradient(160deg, var(--color-plum-dark), var(--color-plum) 65%)`, an orange radial glow blob, grain tile at `background-size: 700px 700px`, `opacity: 0.38`, `mix-blend-mode: soft-light`, children lifted with `z-index: 1`. Both copies cross-reference each other in comments; the house convention is deliberate duplication per module, not extraction.

Raw assets: 10 avatar PNGs, 810×810 RGBA, ~0.5 MB each, sticker-style (circular plum→orange gradient, white outline, transparent corners), currently outside the repo at `/mnt/work/goodone/stopki-sl-photos/`. Certificates: `dimaq-cert.png` (347×143) and `meta-cert.png` (627×345) at `/mem/`.

## Goals / Non-Goals

**Goals:**

- Media box renders the team stage: grain-gradient backdrop, 10 scattered avatars (upper ~⅔), 2 certificate chips (bottom), playful but legible.
- Crisp rendering at all viewports; total added asset weight for the box under ~350 KB.
- Preserve the section's existing reveal choreography and the `.media` container contract (aspect ratio, radius).
- Match house CSS conventions (module CSS, brand tokens, commented recipe duplication).

**Non-Goals:**

- No changes to heading/manifesto/copy/link markup or animations.
- No shared "stage" component extraction (would touch two shipped sections).
- No name labels or per-person links on avatars (name→photo mapping unknown).
- No hover/interaction on avatars beyond optional reveal stagger.
- No dark-theme variant beyond what the absolute palette tokens already guarantee.

## Decisions

1. **Live DOM over flat image** — avatars and certs as `<Image>` elements positioned inside the stage. Rationale: retina-crisp, certs stay legible/scalable, team changes are a file swap. Alternative (single baked JPG, Higgsfield-composited) rejected: fixed pixels, illegible cert text on mobile, regenerate-on-every-team-change. Mockups from the exploration live outside the repo.

2. **Stage recipe duplicated into the module** — copy the `--grain` data-URI + gradient + glow + grain block into `why-that-works.module.css` with a comment referencing the services/how-it-works siblings, matching the existing cross-reference convention. Alternative (extract shared component/CSS) rejected as out-of-scope refactor of shipped sections.

3. **Scatter via absolute %-positioning** — each avatar gets `left/top` in percentages of the stage, `width` as a percentage (≈13–17%), and a per-item rotation (−6°…+6°). Positions live in a small const array in the section component (or inline styles), not in content config — this is presentation, not content. Two loose interleaved rows; rotations alternate sign so the cluster reads scattered, not sliding. Alternative (CSS grid with transform jitter) rejected: grid fights the overlap/depth look.

3a. **Glass bubble behind each sticker** (user decision, 2026-07-16) — a translucent circle seated behind each avatar (`::before`, inset −8%): the how-it-works glass-card recipe (cream 5% fill, 1px cream 14% ring, `backdrop-filter: blur(6px)`) bent into a circle. The sticker renders on top unclipped, so its baked white outline and head pop-out survive; the seat drop-shadow moves to the `img` so it traces the sticker alpha, not the bubble. Alternatives rejected: clipping photos inside bubbles (decapitates the pop-out, double-frames the outline), ambient micro-bubbles all around (clutter at 343px on a panel already carrying grain + glow + 12 elements).

4. **Certificate chips as cream rounded rectangles** — `background: var(--color-cream)`, `border-radius`, thin `var(--color-sand)` inner border, soft shadow, ±3° tilt, laid out with flex along the stage bottom. Real PNGs via `<Image>` with `objectFit="contain"`. DIMAQ and Meta marks must not be recolored or distorted (trademark hygiene).

5. **Asset pipeline** — avatars: resize 810→400px, encode WebP q80 (≈15–25 KB each), place in `public/assets/team/` with people-neutral names (`avatar-01.webp`…`avatar-10.webp`, keeping source numbering). Certs: keep PNG (logos with text degrade in aggressive WebP; still re-encode losslessly if smaller) in `public/assets/certs/`. Delete `why-team.jpg`. Use the repo `Image` component with explicit `mobileSize`/`desktopSize` so Next serves scaled variants.

6. **Reveal** — the media box keeps its single `data-reveal-item` wrapper (whole stage reveals as one). Optional per-avatar stagger only if it drops out of the existing `useReveal` API trivially; otherwise skip (non-goal creep).

## Risks / Trade-offs

- [Absolute % positions can collide on very narrow boxes] → positions tuned against the real 4/3 box at mobile width (~343px) during implementation; avatars sized ≥13% so faces stay recognizable at ~45px.
- [Grain data-URI duplication drifts from siblings] → comment in the module names both sibling files, mirroring their existing cross-references.
- [Cert text illegible at mobile scale] → accepted: chips read as credential marks, not documents; they are DOM elements so a later enhancement (tap to enlarge/link) stays possible.
- [Sticker PNGs have baked white outlines and shadows] → no CSS border/shadow on the stickers themselves; only a subtle drop shadow under the sticker to seat it on the stage, tuned visually. The glass bubble (decision 3a) is a separate element *behind* the sticker, not a border on it.
- [Meta/DIMAQ brand misuse] → marks rendered unmodified on neutral chips; no recolor, no crop.

## Migration Plan

Single PR: add assets → add stage markup/styles → delete `why-team.jpg`. Rollback = revert commit. No data, route, or dependency changes.

## Open Questions

- Exact scatter coordinates are a taste call — implementer tunes in-browser against desktop and mobile widths; the spec fixes the *shape* (two loose rows, upper ⅔, rotations ±6°), not the numbers.
- Whether `lib/content/home.ts` should list the asset paths (content-config purity) or the section component owns them (presentation) — default: component owns them, matching decision 3.
