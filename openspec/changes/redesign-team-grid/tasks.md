## 1. Optimize the two new source portraits

- [x] 1.1 Convert `public/assets/team/avatar-11.png` and `public/assets/team/Agnieszka-sl.png` to WebP at 400px (matching the existing medallions, not 811px source), cwebp quality 80, ~11–14 KB each
- [x] 1.2 Confirm the converted WebP render identically (medallion + pink radial intact) at grid scale, then remove the source PNGs
- [x] 1.3 Verify all 12 files in `public/assets/team/` are now WebP and no half-megabyte PNGs remain

## 2. Rework the component markup (`index.tsx`)

- [x] 2.1 Replace the `TEAM_SCATTER` position array and `CERT_CHIPS` array with a flat `TEAM` filename list (12 WebP) and a `CERTS` list (DIMAQ, Meta)
- [x] 2.2 Replace the scattered-avatar / glass-bubble / floating-chip markup with a mosaic grid: 12 square tiles via `<Image fill objectFit="cover">` (desktop 16vw, mobile 30vw), then a "Certyfikaty" label cell and two cert cards via `<Image fill objectFit="contain">` in an aspect-ratio media box
- [x] 2.3 Reflow the layout so heading + manifesto sit above the full-width stage and the supporting paragraph + CTA sit below it (keep the `ProgressText` scrub and `useReveal` behavior on copy/CTA)
- [x] 2.4 Keep the `role="group"` / `aria-label="Zespół Social Lama"` grouping and empty `alt=""` on decorative portraits; give the cert images their unmodified alt text

## 3. Rework the styles (`why-that-works.module.css`)

- [x] 3.1 Delete the `.avatar` / glass-bubble `::before` / `.chips` / `.chip` / `.chipMedia` scatter styles
- [x] 3.2 Keep the shared plum grain-stage recipe (160° gradient, orange glow blob, feTurbulence grain at soft-light) on the stage container, now full-width
- [x] 3.3 Add `.mosaic` grid (6 columns desktop / 3 columns mobile, consistent gap), `.tile` square medallions, and `.cert` cream cards spanning 2 columns (full row on mobile) with a label cell
- [x] 3.4 Add the spotlight hover: `.mosaic:hover .tile { opacity: .5 }` + hovered tile `opacity: 1` + `scale` + orange ring box-shadow; exclude cert cards from the dim
- [x] 3.5 Under `prefers-reduced-motion: reduce`, drop the hover `transform` scale and keep only the opacity/ring change

## 4. Verify

- [x] 4.1 Biome + `tsc` clean (`--diagnostic-level=error` per project note)
- [x] 4.2 Screenshot the live section at desktop (1440) and mobile (390) widths; skin tones and pink radials render true — no Next optimizer color corruption
- [x] 4.3 Hover spotlight verified with a pointer (hovered tile scales + orange ring, siblings dim, certs excluded); reduced-motion rule in place to drop the scale
- [x] 4.4 Cert marks render unmodified (objectFit contain, no crop/recolor); block stacks cleanly to 3 columns + stacked cert cards on mobile
