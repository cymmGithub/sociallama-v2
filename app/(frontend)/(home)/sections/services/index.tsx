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
 * The kreacje clip rail plays one clip at a time (middle by default); dimmed
 * neighbours are tap-to-play buttons. A clip tap stops the tab auto-advance;
 * clicking any tab column revives the loop.
 *
 * Mobile (<800px) renders a separate stacked variant with no tab machinery.
 * Reduced motion: autoplay disabled (first tab open, click to switch), bars
 * render full, gradient is static via the global animation neutralizer.
 */

import cn from 'clsx'
import { useMediaQuery } from 'hamo'
import { Play } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import type { LocalizedHome, StageClip } from '@/lib/content/home'
import { usePreferredReducedMotion } from '@/lib/hooks'
import { useReveal } from '@/lib/hooks/use-reveal'
import { breakpoints } from '@/styles/config'
import s from './services.module.css'

// The localized (widened) item type — `content` may be the PL const or its EN
// twin, so helpers can't use the narrow `Service` type.
type ServiceItem = LocalizedHome['services']['items'][number]

function stageId(service: ServiceItem) {
  return `uslugi-stage-${service.id}`
}

export function Services({ content }: { content: LocalizedHome['services'] }) {
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

  // A clip tap hands playback control to the user: the auto-advance loop
  // stops (unlike the off-screen pause) until a tab-column click revives it.
  const [engaged, setEngaged] = useState(false)

  const reducedMotion = usePreferredReducedMotion()
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.dt}px)`)
  const autoplay = isDesktop === true && !reducedMotion && !engaged

  // Mounted for the whole desktop tab-loop lifetime — deliberately not gated
  // on `engaged`, so a clip tap doesn't tear the observer down and `inView`
  // stays current for when a tab click revives the loop.
  useEffect(() => {
    if (isDesktop !== true || reducedMotion) return
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
  }, [isDesktop, reducedMotion])

  function select(index: number) {
    if (index === active) return
    setActive(index)
    setCycle((count) => count + 1)
    // A tab click is an explicit exit from clip-watching — bring the loop back.
    setEngaged(false)
  }

  function advance() {
    setActive((index) => (index + 1) % content.items.length)
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
        <p className={s.eyebrow}>{content.eyebrow}</p>
        <h2 className={s.heading}>{content.heading}</h2>
      </header>

      {/* Desktop: shared stage + tab columns. Both variants stay mounted only
          until the breakpoint resolves post-mount (SSR and first paint render
          both, CSS hides the wrong one); after that the hidden copy unmounts
          so its videos, observers, and grain SVGs are torn down. */}
      {isDesktop !== false && (
        <div ref={revealRef} className={s.tabs}>
          <div data-reveal-item className={s.stage}>
            <Backdrop />
            {content.items.map((service, index) => (
              <div
                key={service.id}
                id={stageId(service)}
                className={cn(s.layer, index === active && s.isActive)}
                aria-hidden={index !== active}
              >
                <StageMedia
                  service={service}
                  active={index === active}
                  playLabel={content.playLabel}
                  reducedMotion={reducedMotion}
                  onEngage={() => setEngaged(true)}
                />
              </div>
            ))}
            <Grain />
          </div>

          <ul className={s.columns}>
            {content.items.map((service, index) => {
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
          {content.items.map((service) => (
            <li key={service.id} data-reveal-item className={s.stackItem}>
              <div className={s.stackStage}>
                <Backdrop />
                {/* Mobile shows only the first three media items — the smaller
                    stage fits exactly a trio (slot geometry in the CSS). No
                    `onEngage`: the tab loop it stops does not exist here. */}
                <StageMedia
                  service={service}
                  active
                  playLabel={content.playLabel}
                  reducedMotion={reducedMotion}
                  limit={3}
                />
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
  playLabel,
  reducedMotion,
  limit,
  onEngage,
}: {
  service: ServiceItem
  active: boolean
  playLabel: string
  reducedMotion: boolean
  /** Render only the first N media items (the mobile stage fits a trio). */
  limit?: number
  onEngage?: () => void
}) {
  const { stage } = service

  // `in`-narrowing, not `stage.kind === 'panels'`: Localized widens the `kind`
  // discriminant to `string`, so the property check is what narrows the union.
  if ('panels' in stage) {
    const panels = limit ? stage.panels.slice(0, limit) : stage.panels
    return (
      <div className={s.panels} data-stage={service.id}>
        {panels.map((panel) => (
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
    <ClipRail
      clips={limit ? stage.clips.slice(0, limit) : stage.clips}
      active={active}
      playLabel={playLabel}
      reducedMotion={reducedMotion}
      onEngage={onEngage}
    />
  )
}

/**
 * One-clip-at-a-time phone rail: the middle clip plays by default, the others
 * sit dimmed and frozen behind full-card play buttons. Extracted from
 * `StageMedia` so the playing-index hook stays unconditional (the panels
 * branch never mounts it). Frames must remain direct `.phone` children in
 * data order — the `nth-child` tilt CSS depends on it.
 */
function ClipRail({
  clips,
  active,
  playLabel,
  reducedMotion,
  onEngage,
}: {
  clips: readonly StageClip[]
  active: boolean
  playLabel: string
  // Reduced motion keeps today's rail: undimmed posters, no buttons —
  // `Video` renders no <video> there, so a play button would be a lie.
  reducedMotion: boolean
  onEngage?: (() => void) | undefined
}) {
  const [playingIdx, setPlayingIdx] = useState(Math.floor(clips.length / 2))

  return (
    <div className={s.phone}>
      {clips.map((clip, index) => {
        const isPlaying = index === playingIdx
        const paused = !(reducedMotion || isPlaying)
        return (
          <div
            key={clip.src}
            className={cn(s.phoneFrame, paused && s.phoneDimmed)}
          >
            <Video
              src={clip.src}
              poster={clip.poster}
              alt={clip.alt}
              autoPlay={active}
              playing={isPlaying}
              className={s.phoneVideo}
            />
            {paused && (
              <button
                type="button"
                className={s.playButton}
                aria-label={`${playLabel}: ${clip.alt}`}
                onClick={() => {
                  setPlayingIdx(index)
                  onEngage?.()
                }}
              >
                <span className={s.playBadge}>
                  <Play aria-hidden="true" />
                </span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
