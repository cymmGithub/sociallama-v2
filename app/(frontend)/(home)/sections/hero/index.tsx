'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { hero, socials } from '@/lib/content/home'
import { useRotator } from '@/lib/hooks/use-rotator'
import { breakpoints } from '@/styles/config'
import { HeroFrames } from './frame-sequence'
import s from './hero.module.css'

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  // Rotates the first headline word through the offer. Static under reduced
  // motion (shows the first word only); paused while the hero is off screen.
  const { ref: rotatorRef, rotation } = useRotator<HTMLElement>(
    hero.headline.rotator.length
  )
  // 'poster' until mount so SSR and hydration render the same static shell;
  // then desktop gets its scrubbed head-turn clip. Mobile stays static — a
  // poster image, no video (user decision 2026-07-14: simpler and immune to
  // iOS's never-played-video decode restrictions). Reduced motion stays on
  // the poster too, as do touch-only devices above the dt breakpoint —
  // tablets get the static poster, not the scroll scrub (user decision
  // 2026-07-20). Same query as the track's runway collapse in the CSS.
  const [media, setMedia] = useState<'poster' | 'desktop'>('poster')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mobile = window.matchMedia(
      `(max-width: ${breakpoints.dt - 0.02}px)`
    ).matches
    const touchOnly = window.matchMedia(
      '(any-pointer: coarse) and (hover: none)'
    ).matches
    if (!(mobile || touchOnly)) setMedia('desktop')
  }, [])

  // Stagger the three headline lines in on first paint (design D4). Runs once
  // and never re-triggers; reduced motion leaves the final state untouched.
  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Skip on mobile: the hero is a static poster there, so running GSAP on
    // mount only adds a main-thread task inside the LCP paint window. The
    // headline lands in its natural (visible) state — same as reduced motion.
    if (window.matchMedia(`(max-width: ${breakpoints.dt - 0.02}px)`).matches)
      return

    const lines = el.querySelectorAll<HTMLElement>('[data-line]')
    const tween = gsap.from(lines, {
      yPercent: 120,
      duration: 0.9,
      stagger: 0.35,
      delay: 0.2,
      ease: 'expo.out',
    })
    return () => {
      // revert(), not kill(): kill() leaves the lines at the from-state
      // (yPercent 120, offscreen) and poisons GSAP's transform cache, so the
      // next run's gsap.from() animates 120 → 120 and the headline never
      // appears. That next run is real: StrictMode double-invokes this effect,
      // and Next 16's Activity cache re-runs it when navigating back here
      // (first seen returning from /kontakt). revert() restores the pre-tween
      // styles so every re-run starts from a clean slate.
      tween.revert()
    }
  }, [])

  return (
    <section ref={rotatorRef} className={s.hero}>
      {/* Desktop media: transparent head-turn frames (rembg matte) composited
          live onto the #892f53 chapter via a <canvas>. No baked plum, so
          Safari has no video colour pipeline to mis-manage — the reason we
          moved off the clip. Absolute against the section; hidden on mobile. */}
      {media === 'desktop' ? (
        <HeroFrames alt={hero.llamaAlt} />
      ) : (
        media === 'poster' && (
          /* SSR / pre-mount / reduced motion: the first matte frame, composited
             onto the CSS plum exactly like the canvas — so the poster IS frame 0,
             no baked-plum JPG to colour-desync from the scrubbed sequence.
             unoptimized: Next's optimizer re-encodes WebP and shifts colour/alpha
             (the known width-specific corruption), which would push the poster
             off the canvas match — serve the matte as-is. */
          <Image
            src="/clips/hero-frames/001.webp"
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

        {/* Mobile media: static poster, full-bleed (user decision 2026-07-14
            — no scrubbed clip on mobile). Rendered unconditionally; CSS hides
            the box on desktop, so SSR and reduced motion get it for free. */}
        <div className={s.media}>
          {/* unoptimized: the poster's plum is graded to the --color-plum-hero
              token (#853253) so it composites seamlessly onto the section
              ground. Next's image optimizer re-encodes the WebP and shifts
              this plum ~+5 on green (and differently per width — the known
              width-specific color corruption), which would push it back off
              the token. Serving the graded file as-is keeps render == source. */}
          <Image
            src={hero.video.posterMobile}
            alt={hero.llamaAlt}
            fill
            objectFit="cover"
            className={s.mobileImage}
            mobileSize="100vw"
            preload
            unoptimized
          />
        </div>
      </div>
    </section>
  )
}
