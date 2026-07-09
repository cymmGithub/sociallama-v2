'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { hero, socials } from '@/lib/content/home'
import s from './hero.module.css'

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null)

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

  return (
    <section className={s.hero}>
      <div className={s.inner}>
        <div className={s.copy}>
          <h1 ref={headlineRef} className={s.headline}>
            {hero.headline.map((line) => (
              <span key={line} className={s.lineMask}>
                <span data-line className={s.line}>
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
            aspectRatio={1370 / 1080}
          />
        </div>
      </div>
    </section>
  )
}
