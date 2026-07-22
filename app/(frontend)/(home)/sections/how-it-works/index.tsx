'use client'

import { useScrollTrigger } from 'hamo'
import { useState } from 'react'
import { Image } from '@/components/ui/image'
import { howItWorks, type LocalizedHome } from '@/lib/content/home'
import s from './how-it-works.module.css'

export function HowItWorks({
  content = howItWorks,
}: {
  content?: LocalizedHome['howItWorks']
}) {
  const stepCount = content.steps.length
  const [active, setActive] = useState(0)

  // Same scroll-trigger mechanism <Fold> is built on, driving both the pin
  // range and sequential step activation. Progress 0→1 maps to steps 01–05.
  const [setRectRef] = useScrollTrigger({
    start: 'top top',
    end: 'bottom bottom',
    onProgress: ({ progress }: { progress: number }) => {
      const index = Math.min(stepCount - 1, Math.floor(progress * stepCount))
      setActive(index)
    },
  })

  return (
    <section ref={setRectRef} className={s.pin} aria-label={content.ariaLabel}>
      <div className={s.sticky}>
        <div className={s.head}>
          <h2 className={s.heading}>
            {content.heading.map((line) => (
              <span key={line} className={s.headingLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={s.subhead}>{content.subhead}</p>
        </div>

        {/* Plum stage panel (Mock B, user decision 2026-07-14): steps and
            progress live on the services-stage backdrop language — rounded
            plum gradient, orange glow, grain. */}
        <div className={s.stage}>
          <ol className={s.steps}>
            {content.steps.map((step, index) => (
              <li
                key={step.number}
                className={s.step}
                data-active={index === active}
              >
                <span className={s.number}>{step.number}</span>
                <div className={s.stepMedia}>
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    objectFit="contain"
                    mobileSize="30vw"
                    desktopSize="12vw"
                    /* Tiny 3-color PNGs the optimizer can't improve — and its
                       w=256 rendition inverts the ink strokes to white (same
                       optimizer-bug family as the disabled AVIF in
                       next.config). Serve the originals. */
                    unoptimized
                  />
                </div>
                <p className={s.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>

          <div className={s.progress} aria-hidden="true">
            <span
              className={s.progressBar}
              style={{ '--fill': `${((active + 1) / stepCount) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
