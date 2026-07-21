## Why

The hero pairs a scroll-scrubbed llama (transparent frame sequence, head-turn) with a word rotator cycling the offer. Today those two are unrelated: the frames are scroll-driven, but the rotator cycles on a **timer**, so the word the visitor reads has nothing to do with what the llama is doing. The idea (from the client) is to make the mascot *embody each service*: dress the llama for each word, and advance the word and the outfit **together as the visitor scrolls** — so scrolling literally walks through the services, with the llama re-styled for each.

## What Changes

- The word rotator becomes **scroll-driven** — its active index derives from the same hero scrub progress the frames already use, replacing the time-based `useRotator` for the hero.
- A new hero frame sequence from a **single approved take** ("take 14"): the llama's outfit and sunglasses morph together through five word-themed looks while the head turns front → left at a steady pace, ending in profile with a subtle admiring settle. The looks were purpose-built to the words: bold color-blocked streetwear + rainbow wayfarers (KREACJE), all-black film-crew look + slim black rectangles (WIDEO), smart-casual cream overshirt + amber tortoiseshell (CONTENT), charcoal blazer + dark aviator-style shades (SPRZEDAŻ), sharp navy suit + thin silver frames (STRATEGY).
- `hero.headline.rotator` in `home.ts` becomes KREACJE → WIDEO → CONTENT → SPRZEDAŻ → STRATEGY to match the take's outfit order (informal → formal, so the morphs stay subtle).
- **Word boundaries follow the clip's real outfit cuts** (between frames 15/16, 29/30, 42/43, 48/49 of the 60-frame sequence), not an equal 1/5 grid; the fifth word holds through the profile + admiring settle.
- Reduced-motion / mobile (no scrub runway): the hero rests on **word 0 + frame 0** statically, with no timed cycling.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `hero-scroll-scrub`: adds a scroll-synced service-wardrobe requirement — the rotator word derives from scrub progress and flips at the clip's outfit-transition boundaries; the reduced-motion fallback rests on the first word/outfit.

## Impact

- **Code**: `app/(frontend)/(home)/sections/hero/index.tsx` (rotator → scroll-derived index via the existing scrub context; `useRotator` retired for the hero), `lib/content/home.ts` (rotator word order).
- **Assets**: regenerated `public/clips/hero-frames/001–060.webp` (from the approved take, 2K-upscaled then matted with bria-rmbg / RMBG 2.0 — replaces the u2net matte that left a gray halo and the soft 720p source) + `hero.mp4` / posters.
- **Scope**: hero + `home.ts` rotator only. Independent of case-studies (different `home.ts` region) and o-nas.
