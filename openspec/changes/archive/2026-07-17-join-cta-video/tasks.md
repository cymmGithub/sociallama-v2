# Tasks: join-cta-video

## 1. Clip preparation (ffmpeg, in scratchpad until gated)

- [x] 1.1 Square-crop `work.mp4` to 1080×1080 (window x≈670–1750; verify by eye that all six props keep margin at start, middle, and end frames)
- [x] 1.2 Grade the crop's mean background (~`#7d284b`) toward `#722341`; extract sample frames and check the llama for visible tint drift
- [x] 1.3 Build the feathered alpha mask (opaque center, transparent outer ~48–64 px band) and composite the graded video onto flat `#722341`
- [x] 1.4 Ping-pong the clip (split → reverse → concat, 16 s) and watch the loop point for jumps or unnatural reversed motion; if the sip reversal reads wrong, trim to a matching-endpoint sub-range instead
- [x] 1.5 Encode final `cta-llama-work.mp4` (libx264, yuv420p, +faststart, ≤3 MB) and export `cta-llama-work-poster.jpg` from frame 0 of the final clip
- [x] 1.6 Gate: `bun lib/scripts/verify-clip-bg.ts <clip> '#722341'` and the same gate on the poster — both must pass; on failure re-grade, or fall back to regenerating the clip on flat `#722341` (design D1 fallback)
- [x] 1.7 Copy the two passing assets into `public/clips/`

## 2. Content and component

- [x] 2.1 `lib/content/home.ts`: drop `rotator[].image` (tokens only), add `joinCta.clip` / `joinCta.poster`, update the seamless-composite comment to reference the clip
- [x] 2.2 `app/(home)/sections/join-cta/index.tsx`: replace the image stack with `<Video src={joinCta.clip} poster={joinCta.poster} alt={joinCta.llamaAlt} aspectRatio={1} />`; rotation state keeps driving the heading only
- [x] 2.3 `join-cta.module.css`: remove `slide`/`slideActive` rules; keep `.media` square sizing and grid placement
- [x] 2.4 Delete the nine `public/clips/cta-*.jpg` stills; confirm no references remain (`grep -r "cta-facebook\|cta-instagram\|..."`)

## 3. Verification

- [x] 3.1 Typecheck + Biome pass (`bun run` CI commands per AGENTS.md)
- [x] 3.2 Dev-server screenshot sampling: full section at desktop and mobile widths — no visible clip boundary against the chapter, heading rotator still cycling, video playing
- [x] 3.3 Pixel-sample the optimizer-served poster variants at rendered widths against `#722341` (known width-specific optimizer corruption)
- [x] 3.4 Reduced-motion check (emulate `prefers-reduced-motion: reduce`): poster renders, no `<video>` element, no layout shift vs playing state
- [x] 3.5 Watch two full loop cycles in the browser for loop-point jumps and confirm pause/resume when scrolling the section out of and back into view

## 4. Sponsored-post chrome + sizing (user requests 2026-07-17, post-verification)

- [x] 4.1 Hero-scale media then trim to `min(38vw, 560px)` desktop / `min(82vw, 420px)` mobile; heading to `clamp(2.5rem, 6.5vw, 5.5rem)`, button to 1.05rem
- [x] 4.2 Sponsored-post card around the clip (picked from 3 live mocks): header avatar+handle → Instagram profile link, lucide actions row, likes + caption from `joinCta.post`
- [x] 4.3 Copy column `max-width: 48%` + `min-width: 0` (hero recipe) so long tokens overflow instead of pinning the card flush right; card centered via auto margins
- [x] 4.4 Re-verify: typecheck + Biome, no horizontal overflow at 390/1100/1440, Manrope in card, link target/rel, handle `social.lama` everywhere
