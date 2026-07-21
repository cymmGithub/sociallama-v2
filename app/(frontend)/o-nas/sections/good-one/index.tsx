'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { oNasGoodOne } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './good-one.module.css'

/*
 * "JESTEŚMY CZĘŚCIĄ GOOD ONE" band (/o-nas). Cream band, two columns: the Good
 * One group wheel on the left, the intro copy on the right.
 *
 * The wheel renders two ways (same six companies + hub, mirroring the hero's
 * desktop-scrub / mobile-static split):
 *   • Desktop (≥ --desktop): a positioned-DOM orbit — a static center hub, a
 *     dotted ring track carrying six orange spoke dots, and six child logos on
 *     the ring. The ring group and the logos co-rotate in lockstep (one ~54s
 *     period, one phase) so each dot stays inboard of its logo; each logo
 *     counter-rotates to stay upright. Motion is in-view-gated and halts under
 *     reduced motion (see the CSS module).
 *   • Mobile (< --desktop): the original single PNG, unchanged — six positioned
 *     wide logos crowd at phone width, the flat image scales cleanly.
 * CSS `display` toggles between them, so only one is in the a11y tree per width.
 *
 * data-theme="cream" resolves ink text + plum contrast against the explicit
 * cream ground (the section sits between two plum bands on the page).
 */
export function GoodOne() {
  const ref = useReveal<HTMLDivElement>()
  const orbitRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)

  // Run the perpetual spin only while the orbit is on screen; never under
  // reduced motion (CSS also disables the animation there — this just avoids a
  // pointless observer). Re-entrant (once: false semantics) so scrolling away
  // pauses and scrolling back resumes.
  useEffect(() => {
    const el = orbitRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) => setPlaying(entries[0]?.isIntersecting ?? false),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={s.section}
      data-theme="cream"
      data-onas-section="good-one"
    >
      <div ref={ref} data-reveal-style="wipe" className={s.inner}>
        <div data-reveal-item className={s.wheel}>
          {/* Desktop orbit (hidden below --desktop). */}
          <div ref={orbitRef} className={s.orbit} data-playing={playing}>
            <div className={s.track}>
              <svg
                className={s.trackSvg}
                viewBox="0 0 100 100"
                aria-hidden="true"
                focusable="false"
              >
                <circle className={s.trackCircle} cx="50" cy="50" r="50" />
              </svg>
              {oNasGoodOne.spokes.map((company, i) => (
                <span
                  key={company.label}
                  className={s.dot}
                  style={{ '--base': `${i * 60}deg` } as CSSProperties}
                />
              ))}
            </div>

            {oNasGoodOne.spokes.map((company, i) => (
              <div
                key={company.label}
                className={s.logo}
                style={
                  {
                    '--base': `${i * 60}deg`,
                    '--logo-scale': 'scale' in company ? company.scale : 1,
                  } as CSSProperties
                }
              >
                <Image
                  className={s.logoImg}
                  src={company.logo}
                  alt={company.label}
                  width={company.w}
                  height={company.h}
                  objectFit="contain"
                  block
                  desktopSize="18vw"
                  unoptimized
                />
                <span className={s.dash} aria-hidden="true" />
                <span className={s.kind}>{company.kind}</span>
              </div>
            ))}

            <div className={s.hub}>
              <Image
                className={s.hubImg}
                src="/o-nas/good-one/hub.png"
                alt={oNasGoodOne.center}
                width={275}
                height={129}
                objectFit="contain"
                block
                desktopSize="14vw"
                unoptimized
              />
            </div>
          </div>

          {/* Mobile static fallback (hidden at/above --desktop). */}
          <Image
            className={s.wheelImg}
            src="/o-nas/good-one-wheel.png"
            alt="Grupa Good One: Good One PR, SEOFLY, Folks, TymKor media, Diea i Social Lama"
            aspectRatio={971 / 831}
            block
            mobileSize="90vw"
            unoptimized
          />
        </div>

        <div data-reveal-item className={s.copy}>
          <p className={s.eyebrow}>{oNasGoodOne.heading}</p>
          <h2 className={`h2 ${s.title}`}>{oNasGoodOne.headingAccent}</h2>
          <p className={s.body}>{oNasGoodOne.body}</p>
        </div>
      </div>
    </section>
  )
}
