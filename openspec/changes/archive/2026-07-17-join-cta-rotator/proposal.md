# Proposal: join-cta-rotator

## Why

The "POTRZEBUJESZ WSPARCIA W FACEBOOKU?" CTA section names a single platform while the agency serves nine offer areas, and its right-side looping video reads as filler rather than reinforcing the message. Rotating the heading through the full offer (mirroring the hero's rotator language) with a synchronized platform-themed image per word turns the section into an active pitch of the whole service range.

## What Changes

- The join-cta heading becomes a rotator: the static lead shortens to "POTRZEBUJESZ WSPARCIA" and a rotating token cycles through nine preposition + locative-case entries — `W FACEBOOKU?` → `NA INSTAGRAMIE?` → `NA TIKTOKU?` → `NA LINKEDINIE?` → `NA PINTEREŚCIE?` → `NA X?` → `NA YOUTUBIE?` → `W STRATEGII?` → `W WIDEO?`. The preposition and the question mark travel with the rotating word (Polish locative case forces per-word prepositions). Transition is the hero's masked vertical slide.
- The right-side media swaps from the looping `cta-llama.mp4` clip to a stack of nine still images — one per rotator entry — crossfading in sync with the heading word, driven by the same interval state.
- Nine images are generated with Higgsfield using `hero-poster.jpg` as the character/style reference (same llama, same framing family, one platform/offer-themed accent per image), then background-removed and programmatically composited onto exactly `#722341` (plum-deep) so they follow the seamless-composite convention. Each composite is gated with `lib/scripts/verify-clip-bg.ts` corner sampling before use.
- **BREAKING (asset)**: `public/clips/cta-llama.mp4` and `public/clips/cta-llama-poster.jpg` are deleted; the first rotator image serves as the static state for SSR and reduced motion.
- `JoinCta` gains a client-side rotation clock (it is currently a server component); reduced motion freezes word 1 / image 1, matching the hero's behavior.

## Capabilities

### New Capabilities

- `join-cta-rotator`: The join-cta section's rotating heading (preposition + locative token set), the synchronized crossfading image stack, the nine-image asset pipeline (generation reference, composite target `#722341`, corner-sample gate), and reduced-motion/SSR fallback behavior.

### Modified Capabilities

<!-- none — the homepage spec does not define the join-cta section's media or heading at requirement level; its "content from typed data" requirement continues to hold with the updated `joinCta` content shape. `video-playback`'s seamless-composite convention is reused, not changed. -->

## Impact

- `app/(home)/sections/join-cta/index.tsx` + `join-cta.module.css` — rotator markup, image stack, client rotation state (or a client island within the section).
- `lib/content/home.ts` — `joinCta` reshaped: `headingLead`, rotator token list, image list; `clip`/`poster` fields removed.
- `public/clips/cta-llama.mp4`, `public/clips/cta-llama-poster.jpg` — deleted.
- `public/` — nine new composited WebP/JPG stills (square, sized for the section's 360px desktop box at 2x).
- Higgsfield MCP (generation, `remove_background`), local compositing (sharp/ImageMagick), `verify-clip-bg.ts` reused as the image background gate.
- Known risk carried from repo history: the Next image optimizer's width-specific color corruption (AVIF already disabled globally) — served variants of the new composites must be pixel-sampled before sign-off.
