# Tasks — refine-services-clip-playback

## 1. Video primitive: controlled playback

- [x] 1.1 Add optional `playing?: boolean` prop to `components/ui/video/index.tsx`: lift the IntersectionObserver's `isIntersecting` into state and drive play/pause from an effect over `(inViewport, playing)`; `playing === false` pauses the mounted element in place, omitted prop keeps the current in-viewport contract bit-identical. Update the component's header doc comment.
- [x] 1.2 Extend `components/ui/video/video.stories.tsx` with a controlled freeze-frame story/state (per the video-playback delta's Storybook scenario).
- [x] 1.3 Verify unchanged call sites still play/pause on scroll (hero looks, join CTA, service covers) — no prop passed, no behavior change.

## 2. Content: localized play label

- [x] 2.1 Add `playLabel: 'Odtwórz'` to `services` in `lib/content/home.ts` (near `linkLabel`, with a one-line comment) and `playLabel: 'Play'` in `lib/content/home.en.ts` — the `satisfies LocalizedHome['services']` check must pass.

## 3. Clip rail: one-at-a-time playback

- [x] 3.1 In `app/(frontend)/(home)/sections/services/index.tsx`, extract the video branch of `StageMedia` into a `ClipRail` component owning `useState(Math.floor(clips.length / 2))` for the playing index; frames stay direct `.phone` children in order (the `nth-child` tilt CSS depends on it).
- [x] 3.2 Pass `playing={index === playingIdx}` and keep `autoPlay={active}` on each `Video`; on non-playing cards render a full-card overlay `<button>` with `aria-label` = `` `${playLabel}: ${clip.alt}` `` and a centered lucide `Play` badge; the playing card renders no button.
- [x] 3.3 Under `usePreferredReducedMotion()`, render the rail exactly as today: no dimming, no buttons, three posters.
- [x] 3.4 CSS in `services.module.css`: `.phoneFrame` gets `position: relative`; `.phoneDimmed` dims the media via `filter` with a ~400ms transition; play-badge circle uses brand tokens (`color-mix` ink/cream, backdrop blur, `clamp()` sizing); button focus ring pulled inward with negative `outline-offset` so `overflow: hidden` can't clip it.

## 4. Engagement stops rotation

- [x] 4.1 In `Services`, add `engaged` state; `autoplay` becomes `isDesktop === true && !reducedMotion && !engaged`; thread `onEngage` through `StageMedia` → `ClipRail` and call it from every play-button click. Tab-column clicks stay untouched.
- [x] 4.2 (amendment) `select()` clears `engaged` — clicking a different tab column revives the auto-advance loop after a clip tap; clicking the active tab stays a no-op.

## 5. Verification

- [x] 5.1 `bun run check` passes (known Biome internal-panic lines are pre-existing; judge by exit code).
- [x] 5.2 Playwright pass against this worktree's own port (playwright.config hardcodes :3000 — do NOT trust a green run from a worktree without pointing it at this port): desktop — middle clip plays alone, tap swaps with freeze-frame, dwell bar stops after a tap; mobile viewport — same rail, no timers; reduced-motion — three plain posters.
- [x] 5.3 Screenshot the settled rail (playing + dimmed cards) for the visual OK before any push.
