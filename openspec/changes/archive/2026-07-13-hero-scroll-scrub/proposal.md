# Hero Scroll Scrub

## Why

The hero llama clip currently autoplays on a loop, disconnected from the visitor's behavior. The reference implementation (`../goodone/sociallama`) binds the clip to scroll — the llama's head-turn is driven by scroll progress while the hero stays pinned — which turns a passive background into the page's core interaction. Additionally, the current clip ends on a neutral pose; the payoff of the scrub (the pose the visitor parks on) should sell an emotion: the llama is visibly impressed by the headline it turns to look at.

## What Changes

- The chapter-1 wrapper (hero + client-logos belt) becomes a sticky element pinned inside a new tall scroll track (~250–300vh); the belt pins with the hero for the whole scrub, matching the reference.
- Scroll progress through the track scrubs `video.currentTime`: clip completes at 80% of the runway, the final 20% holds the finished pose. Progress comes from hamo's `useScrollTrigger` (the existing `how-it-works` pattern), with an rAF lerp toward the target time and a minimum-seek threshold to avoid Chrome's perpetual-seek compositing bug.
- The hero stops using the shared `@/components/ui/video` primitive (whose loop/autoplay/lazy-load semantics conflict with scrubbing) and gets a hero-local `<video>` element: `preload="auto"`, no loop, never played — only seeked.
- Reduced motion keeps today's behavior: static poster, no video element, no pinning surprises.
- The hero video is reframed inside a retro TV shell (landscape, ~4:3 screen). This retires the seamless-composite constraint for the hero clip — the screen's bezel, vignette, and scanline overlays make background-color drift in generated takes unreadable (a visible seam already exists in the shipped clip today). Validated by a CSS stand-in composition study (2026-07-12): landscape TV proportions are the most convincing, provided the clip is framed tighter.
- A new desktop hero clip is generated via Higgsfield: a tighter head-and-chest crop filling the 4:3 screen, same slow screen-left turn toward the headline (eyeline clearly out of the screen toward the text), with the last ~25% of frames selling "impressed" — ears snapping straight, mouth dropping open, slight head pull-back, eyebrows raised above the sunglasses (glasses stay on). Re-encoded all-intra for instant seeking. The hero's pre-scroll appearance changes deliberately (TV + new framing), so first-frame continuity with the old poster is no longer required. Mobile keeps the existing looping clip for now (**known follow-up**: mobile emotional arc and framing will differ until regenerated).
- Headline stagger trigger changes: it currently syncs to the video's first loop; with no autoplay there is no first loop, so the stagger runs on first paint as it does today (mount-based), decoupled from video time.

## Capabilities

### New Capabilities

- `hero-scroll-scrub`: pinned hero track, scroll-driven video scrubbing, hold phase, reduced-motion and short-viewport behavior.
- `hero-tv-shell`: the retro TV framing the hero video — a generated photoreal raster cutout (landscape ~4:3 screen, rabbit-ear antenna, walnut cabinet, dials/grille column, no legs) with the video aligned to its measured screen rect, plus screen overlays (glare, scanlines, vignette) that neutralize background drift.
- `hero-impressed-clip`: requirements for the generated desktop clip — head-and-chest 4:3 framing, motion arc and eyeline, placement of the emotion beat, encoding for scrubbing.

### Modified Capabilities

- `homepage`: the hero requirement changes — hero + belt pin inside a scroll track instead of scrolling away; the clip no longer loops or autoplays. (Base spec lives in the in-progress `sociallama-homepage` change; this delta assumes that change archives first.)

## Impact

- `app/(home)/page.tsx` — chapter-1 wrapper gains track/sticky structure.
- `app/(home)/sections/hero/index.tsx` + `hero.module.css` — hero-local scrubbed `<video>`, TV shell markup/styles, scroll-trigger wiring; media column widened for the landscape TV (a CSS prototype of the shell exists in the working tree from the composition study).
- `lib/content/home.ts` — hero video config (new clip path after generation).
- `public/clips/hero.mp4` / `hero-poster.jpg` — replaced by the new impressed clip (all-intra encode) and its poster; the hero's pre-scroll look changes deliberately (TV + tighter framing).
- `@/components/ui/video` — untouched; hero stops consuming it. `verify-clip-bg.ts` no longer gates the hero clip (still applies to other sections' clips).
- Chapters theme-morph observer — chapter 1 gets taller (track height); center-band logic unaffected but must be sanity-checked.
- Higgsfield credits: ~2–4 video generation takes (590 available at proposal time); no longer at risk of rejection for background-color drift.
- Sequencing constraint: the scrub and TV shell ship first using the existing clip; the scrub's timing constants and the screen's aspect/crop inform the new clip's prompt before credits are spent.
