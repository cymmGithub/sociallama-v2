# Design — refine-home-uslugi-media

## Context

The services section (`app/(frontend)/(home)/sections/services/`) renders per-tab stage media from typed descriptors in `lib/content/home.ts` (EN twin `home.en.ts`). Panel *width is derived*: CSS sets only each slot's `height`/position (`services.module.css:232-300`), and the inline `aspect-ratio` from the data resolves the width. The current eight CONTENT slots were tuned for tall phone-screenshot ratios (~0.46–0.59 w/h). All seven replacement creatives are 4:5 (0.8): at today's slot heights they would occupy ~2000px of a ~1300px stage — a straight src swap cannot work, the collage must be re-laid-out.

The clip rail (`ClipRail` in `index.tsx`) plays one clip at a time, defaulting to `Math.floor(clips.length / 2)`. Tilt CSS alternates only through `nth-child(3)`; the mobile stack hides surplus `.panel`s via `nth-child(n + 4)` but has **no** cap for `.phoneFrame` — with four clips, mobile would squeeze all four into the stack stage.

Source files are in the session scratchpad (`scratchpad/uslugi-drive/`), downloaded from the marketing Drive folder:

| Source file | Brand | Dims | Notes |
|---|---|---|---|
| `628373560…n.jpg` | Burger King ("WYJŚCIE NA MEDAL") | 1081×1351 | hero |
| `725127878…n.jpg` | Social Lama × DPD (lama z paczką) | 1080×1350 | mobile trio |
| `597897059…n.jpg` | Breville (kubek Grincha) | 1080×1350 | mobile trio |
| `629626962…n.jpg` | pracuj.pl/iRobot/Vobis (walentynkowa lama) | 1080×1350 | |
| `686135776…n.jpg` | Laurastar (parownica + szpilka) | 1638×2048 | downscale |
| `731442648…n.jpg` | Easy Egg (toast-rakieta) | 1081×1351 | |
| `494760074…n.jpg` | Kohersen (garnek na scenie) | 576×720 | **low-res → smallest slot** |
| `ssstik.io_1785766720675.mp4` | new rail reel | HEVC 1080×1920, 17.2s, 11.9MB | transcode required |

## Goals / Non-Goals

**Goals:**

- Replace the CONTENT collage with the seven new creatives, re-tuned for uniform 4:5 panels on desktop and mobile.
- Add the new reel as the fourth rail clip on desktop/tablet (≥ desktop breakpoint); mobile keeps exactly three.
- Optimized, correctly named, alt-texted assets in `public/`, PL + EN.

**Non-Goals:**

- No changes to tab/autoplay mechanics, engagement rules, reduced-motion behavior, or the SPRZEDAŻ stage.
- No deletion of the replaced panel sources — they are live case-study gallery files.
- No Payload/DB work (the Volvo case-study video idea was explicitly dropped).
- No change to the `Image` `sizes` props or the video primitive.

## Decisions

**1. Seven slots, not seven-into-eight.** Drop to seven `nth-child` slot rules rather than repeating an image to keep eight. The composition mirrors the current shape — center hero, two inner flanks, four corners — minus the eighth "top pocket", which existed to fill width the wider 4:5 panels now cover. Slot heights shrink relative to today (hero ~86% → ~70–75%, flanks/corners proportionally) so seven 0.8-ratio panels fit a ~1300px stage; exact values are tuned visually against the dev server, which is the established workflow for this collage (wariant B precedent).

**2. Slot order = data order = mobile trio.** Panels 1–3 double as the mobile set (`nth-child(n + 4)` hide rule already exists for `.panel`), so data order is Burger King (hero), DPD, Breville, then walentynki, Laurastar, Easy Egg, Kohersen. Kohersen sits last purely semantically; its *slot* is the smallest because 576×720 only survives ~2x DPR at ~230px rendered width.

**3. New files under `public/assets/content-<brand>.jpg`.** Matches the sibling `sprzedaz-*` naming. These are standalone marketing exports, not case-study gallery members, so they do not belong under `public/case-studies/<brand>/`. Optimization: downscale to ≤1080px width (Laurastar 1638→1080), mozjpeg-style re-encode ~q80 — sources are already Instagram-compressed, so the win is mostly the Laurastar downscale; avoid recompressing the tiny Kohersen below its current quality.

**4. Fourth clip appended, defaults untouched.** The new clip is entry #4 in `clips`; `Math.floor(4 / 2) = 2` shifts the default playing clip from #2 to #3 (Dom Volvo). Accepted: the alternative (special-casing the default index) adds a knob the spec doesn't ask for. Desktop gains one tilt rule (`.phoneFrame:nth-child(4) { rotate: 1.5deg }`, continuing the alternation); mobile gains `.stackStage .phoneFrame:nth-child(n + 4) { display: none }` — same pattern as panels. Because the hidden clip is 4th and the default playing index (2) is a *visible* frame on mobile, no JS branch is needed.

**5. Transcode to sibling spec.** `ffmpeg` HEVC→H.264 600×1066, trim to a tight ~12s loop (siblings are exactly 12s, target ≤3MB, `faststart`), poster jpg from a representative frame, explicit bt709 color tags (the source is bt709 matrix with P3 primaries; untagged output hue-shifts in browsers — established repo lesson). HEVC/VP9 sources must not ship as-is: no Firefox (HEVC) / Safari (VP9-in-mp4) playback.

**6. Low-desktop rail nudge.** At ~800–1000px viewports four 82%-height frames + 6% gaps exceed the stage width (~830px needed in ~740px). Fix inside the existing vocabulary: reduce `.phoneFrame` height and/or the `.phone` gap under a narrow desktop media query rather than introducing flex-shrink behavior (shrinking width would fight `aspect-ratio` and distort frames).

## Risks / Trade-offs

- [Uniform 4:5 panels read flatter than the current mixed-ratio collage] → vary slot heights and keep the alternating ±1deg rotations so the composition keeps depth; verify against the dev server with screenshots before sign-off.
- [Kohersen 576×720 can blur on high-DPR screens] → pin it to the smallest slot; if it still reads soft at 2x, flag for a higher-res export rather than upscaling.
- [Fourth clip shifts the default playing clip to #3] → deliberate (Decision 4); revisit only if the user objects visually.
- [New `public/` files 404 on the running dev server until restart] → known hazard; hand the restart to the user, never kill the server from the session.
- [`data-reveal` wipe clip-path can hide panel overflow issues in rect-based checks] → verify the settled state with screenshots, not bounding-box queries.

## Open Questions

- Exact retuned slot heights/positions — resolved visually during implementation (established collage workflow), not spec'd numerically here.
- Poster frame choice for the new clip — pick a clean, representative frame during transcode.
