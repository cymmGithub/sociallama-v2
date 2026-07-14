'use client'

import cn from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { testimonials } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './testimonial.module.css'

const COUNT = testimonials.length
// Below this horizontal travel a touch reads as a tap/scroll, not a swipe.
const SWIPE_THRESHOLD = 40

export function Testimonial() {
  const ref = useReveal<HTMLElement>()
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const labelId = useId()

  const go = useCallback((next: number) => {
    setActive((next + COUNT) % COUNT)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current
    if (start === null) return
    const dx = (e.changedTouches[0]?.clientX ?? start) - start
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(active + (dx < 0 ? 1 : -1))
    touchStartX.current = null
  }

  return (
    // data-blur-edge-gate: suppress the viewport-bottom blur while this section
    // is on screen — the carousel dots/arrows are the only way to advance and
    // must stay crisp (see components/layout/blur-edge).
    <section
      ref={ref}
      className={s.section}
      aria-labelledby={labelId}
      data-blur-edge-gate
    >
      <h2 id={labelId} className={s.srOnly}>
        Opinie klientów
      </h2>

      {/* biome-ignore lint/a11y/useSemanticElements: a carousel region is the
          correct ARIA role here, not a landmark. Keyboard control is on the
          arrow/dot buttons below; swipe is a touch-only enhancement. */}
      <div
        data-reveal-item
        className={s.carousel}
        role="group"
        aria-roledescription="karuzela"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* All slides share one grid cell so the viewport sizes to the tallest
            quote — switching never shifts the layout below. */}
        <div className={s.viewport}>
          {testimonials.map((t, i) => (
            <figure
              key={t.author}
              className={s.slide}
              data-active={i === active}
              aria-hidden={i !== active}
            >
              <blockquote className={s.quote}>“{t.quote}”</blockquote>
              {t.image && (
                <div className={s.media}>
                  <Image
                    src={t.image}
                    alt={t.author}
                    width={112}
                    height={112}
                    className={s.avatar}
                  />
                </div>
              )}
              <figcaption className={s.caption}>
                {t.logo ? (
                  <Image
                    src={t.logo}
                    alt={t.company ?? t.author}
                    width={180}
                    height={56}
                    objectFit="contain"
                    className={s.logo}
                  />
                ) : (
                  t.company && <span className={s.company}>{t.company}</span>
                )}
                <span className={s.author}>{t.author}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={s.controls}>
          <button
            type="button"
            className={s.arrow}
            onClick={() => go(active - 1)}
            aria-label="Poprzednia opinia"
          >
            <ChevronLeft aria-hidden size={20} strokeWidth={2.25} />
          </button>
          <div className={s.dots} role="tablist" aria-label="Wybierz opinię">
            {testimonials.map((t, i) => (
              <button
                type="button"
                key={t.author}
                className={cn(s.dot, i === active && s.dotActive)}
                aria-label={`Opinia ${i + 1}: ${t.author}`}
                aria-selected={i === active}
                role="tab"
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className={s.arrow}
            onClick={() => go(active + 1)}
            aria-label="Następna opinia"
          >
            <ChevronRight aria-hidden size={20} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </section>
  )
}
