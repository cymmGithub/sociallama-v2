'use client'

import { useScrollTrigger } from 'hamo'
import {
  createContext,
  type ReactNode,
  type RefObject,
  use,
  useRef,
} from 'react'
import s from './hero.module.css'

/* The clip completes at 80% of the runway; the final 20% holds the finished
   pose so the visitor parks on the llama's impressed stare (hero-scroll-scrub
   spec). */
const HOLD = 0.2

/* Mutable scrub target (0..1 of clip time), written per scroll event and read
   per frame by the hero's seek loop — a ref, not state, so progress updates
   never re-render the pinned tree. */
const ScrubTargetContext = createContext<RefObject<number> | null>(null)

export function useHeroScrubTarget() {
  return use(ScrubTargetContext)
}

/**
 * Chapter-1 scroll track: hero + client-logos belt pin as a sticky
 * viewport-height column while scroll through the runway scrubs the hero
 * clip — head-turn on desktop (280vh runway), upward glance on mobile
 * (155svh). Under reduced motion the track collapses to a single viewport —
 * no dead scroll runway.
 */
export function HeroTrack({ children }: { children: ReactNode }) {
  const targetRef = useRef(0)

  const [setRectRef] = useScrollTrigger({
    start: 'top top',
    end: 'bottom bottom',
    onProgress: ({ progress }: { progress: number }) => {
      targetRef.current = Math.min(1, progress / (1 - HOLD))
    },
  })

  return (
    <div ref={setRectRef} className={s.track}>
      <div className={s.sticky}>
        <ScrubTargetContext.Provider value={targetRef}>
          {children}
        </ScrubTargetContext.Provider>
      </div>
    </div>
  )
}
