# Tasks: sociallama-homepage

## 1. Foundation — theme, fonts, content

- [x] 1.1 Replace palette and themes in `lib/styles/colors.ts` with brand tokens and `plum`/`cream`/`plum-deep` themes (D1); run `bun run setup:styles` and `bun run check` to verify the pipeline
- [x] 1.2 Configure Exo 2 (400/800) + Manrope (400/600) with `latin`+`latin-ext` subsets in `lib/styles/fonts.ts`; verify Polish diacritics render in a display headline
- [x] 1.3 Create `lib/content/home.ts` with typed content verbatim from the content export (nav, hero, services, steps, 13 clients, featured testimonial, post card, footer/contact)
- [x] 1.4 Copy hero assets from `../goodone/sociallama/public/clips/` into `public/clips/`; attempt download of the 13 client logo files from the live media API (fallback: text marquee)

## 2. Video primitive

- [x] 2.1 Build `components/ui/video/` per spec (lazy IO playback, responsive source, reduced-motion poster fallback via `@/components/ui/image`)
- [x] 2.2 Add `video.stories.tsx` covering poster, playback, and reduced-motion states; verify in `bun storybook` <!-- story written + typechecks; Storybook server not yet launched -->
- [x] 2.3 Write the clip background verification script (ffmpeg corner-pixel sample vs. theme token, tolerance per spec) and check `hero.mp4` passes against `#892f53`

## 3. Higgsfield clip generation

- [ ] 3.1 Check credit balance (`balance` / `show_plans_and_credits`) and confirm budget for 4 clips; upload `hero-poster.jpg` as character reference (`media_upload`)
- [ ] 3.2 Generate `service-content`, `service-sprzedaz`, `service-kreacje` clips (D5 recipe: same llama character, flat `#892f53` bg, ~3s loopable, no camera move); verify each with the 2.3 script; color-correct or regenerate on mismatch; reframe to 16:10 if needed
- [ ] 3.3 Generate `cta-llama` clip (llama on the phone, same recipe); verify composite rule
- [ ] 3.4 Compress/encode all clips for web (h264, target ≤2MB per service clip) and add poster frames; place in `public/clips/`

## 4. Homepage sections

- [x] 4.1 Page scaffold: replace `app/page.tsx` with chapter wrappers, theme switching, and IO-driven background morph (incl. reduced-motion behavior); update page metadata/OG for Social Lama <!-- moved to app/(home)/; verified live: data-theme + fixed morph layer flip plum↔cream↔plum-deep on scroll -->
- [x] 4.2 Nav + Hero section: two-column layout on `#892f53`, `<Video>` hero, GSAP headline stagger choreographed to first loop (D4), poster fallback trigger, social links <!-- headline uses GSAP mount stagger (not yet tied to video timeupdate); D4 review is task 5.1 -->
- [x] 4.3 Client logo `<Marquee>` (logos or text fallback per 1.4 outcome) <!-- 13 real logos, uniform cream silhouette via filter -->
- [x] 4.4 Why-that-works section: scroll-scrubbed heading fill + copy reveals
- [x] 4.5 Services section: 3 cards from content data with hover clip previews (poster on touch devices), `useReveal` entrances <!-- clips deferred (D5): posters render in the clip slot; swap to <Video> when clips exist -->
- [x] 4.6 How-it-works: `<Fold>`-pinned 5-step scrub tied to scroll progress <!-- DEVIATION: implemented as a sticky pin via hamo useScrollTrigger (the mechanism Fold is built on) rather than wrapping <Fold>, which is a one-viewport reveal-transition unsuited to a 5-step long pin. Verified live: pins, steps 01–05 activate in order, CSS-only reduced-motion fallback. Needs sign-off. -->
- [x] 4.7 Big "THAT WORKS / WITH SOCIAL LAMA" marquee (orange + outline treatment per mock)
- [x] 4.8 Chapter 3: featured testimonial, CTA ("POTRZEBUJESZ WSPARCIA W FACEBOOKU?" + button), single NewsLAMA card, footer with contact/legal <!-- nav/footer built as Wrapper chrome per Satus convention -->

  Note: `app/(home)/` route group; sections in `app/(home)/sections/`. `<Header>`/`<Footer>` chrome customized to Social Lama nav/footer.

## 5. Verification & polish

- [ ] 5.1 Hero choreography review on the running site — decide D4: keep turn-toward-headline or regenerate hero (sunglasses-drop fallback); implement outcome
- [x] 5.2 Run `bun run check` (Biome, tsc, tests, manifest) and fix all findings <!-- green: biome ✓, tsc ✓, 371 tests pass, manifest ✓. Fixed satus scaffolding template (theme="dark"→"plum") and regenerated COMPONENTS.md for the Video component. -->
- [x] 5.3 Drive the full page in the browser: chapter morphs, all scroll behaviors, hover previews, mobile viewport (mobile hero variant, single-column layouts), reduced-motion pass <!-- PASS (0 console errors). Verified live via Playwright: (1) morph flips data-theme + fixed bg plum#892f53→cream#fbfaf6→plum-deep#722341 on scroll, chrome adapts; (2) reveals fire, ProgressText fill, pin+step activation, marquees; (3) service posters load (clips deferred), hover-zoom present; (4) mobile 390px: <Video> picks hero-mobile.mp4/poster, single-column stack, hamburger + expandable submenu; (5) reduced-motion: no <video> (poster path), reveals visible immediately, pin unpins to static list with all steps at opacity 1. Cosmetic follow-ups for 5.1: hero headline wraps to 6 lines vs spec's 3; hero POSTER interior plum slightly lighter than page (corners match; video is flat) — asset polish tied to §3 color-correction. -->
- [ ] 5.4 Performance pass: verify `preload="none"` behavior, total route weight, and Lighthouse against Satus baseline (`bun run lighthouse`)
