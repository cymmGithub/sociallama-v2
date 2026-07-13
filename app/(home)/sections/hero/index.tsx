'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { useTempus } from 'tempus/react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { hero, socials } from '@/lib/content/home'
import { breakpoints } from '@/styles/config'
import s from './hero.module.css'
import { useHeroScrubTarget } from './track'

const ROTATOR_INTERVAL = 2600

/* Scrub smoothing (design D3): per-frame lerp toward the target time, and the
   minimum remaining delta worth a `currentTime` write — perpetual micro-seeks
   keep Chrome in a seeking state that composites frames wrong. The reference
   used 0.22 against raw scroll; Lenis already smooths, so start higher. */
const SCRUB_LERP = 0.35
const SEEK_THRESHOLD = 0.02

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrubTargetRef = useHeroScrubTarget()
  // prev tracks the word sliding out so only it (and the incoming word)
  // transition — waiting words snap into place unseen below the mask.
  const [rotation, setRotation] = useState({ index: 0, prev: -1 })
  // 'poster' until mount so SSR and hydration render the same static shell;
  // then desktop gets the scrubbed clip, mobile the looping one. Reduced
  // motion stays on the poster (no <video> element at all).
  const [media, setMedia] = useState<'poster' | 'desktop' | 'mobile'>('poster')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mobile = window.matchMedia(
      `(max-width: ${breakpoints.dt - 0.02}px)`
    ).matches
    setMedia(mobile ? 'mobile' : 'desktop')
  }, [])

  // Seek loop (hero-scroll-scrub): the video is never played, only seeked
  // toward the track's scrub target. No-ops until the desktop video mounts
  // and its metadata (duration) arrives.
  useTempus(() => {
    const video = videoRef.current
    if (!(video && scrubTargetRef)) return
    if (!video.duration || Number.isNaN(video.duration)) return

    const want = scrubTargetRef.current * (video.duration - 0.05)
    const delta = want - video.currentTime
    if (Math.abs(delta) > SEEK_THRESHOLD) {
      video.currentTime += delta * SCRUB_LERP
    }
  })

  // Stagger the three headline lines in on first paint (design D4). Runs once
  // and never re-triggers; reduced motion leaves the final state untouched.
  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lines = el.querySelectorAll<HTMLElement>('[data-line]')
    const tween = gsap.from(lines, {
      yPercent: 120,
      duration: 0.9,
      stagger: 0.35,
      delay: 0.2,
      ease: 'expo.out',
    })
    return () => {
      tween.kill()
    }
  }, [])

  // Rotate the first headline word through the offer. Static under reduced
  // motion (shows the first word only).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      setRotation((state) => ({
        index: (state.index + 1) % hero.headline.rotator.length,
        prev: state.index,
      }))
    }, ROTATOR_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return (
    <section className={s.hero}>
      {/* Desktop media: bare right-anchored clip composited directly onto the
          #892f53 chapter (seamless-composite — the clip is graded to the token
          and gated by verify-clip-bg.ts). Absolute against the section, like
          the reference build; hidden on mobile via CSS. */}
      {media === 'desktop' ? (
        /* Scrubbed by scroll: never played, only seeked (see the useTempus
           loop above). Poster paints until data arrives. */
        <video
          ref={videoRef}
          className={s.video}
          src={hero.video.src}
          poster={hero.video.poster}
          muted
          playsInline
          preload="auto"
          aria-label={hero.llamaAlt}
        />
      ) : (
        media === 'poster' && (
          /* SSR / pre-mount / reduced motion: static poster, same box.
             Unoptimized: the optimizer's WebP re-encode decodes a few RGB
             points dark in Chromium, breaking the seamless composite the
             poster is gated for — the raw frame-0 JPEG renders exact. */
          <Image
            src={hero.video.poster}
            alt={hero.llamaAlt}
            width={1370}
            height={1080}
            desktopSize="46vw"
            preload
            unoptimized
            className={s.video}
          />
        )
      )}
      <div className={s.inner}>
        <div className={s.copy}>
          {/* The visual headline rotates; expose a stable accessible name. */}
          <h1
            ref={headlineRef}
            className={s.headline}
            aria-label={`${hero.headline.rotator[0]} ${hero.headline.lines.join(' ')}`}
          >
            <span aria-hidden="true" className={s.lineMask}>
              <span data-line className={cn(s.line, s.lineSmall, s.rotator)}>
                {hero.headline.rotator.map((word, index) => (
                  <span
                    key={word}
                    className={cn(
                      s.rotatorWord,
                      index === rotation.index && s.rotatorWordActive,
                      index === rotation.prev && s.rotatorWordLeaving
                    )}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </span>
            {hero.headline.lines.map((line, index) => (
              <span aria-hidden="true" key={line} className={s.lineMask}>
                <span
                  data-line
                  className={cn(s.line, index === 0 ? s.lineBig : s.lineLight)}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <ul className={s.socials}>
            {socials.map((social) => (
              <li key={social.label}>
                <Link
                  className={s.social}
                  href={social.href}
                  aria-label={social.label}
                >
                  <span
                    aria-hidden="true"
                    className={s.socialIcon}
                    style={{
                      maskImage: `url(${social.icon})`,
                      WebkitMaskImage: `url(${social.icon})`,
                    }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {media === 'mobile' && (
          /* Mobile keeps the bare looping clip — no scrub — until the mobile
             follow-up regenerates its emotional arc. */
          <div className={s.media}>
            <Video
              className={s.mobileVideo}
              src={hero.video.mobileSrc}
              poster={hero.video.posterMobile}
              alt={hero.llamaAlt}
              aspectRatio={0.92}
            />
          </div>
        )}
      </div>
    </section>
  )
}
