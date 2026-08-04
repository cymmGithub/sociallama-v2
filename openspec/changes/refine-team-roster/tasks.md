## 1. Portrait cutouts

- [ ] 1.1 Produce Robert's replacement cutout from `~/Downloads/Firefly_Gemini_Flash-removebg.png`: crop to 422:600 with the torso bleeding off the bottom edge, head width anchored to the existing roster, resize to 422x600, optimize toward ~300 KB. Keep it in the scratchpad until 1.4 passes.
- [ ] 1.2 Produce naive 422x600 crops of Wojtek (`~/Downloads/wojtek-poziom-removebg.png`) and Aleksander (`~/Downloads/alex_Firefly_20241118142801-removebg.png`) the same way.
- [ ] 1.3 Build a plum-background contact sheet: the three candidate cutouts beside 3–4 existing roster cutouts, with head widths measured. Show it to the user. If either new member reads mis-scaled, agree the fix — outpaint-extension via Higgsfield ONLY after explicit per-batch credit approval (upscale Wojtek's source locally first if the crop window must shrink below 422px).
- [ ] 1.4 On approval, install the final files: overwrite `public/o-nas/slider/robert-sawicki.png`, add `wojtek-sochaczynski.png` and `aleksander-dyminski.png`. Verify each is a transparent PNG at 422x600 within the roster's weight band. Clear `.next/dev/cache/images` (Robert's file replaces under the same name). Hand the dev-server restart to the user — new public/ files 404 until then; never restart it from the agent.

## 2. Bios

- [ ] 2.1 Draft PL bios for Wojtek (Senior Videographer) and Aleksander (Videographer): craft-focused, third person, zero invented employers/clients/years/credentials, ` ` after single-letter words, length inside the roster's band, the two clearly distinct from each other. Show both drafts to the user for approval before wiring them in.
- [ ] 2.2 Draft the EN counterparts in the established EN voice (playful-but-clean, American spelling), same substance and comparable length; include them in the same approval pass.

## 3. Content wiring

- [ ] 3.1 Update the homepage `TEAM` array in `app/(frontend)/(home)/sections/why-that-works/index.tsx`: add Wojtek and Aleksander, reorder all 14 to Anna, Kamil, Robert, Emilia, Paulina, Magda, Piotrek, Agnieszka, Katarzyna, Oliwia, Karolina, Wojtek, Aleksander, Przemek.
- [ ] 3.2 Update `oNasTeam.members` in `lib/content/o-nas.ts`: same order, new entries with `given`/`surname`, role, approved PL bio, photo path; no `certs`, no `link` for the new members. Refresh the roster-order comment (it no longer mirrors a seniority rule).
- [ ] 3.3 Mirror in `lib/content/o-nas.en.ts` with the approved EN bios; confirm it still compiles under `satisfies LocalizedONas`.
- [ ] 3.4 Run `bun run check` (Biome + TypeScript) and fix anything it raises.

## 4. Verification

- [ ] 4.1 Playwright screenshots of the homepage grid: 14 tiles in the curated order, new portraits rendering, incomplete final row left-aligned on desktop, 7x2 on mobile.
- [ ] 4.2 Playwright pass on `/o-nas#zespol` and `/en/about-us#zespol`: step to each new member and Robert; check portrait, name, role, bio; confirm homepage deep links `?lama=wojtek-sochaczynski` / `?lama=aleksander-dyminski` preselect correctly.
- [ ] 4.3 Feature Wojtek and verify "SOCHACZYŃSKI" renders without clipping or horizontal overflow at 390, 768, 1280, 1920, and >1700px. Adjust the display-slot CSS only if it clips.
- [ ] 4.4 Step between the longest- and shortest-bio members and confirm the slider text column does not jump mid-crossfade (bio length band holds with the two new bios).
- [ ] 4.5 Show the final rendered surfaces to the user for sign-off before any commit.
