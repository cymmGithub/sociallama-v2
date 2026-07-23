'use client'

import cn from 'clsx'
import { useEffect, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { hero, type LocalizedHome, socials } from '@/lib/content/home'
import { useRotator } from '@/lib/hooks/use-rotator'
import { breakpoints } from '@/styles/config'
import { HeroFrames } from './frame-sequence'
import s from './hero.module.css'

export function Hero({ content = hero }: { content?: LocalizedHome['hero'] }) {
  // Timer-based word rotator (hero-intro-montage), same mechanism as JoinCta:
  // paused off-screen, static first word under reduced motion. Fully
  // independent of the llama montage — no outfit sync (user decision
  // 2026-07-22; coupling was tried and felt flaky). The hook's ref also
  // serves as the headline element ref.
  const { ref: headlineRef, rotation } = useRotator<HTMLHeadingElement>(
    content.headline.rotator.length
  )
  // 'poster' until mount so SSR and hydration render the same static shell;
  // then desktop gets its one-shot head-turn montage. Mobile stays static — a
  // poster image, no video (user decision 2026-07-14: simpler and immune to
  // iOS's never-played-video decode restrictions). Reduced motion stays on
  // the poster too, as do touch-only devices above the dt breakpoint —
  // tablets get the static poster, not the montage (user decision
  // 2026-07-20).
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

  // No headline entrance animation (user decision 2026-07-23): the GSAP
  // stagger fly-in was removed — the three lines render in their natural
  // visible state on mount. Only the word rotator animates.

  return (
    <section className={s.hero}>
      {/* Desktop media: transparent head-turn frames (rembg matte) composited
          live onto the brand-plum (#913155) chapter via a <canvas>. No baked plum, so
          Safari has no video colour pipeline to mis-manage — the reason we
          moved off the clip. Absolute against the section; hidden on mobile. */}
      {media === 'desktop' ? (
        <HeroFrames alt={content.llamaAlt} />
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
            alt={content.llamaAlt}
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
            aria-label={`${content.headline.rotator[0]} ${content.headline.lines.join(' ')}`}
          >
            <span aria-hidden="true" className={s.lineMask}>
              <span className={cn(s.line, s.lineSmall, s.rotator)}>
                {content.headline.rotator.map((word, index) => (
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
            {content.headline.lines.map((line, index) => (
              <span aria-hidden="true" key={line} className={s.lineMask}>
                <span
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
              token (#913155, the brand plum) so it composites seamlessly onto
              the section ground. Next's image optimizer re-encodes the WebP and shifts
              this plum ~+5 on green (and differently per width — the known
              width-specific color corruption), which would push it back off
              the token. Serving the graded file as-is keeps render == source. */}
          <Image
            src={content.video.posterMobile}
            alt={content.llamaAlt}
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
