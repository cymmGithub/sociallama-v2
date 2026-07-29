## 1. Assets

- [ ] 1.1 Split the supplied mascot PNG into its two alpha components; export the llama layer (693×979) to `public/assets/join-cta-llama.webp` as a transparent WebP. The source cube is discarded — the repo cube set replaces it.
- [ ] 1.2 Verify the cutout: no semi-transparent halo against `#913155` (the red channel of edge pixels should track the plum reference; a desaturated band means studio residue), and no stray alpha components beyond the llama itself.
- [ ] 1.3 Confirm `public/assets/cube-*.png` covers all seven platforms and needs no re-export. No new artwork in this change.
- [ ] 1.4 Move the rejected seven-look exploration into `assets-src/join-cta-looks/` — the anchored cutouts, `anchor2.py`, `defringe2.py`, the muzzle template, and a `README.md` recording the prompts, the model choice (`nano_banana_pro` framed as an image edit; `soul_2` silently rewrites prompts and must not be used) and the head-scale findings. Excluded from `public/`.

## 2. Content

- [ ] 2.1 `lib/content/home.ts` — cut `joinCta.rotator` to the seven platform tokens in `PlatformKey` order; give each entry a `platform` key (selecting the cube) and a `services` list. Remove `W STRATEGII?` and `W WIDEO?`.
- [ ] 2.2 Write the services lists, distilled from the platform descriptions in `lib/content/uslugi.ts`. LinkedIn and YouTube carry three items (no ads — not offered); X carries no ads item.
- [ ] 2.3 Add the comment-thread pairs and the `⋯` menu strings to `joinCta.post`.
- [ ] 2.4 Mirror everything in `lib/content/home.en.ts` — the `LocalizedHome` parity gate will fail the build otherwise. The `Tam lama zakłada marynarkę` quip does not translate literally and needs its own English joke.
- [ ] 2.5 Drop `joinCta.clip` and `joinCta.poster`; point `joinCta` at the new mascot asset. The clip files stay on disk, unreferenced.

## 3. Media column

- [ ] 3.1 Rewrite the media column in `app/(frontend)/(home)/sections/join-cta/index.tsx` as two layers: the mascot, and a cube slot positioned in percentages of the mascot's bounding box.
- [ ] 3.2 Render all seven cubes with only the active one visible, selected by the rotator index. Cubes are decorative — hidden from assistive technology.
- [ ] 3.3 Animate the swap as a pop (scale + slight rotation, spring easing), suppressed under reduced motion.
- [ ] 3.4 Serve the mascot `unoptimized`.
- [ ] 3.5 Verify at 360 px and at maximum card width that the cube stays on the paw and is not clipped by the top of the well. The framing is driven by the cube, not the head — an earlier crop anchored on the llama pushed the cube out of frame.

## 4. Services copy placement

- [ ] 4.1 **Resolve the open question first**: option B (second caption line) or option C (chip list under the heading). B was chosen under the carousel premise, which no longer holds; the mock ships both behind a toggle.
- [ ] 4.2 Implement the chosen placement, with all seven lists in the DOM and only the active one visible.

## 5. Card interactions

- [ ] 5.1 Convert the four decorative icons into `button` elements with labels, focus rings, keyboard activation, and `aria-pressed` where they toggle.
- [ ] 5.2 Like: partial initial fill, four activations to full, then increment likes, swap the meta note, and reveal the `/kontakt` link. Likes line under a polite live region.
- [ ] 5.3 Double-tap / double-click on the image: bloom and complete the like. Must not be the only route to that state.
- [ ] 5.4 Share: real `navigator.share` with clipboard fallback. No joke on this one.
- [ ] 5.5 Save: toggle filled state, raise a toast carrying the contact CTA. Check the toast does not obscure the caption at 360 px.
- [ ] 5.6 Comment thread: append Q&A pairs, typed out; button retires when exhausted and hands over to a real conversation.
- [ ] 5.7 `⋯` sheet: dialog role, `Escape` to close, focus moves in on open and returns to the trigger on close.
- [ ] 5.8 Reduced-motion variants for burst, bloom, plane flight, sheet slide, cube pop and typewriter — each collapsing to its end state.

## 6. Styling

- [ ] 6.1 Well gradient — brand plum with radial falloff toward the corners, replacing the flat fill.
- [ ] 6.2 Stage/slot geometry, control states, thread, sheet and toast in `join-cta.module.css`.
- [ ] 6.3 Watch selector specificity: section-level type selectors must not reach into the card. A `.context p` rule painted the card's own text white-on-white during exploration; scope prose rules to direct children.

## 7. Verification

- [ ] 7.1 Screenshot at 390 px and 1440 px; confirm no horizontal overflow and no layout shift as the cube swaps.
- [ ] 7.2 Keyboard pass: tab through every control, confirm focus is always visible, and the sheet traps and returns focus.
- [ ] 7.3 Screen-reader pass: heading announces a stable name, likes changes are announced once, all seven services lists are present, cubes are silent.
- [ ] 7.4 Reduced-motion pass with the OS setting on: heading and cube rest on the first platform, no burst/bloom/flight/pop.
- [ ] 7.5 Confirm the EN route renders the mirrored copy and the parity gate passes.
- [ ] 7.6 `bun run check`.
