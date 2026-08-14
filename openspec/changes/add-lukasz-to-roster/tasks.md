## 1. Prerequisites — clear the stale spec first

- [ ] 1.1 Archive `refine-team-roster` (18/18, implemented, never archived) with `openspec archive refine-team-roster --yes`
- [ ] 1.2 Archive `add-team-rail-mobile` (10/10, implemented, never archived) with `openspec archive add-team-rail-mobile --yes`
- [ ] 1.3 **Check for a regression introduced by 1.1.** `refine-team-roster`'s `MODIFIED` block for "Every member has a transparent, crop-matched portrait cutout" predates the framing-integrity rules that the later-archived `refine-team-slider` folded into the published spec (subject bleeds off the bottom edge; side edges touched only below elbow height; no mid-frame amputations). Because `MODIFIED` replaces wholesale, archiving in date order drops them. Confirm whether `openspec/specs/onas-team/spec.md` still carries all three scenarios after 1.1 — this change's delta restores the merged text, so the gap closes when this change archives, but it must be a known gap, not a silent one
- [ ] 1.4 Confirm `openspec/specs/onas-team/spec.md` now describes 15 members and the CTA tile, so this change's `MODIFIED` headers match their targets
- [ ] 1.5 `openspec validate add-lukasz-to-roster --strict`

## 2. Source preparation and measurement (local, no credits)

- [ ] 2.1 Save the seofly.pl source `Lukasz-seo-specialist.webp` (300x300) into the change's working directory; keep `public/authors/lukasz-plocinski.png` untouched as the likeness reference
- [ ] 2.2 Matte the source with `bria-rmbg` in the rembg python (`/home/linuxbrew/.linuxbrew/opt/python@3.11/bin/python3.11`), applying `ImageOps.exif_transpose` before matting, and confirm the green circular ring and white corners are gone
- [ ] 2.3 Re-measure head width, subject bbox and the generated fraction against the roster anchor (head width 0.369 of frame, measured off `przemyslaw-swiercz.png`) to confirm the 34% figure before spending credits
- [ ] 2.4 Crop the matted source to the subject's hem so the body touches the new bottom edge — this is what makes the extension continue the torso rather than float it

## 3. Reconstruction (approved credit batch, ~3 credits)

- [ ] 3.1 Upscale the prepared source to 2K with `upscale_image` before any generative edit — the roster framing needs a 1.3x upsample and reconstructing from a soft source compounds it
- [ ] 3.2 Run one `nano_banana_pro` edit at aspect ratio 2:3 framed as reconstruction (role must be `image`), extending the torso to hip level and continuing the vest and checked shirt. **Do not use `outpaint_image`** — it NSFW-false-flags deterministically on plum-flattened male cutouts on this roster and has returned anisotropically squeezed output
- [ ] 3.3 If an outpaint proves unavoidable, pass explicit `width`/`height` at source resolution rather than letting it auto-size
- [ ] 3.4 Report credits actually spent; any retake beyond this batch needs a fresh explicit approval

## 4. Cutout production and verification

- [ ] 4.1 Run the standard pipeline on the reconstruction: `bria-rmbg` matte, edge decontamination (nearest-opaque RGB fill on semi-transparent edge pixels), then the framing solver
- [ ] 4.2 Solve head width downward from 0.42 until every row above the hip line fits inside the 422 width with ~6px margin; centre that span's x (head may sit up to ±30px off-centre); place head-top at 0.06H. After capping head drift, re-check the span still clears both edges
- [ ] 4.3 Write `public/o-nas/slider/lukasz-plocinski.png` at 422x600, alpha, optimized to the ~300 KB band. Confirm it does not collide with `public/authors/lukasz-plocinski.png`, which stays as-is
- [ ] 4.4 Verify `alpha[-1]` carries subject coverage — the figure must bleed off the bottom edge, not float
- [ ] 4.5 Verify no side-edge alpha above elbow height and no contact run that ends mid-frame
- [ ] 4.6 Template-correlate the face against the pre-reconstruction source across an (sx, sy) scale grid; both axes must be ≥0.99. Ratio checks cannot substitute — the framing solver normalises head width away
- [ ] 4.7 Render a plum `#913155` contact sheet of all 16 cutouts together and confirm Łukasz reads as one set with the roster — no oversized head, no smeared garment, no softness at slider scale
- [ ] 4.8 Send the finished portrait to Łukasz for sign-off before it ships; a third of it is generated and the likeness is his

## 5. Roster content

- [ ] 5.1 Draft the PL bio in the roster's length band (~4 sentences, third person, craft-focused, no invented employers or year counts beyond what his published author bio states) and get it approved
- [ ] 5.2 Insert the member entry in `lib/content/o-nas.ts` immediately before Przemysław Świercz: `given: 'ŁUKASZ'`, `surname: 'PŁOCIŃSKI'`, `role: 'Specjalista SEO, SEOFLY'`, the approved bio, `photo: '/o-nas/slider/lukasz-plocinski.png'`
- [ ] 5.3 Add the SEOFLY profile `link` — `{ label: 'seofly.pl', href: 'https://seofly.pl/zespol/lukasz-plocinski/' }` — **only if confirmed**; otherwise omit the field
- [ ] 5.4 Mirror the entry in `lib/content/o-nas.en.ts` at the same index with `role: 'SEO Specialist, SEOFLY'` and an EN bio of matching substance and length
- [ ] 5.5 Run `lib/content/locale-parity.test.ts` — it asserts both files list identical photos in identical order

## 6. Remove the homepage CTA tile

- [ ] 6.1 Delete the CTA `<li>` block from `app/(frontend)/(home)/sections/why-that-works/index.tsx` (the `.moreTile` item and its comment)
- [ ] 6.2 Delete `.moreTile`, `.moreLink`, `.moreLabel`, `.moreArrow` and their `@media (hover: hover)` and `@media (--reduced-motion)` blocks from `why-that-works.module.css`. Leave `components/layout/header/header.module.css`'s unrelated `.moreLink` alone
- [ ] 6.3 Remove `moreCard` from `lib/content/home.ts` and `lib/content/home.en.ts`, plus any now-unused type member
- [ ] 6.4 Confirm no remaining reference to `moreCard`/`moreTile`/`moreLabel`/`moreArrow` in the section, and that `ArrowRight` is still imported for the member tiles

## 7. Verification

- [ ] 7.1 Ask the user to restart the dev server — a new `public/` file 404s until then. Never kill or spawn the server from the agent session
- [ ] 7.2 Screenshot the homepage team grid at desktop: 16 tiles, four complete rows of four, no CTA cell, Łukasz immediately left of Przemek
- [ ] 7.3 Screenshot the mobile rail: all 16 members swipeable, Przemysław Świercz as the final cell, swipe hint intact
- [ ] 7.4 Step the `/o-nas` slider to Łukasz in both locales; confirm the surname renders complete, the bio does not jump the text column, and the SEOFLY role and link render as intended
- [ ] 7.5 Follow `?lama=lukasz-plocinski#zespol` from his homepage tile and confirm it lands on his slide with the peer wash correct on a cold cache
- [ ] 7.6 Check the slide in WebKit, not only Chromium
- [ ] 7.7 `bun run check` (lint, types, tests) and a production build
- [ ] 7.8 Archive this change into the same commit as the code, then ff-merge per the close-out flow
