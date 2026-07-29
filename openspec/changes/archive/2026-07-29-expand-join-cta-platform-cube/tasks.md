## 1. Assets

- [x] 1.1 Split the supplied mascot PNG into its two alpha components; export the llama layer (693×979) to `public/assets/join-cta-llama.webp` as a transparent WebP. The source cube is discarded — the repo cube set replaces it.
- [x] 1.2 Verify the cutout: no semi-transparent halo against `#913155` (the red channel of edge pixels should track the plum reference; a desaturated band means studio residue), and no stray alpha components beyond the llama itself. **Note:** the red-channel heuristic gives a false positive here — the mascot's fur is cream, so edge pixels are legitimately high-green and R−G collapses from 96 to 41 with no matte residue present. Compositing over an unrelated ground (pure green) is the test that cannot be fooled, and it comes back clean: individual fur strands survive, no plum ring.
- [x] 1.3 Confirm `public/assets/cube-*.png` covers all seven platforms and needs no re-export. No new artwork in this change.
- ~~1.4 Move the rejected seven-look exploration into `assets-src/join-cta-looks/`.~~ **Dropped 2026-07-29** — `anchor2.py`, `defringe2.py`, the muzzle template and the anchored cutouts no longer exist on disk (searched the filesystem, all sibling worktrees and both prior scratchpads); only the mocks and the split llama survived. The findings are recorded in `design.md` instead, and its pointer to `assets-src/join-cta-looks/` was corrected.

## 2. Content

- [x] 2.1 `lib/content/home.ts` — cut `joinCta.rotator` to the seven platform tokens; give each entry a `cube` path (selecting the cube) and a `services` list. Remove `W STRATEGII?` and `W WIDEO?`. **Order:** the rotator keeps its established reading order, which is *not* `PlatformKey` declaration order (that file declares X before LinkedIn and Pinterest). The spec asserted both and has been corrected to require the seven *values*, not the sequence.
- [x] 2.2 Write the services lists, distilled from the platform descriptions in `lib/content/uslugi.ts`. LinkedIn and YouTube carry three items (no ads — not offered); X carries no ads item. **Changed from the mock:** Instagram's "sesje i kreacje" was dropped — nothing in `lib/content/` supports a photo-shoot claim — and replaced with "spójny wizerunek", which is literally in that platform's description.
- [x] 2.3 Add the comment-thread pairs and the `⋯` menu strings to `joinCta.post`.
- [x] 2.4 Mirror everything in `lib/content/home.en.ts` — the `LocalizedHome` parity gate will fail the build otherwise. The save toast is the line that does not translate literally and carries its own English joke. (The `Tam lama zakłada marynarkę` quip named in the original task does not exist in this section's copy.)
- [x] 2.5 Drop `joinCta.clip` and `joinCta.poster`; point `joinCta` at the new mascot asset. The clip files stay on disk, unreferenced.

## 3. Media column

- [x] 3.1 Rewrite the media column in `app/(frontend)/(home)/sections/join-cta/index.tsx` as two layers: the mascot, and a cube slot positioned in percentages of the mascot's bounding box.
- [x] 3.2 Render all seven cubes with only the active one visible, selected by the rotator index. Cubes are decorative — hidden from assistive technology.
- [x] 3.3 Animate the swap as a pop (scale + slight rotation, spring easing), suppressed under reduced motion.
- [x] 3.4 Serve the mascot `unoptimized`.
- [x] 3.5 Verify at 360 px and at maximum card width that the cube stays on the paw and is not clipped by the top of the well. **Two fixes were needed.** `width: auto` on a replaced element resolves to its intrinsic size clamped by the global `img { max-width: 100% }`, not to the inset box — the cube rendered at slot size while positioned as if it were oversized, jammed into the corner; width/height/`max-width: none` are now explicit. And at the mock's `top: 2%` every cube crossed the top edge (the mock included), so the stage sits at `4%` and the overscale is 165%. Stage height is `100%` (user call 2026-07-29 — more air in the post; see design D11 for why the cube necessarily shrinks with it). Measured at 360/390/800/1440 px: all seven clear the well identically (top 1.75%, left ≥ 13.33%, right ≤ 31.03%), confirming the geometry really is width-invariant.

## 4. Services copy placement

- [x] 4.1 **Resolved 2026-07-29: option C**, the chip list under the heading. B was chosen under the carousel premise, which no longer holds. The mock's toggle does not ship.
- [x] 4.2 Implement the chosen placement, with all seven lists in the DOM and only the active one visible.

## 5. Card interactions

- [x] 5.1 Convert the four decorative icons into `button` elements with labels, focus rings, keyboard activation, and `aria-pressed` where they toggle.
- [x] 5.2 Like: partial initial fill, four activations to full, then increment likes, swap the meta note, and reveal the `/kontakt` link. Likes line under a polite live region.
- [x] 5.3 Double-tap / double-click on the image: bloom and complete the like. Must not be the only route to that state.
- [x] 5.4 Share: real `navigator.share` with clipboard fallback. No joke on this one.
- [x] 5.5 Save: toggle filled state, raise a toast carrying the contact CTA. **The toast is anchored to the foot of the well, not of the card** — anchored to the card it lands straight on the caption and the thread. Verified: toast bottom 663px, caption top 752px.
- [x] 5.6 Comment thread: append Q&A pairs, typed out; button retires when exhausted and hands over to a real conversation. Retirement uses `aria-disabled` rather than `disabled`, so a keyboard user does not lose focus when the last pair lands.
- [x] 5.7 `⋯` sheet: dialog role, `Escape` to close, focus moves in on open and returns to the trigger on close. **Two holes found and closed:** picking an option unmounts the button holding focus, stranding it on `<body>` where the container's key handler cannot see it (focus is now re-entered on the view swap); and Escape is bound to the document, because clicking the scrim drops focus to `<body>` too.
- [x] 5.8 Reduced-motion variants for burst, bloom, plane flight, sheet slide, cube pop and typewriter — each collapsing to its end state. **The global neutralizer does not cover these:** it selects `*`, so every class-declared animation here outranks it. The module carries its own `@media (--reduced-motion)` block, as the header, footer and testimonial modules already do.

## 6. Styling

- [x] 6.1 Well gradient — brand plum with radial falloff toward the corners, replacing the flat fill.
- [x] 6.2 Stage/slot geometry, control states, thread, sheet and toast in `join-cta.module.css`.
- [x] 6.3 Watch selector specificity: section-level type selectors must not reach into the card. The one type selector added (`.servicesLead`) is scoped as a direct child for exactly this reason.

## 7. Verification

- [x] 7.1 Screenshot at 390 px and 1440 px; confirm no horizontal overflow and no layout shift as the cube swaps. Also checked at 360 px and 800 px. `scrollWidth === innerWidth` at every one; the seven services lists stack in a single grid cell so the block's height is the tallest list's and nothing reflows as the word turns.
- [x] 7.2 Keyboard pass: tab through every control, confirm focus is always visible, and the sheet traps and returns focus. All five card controls plus the profile link are reachable in order; `outline-width: 2px` on focus; Escape returns focus to the `⋯` trigger.
- [x] 7.3 Screen-reader pass: heading announces a stable name, likes changes are announced once, all seven services lists are present, cubes are silent. Confirmed against the aria snapshot — heading name stays `POTRZEBUJESZ WSPARCIA NA FACEBOOKU?` across rotation, all seven lists exposed and labelled by platform, exactly one live region, and exactly one named image (the mascot).
- [x] 7.4 Reduced-motion pass with the OS setting on: heading and cube rest on the first platform, no burst/bloom/flight/pop. Verified after 6s (more than two intervals); the typewriter lands complete rather than being withheld.
- [x] 7.5 Confirm the EN route renders the mirrored copy and the parity gate passes. `/en` returns 200 with `NEED A HAND`, `WHAT WE DO`, seven translated lists, `/en/contact` CTAs and no PL leakage.
- [x] 7.6 `bun run check`.
