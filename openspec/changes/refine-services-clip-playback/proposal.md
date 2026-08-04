# Refine services clip playback

## Why

The KREACJE I WIDEO stage plays all three phone clips at once: three fast-cut
montages compete with each other and with the tab copy, and — because the
`Video` primitive downloads on play — activating the tab pulls ~7.3 MB of video
even though the 11 s dwell means most visitors watch only seconds of each. On
the mobile stack it is worse: all three play whenever the section is in view,
with no tab gating at all.

## What Changes

- Only one clip plays at a time in the kreacje phone rail. The middle clip
  (DPD) is the default player; its neighbours sit dimmed and paused.
- Paused cards carry a quiet play affordance (lucide `Play` badge) and are
  real buttons: tapping one makes it the playing card.
- A deselected card freezes in place (resumable) instead of snapping back to
  its poster — the `Video` primitive gains a controlled `playing` prop that
  pauses the element rather than unmounting it.
- Tapping any clip permanently stops the services tab auto-rotation for the
  rest of the page view. Tab-column clicks keep today's behavior (switch,
  restart dwell, keep rotating).
- Same one-at-a-time model on the mobile stack (no rotation exists there).
- Under `prefers-reduced-motion` the rail keeps today's behavior: three
  undimmed posters, no play buttons, nothing plays.
- New localized `playLabel` string ('Odtwórz' / 'Play') for the play buttons'
  aria-labels.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `services-autoplay-tabs`: the "video plays only while its tab is active"
  behavior narrows to a single playing clip with tap-to-switch, and clip
  interaction adds a new way for auto-advance to stop (permanently, unlike the
  off-screen pause).
- `video-playback`: the `Video` primitive gains an optional controlled
  `playing` prop — `false` pauses in place (freeze-frame, resumable) instead
  of unmounting; omitted keeps the current in-viewport autoplay contract.

## Impact

- `components/ui/video/index.tsx` — controlled `playing` prop alongside the
  existing viewport observer; no change for existing call sites (hero, CTA,
  covers) which omit the prop.
- `app/(frontend)/(home)/sections/services/index.tsx` — clip rail gets local
  playing-index state, play-button overlays, and an engagement callback that
  disables the rotation loop.
- `app/(frontend)/(home)/sections/services/services.module.css` — dimmed-card
  and play-badge styles.
- `lib/content/home.ts` / `lib/content/home.en.ts` — `playLabel` under
  `services` in both locales.
- No schema, DB, or route changes; no new assets.
