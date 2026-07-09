'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { hero, socials } from '@/lib/content/home'
import s from './hero.module.css'

const ROTATOR_INTERVAL = 2600

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  // prev tracks the word sliding out so only it (and the incoming word)
  // transition — waiting words snap into place unseen below the mask.
  const [rotation, setRotation] = useState({ index: 0, prev: -1 })

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

        <div className={s.media}>
          <Video
            src={hero.video.src}
            mobileSrc={hero.video.mobileSrc}
            poster={hero.video.poster}
            posterMobile={hero.video.posterMobile}
            alt={hero.llamaAlt}
            aspectRatio={0.92}
          />
        </div>
      </div>
    </section>
  )
}
