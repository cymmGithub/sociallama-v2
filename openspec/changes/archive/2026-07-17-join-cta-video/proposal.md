# Proposal: join-cta-video

## Why

The nine-still crossfade in the join-cta section says "we support every channel" sequentially; the multi-arm llama clip from lama-showcase (`work.mp4` — one llama holding laptop, phone, brush, clapperboard, mug, and parcel) says it in a single continuous shot, with motion, and pairs naturally with the rotating locative heading: every question the heading asks, the llama is already visibly answering. User decision 2026-07-17: bring the clip in, keep the heading rotator, drop the image stack.

## What Changes

- **BREAKING (spec)**: Reverses the "Static fallback replaces the CTA clip" and "Word-synchronized image stack" requirements of `join-cta-rotator` (archived earlier today). The section ships a video again.
- The join-cta media column renders one looping, muted, autoplaying square video clip (via `components/ui/video`) instead of the nine-image crossfade stack.
- The rotating locative heading stays exactly as specified and runs independently — no word↔media synchronization remains.
- The source clip is prepared before wiring: square crop around the llama, color grade toward plum-deep `#722341` with an edge-feathered blend to exact flat `#722341` at the frame boundary (so the corner-sampling gate passes), ping-pong concatenation to hide the loop seam (first/last frame SSIM ≈ 0.86), re-encode to sibling-clip weight (~2–3 MB), plus a poster JPG. If grading cannot pass the gate, fallback is regenerating the clip on a flat `#722341` background.
- Reduced motion / no-JS renders the poster frame instead of playing video.
- The clip ships inside fake sponsored-post chrome (white card: avatar linking to the real Instagram profile, handle, actions row, caption) — user pick 2026-07-17 from three framed mocks, reversing design D1's "no visible card" rejection.
- The nine `public/clips/cta-*.jpg` stills and their `rotator[].image` content fields are deleted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `join-cta-rotator`: the word-synchronized image stack and no-video requirements are removed; new requirements cover the prepared looping clip (seamless-composite gate on the video, ping-pong loop, weight budget, poster, reduced-motion/poster fallback). The rotating-heading requirement is unchanged.

## Impact

- `app/(home)/sections/join-cta/index.tsx` + `join-cta.module.css` — media column becomes a `<Video>`; rotation state no longer drives media.
- `lib/content/home.ts` — `joinCta.rotator[].image` fields removed; `joinCta.clip`/`joinCta.poster` (re)introduced.
- `public/clips/` — adds `cta-llama-work.mp4` + poster; deletes nine `cta-*.jpg` files.
- Source asset read from `/mnt/work/goodone/lama-showcase/public/clips/work.mp4` (1920×1080, 8 s, 9.5 MB — never shipped as-is).
- Gate: `bun lib/scripts/verify-clip-bg.ts <clip> '#722341'` must pass on the final encode; known Next image-optimizer width-specific corruption applies to the poster (verify served variants).
