# Tasks — Why Team Stage

## 1. Assets

- [x] 1.1 Convert the 10 avatar PNGs (`/mnt/work/goodone/stopki-sl-photos/PROFILOWE_SL_*.png`, 810px) to ~400px WebP q80 and add as `public/assets/team/avatar-01.webp` … `avatar-10.webp` (keep source numbering order); verify each ≤ ~30 KB and transparency preserved
- [x] 1.2 Add certificate images to `public/assets/certs/` (`dimaq.png` from `/mem/dimaq-cert.png`, `meta.png` from `/mem/meta-cert.png`), re-encoded losslessly if smaller, marks unmodified

## 2. Stage backdrop

- [x] 2.1 In `why-that-works.module.css`, add the stage backdrop inside `.media`: plum 160° gradient base, orange glow blob, `--grain` feTurbulence data-URI overlay at `700px/0.38/soft-light` — copied from the how-it-works `.stage` recipe with a comment cross-referencing both sibling modules; children lifted `z-index: 1`; verify against services/how-it-works panels that noise density and glow read identically

## 3. Avatars scatter

- [x] 3.1 In `index.tsx`, replace the `why-team.jpg` `<Image>` with the stage markup: 10 avatar `<Image>`s (assets from 1.1) absolutely positioned from a const position array (left/top %, width % ≈13–17, rotation −6°…+6°, loose two-row cluster in upper ⅔); decorative alts, group `aria-label="Zespół Social Lama"`
- [x] 3.2 Tune scatter coordinates in-browser at desktop (~45vw) and mobile (~100vw / 343px) widths: no face clipped by the box radius, no avatar under the cert chips, faces ≥ ~45px on mobile
- [x] 3.3 Add a subtle seat shadow under each sticker (CSS drop-shadow tuned visually; no border — stickers carry their own white outline)
- [x] 3.4 Glass bubble behind each sticker (user decision 2026-07-16, design decision 3a): `::before` circle at inset −8% with the how-it-works glass recipe; seat shadow moved to the `img` so it traces sticker alpha

## 4. Certificate chips

- [x] 4.1 Add the two cert chips along the stage bottom: cream (`--color-cream`) rounded rectangles with thin sand inner border and soft shadow, tilted −2°…+3°, cert images `objectFit="contain"`; verify marks render unmodified
- [x] 4.2 Check mobile: chips stay inside the box, don't collide with avatars, and remain recognizable at ~343px box width

## 5. Integration & cleanup

- [x] 5.1 Confirm the bottom-row reveal still fires (stage inside the existing `data-reveal-item` wrapper) and reduced-motion renders static
- [x] 5.2 Delete `public/assets/why-team.jpg`; grep for remaining references; update the media cell alt/aria copy
- [x] 5.3 Run `bun run lint` (Biome) and typecheck; visual pass on `/` at mobile + desktop against the two sibling stage panels
