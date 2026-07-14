'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { useTempus } from 'tempus/react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
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
  // then each breakpoint gets its scrubbed clip (head-turn on desktop, upward
  // glance on mobile). Reduced motion stays on the poster (no <video>).
  const [media, setMedia] = useState<'poster' | 'desktop' | 'mobile'>('poster')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mobile = window.matchMedia(
      `(max-width: ${breakpoints.dt - 0.02}px)`
    ).matches
    setMedia(mobile ? 'mobile' : 'desktop')
  }, [])

  // Seek loop (hero-scroll-scrub): the video is never played, only seeked
  // toward the track's scrub target. No-ops until the active breakpoint's
  // video mounts and its metadata (duration) arrives.
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

  // iOS decode unlock: Safari ignores preload="auto" and never buffers or
  // activates the decode pipeline for a video that is never play()ed — the
  // poster paints but currentTime writes show nothing. Prime it with a muted
  // play() → pause() (allowed without a gesture for muted+playsInline). Low
  // Power Mode rejects programmatic play(), so retry once on first touch.
  useEffect(() => {
    if (media === 'poster') return
    const video = videoRef.current
    if (!video) return

    let primed = false
    const prime = () => {
      if (primed) return
      video
        .play()
        ?.then(() => {
          primed = true
          video.pause()
        })
        .catch(() => {
          // Low Power Mode / restricted: the touchstart retry covers it.
        })
    }

    prime()
    window.addEventListener('touchstart', prime, {
      once: true,
      passive: true,
    })
    return () => window.removeEventListener('touchstart', prime)
  }, [media])

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
             Optimized WebP composites correctly; AVIF is disabled globally
             (next.config images.formats) because the optimizer's AVIF output
             is squashed and range-shifted, which broke this composite. */
          <Image
            src={hero.video.poster}
            alt={hero.llamaAlt}
            width={1370}
            height={1080}
            desktopSize="46vw"
            preload
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
          /* Mobile scrubs too (reference behavior): the upward glance is
             driven by the same seek loop — only one of the two <video>
             variants mounts, so they share the ref. */
          <div className={s.media}>
            <video
              ref={videoRef}
              className={s.mobileVideo}
              src={hero.video.mobileSrc}
              poster={hero.video.posterMobile}
              muted
              playsInline
              preload="auto"
              aria-label={hero.llamaAlt}
            />
          </div>
        )}
      </div>
    </section>
  )
}
