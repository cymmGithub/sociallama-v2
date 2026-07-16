# Design: join-cta-rotator

## Context

`app/(home)/sections/join-cta/` is a static server component: heading (`headingLead` + emphasized `FACEBOOKU?`), a pill button, and a 360px-square looping `<Video>` (`cta-llama.mp4`) composited onto the plum-deep `#722341` chapter. The hero already ships the interaction language this change borrows: a `setInterval`-driven `{index, prev}` state, words stacked in one `inline-grid` cell, masked 650ms `expo.out` vertical slide, frozen under reduced motion (`app/(home)/sections/hero/index.tsx`, `hero.module.css .rotator*`).

Polish locative case is the constraint that shapes the content model: platform names decline (`FACEBOOKU`, `INSTAGRAMIE`, `PINTEREŚCIE`) and the preposition flips between `W` and `NA` per word, so the rotating token must be the full `<preposition> <locative>?` phrase, not a bare name.

## Goals / Non-Goals

**Goals:**

- Heading rotates through the nine offer entries with the hero's masked-slide feel.
- Right-side media is a per-word still image, crossfading in lockstep with the word.
- All nine images follow the seamless-composite convention against `#722341`, gated mechanically.
- `cta-llama.mp4` / `cta-llama-poster.jpg` deleted.

**Non-Goals:**

- No changes to the hero rotator or any other section.
- No shared rotator abstraction extracted (two call sites, different layouts — duplicate the ~15-line pattern; revisit at a third use).
- No mobile-specific media variant; the same square stack renders on both breakpoints.
- No video/motion asset — stills only.

## Decisions

### D1 — Rotating token = preposition + locative + question mark

`joinCta.rotator` is a flat list of nine display strings: `W FACEBOOKU?`, `NA INSTAGRAMIE?`, `NA TIKTOKU?`, `NA LINKEDINIE?`, `NA PINTEREŚCIE?`, `NA X?`, `NA YOUTUBIE?`, `W STRATEGII?`, `W WIDEO?`. The static lead becomes `POTRZEBUJESZ WSPARCIA`. Rationale: locative case makes per-word prepositions unavoidable, and keeping the `?` inside the token means it never detaches from the sliding word. Alternative considered — fixed `W` with bare names — rejected as ungrammatical for most entries (`w Instagramie`, `w X`).

Each rotator entry pairs with an image in the same array element (`{ token, image, theme }` objects) so word↔image sync is index-based by construction and content stays typed in `lib/content/home.ts`.

### D2 — Whole section becomes a client component

`JoinCta` gets `'use client'` and owns one `setInterval` → `{index, prev}` state (hero's exact pattern, same `ROTATOR_INTERVAL = 2600`). Alternative — a client island inside a server shell — rejected: the section has no server-only work, and splitting a ~40-line component into two files buys nothing. Same-interval keeps the page's rotation rhythm uniform; a 9-entry cycle runs 23.4s, which is fine for a below-fold section.

### D3 — Crossfade via stacked grid cell

All nine `<Image>`s render stacked in one grid cell (`grid-area: 1 / 1`), each `opacity: 0` except the active one, transitioning opacity over 650ms with the existing ease token. Everything stays mounted so each image is decoded before its first swap; below the fold, default lazy loading is acceptable (no `preload`). The heading's slide and the image's fade share the one state object — coupled by construction, not by coincidence of two timers.

### D4 — Asset pipeline: generate on-plum, flatten background, gate

Nine Higgsfield generations, `hero-poster.jpg` as the character/style reference (same llama, sunglasses, beige shirt, same framing family), 1:1 aspect, each prompt varying only the platform/offer-themed accent (prop or color cue). Prompts request a flat `#722341` studio background.

Post-processing order of preference:

1. **Flatten/grade**: nudge the near-plum background to exactly `#722341` (the approach used for the existing clips). Preserves the llama's fuzzy fur edge.
2. **Fallback — cutout + composite**: `remove_background` → composite onto `#722341` via sharp/ImageMagick. Only if a generation's background drifts too far to grade cleanly; fur-edge halos make this the second choice, not the first.

Every final image passes `bun lib/scripts/verify-clip-bg.ts <img> '#722341'` (ffmpeg corner sampling works on stills). Budget 2–3 candidates per slot for curation; abstract slots (`W STRATEGII?` → whiteboard/chess prop, `W WIDEO?` → camera/clapper) need the tightest art direction to keep the set reading as one system.

Files land as `public/clips/cta-<slug>.jpg` (e.g. `cta-facebook.jpg`), ~1080×1080 source; the optimizer serves scaled WebP (AVIF stays globally disabled).

### D5 — Accessibility and static states

Heading keeps a stable `aria-label` (`POTRZEBUJESZ WSPARCIA W FACEBOOKU?` — the first entry) with rotating spans `aria-hidden`, mirroring the hero. The image stack is one labelled figure: container `role="img"` + `aria-label` (llama mascot description); individual images get empty `alt`. SSR renders word 1 + image 1; reduced motion never starts the interval, leaving that static state — same policy as the hero, no poster/video split needed since the fallback *is* the first image.

## Risks / Trade-offs

- **Character drift across 9 generations** → single reference image, one shared base prompt with a single varying clause, curate from 2–3 candidates per slot; reject any image where the llama reads as a different character.
- **Background not gradeable to exact hex** (vignette, gradient) → fallback cutout pipeline (D4.2); the gate script is the arbiter either way — never adjust the token to match an asset.
- **Next image optimizer color corruption at specific widths** (known repo issue) → after wiring, pixel-sample the served variants at the section's rendered widths (~360 CSS px, 1x/2x) against `#722341`; if a width corrupts, constrain `sizes`/quality as done previously.
- **Widest token reserves heading width** (`NA PINTEREŚCIE?` sizes the inline-grid) → accepted; heading is `clamp`-sized and the section has room. Check the mobile wrap visually.
- **23.4s full cycle means most visitors never see the last entries** → accepted; the rotation is texture, not information architecture — every entry also lives in nav/services.
- **9 stacked images vs 1 video** → total transfer is comparable to the deleted mp4 and stills decode cheaply; all-mounted stack trades a little memory for glitch-free swaps.

## Open Questions

- Exact per-slot art direction (which prop/accent per platform) is left to curation during asset generation — the spec constrains consistency and compositing, not each image's content.
