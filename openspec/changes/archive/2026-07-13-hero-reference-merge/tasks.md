# Tasks — hero-reference-merge

## 1. Prerequisites

- [x] 1.1 Archive `hero-bare-clip` (complete, 17/17) so main specs sync with its deltas
- [x] 1.2 Archive `hero-client-logos-hover` (complete, 15/15) so the `client-logos-marquee` capability exists in main specs
- [x] 1.3 Verify `openspec/specs/` now reflects both (no `hero-tv-shell`, `client-logos-marquee` present)

## 2. Clip pipeline

- [x] 2.1 Corner-sample the reference take's background (`../sociallama/public/clips/hero.mp4`) with the `verify-clip-bg.ts` sampling method; confirm the per-channel shift to `#892f53` is within ~10/channel and corners agree within gate tolerance (surface to user if not) — *outcome: already at token, Δmax ≤ 2 on all corners; identity grade*
- [x] 2.2 Apply the global grade and re-encode: full 3s, h264 all-intra 24fps, 601-encode tagged smpte170m, ≤5MB — *outcome: identity grade (no lut); a bitstream-only tag remux was tried first but Chromium ignores SPS-level tags without the container `colr` atom (rendered ~Δ4 off); final is a clean libx264 all-intra re-encode (crf 13, `-g 1`) with full color tags, 4.36MB — browser then matches ffmpeg exactly*
- [x] 2.3 Run `verify-clip-bg.ts <out> '#892f53'` — must pass (±3/channel or ΔE < 3) — *passed, all corners*
- [x] 2.4 Extract poster from frame 0 of the tinted encode
- [x] 2.5 Replace `public/clips/hero.mp4` and `public/clips/hero-poster.jpg`; confirm ffprobe reports all frames pict_type I and 72 frames — *confirmed*

## 3. Hero geometry

- [x] 3.1 Update `.video` in `hero.module.css`: top inset → header clearance only (start `calc(var(--safe) + 53px)`, tune visually), `right: 0`, bottom-anchored full height
- [x] 3.2 Verify at 1280×720, 1440×900, and ultrawide: llama at hero scale, bottom flush, ears clear of header CTA/menu pills, headline overflow lands on the clip's empty plum field
- [x] 3.3 Browser-rendered background check (screenshot sampling page vs video pixels); apply empirical per-channel bump on top of the base grade if the matrix shifts, re-gate — *outcome: no bump needed; the shift was the missing container `colr` atom (see 2.2). Final render: video (137,47,82±1) vs page (137,47,83)*
- [x] 3.4 Scrub pass: pinned hero scrubs the 3s arc across the 280vh runway, hold phase parks on the final impressed profile; poster→video handoff seamless — *verified: linear 0→2.93s over 80% runway, flat hold after*

## 4. Belt restyle

- [x] 4.1 Add "ZAUFALI NAM" heading string to `lib/content/home.ts` and render it centered above the marquee in `client-logos/index.tsx`; ensure a single accessible name (no AT duplication with the section label)
- [x] 4.2 `client-logos.module.css`: sand band background + padding, heading style (display face), edge-fade `::before/::after` overlays from sand → transparent (no mask; cards must overflow)
- [x] 4.3 Remove silhouette filters, `html[data-theme]` flip rule, and the `.item::before` cream chip; logos grayscale at ~0.55 opacity at rest with brand-color reveal on hover (reference behavior, user correction); keep dim-others hover rule
- [x] 4.4 Verify hover interactions intact: pause-on-hover (fine pointers), testimonial cards with keep-on-screen shift near edges, cards float above hero content and the edge fades; touch devices keep the plain scrolling belt — *verified: track pauses (Δ0), card visible, hovered logo full-color, dim-others active*
- [x] 4.5 Light chapter ground → sand (user addition): `themes.cream.primary` = sand `#f0ece3` in `lib/styles/colors.ts`, styles regenerated
- [x] 4.6 "THAT WORKS" bold orange everywhere (user addition): big-marquee `.fill` → `var(--color-orange)`; why-that-works fill callback ends orange for "THAT"/"WORKS", plum for "WHY"
- [x] 4.7 Why-that-works owns its sand ground (user pick from seam mocks — seam 1 only, testimonial seam explicitly left as-is): `background-color: var(--color-sand)` on the section; worst-case mid-morph frame verified sandwich-free

## 5. Verification

- [x] 5.1 `bun run check` (Biome + TypeScript) passes — *371 tests pass, manifest clean*
- [x] 5.2 Reduced-motion pass: static poster hero (same geometry), no scrub runway, belt per its existing reduced-motion behavior — *poster seamless after `unoptimized` + explicit box height (see design outcomes)*
- [x] 5.3 Mobile pass: mobile clip/layout unchanged, belt band renders correctly at mobile widths — *verified at 390×844; note: pre-existing faint boundary on the mobile clip (missing colr atom, out of scope)*
- [x] 5.4 Full first-viewport review against the reference build side by side (user acceptance) — *accepted by user 2026-07-13*
