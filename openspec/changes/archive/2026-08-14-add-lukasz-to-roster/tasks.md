## 1. Prerequisites — clear the stale spec first

- [x] 1.1 Archive `refine-team-roster` (18/18, implemented, never archived) with `openspec archive refine-team-roster --yes`
- [x] 1.2 Archive `add-team-rail-mobile` (10/10, implemented, never archived) with `openspec archive add-team-rail-mobile --yes`
- [x] 1.3 **Check for a regression introduced by 1.1.** *(Confirmed 2026-08-14: the three scenarios WERE dropped from `openspec/specs/onas-team/spec.md` by 1.1. Known gap, open until this change archives — its `MODIFIED` block for that requirement carries all three back.)* `refine-team-roster`'s `MODIFIED` block for "Every member has a transparent, crop-matched portrait cutout" predates the framing-integrity rules that the later-archived `refine-team-slider` folded into the published spec (subject bleeds off the bottom edge; side edges touched only below elbow height; no mid-frame amputations). Because `MODIFIED` replaces wholesale, archiving in date order drops them. Confirm whether `openspec/specs/onas-team/spec.md` still carries all three scenarios after 1.1 — this change's delta restores the merged text, so the gap closes when this change archives, but it must be a known gap, not a silent one
- [x] 1.4 Confirm `openspec/specs/onas-team/spec.md` now describes 15 members and the CTA tile, so this change's `MODIFIED` headers match their targets
- [x] 1.5 `openspec validate add-lukasz-to-roster --strict`

## 2. Source preparation and measurement (local, no credits)

> **Superseded 2026-08-14.** The client supplied the 6000x4000 studio original
> (`PG1W4678.JPG`), so sections 2–4 below describe reconstruction work that no
> longer ships. They are kept as the record of what was measured and tried; the
> work that produced the shipped cutout is section 4A.

- [x] 2.1 Save the seofly.pl source `Lukasz-seo-specialist.webp` (300x300) into the change's working directory; keep `public/authors/lukasz-plocinski.png` untouched as the likeness reference — fetched from `https://seofly.pl/wp-content/uploads/2026/05/Lukasz-seo-specialist.webp` (300x300 confirmed; every WP size variant 404s, so no larger original exists). **Superseded as the reconstruction source by 2.3's finding** — `public/authors/lukasz-plocinski.png` is now both the source and the likeness reference, and is copied, never modified
- [x] 2.2 Matte the source with `bria-rmbg` in the rembg python (`/home/linuxbrew/.linuxbrew/opt/python@3.11/bin/python3.11`), applying `ImageOps.exif_transpose` before matting, and confirm the green circular ring and white corners are gone
- [x] 2.3 Re-measure head width, subject bbox and the generated fraction against the roster anchor (head width 0.369 of frame, measured off `przemyslaw-swiercz.png`) to confirm the 34% figure before spending credits — **the 34% figure did NOT hold.** The anchor reproduced exactly (przemyslaw head_w 155.7/422 = 0.369), but the seofly source is a **circular avatar**: a circle at r=149, centre (149.5, 149.5) matches its transparency at 99.75%, and its transparent area is 22.2% vs the 21.5% an inscribed circle predicts. Everything below the widest row (y=243) is the mask arc, not his body. Counting only photographic content, seofly leaves **45.6%** to generate against the repo avatar's **45.9%** — a 0.3-point difference, not 34 vs 46. Placed in the real 422x600 frame at the anchor, the two sources cover the same extent; the repo avatar is 1.6x sharper (x0.80 downscale vs x1.30 upsample). Source decision escalated to the user
- [x] 2.4 Crop the matted source to the subject's hem so the body touches the new bottom edge — this is what makes the extension continue the torso rather than float it. On the repo avatar this is close to a no-op: its torso already reaches the canvas bottom row (y=383 of 384), which is precisely why it was chosen over the disc-masked seofly file

## 3. Reconstruction — DISCARDED (8 credits spent before the original arrived)

- [x] 3.1 Upscale the prepared source to 2K with `upscale_image` before any generative edit — no longer to cover a 1.3x upsample (the repo source downscales into the frame) but so the generative pass reads sharp garment structure
- [x] 3.2 Run one `nano_banana_pro` edit at aspect ratio 2:3 framed as reconstruction (role must be `image`), extending the torso to hip level and continuing the vest and checked shirt. **Do not use `outpaint_image`** — it NSFW-false-flags deterministically on plum-flattened male cutouts on this roster and has returned anisotropically squeezed output — **took three passes, not one.** v1 continued the torso but replaced his vest with vertical cable knit (user caught it). v2 fixed the knit but drew the grey trim as a windowpane grid. v3 (shipped) reads the garment correctly: flat fine heathered maroon knit with narrow grey bands along the V-neck, fine gingham shirt, ribbed hem. The real vest was read off a 2K zoom of the source before re-prompting, and cable knit / windowpane were named as explicit negatives. `outpaint_image` was considered once compositing failed — its ban is conditioned on *plum-flattened* cutouts and ours is on studio grey — but it takes no prompt and centres the source, so it cannot be steered to the garment or to the roster geometry. Not used
- [x] 3.3 If an outpaint proves unavoidable, pass explicit `width`/`height` at source resolution rather than letting it auto-size — **not needed.** The single `nano_banana_pro` 2:3 edit returned a usable reconstruction first time; `outpaint_image` was never called
- [x] 3.4 Report credits actually spent; any retake beyond this batch needs a fresh explicit approval — **8 credits total** (balance 690.28 → ~682.28): 2 `upscale_image` at 2K, then 2 + 2 + 2 for three `nano_banana_pro` passes. The approved batch was ~3 and covered the first 4; the two retakes (v2, v3) were run on the user's explicit 2026-08-14 instruction to regenerate after the vest came back wrong

## 4. Cutout production and verification

- [x] 4.1 Run the standard pipeline on the reconstruction: `bria-rmbg` matte, edge decontamination (nearest-opaque RGB fill on semi-transparent edge pixels), then the framing solver
- [x] 4.2 Solve head width downward from 0.42 until every row above the hip line fits inside the 422 width with ~6px margin; centre that span's x (head may sit up to ±30px off-centre); place head-top at 0.06H. After capping head drift, re-check the span still clears both edges — **solved from the 0.369 anchor, not the 0.42 ceiling.** Starting at 0.42 accepts the ceiling whenever the body happens to fit, which it did here: the first pass shipped a 0.4218 head, the widest male head in the roster (measured band across the 15 shipped cutouts: median 0.3720, mean 0.3837, range 0.3389–0.4351). 0.42 is the never-exceed bound; the anchor is the target. **A second solver bug surfaced on the v3 retake:** the fit test constrained the widest single ROW, but the extent that must fit is the UNION span across in-frame rows — rows peak at different x, so the union is wider. A 408px "widest row" produced a 411px span and lost the margin after centring; the check now tests the union. Final shipped (v3): head width **0.3365**, head-top y=36, span x 6–415 with equal 6px margins, head drift −19.4px so the ±30 cap never engaged. 0.3365 sits a hair under the roster minimum (Aleksander 0.3389) because v3 shows more body — arms and hip — which the 422 width has to accommodate
- [x] 4.3 Write `public/o-nas/slider/lukasz-plocinski.png` at 422x600, alpha, optimized to the ~300 KB band. Confirm it does not collide with `public/authors/lukasz-plocinski.png`, which stays as-is — shipped at **310 KB** (roster band 176–316 KB). `public/authors/lukasz-plocinski.png` is untouched (still 384x384, 144 KB) and git-clean
- [x] 4.4 Verify `alpha[-1]` carries subject coverage — the figure must bleed off the bottom edge, not float — 400px of 422 (94.8%)
- [x] 4.5 Verify no side-edge alpha above elbow height and no contact run that ends mid-frame — zero side-edge rows anywhere in the frame, so both conditions hold trivially
- [x] 4.6 Template-correlate the face against the pre-reconstruction source across an (sx, sy) scale grid; both axes must be ≥0.99 — **moot for what ships** (the frame is photographic), but recorded because it is why the reconstruction was never good enough. Measured on a brow-to-chin face box: pass 1 peak 0.9793 / anisotropy 0.9933 with a wrong cable-knit vest; pass 2 0.8805 / 0.9704; pass 3 0.8596 / 0.9531 with the right vest. Every pass re-rendered the face rather than preserving it, and likeness fell as garment fidelity rose. Compositing the photograph back over a generated torso was tried face-anchored and chest-anchored and ghosted both times — the generated anatomy differs enough that no scale-and-shift aligns the collar and the V-neck at once
- [x] 4.7 Render a plum `#913155` contact sheet of all 16 cutouts together and confirm Łukasz reads as one set with the roster — no oversized head, no smeared garment, no softness at slider scale — rebuilt on the shipped v3. Reads as one set; the garment is clean at slider scale and there is no smearing. He shows more torso than most (chest-up is the roster norm) and his head is the smallest in the set by a hair
- [x] 4.8 Send the finished portrait to Łukasz for sign-off before it ships; a third of it is generated and the likeness is his — **moot.** Nothing is generated; the shipped cutout is a crop of the studio photograph the client supplied. No AI-likeness sign-off is owed

## 4A. Cutout from the client original (what actually shipped)

- [x] 4A.1 Matte `PG1W4678.JPG` (6000x4000, Panasonic DC-S5M2X, 2025-12-01) with `bria-rmbg` under `ImageOps.exif_transpose`. Two passes: locate him on a 1200px copy, crop the full-res frame to him keeping the bottom edge, then matte that crop at 2000px tall — bria-rmbg infers at 1024px internally, so matting the full frame would upsample a coarse mask over his hair
- [x] 4A.2 Edge-decontaminate (nearest-opaque RGB fill on the 2 215 semi-transparent edge px); verified at 4x zoom on plum — no grey halo, hair strands intact
- [x] 4A.3 Solve the framing with the drift cap applied *inside* the solve (see design.md). Shipped: head width **0.3673** (anchor 0.369), head-top y=36, span x 9–413 with equal 9px margins, head drift +43.7px
- [x] 4A.4 Bottom-edge bleed **60.4%** (255px of 422) — comparable to Anna 63.0% and Robert 66.6%
- [x] 4A.5 Zero side-edge rows, so "no side contact above elbow height" and "no contact run ending mid-frame" both hold trivially
- [x] 4A.6 Likeness: **not applicable** — the frame is photographic end to end, so there is nothing to correlate. The reconstruction-verification requirement was dropped from the spec delta for the same reason
- [x] 4A.7 Optimised to **285 KB** (roster band 176–316 KB), written to `public/o-nas/slider/lukasz-plocinski.png`. `public/authors/lukasz-plocinski.png` remains untouched
- [x] 4A.8 Plum contact sheet of all 16 rebuilt — he reads as one set, and his crossed-arms pose matches the roster's dominant framing (Emilia, Karolina, Robert, Wojtek, Agnieszka)

## 5. Roster content

- [x] 5.1 Draft the PL bio in the roster's length band (~4 sentences, third person, craft-focused, no invented employers or year counts beyond what his published author bio states) and get it approved — **approved by the user 2026-08-14.** Sourced only from published material: his CMS author bio (SEOFLY, "od ponad piętnastu lat", analytical + creative, Google algorithm changes) and his own seofly.pl profile (volleyball as fan and amateur player, family, fantasy from Tolkien to Discworld). The "Moje pasje" section was checked against a peer profile first and is per-person, not agency boilerplate
- [x] 5.2 Insert the member entry in `lib/content/o-nas.ts` immediately before Przemysław Świercz: `given: 'ŁUKASZ'`, `surname: 'PŁOCIŃSKI'`, `role: 'Specjalista SEO, SEOFLY'`, the approved bio, `photo: '/o-nas/slider/lukasz-plocinski.png'`
- [x] 5.3 Add the SEOFLY profile `link` — `{ label: 'seofly.pl', href: 'https://seofly.pl/zespol/lukasz-plocinski/' }` — **confirmed by the user 2026-08-14**; URL verified live (HTTP 200, title "Łukasz Płociński - SeoFly")
- [x] 5.4 Mirror the entry in `lib/content/o-nas.en.ts` at the same index with `role: 'SEO Specialist, SEOFLY'` and an EN bio of matching substance and length
- [x] 5.5 Run `lib/content/locale-parity.test.ts` — it asserts both files list identical photos in identical order

## 6. Remove the homepage CTA tile

- [x] 6.1 Delete the CTA `<li>` block from `app/(frontend)/(home)/sections/why-that-works/index.tsx` (the `.moreTile` item and its comment)
- [x] 6.2 Delete `.moreTile`, `.moreLink`, `.moreLabel`, `.moreArrow` and their `@media (hover: hover)` and `@media (--reduced-motion)` blocks from `why-that-works.module.css`. Leave `components/layout/header/header.module.css`'s unrelated `.moreLink` alone
- [x] 6.3 Remove `moreCard` from `lib/content/home.ts` and `lib/content/home.en.ts`, plus any now-unused type member
- [x] 6.4 Confirm no remaining reference to `moreCard`/`moreTile`/`moreLabel`/`moreArrow` in the section, and that `ArrowRight` is still imported for the member tiles

## 7. Verification

> 7.2–7.6 passed in Chromium and WebKit with this exact roster entry, before the
> portrait was swapped for the client original. The swap replaced the bytes at
> the same path, at the same 422x600 dimensions, with no code change — so it
> cannot move layout, and the residual risk is the image itself, which was
> judged on the plum contact sheet instead. The worktree dev server had stopped
> by then and this session does not start those.

- [x] 7.1 Ask the user to restart the dev server — a new `public/` file 404s until then. Never kill or spawn the server from the agent session — **not needed.** Verified the new `public/` file serves HTTP 200 off the running worktree dev server on :3005 without a restart. The Next image cache did need clearing after the v3 overwrite (`rm -rf .next/dev/cache/images`), or the optimizer keeps serving the old bytes. The server was never killed or restarted by this session
- [x] 7.2 Screenshot the homepage team grid at desktop: 16 tiles, four complete rows of four, no CTA cell, Łukasz immediately left of Przemek — 16 tiles, four complete rows of four, no CTA cell, Łukasz 15th and immediately left of Przemysław. Verified in Chromium and WebKit
- [x] 7.3 Screenshot the mobile rail: all 16 members swipeable, Przemysław Świercz as the final cell, swipe hint intact — rail reports 16 cells, `overflow-x: auto`, scrollWidth 2869 vs clientWidth 390, Przemysław Świercz last. Verified in Chromium and WebKit
- [x] 7.4 Step the `/o-nas` slider to Łukasz in both locales; confirm the surname renders complete, the bio does not jump the text column, and the SEOFLY role and link render as intended — both locales land on his slide: ŁUKASZ / PŁOCIŃSKI renders complete, role reads "SPECJALISTA SEO, SEOFLY" / "SEO Specialist, SEOFLY", the full bio fits its column without pushing the layout, and the `seofly.pl` link renders
- [x] 7.5 Follow `?lama=lukasz-plocinski#zespol` from his homepage tile and confirm it lands on his slide with the peer wash correct on a cold cache — `?lama=lukasz-plocinski#zespol` landed on his slide on a cold context in both locales, with the peer wash correct (Iza washed left, Przemysław washed right)
- [x] 7.6 Check the slide in WebKit, not only Chromium — WebKit run passes every check Chromium does: 16 grid cells, 16 rail cells, both locale slides
- [x] 7.7 `bun run check` (lint, types, tests) and a production build — `bun run check` exit 0 (648 tests pass, 0 fail; 47 warnings, all pre-existing including the 3 known Biome internal panics), `bun run build` exit 0. Build left no copyright restamp on `home.ts`
- [x] 7.8 Archive this change into the same commit as the code, then ff-merge per the close-out flow
