## Why

The hero pairs a scroll-scrubbed llama (transparent frame sequence, head-turn) with a word rotator cycling the offer — STRATEGY → CONTENT → SPRZEDAŻ → KREACJE → WIDEO. Today those two are unrelated: the frames are scroll-driven, but the rotator cycles on a **timer**, so the word the visitor reads has nothing to do with what the llama is doing. The idea (from the client) is to make the mascot *embody each service*: dress the llama for each word, and advance the word and the outfit **together as the visitor scrolls** — so scrolling literally walks through the services, with the llama re-styled for each.

## What Changes

- The word rotator becomes **scroll-driven** — its active index derives from the same hero scrub progress the frames already use (`wordIndex = floor(scrubProgress × 5)`), replacing the time-based `useRotator` for the hero.
- A new hero frame sequence in which the llama wears **five service-themed outfits**, one per word, each occupying an exact equal block of the 60-frame runway (frames 0–12 STRATEGY … 48–60 WIDEO), with the approved neck-turn + subtle approving-nod motion running continuously across all blocks.
- **Word ↔ outfit ↔ scroll locked in lockstep:** as scrub progress crosses each 1/5 boundary, the active word and the visible outfit advance together.
- Reduced-motion / mobile (no scrub runway): the hero rests on **word 0 + outfit 0** statically (the poster is frame 0), with no timed cycling.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `hero-scroll-scrub`: adds a scroll-synced service-wardrobe requirement — the rotator word and the llama's outfit both derive from scrub progress and advance in lockstep across five equal blocks; the reduced-motion fallback rests on the first word/outfit.

## Impact

- **Code**: `app/(frontend)/(home)/sections/hero/index.tsx` (rotator → scroll-derived index via the existing scrub context), `track.tsx` / `frame-sequence.tsx` (expose `scrubTarget` to the headline; keep the frame-draw loop), and retiring `useRotator` for the hero (the hook stays for any other consumer). `lib/content/home.ts` `hero.headline.rotator` stays the source of the five words (optionally annotated with the outfit theme per word).
- **Assets**: a regenerated `public/clips/hero-frames/001–060.webp` set (five themed-outfit blocks) + `hero.mp4` / posters, produced by the slice pipeline in `design.md`.
- **Build gating**: the code change is small; the **build is gated on the five themed clips being generated and approved** (Higgsfield, iterated separately). Frame-perfect word↔outfit alignment depends on the deterministic slice method, not a single generation.
- **Scope**: hero + `home.ts` rotator only. Independent of case-studies (different `home.ts` region) and o-nas.
