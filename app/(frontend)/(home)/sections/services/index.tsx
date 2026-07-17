'use client'

/**
 * Services as autoplay-tabs (Webflow "Build / Manage / Optimize" pattern,
 * adapted per openspec/changes/services-autoplay-tabs):
 *
 * Desktop: one shared 16:9 stage above three tab columns. The active tab's
 * stage layer crossfades in; tabs auto-advance on a fixed dwell driven by the
 * progress bar's CSS animation (`animationend` → next tab), so pausing the
 * animation (off-screen via IntersectionObserver → `data-paused`) freezes the
 * loop with its progress intact. Clicking a column switches immediately and
 * restarts the cycle.
 *
 * The stage background is the live grain-gradient (gggrain recipe): base
 * plum→orange gradient, slow-drifting radial blobs (CSS transforms), and an
 * SVG feTurbulence grain blended `soft-light` above the media panels so all
 * screenshots share one film grain.
 *
 * Mobile (<800px) renders a separate stacked variant with no tab machinery.
 * Reduced motion: autoplay disabled (first tab open, click to switch), bars
 * render full, gradient is static via the global animation neutralizer.
 */

import cn from 'clsx'
import { useMediaQuery } from 'hamo'
import { useEffect, useId, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { type Service, services } from '@/lib/content/home'
import { usePreferredReducedMotion } from '@/lib/hooks'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './services.module.css'

function stageId(service: Service) {
  return `uslugi-stage-${service.id}`
}

export function Services() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const revealRef = useReveal<HTMLDivElement>()
  const stackRevealRef = useReveal<HTMLUListElement>()

  const [active, setActive] = useState(0)
  // Remount key for the progress fill so every activation restarts its CSS
  // animation from 0%, including click-switches mid-cycle.
  const [cycle, setCycle] = useState(0)
  // Start paused until the IntersectionObserver reports actual visibility,
  // so the loop never runs while the section is below the fold.
  const [inView, setInView] = useState(false)

  const reducedMotion = usePreferredReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 800px)')
  const autoplay = isDesktop === true && !reducedMotion

  useEffect(() => {
    if (!autoplay) return
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [autoplay])

  function select(index: number) {
    if (index === active) return
    setActive(index)
    setCycle((count) => count + 1)
  }

  function advance() {
    setActive((index) => (index + 1) % services.items.length)
    setCycle((count) => count + 1)
  }

  return (
    <section
      ref={sectionRef}
      className={s.section}
      id="uslugi"
      data-paused={autoplay && !inView ? '' : undefined}
    >
      <header className={s.head}>
        <p className={s.eyebrow}>{services.eyebrow}</p>
        <h2 className={s.heading}>{services.heading}</h2>
      </header>

      {/* Desktop: shared stage + tab columns. Both variants stay mounted only
          until the breakpoint resolves post-mount (SSR and first paint render
          both, CSS hides the wrong one); after that the hidden copy unmounts
          so its videos, observers, and grain SVGs are torn down. */}
      {isDesktop !== false && (
        <div ref={revealRef} className={s.tabs}>
          <div data-reveal-item className={s.stage}>
            <Backdrop />
            {services.items.map((service, index) => (
              <div
                key={service.id}
                id={stageId(service)}
                className={cn(s.layer, index === active && s.isActive)}
                aria-hidden={index !== active}
              >
                <StageMedia service={service} active={index === active} />
              </div>
            ))}
            <Grain />
          </div>

          <ul className={s.columns}>
            {services.items.map((service, index) => {
              const isActive = index === active
              return (
                <li
                  key={service.id}
                  data-reveal-item
                  className={cn(s.column, isActive && s.isActive)}
                >
                  <button
                    type="button"
                    className={s.tabButton}
                    aria-expanded={isActive}
                    aria-controls={stageId(service)}
                    onClick={() => select(index)}
                  >
                    <span className="sr-only">{service.title}</span>
                  </button>
                  <div className={s.bar}>
                    {autoplay && isActive ? (
                      <div
                        key={cycle}
                        className={cn(s.fill, s.fillLive)}
                        style={
                          service.dwellMs
                            ? { animationDuration: `${service.dwellMs}ms` }
                            : undefined
                        }
                        onAnimationEnd={advance}
                      />
                    ) : (
                      <div
                        className={cn(s.fill, reducedMotion && s.fillFull)}
                      />
                    )}
                  </div>
                  <h3 className={s.title}>{service.title}</h3>
                  <p className={s.body}>{service.body}</p>
                  <Link className={s.link} href={service.link.href}>
                    {service.link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Mobile: stacked blocks, no tab machinery */}
      {isDesktop !== true && (
        <ul ref={stackRevealRef} className={s.stack}>
          {services.items.map((service) => (
            <li key={service.id} data-reveal-item className={s.stackItem}>
              <div className={s.stackStage}>
                <Backdrop />
                <StageMedia service={service} active />
                <Grain />
              </div>
              <h3 className={s.title}>{service.title}</h3>
              <p className={s.body}>{service.body}</p>
              <Link className={s.link} href={service.link.href}>
                {service.link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Live grain-gradient base: plum→orange gradient + slow-drifting blobs. */
function Backdrop() {
  return (
    <div className={s.backdrop} aria-hidden="true">
      <div className={cn(s.blob, s.blobOrange)} />
      <div className={cn(s.blob, s.blobPlum)} />
    </div>
  )
}

/**
 * Film-grain overlay (gggrain recipe): feTurbulence → desaturate → contrast
 * boost → alpha threshold, blended `soft-light` over the whole stage so the
 * gradient and the media panels share one grain.
 */
function Grain() {
  const id = useId()
  return (
    <svg className={s.grain} aria-hidden="true" role="presentation">
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.62"
          numOctaves="2"
          seed="2"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix in="noise" type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="3" />
          <feFuncG type="linear" slope="3" />
          <feFuncB type="linear" slope="3" />
        </feComponentTransfer>
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 17 -9"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

function StageMedia({
  service,
  active,
}: {
  service: Service
  active: boolean
}) {
  const { stage } = service

  if (stage.kind === 'panels') {
    return (
      <div className={s.panels} data-stage={service.id}>
        {stage.panels.map((panel) => (
          <div
            key={panel.src}
            className={s.panel}
            style={{ aspectRatio: `${panel.width} / ${panel.height}` }}
          >
            <Image
              src={panel.src}
              alt={panel.alt}
              fill
              objectFit="cover"
              mobileSize="60vw"
              desktopSize="35vw"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={s.phone}>
      {stage.clips.map((clip) =>
        'placeholder' in clip ? (
          <div
            key={clip.placeholder}
            className={cn(s.phoneFrame, s.phonePlaceholder)}
            role="img"
            aria-label={clip.placeholder}
          >
            <div className={s.placeholderInner}>
              <Image
                src="/assets/clients/irobot.svg"
                alt=""
                width={1024}
                height={203}
                className={s.placeholderLogo}
              />
              <span className={s.placeholderTag}>Wkrótce</span>
            </div>
          </div>
        ) : (
          <div key={clip.src} className={s.phoneFrame}>
            <Video
              src={clip.src}
              poster={clip.poster}
              alt={clip.alt}
              autoPlay={active}
              className={s.phoneVideo}
            />
          </div>
        )
      )}
    </div>
  )
}
