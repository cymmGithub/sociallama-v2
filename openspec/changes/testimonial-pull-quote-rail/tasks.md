# Tasks: testimonial-pull-quote-rail

## 1. Content model

- [x] 1.1 Extend the `Testimonial` interface in `lib/content/home.ts` with `pull: { before?: string; highlight: string; after?: string }` and add the three approved pull-phrases from design.md → verify: `bun tsc` passes, no other `Testimonial` consumer breaks
- [x] 1.2 Add a `TODO(sign-off)` comment on the Uniphar pull-phrase (rephrased excerpt, launch blocker per design.md) → verify: comment present, matches the existing lorem-placeholder TODO convention in the file

## 2. Layout

- [x] 2.1 Rebuild `app/(home)/sections/testimonial/index.tsx` structure: eyebrow, stacked-grid quote stage (pull-phrase with `<mark>`, full quote, byline), client rail as `role="tablist"` buttons with avatar/logo/name — keep `useReveal`, `data-blur-edge-gate`, and content from `lib/content/home.ts` → verify: section renders all three rail rows and slide 0 on `localhost:3000` — see Deviations D1, D3
- [x] 2.2 Rewrite `testimonial.module.css`: asymmetric grid (quote 1.55fr / rail minmax(280px, 1fr)), pull-phrase display type with orange mark treatment, reading-size quote, active/dim rail states with orange edge bar and avatar ring → verify: 1440 px screenshot matches Makieta 1 — see Deviations D2, D4
- [x] 2.3 Mobile ≤ 820 px: rail becomes a horizontal 3-chip row (avatar + name, orange top bar on active, logos hidden) above the quote stage → verify: 390 px screenshot, no horizontal page overflow

## 3. Interaction

- [x] 3.1 Directional slide transition: enter-from-right base transform, `data-leaving` exit-to-left override, `data-active` declared last in the cascade; stacked grid keeps section height stable → verify: switching between shortest and longest quote moves nothing below the section
- [x] 3.2 Autoplay engine per design.md: 7 s `setTimeout` chain, CSS `scaleX` progress animation on the active rail row, hover pause/resume via `data-paused` + remaining-time bookkeeping, manual rail click restarts the rhythm → verify: idle 21 s cycles 0→1→2 with progress bars; hover mid-cycle holds slide and bar, resumes on leave
- [x] 3.3 Touch behavior: keep the existing swipe handler; on `(hover: none)` devices any manual selection (rail tap or swipe) stops autoplay permanently → verify: in touch emulation, tap a rail chip, wait > 7 s, slide does not advance
- [x] 3.4 `prefers-reduced-motion`: skip autoplay scheduling in JS and disable progress/slide animations in CSS → verify: with reduced motion emulated, no auto-advance after 10 s and slides switch instantly

## 4. Verification

- [x] 4.1 Accessibility pass: rail buttons keyboard-operable with visible focus, `aria-selected` correct, inactive slides `aria-hidden`/`visibility: hidden`, heading present → verify: tab through rail, activate with Enter, screen-reader tree lists one visible quote
- [x] 4.2 Full-page check on `localhost:3000`: chapter-3 theme transition into the section, reveal-on-scroll entrance, blur-edge suppressed while section on screen, no console errors → verify: scroll the whole homepage at 1440 px and 390 px
- [x] 4.3 Run repo checks (Biome + TypeScript per AGENTS.md) → verify: CI-equivalent commands pass

## Deviations from the mock/spec (user-directed during apply, 2026-07-15)

These refinements were requested by the user while reviewing the live section and diverge from `specs/testimonial-rail/spec.md`; the spec should be updated (or these accepted) before archive:

- **D1 — Byline removed.** The author/company byline under the quote was dropped as redundant with the always-visible rail. Spec "Two-tier quote hierarchy" currently says the quote is "followed by a byline (author name + company)".
- **D2 — Highlight underline band removed.** The `<mark>` is now plain orange text, no translucent underline band ("doesn't fit the page"). Spec says "orange text with a translucent orange underline band".
- **D3 — Section heading is `sr-only`.** The visible "Opinie klientów" eyebrow was removed; the `<h2>` is retained sr-only for accessibility. Spec's "Section chrome preserved" already allows "an sr-only or eyebrow heading", so this is within spec.
- **D4 — Larger quote stage.** Grid widened to `minmax(0, 2.4fr) minmax(250px, 0.72fr)` (from 1.55fr / 280px) and pull/quote type enlarged, per "make the left section bigger".

Also fixed during verification: picking a rail row while hovering (paused) no longer starts a live autoplay timer — it holds until the pointer leaves, honoring the hover-pause contract.
