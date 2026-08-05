'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ARTWORKS } from './artworks'
import type { PosterId, PosterVariant } from './ids'
import s from './posters.module.css'

/*
 * Service poster — the line-art artwork shared by a /uslugi hub card and its
 * service page's hero (design D1/D2). One component, two compositions, keyed by
 * the locale-neutral service id so both locales pair by construction.
 *
 * Inline SVG rather than a file in `public/`: the ambient loops need to pause
 * off-screen, the draw-on accents need a viewport trigger, and both sides of
 * the morph need markup we can reach — none of which works through
 * `<img src="*.svg">`.
 *
 * Callers wrap this in `<ViewTransition name={`usluga-${id}`} …>` to enrol the
 * poster in the card→hero morph; the component itself knows nothing about it
 * beyond deferring its motion until a running transition has settled.
 */

// Ids deliberately are NOT re-exported here — `./ids` is the server-safe entry
// point, and routing them through this `'use client'` module would make
// `isPosterId` uncallable from the Server Components that build the hub cards.
export type { PosterId, PosterVariant }

const FRAME = {
  card: { width: 600, height: 400, cx: '20%', cy: '95%', r: '110%', dim: 0.75 },
  hero: {
    width: 1440,
    height: 540,
    cx: '15%',
    cy: '100%',
    r: '120%',
    dim: 0.8,
  },
} as const

// Layout effect on the client (the pre-draw state must be in place before the
// first paint, or the settled artwork flashes), plain effect on the server.
// Same shape as `lib/hooks/use-reveal.ts`.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

interface ServicePosterProps {
  id: PosterId
  variant: PosterVariant
}

export function ServicePoster({ id, variant }: ServicePosterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = useState(false)
  // 'settled' is the server render and the reduced-motion render: fully drawn,
  // no animation ever armed.
  const [draw, setDraw] = useState<'settled' | 'armed' | 'done'>('settled')

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let observer: IntersectionObserver | undefined
    let cancelled = false

    const start = () => {
      if (cancelled || !ref.current) return
      setDraw((current) => (current === 'done' ? current : 'armed'))

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting ?? false
          setAnimating(visible)
          // Latched: the draw-on plays once per page visit, so scrolling a
          // card out and back never re-draws it.
          if (visible) setDraw('done')
        },
        { threshold: 0 }
      )
      observer.observe(ref.current)
    }

    // Arriving through a card→hero morph, the transition owns the screen: the
    // hero poster must stay the settled shared layer it was captured as, or the
    // ambient loop double-exposes against the outgoing snapshot. Motion begins
    // once the transition finishes. `activeViewTransition` is absent from the
    // DOM lib types.
    const transition = (
      document as Document & {
        activeViewTransition?: { finished: Promise<void> }
      }
    ).activeViewTransition

    if (transition) {
      transition.finished.then(start, start)
    } else {
      start()
    }

    return () => {
      cancelled = true
      observer?.disconnect()
    }
  }, [])

  const frame = FRAME[variant]
  const uid = `${id}-${variant}`
  const Artwork = ARTWORKS[id]

  return (
    <div
      ref={ref}
      className={s.poster}
      data-animating={animating}
      data-draw={draw === 'settled' ? undefined : draw}
    >
      {/* Decorative: the hub card's label and the hero's h1 already name the
          service, so a described poster would only repeat them. */}
      <svg
        className={s.svg}
        viewBox={`0 0 ${frame.width} ${frame.height}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient
            id={`${uid}-vignette`}
            cx={frame.cx}
            cy={frame.cy}
            r={frame.r}
          >
            <stop
              className={s.vignetteStop}
              offset="0%"
              stopOpacity={frame.dim}
            />
            <stop className={s.vignetteStop} offset="55%" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect className={s.ground} width={frame.width} height={frame.height} />
        <rect
          width={frame.width}
          height={frame.height}
          fill={`url(#${uid}-vignette)`}
        />
        <Artwork variant={variant} uid={uid} />
      </svg>
    </div>
  )
}
