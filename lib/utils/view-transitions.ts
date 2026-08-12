import type { ViewTransitionClassPerType } from 'react'

/*
 * Poster-morph transition typing (uslugi-morph-transition /
 * branze-morph-transition).
 *
 * A hub card and its destination hero share one view-transition name
 * (`usluga-<id>` / `branza-<id>`), so React pairs them in BOTH directions —
 * including the detail → hub navigation the hero's back link performs. That
 * direction is always misdirected: <ScrollReset> lands the hub at offset 0
 * inside the same commit, where the paired card usually sits below the fold,
 * so the hero would fly toward an off-screen target. Both morph specs forbid
 * exactly that.
 *
 * The back link therefore tags its navigation `hub-back` (next/link's
 * `transitionTypes`, which forwards to React's `addTransitionType`), and every
 * poster `ViewTransition` maps that type to "none" — React then withholds the
 * `view-transition-name` on both sides and the arrival degrades to a plain
 * page swap. Forward navigation carries no type, so the pair falls back to the
 * `default` key and morphs exactly as before.
 */
const HUB_BACK = 'hub-back'

/** For a hub back link's `transitionTypes` prop. */
export const HUB_BACK_TRANSITION: string[] = [HUB_BACK]

/** For the `share` prop of a poster `ViewTransition`, on either side of the pair. */
export const POSTER_MORPH_SHARE: ViewTransitionClassPerType = {
  [HUB_BACK]: 'none',
  default: 'poster-morph',
}
