# Design: join-cta-video

## Context

The join-cta section (plum-deep chapter, `#722341`) currently renders a rotating locative heading plus a word-synced stack of nine stills (`join-cta-rotator` spec, archived 2026-07-17). The user wants the media column to instead show the multi-arm llama clip from lama-showcase: `/mnt/work/goodone/lama-showcase/public/clips/work.mp4` (1920×1080, 24 fps, 8.04 s, 9.5 MB H.264).

Measured facts about the source clip:
- Background is **not** flat `#722341`: corner samples `#752547` / `#8b2e54` / `#6d2141` / `#802b4f` (ΔE up to 9.06, `verify-clip-bg.ts` fails). It was graded for the lama-showcase hero (`#892f53` family) with a lighting gradient.
- First/last frame SSIM ≈ 0.86 (llama lowers→raises the mug), so a naive `loop` shows a visible jump every 8 s.
- Llama + props sit in the right ~60% of frame; a 1080×1080 crop window at x≈670–1750 contains all six props with margin.
- Sibling clips in `public/clips/` weigh 2.3–3.5 MB; 9.5 MB is out of family.

Existing infrastructure to reuse:
- `components/ui/video` — muted/inline/looping, poster paints first (`preload="none"`), plays only in viewport, reduced motion renders the poster via `@/components/ui/image` and never mounts `<video>`. SSR and first client render both emit the poster (no hydration mismatch).
- `lib/scripts/verify-clip-bg.ts` — corner-sampling gate (±3/channel or ΔE < 3 against a target hex).

## Goals / Non-Goals

**Goals:**
- Media column = one prepared, seamless-compositing, seamlessly-looping square clip of the multi-arm llama.
- Heading rotator behavior unchanged (word list, timing, mask animation, accessible name).
- Final clip passes `verify-clip-bg.ts` against `#722341` and lands in the 2–3 MB family range.
- Reduced motion / pre-hydration shows the poster still; no layout shift when the video mounts.
- Nine `cta-*.jpg` stills and their content fields removed.

**Non-Goals:**
- No word↔media synchronization of any kind (the clip loops on its own clock).
- No changes to the heading rotator, its content, or its CSS.
- No changes to the plum-deep theme token (convention: fix the asset, never the token).
- No mobile-specific variant clip (one square clip serves both breakpoints; hero needed a mobile cut, this square framing does not).

## Decisions

### D1: Grade + edge-feather in ffmpeg, regeneration only as fallback

Conform the existing footage rather than generating new footage:

1. **Crop** 1080×1080 at x≈670 (tune by eye so all props keep margin; final window x=627, chosen so the llama's foreground mass median lands on the frame center — user feedback 2026-07-17 that the llama sat ~43px left).
2. **Grade**: global color shift mapping the measured mean background (~`#7d284b`) to `#722341` (e.g. `colorbalance`/`colorchannelmixer`/`curves` — small shift, ΔE ≈ 4–5, the tan llama tolerates it).
3. **Edge-feather composite**: overlay the graded video onto a flat `#722341` color source through a feathered alpha mask (opaque center, transparent over the outer ~48–64 px band; static mask image + `alphamerge`). Corners become *exactly* `#722341`, so the gate passes deterministically; the residual interior gradient reads as lighting, not as a boundary.
4. **Ping-pong**: `split` → `reverse` → `concat` = 16 s seamless cycle. Reversed coffee-sip at ambient-motion level is acceptable.
5. **Encode**: libx264, `yuv420p`, `+faststart`, CRF/bitrate tuned to ≤3 MB for 16 s at 1080×1080 (~1.5 Mbps). Poster JPG exported from frame 0 of the *final* processed clip so poster and first frame are pixel-identical.

Alternatives rejected:
- *Regenerate via higgsfield on flat `#722341`*: non-deterministic, loses the approved footage; kept as fallback if grading visibly degrades the llama or cannot pass the gate.
- *Chroma-key the magenta background*: fine fur edges + video keying = halo risk; strictly worse than feathering when the replacement color is within ΔE ≈ 5 of the original.
- *Visible card/frame around the video*: breaks the section family's floating-on-chapter language.

### D2: Reuse `components/ui/video` unchanged

`<Video src poster alt aspectRatio={1} />` in the media column. The primitive already implements every behavioral requirement (poster-first, in-view play, reduced-motion poster, no hydration mismatch). No new props, no bespoke `<video>` in the section.

### D3: Content shape in `lib/content/home.ts`

`joinCta.rotator` becomes token-only (`rotator: [...tokens]` — drop the `image` field per entry). Add `joinCta.clip` and `joinCta.poster` paths; keep `llamaAlt` as the video's accessible label. Asset names: `public/clips/cta-llama-work.mp4` / `cta-llama-work-poster.jpg` (deliberately *not* the retired `cta-llama.mp4` name, to keep git history and the archived spec's removal unambiguous).

### D4: Component simplification

`JoinCta` keeps `useState`/`setInterval` rotation for the heading only. The media column's `role="img"` stack, the nine `<Image>`s, and the `slide/slideActive` CSS are removed; `.media` keeps its square sizing and grid placement.

### D5: Sponsored-post chrome around the clip (added 2026-07-17, user pick)

The clip is wrapped in a white Instagram-style card: header (llama-logomark avatar + `social.lama` handle linking to https://www.instagram.com/social.lama/, "Sponsorowane" meta), the video as the post media, footer (lucide action icons, likes line, caption). Chosen from three live mocks (viewfinder / film strip / post card) — the post card is the most on-brand joke for a social agency and fully hides any residual clip-background discrepancy. This intentionally reverses the "no visible card/frame" rejection in D1's alternatives: the card reads as a foreign artifact (a post), not as a themed section frame, so it does not fight the floating-on-chapter language the way a plain frame would. Post strings live in `joinCta.post` (content file); icons are `lucide-react`; chrome icons and avatar are `aria-hidden`, the video keeps `llamaAlt`, and the profile link carries an explicit accessible label. The card sets `font-family: var(--font-mono)` explicitly because the global reset unsets fonts. Media column sized `min(38vw, 560px)` desktop / `min(82vw, 420px)` mobile (user-tuned).

## Risks / Trade-offs

- [Global grade tints the llama] → shift is small (Δmax ≈ 11/channel on background); check frames by eye after grading; fallback to a background-weighted mask grade or regeneration.
- [Feather band visible as a soft halo] → band blends toward the *same* color family (ΔE ≈ 4–5), sized 48–64 px at 1080 px; verify with full-section screenshot sampling at multiple breakpoints.
- [Reversed motion looks unnatural] → sip gesture is small and slow; if it reads wrong, trim to a sub-range with matching endpoints instead of ping-pong.
- [Poster served through Next image optimizer shifts color] → known width-specific optimizer corruption (see memory/AGENTS): pixel-sample the served poster variants at rendered widths against `#722341`, same as the stills required.
- [16 s ping-pong doubles frames → size] → 1080² at ~1.5 Mbps still lands ≤3 MB; drop to CRF-based two-pass if over.

## Migration Plan

Pure asset+component swap on one section; no data, no API. Rollback = revert commit (stills are in git history).

## Open Questions

None — user decisions captured: keep heading rotator (yes), grade+feather first with regeneration fallback (ok), delete the nine stills (delete).
