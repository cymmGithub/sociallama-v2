'use client'

/**
 * Video UI primitive.
 *
 * A muted, inline, looping background video that does not download media until
 * it is needed: the poster paints first (`preload="none"`) and playback only
 * starts once the element is in the viewport. An optional controlled `playing`
 * prop composes with visibility: `false` pauses the mounted element in place
 * (freeze-frame, position kept, resumable); omitted keeps the pure in-viewport
 * contract. Respects `prefers-reduced-motion` by rendering the poster through
 * `@/components/ui/image` and never creating a `<video>` element at all.
 *
 * Source selection is resolved once at mount via `matchMedia` (not `<source
 * media>`), for predictable behavior across the SSR → hydration boundary. The
 * `<video>` is client-only: the server and first client render both emit the
 * poster, then the effect mounts the video when motion is allowed — so there is
 * no hydration mismatch and no flash of an unplayable element.
 *
 * Clips authored for a themed section must have a flat background equal to that
 * section's theme background (seamless-composite convention) so the video edges
 * are invisible — see `lib/scripts/verify-clip-bg.ts`.
 */

import cn from 'clsx'
import { useIntersectionObserver } from 'hamo'
import { useCallback, useEffect, useState } from 'react'
import { Image } from '@/components/ui/image'
import { breakpoints } from '@/styles/config'
import s from './video.module.css'

interface VideoProps {
  /** Desktop video source. */
  src: string
  /** Optional mobile source, used when the mobile breakpoint matches at mount. */
  mobileSrc?: string
  /** Poster still — paints first and is the reduced-motion fallback. */
  poster: string
  /** Optional mobile poster, paired with `mobileSrc`. */
  posterMobile?: string
  /** Accessible label for the video / alt text for the poster. */
  alt?: string
  /** Aspect ratio (width / height) to reserve the layout box. */
  aspectRatio?: number
  /**
   * Autoplay when in view. When `false`, the component renders the poster only
   * (identical to the reduced-motion path) — useful for touch/hover-less
   * contexts where a clip would otherwise sit frozen.
   */
  autoPlay?: boolean
  /**
   * Controlled playback. Omitted: play whenever in viewport (the default
   * contract). `false` pauses the mounted `<video>` on its current frame —
   * position is retained and `true` resumes it; playback always additionally
   * requires viewport visibility.
   */
  playing?: boolean
  className?: string | undefined
}

export function Video({
  src,
  mobileSrc,
  poster,
  posterMobile,
  alt = '',
  aspectRatio,
  autoPlay = true,
  playing,
  className,
}: VideoProps) {
  // The <video> element lives in state (callback ref), not a ref: the
  // play/pause effect must re-run when it mounts or remounts, and only a
  // state-held element makes that an honest dependency.
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  // Start "reduced" so SSR + first client render both emit the poster; the
  // effect below promotes to the <video> only when motion is allowed.
  const [reduced, setReduced] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Viewport visibility via hamo — the observer follows the element the ref
  // below hands it, and a remount re-observes with a fresh entry.
  const [setObserved, intersection] = useIntersectionObserver({
    threshold: 0.1,
  })
  const inViewport = intersection?.isIntersecting ?? false

  const setRefs = useCallback(
    (el: HTMLVideoElement | null) => {
      setVideoEl(el)
      setObserved(el)
    },
    [setObserved]
  )

  useEffect(() => {
    const mobileMql = window.matchMedia(
      `(max-width: ${breakpoints.dt - 0.02}px)`
    )
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsMobile(mobileMql.matches)
    setReduced(motionMql.matches || !autoPlay)
  }, [autoPlay])

  // Play/pause derives from visibility plus the controlled `playing` prop.
  useEffect(() => {
    if (!videoEl) return

    if (inViewport && playing !== false) {
      videoEl.play().catch(() => {})
    } else {
      videoEl.pause()
    }
  }, [videoEl, inViewport, playing])

  const activeSrc = isMobile && mobileSrc ? mobileSrc : src
  const activePoster = isMobile && posterMobile ? posterMobile : poster

  return (
    <div
      className={cn(s.root, className)}
      style={aspectRatio ? { aspectRatio, height: 'auto' } : undefined}
    >
      {reduced ? (
        <Image src={activePoster} alt={alt} fill className={s.media} />
      ) : (
        <video
          ref={setRefs}
          className={s.media}
          src={activeSrc}
          poster={activePoster}
          muted
          playsInline
          loop
          preload="none"
          aria-label={alt || undefined}
        />
      )}
    </div>
  )
}
