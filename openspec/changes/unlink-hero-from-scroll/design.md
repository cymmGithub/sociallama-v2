## Context

Chapter 1 of the homepage is currently a 280vh scroll track (`track.tsx`): a sticky 100svh column (hero + client-logos belt) pins while scroll progress writes a 0..1 scrub target into a context ref. Two consumers read that ref per frame:

- `frame-sequence.tsx` — a `<canvas>` drawing the nearest of 60 transparent WebP frames (the llama head-turn/wardrobe montage, 24fps source, 2.5s).
- `index.tsx` — a rAF watcher mapping scrub progress onto `WORD_BOUNDS` (outfit-cut boundaries) to flip the headline rotator word in lockstep with the llama's outfit.

This change removes the scroll linkage entirely: the montage becomes a one-shot native-pace playthrough, the rotator returns to the shared timer hook, the two run independent cycles, and the track collapses to normal flow. The timer-based rotator mechanism already exists and is proven (`lib/hooks/use-rotator.ts`, used by JoinCta).

Constraint carried over from prior work: mobile, touch-only tablets, and reduced-motion visitors keep the static poster — the media gate in `index.tsx` and its matching CSS queries stay as-is.

## Goals / Non-Goals

**Goals:**

- Hero llama plays its 2.5s montage once at native pace (one smooth continuous motion) shortly after mount, then holds the final frame.
- Headline words rotate on the shared 2600ms timer, fully independent of the llama.
- Chapter 1 returns to normal document flow — no runway, no pin, no dead scroll.
- Hero + belt still compose a single 100svh first viewport (Chapters child structure unchanged).

**Non-Goals:**

- No word↔outfit coupling of any kind — FINAL, decided 2026-07-22 after two working prototypes were reviewed and rejected by the user: (1) word-tick-driven native-speed bursts with holds (exact sync, but chops the single head-turn into stills); (2) montage-as-master driving word flips on the outfit cuts at native pace (smooth, but the first four words flash 0.25–0.63s and the whole coupling read as flaky). A third variant (slow cross-blended playback) was abandoned mid-verification. Independent cycles feel more natural; do not re-propose sync without new material (e.g. a longer regenerated clip).
- No replay on scroll re-entry or viewport re-entry; once per mount is the behavior. (Next 16 Activity cache keeps the component mounted across client navs, so in practice once per session — accepted.)
- No mobile animation. The frames stay desktop-only despite time-driven playback now being technically possible on mobile (3.1MB payload not worth it).
- No wrap-around looping of the llama: the mid-clip outfit cuts are pose-continuous, but frame 60→1 snaps from the settled profile back to front-facing — a visible glitch every cycle.
- No changes to `useRotator`, the frame assets, or the poster pipeline.

## Decisions

### D1: Replace `HeroTrack` with a plain layout div

`Chapters` maps `children[index]` to a chapter, so hero + belt must remain grouped under one element that provides the 100svh flex column. Replace `<HeroTrack>` in `page.tsx` with a plain `<div className={s.column}>` (the current `.sticky` styles minus `position: sticky`/`top`), imported from `hero.module.css`. Delete `track.tsx` (component + `ScrubTargetContext` + `useHeroScrubTarget`) and the `.track` runway CSS including its three collapse media queries — with no runway there is nothing to collapse.

*Alternative considered:* keep `HeroTrack` as a gutted wrapper. Rejected — a client component with no behavior is dead weight; a server-rendered div does the job.

### D2: Time clock lives inside the existing `useTempus` loop

`frame-sequence.tsx` keeps its tempus per-frame loop but replaces the scrub-ref read with an elapsed-time clock: on start, record a baseline timestamp; per tick, `idx = min(59, floor(elapsed / 2500 × 60))`. Redraw-on-change and the clearRect/ghosting handling stay identical. When `idx` reaches 59 the montage is done — the loop bails early thereafter, and the done state lives in a ref (`lastDrawn`), so it survives Activity re-shows and the montage never replays on client-nav return.

*Alternatives considered:* GSAP tween driving a frame index (rejected — adds a tween lifecycle and the known kill/revert Activity-cache pitfalls for what a two-line clock does in a loop we already run); coupling the clock to the word rotator in either direction (built, reviewed, rejected — see Non-Goals).

### D3: Start gate = all frames decoded + 0.3s minimum delay

The montage shows every frame for ~42ms, so a frame still decoding at its slot would visibly drop. The clock starts only when all 60 images have decoded (`Promise.all(imgs.map(img => img.decode()))`) and ≥0.3s has elapsed since mount, landing alongside the headline stagger. Frame 0 still paints immediately on first decode — the hero is never blank while waiting.

*Alternative considered:* fixed 0.3s delay only, tolerating dropped frames on slow connections. Rejected — the decode gate is cheap and the failure mode (llama stutters through its one showpiece playthrough) is exactly what we'd regret.

### D4: Rotator reverts to `useRotator` unchanged

`index.tsx` drops `WORD_BOUNDS`, `wordIndexForProgress`, the rAF watcher effect, and the local rotation state; it calls `useRotator(hero.headline.rotator.length)` with the observer ref on the headline. The CSS classes (`rotatorWordActive` / `rotatorWordLeaving`) and the stable `aria-label` are untouched — `useRotator`'s `{index, prev}` shape is what the markup already consumes (it initializes `prev: -1`, matching the current first-paint guard). Reduced motion and off-screen pausing come free with the hook.

### D5: Words rotate on desktop only where they rotated before — plus everywhere `useRotator` allows

Previously words were static wherever there was no scrub runway (mobile, tablets, reduced motion). `useRotator` gates only on reduced motion and viewport visibility, so mobile/tablet visitors now get rotating words too. This is intentional: "like before" means the pre-scrub behavior, where the rotator ran on its own clock for everyone. The llama media gate is unrelated to the word gate and keeps its current logic.

## Risks / Trade-offs

- [Homepage scroll rhythm changes — chapter 2 arrives ~1.8 viewports sooner, and the chapter-background plum→cream morph was tuned with the pin holding the hero on screen past the flip] → Mandatory visual pass on the chapter transition after the collapse; adjust chapter observer thresholds only if the pass shows a problem (out of scope to pre-tune blind).
- [The hero's own opaque plum background exists partly because of the pin (per CSS comment); removing the pin may make it redundant — or still load-bearing] → Leave the background in place; verify visually. Removing it is a follow-up simplification, not part of this change.
- [Montage plays even if the visitor instantly scrolls past the hero] → Accepted. The clock is 2.5s and canvas draws off-screen are cheap; an in-view gate adds complexity for a case that costs nothing.
- [Words and outfits never correspond — KREACJE may show over the navy suit] → Accepted as the FINAL decision (2026-07-22): two sync prototypes were reviewed and rejected as less natural than independent cycles (see Non-Goals).
- [Mobile/tablet now get rotating words where they previously saw a static first word] → Intentional (D5), but flagged for the user's visual review since it changes what those visitors see.
- [`.next` dev cache may hold stale chunk CSS referencing deleted classes] → Non-issue in practice; dev server restart clears it.

## Open Questions

None — playback shape (independent one-shot montage + free-running words), runway collapse, and the rejection of word↔outfit sync were all decided iteratively with the user (2026-07-22); the rejected sync prototypes are recorded in Non-Goals.
