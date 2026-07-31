All tasks below were completed and shipped in `bf9badf6` before this change was
written; the change documents that work so `how-it-works-proof` matches `main`.

## 1. Establish the size ceiling

- [x] 1.1 Reproduce the panel at real desktop geometry — the section's own CSS values, the real Exo 2 / Manrope woff2 files, and all five panels in one grid cell so the stage is as tall as its tallest step
- [x] 1.2 Measure the literal request (headline and sentence both at `clamp(1.15rem, 4vw, 3.7rem)`, uppercase) at 1440×816, 1440×900, 1536×864, 1366×768, 1280×800 and 800×700
- [x] 1.3 Sweep candidate shared sizes across the same viewports and identify the largest that clears all of them — `clamp(1.15rem, 2.6vw, 2.4rem)`
- [x] 1.4 Put the size and the case treatment (uppercase vs sentence case) to the user as rendered mocks rather than description, and record the decision

## 2. Content

- [x] 2.1 Make `Step.proof.title` optional in `lib/content/home.ts` and document why a step may omit it
- [x] 2.2 PL step 01 — merge the headline into the sentence, end on a colon, drop the inline figures the row already carries
- [x] 2.3 PL step 03 — merge the headline into the sentence, leading with the filter so the headline becomes its opening clause; fix the pronoun order and the missing `przez`
- [x] 2.4 EN step 01 — mirror the PL merge
- [x] 2.5 EN step 03 — mirror the PL merge
- [x] 2.6 Confirm both merged sentences stay inside the 25-word budget `how-it-works.test.ts` enforces (22 and 23 words)

## 3. Component

- [x] 3.1 Render the headline only when the step carries one
- [x] 3.2 Update the `Panel` doc comment to describe the headline as optional

## 4. Type

- [x] 4.1 Merge `.panelTitle` and `.panelSay` into one rule at `clamp(1.15rem, 2.6vw, 2.4rem)`, leaving weight, letter case and tint as the only distinctions
- [x] 4.2 Drop the sentence's `max-width: 60ch`, which no longer binds at display size
- [x] 4.3 Give `.panelSay:first-child` the mobile auto-margin the headline used to hold, so the headline-less steps stay centred rather than top-aligning
- [x] 4.4 Unify the two sizes in the base mobile tier and the tall-phone tier
- [x] 4.5 Record the measured overflow figures in the rule's comment, so the ceiling is visible to whoever changes the size next
- [x] 4.6 Correct the figure-row comment, which credited the now-removed 60ch cap for the empty width

## 5. Verify

- [x] 5.1 Re-render the shipped rule at 1440×816, 1440×900, 1920×1080, 1536×864, 1366×768, 1280×800, 1024×768 and 800×700 in both locales — all fit
- [x] 5.2 Measure the running application on mobile at 390×844, 417×906, 412×915 and 360×568 in both locales
- [x] 5.3 Fix the 19px overflow 5.2 found at 360×568 PL: step the `max-height: 620px` tier down to `0.9rem` and tighten the `.panelText` gap
- [x] 5.4 Re-measure 5.2 after the fix — all eight combinations fit
- [x] 5.5 Confirm headline and sentence report identical computed font sizes at every tier
- [x] 5.6 `bun run check` green — Biome, typecheck, 615 tests, manifest
