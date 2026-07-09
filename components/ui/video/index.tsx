'use client'

/**
 * Video UI primitive.
 *
 * A muted, inline, looping background video that does not download media until
 * it is needed: the poster paints first (`preload="none"`) and playback only
 * starts once the element is in the viewport. Respects `prefers-reduced-motion`
 * by rendering the poster through `@/components/ui/image` and never creating a
 * `<video>` element at all.
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
import { useEffect, useRef, useState } from 'react'
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
  className,
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Start "reduced" so SSR + first client render both emit the poster; the
  // effect below promotes to the <video> only when motion is allowed.
  const [reduced, setReduced] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mobileMql = window.matchMedia(
      `(max-width: ${breakpoints.dt - 0.02}px)`
    )
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsMobile(mobileMql.matches)
    setReduced(motionMql.matches || !autoPlay)
  }, [autoPlay])

  // Play/pause with viewport visibility. Re-runs when the <video> mounts.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduced])

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
          ref={videoRef}
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
