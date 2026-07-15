'use client'

/**
 * Testimonials — pull-quote + client rail (openspec/changes/testimonial-pull-quote-rail,
 * Makieta 1). A short pull-phrase in display type with an orange <mark> sits
 * above the full quote at reading size; all three clients stay visible in a
 * rail that doubles as the only navigation. The slider autoplays on a 7 s
 * rhythm with a thin orange progress bar filling along the active rail row.
 *
 * Autoplay engine (the mock's proven approach): a setTimeout chain plus
 * performance.now() bookkeeping so hover can pause and resume from the same
 * point. The progress bar is a pure CSS scaleX animation keyed off
 * aria-selected, so it restarts in lockstep with the timer when the active row
 * changes and freezes via data-paused — no rAF, JS and CSS stay in sync.
 * Hover pauses temporarily; on touch-only devices any manual pick (rail tap or
 * swipe) stops autoplay for the page view. prefers-reduced-motion skips
 * scheduling entirely (CSS kills the slide + progress animations too).
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { testimonials } from '@/lib/content/home'
import { useMediaQuery, usePreferredReducedMotion } from '@/lib/hooks'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './testimonial.module.css'

const COUNT = testimonials.length
const CYCLE = 7000
// Below this horizontal travel a touch reads as a tap/scroll, not a swipe.
const SWIPE_THRESHOLD = 40
// The exiting slide keeps its data-leaving flag for one transition so it
// animates out to the left instead of snapping (see the CSS).
const LEAVE_MS = 500

export function Testimonial() {
  const ref = useReveal<HTMLElement>()
  const labelId = useId()
  const reducedMotion = usePreferredReducedMotion()
  const touchOnly = useMediaQuery('(hover: none)') === true

  const [active, setActive] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  // Touch: a manual pick stops autoplay permanently for this page view.
  const [stopped, setStopped] = useState(false)

  const autoplay = !(reducedMotion || stopped)

  const activeRef = useRef(0)
  const autoplayRef = useRef(autoplay)
  autoplayRef.current = autoplay
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedRef = useRef(0)
  const remainingRef = useRef(CYCLE)
  const pausedRef = useRef(false)
  const touchStartX = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const select = useCallback((i: number) => {
    const prev = activeRef.current
    if (i === prev) return
    activeRef.current = i
    setLeaving(prev)
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = setTimeout(() => setLeaving(null), LEAVE_MS)
    setActive(i)
  }, [])

  const schedule = useCallback(
    (ms: number) => {
      clearTimer()
      if (!autoplayRef.current) return
      startedRef.current = performance.now()
      remainingRef.current = ms
      timerRef.current = setTimeout(() => {
        select((activeRef.current + 1) % COUNT)
        schedule(CYCLE)
      }, ms)
    },
    [clearTimer, select]
  )

  // Start (or tear down) the loop whenever eligibility flips — reduced-motion
  // toggled, or a touch pick stopped it. Hover pause is handled imperatively
  // below, so `paused` is deliberately not a dependency here.
  useEffect(() => {
    if (autoplay) schedule(CYCLE)
    else clearTimer()
    return clearTimer
  }, [autoplay, schedule, clearTimer])

  // Flush the pending leave-timer on unmount (its own lifecycle, kept separate
  // from the autoplay loop so eligibility flips don't cancel an exit mid-slide).
  useEffect(
    () => () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    },
    []
  )

  // Manual pick (rail tap or swipe): restart the rhythm on hover devices; stop
  // it for good on touch-only ones — the user chose this testimonial.
  const pick = useCallback(
    (i: number) => {
      const same = i === activeRef.current
      if (!same) select(i)
      if (touchOnly) {
        setStopped(true)
        clearTimer()
      } else if (!same) {
        // Restart the rhythm from the chosen testimonial — but if the pointer
        // is still over the section (paused), hold at 0 and let mouseleave
        // resume it, so a pick-while-hovering doesn't silently unpause.
        remainingRef.current = CYCLE
        if (!pausedRef.current) schedule(CYCLE)
      }
    },
    [touchOnly, select, schedule, clearTimer]
  )

  // Hover holds the slider and its progress bar in place, resuming from the
  // same point on leave (no-op on touch, where mouseenter never fires).
  const onEnter = () => {
    if (!autoplayRef.current) return
    clearTimer()
    remainingRef.current -= performance.now() - startedRef.current
    pausedRef.current = true
    setPaused(true)
  }
  const onLeave = () => {
    if (!autoplayRef.current) return
    pausedRef.current = false
    setPaused(false)
    schedule(Math.max(0, remainingRef.current))
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current
    if (start === null) return
    const dx = (e.changedTouches[0]?.clientX ?? start) - start
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      pick((activeRef.current + (dx < 0 ? 1 : COUNT - 1)) % COUNT)
    }
    touchStartX.current = null
  }

  return (
    // data-blur-edge-gate: suppress the viewport-bottom blur while this section
    // is on screen — the byline and rail sit low on short desktop viewports and
    // must stay crisp (see components/layout/blur-edge).
    <section
      ref={ref}
      className={s.section}
      aria-labelledby={labelId}
      data-blur-edge-gate
      data-autoplay={autoplay ? 'true' : 'false'}
      data-paused={paused ? 'true' : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <h2 id={labelId} className="sr-only">
        Opinie klientów
      </h2>

      <div
        data-reveal-item
        className={s.grid}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* All slides share one grid cell so the stage reserves the tallest
            slide's height — switching never shifts the rail or the sections
            below (layout-stable directional transition). */}
        <div className={s.stage}>
          {testimonials.map((t, i) => (
            <article
              key={t.author}
              className={s.slide}
              data-active={i === active}
              data-leaving={i === leaving}
              aria-hidden={i !== active}
            >
              {t.pull && (
                <p className={s.pull}>
                  {t.pull.before}
                  <mark>{t.pull.highlight}</mark>
                  {t.pull.after}
                </p>
              )}
              <blockquote className={s.quote}>“{t.quote}”</blockquote>
            </article>
          ))}
        </div>

        {/* Rail = the slider's tab strip (each row selects a testimonial), so
            role="tablist" over a plain container is the right ARIA, not a nav. */}
        <div className={s.rail} role="tablist" aria-label="Wybierz opinię">
          {testimonials.map((t, i) => (
            <button
              type="button"
              key={t.author}
              className={s.client}
              role="tab"
              aria-selected={i === active}
              aria-label={`Opinia ${i + 1}: ${t.author}`}
              onClick={() => pick(i)}
            >
              {t.image && (
                <Image
                  src={t.image}
                  alt={t.author}
                  width={136}
                  height={136}
                  className={s.avatar}
                />
              )}
              <span className={s.who}>
                {t.logo && (
                  <Image
                    src={t.logo}
                    alt={t.company ?? t.author}
                    width={180}
                    height={56}
                    objectFit="contain"
                    className={s.logo}
                  />
                )}
                <b>{t.author}</b>
              </span>
              <span className={s.progress} aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
