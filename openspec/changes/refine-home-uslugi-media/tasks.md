## 1. Source assets

- [ ] 1.1 Collect the eight source files: they sit in `/tmp/claude-1000/-mnt-work-goodone-sociallama-v2/fe2dc8a3-6859-4fb5-a217-a06bf6da5acd/scratchpad/uslugi-drive/` from the explore session; if gone, re-download with `rclone copy "goodone-gdrive:" <dest> --drive-root-folder-id 1pPlBuevAX3Sth1-ALHXU4YJXKr2lBmrH` (7 jpg + `ssstik.io_1785766720675.mp4`; the FDownloader mp4 is out of scope)
- [ ] 1.2 Optimize + rename the seven images to `public/assets/content-<brand>.jpg` per the design mapping (burger-king, dpd, breville, walentynki, laurastar, easy-egg, kohersen): ≤1080px long edge (Laurastar 1638→1080 downscale), ~q80 re-encode, no upscale of the 576×720 Kohersen; record each file's true width/height for the content data
- [ ] 1.3 Watch `ssstik.io_1785766720675.mp4`, pick its brand/subject for the clip filename (`public/clips/kreacje-<name>.mp4`), PL alt, and EN alt, and choose a clean poster frame
- [ ] 1.4 Transcode the reel: HEVC → H.264 600×1066, tight ~12s trim, `faststart`, ≤3 MB, explicit bt709 color tags (source is bt709 matrix / P3 primaries — untagged output hue-shifts); extract the poster jpg; verify with ffprobe that codec/dims/duration/color match the three sibling clips

## 2. Content data

- [ ] 2.1 `lib/content/home.ts`: replace the CONTENT `panels` array with the seven new entries (data order = Burger King, DPD, Breville, walentynki, Laurastar, Easy Egg, Kohersen) with true dims and Polish alts; update the roster comment
- [ ] 2.2 `lib/content/home.ts`: append the fourth clip entry (`src`, `poster`, PL alt) to the KREACJE `clips`
- [ ] 2.3 `lib/content/home.en.ts`: mirror both edits with English alts

## 3. Layout CSS (`services.module.css`)

- [ ] 3.1 Desktop CONTENT collage: retune to seven slots for uniform 4:5 panels — drop the eighth slot rule, lower slot heights (hero ~70–75%, flanks/corners proportionally), keep center-hero + flanks + corners composition, alternating ±1deg rotations, Kohersen in the smallest slot; tune visually against the dev server
- [ ] 3.2 Mobile CONTENT trio: retune the three `stackStage .panel` width/position rules for 4:5 panels (current widths were tuned for tall screenshots)
- [ ] 3.3 Clip rail: add `.phoneFrame:nth-child(4)` tilt rule (`rotate: 1.5deg`, continuing the alternation)
- [ ] 3.4 Mobile clip cap: add `.stackStage .phoneFrame:nth-child(n + 4) { display: none }` so mobile keeps exactly three frames with unchanged size/spacing
- [ ] 3.5 Low-desktop rail nudge: at ~800–1000px viewports shrink `.phoneFrame` height and/or `.phone` gap so four frames fit without overflow or aspect distortion

## 4. Verification

- [ ] 4.1 Ask the user to restart the dev server (new `public/` files 404 until restart — never kill/spawn the server from the session)
- [ ] 4.2 `bun run check` passes
- [ ] 4.3 Playwright screenshots of the settled CONTENT stage (not rect queries — the reveal wipe can mask overflow) at ~800, ~1024, ~1440px: seven panels fit, no unintended overlap/cropping, Kohersen not soft; mobile viewport shows the Burger King / DPD / Breville trio
- [ ] 4.4 Playwright screenshots of the KREACJE rail at the same widths: four frames fit side by side with tilts; mobile shows exactly three frames with today's sizing; default playing clip is a visible frame on mobile
- [ ] 4.5 Confirm the new clip plays (H.264) and its poster paints; spot-check colors against the source (no hue shift)
- [ ] 4.6 Show the user before/after screenshots for visual sign-off before any push
