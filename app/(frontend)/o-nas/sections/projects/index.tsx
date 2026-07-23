'use client'

import cn from 'clsx'
import { ArrowRight } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { type LocalizedONas, oNasProjects } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './projects.module.css'

/*
 * "Zrealizowane projekty" — sand band (data-theme="cream"). A centered two-tone
 * heading over three image-led case-study tiles (design C). Each tile is a
 * full-bleed cover under a plum scrim carrying the client logo (white chip),
 * an SEO-friendly question title, and a year / "Zobacz" row that reveals on
 * hover (always shown on touch). The whole tile links to the case study.
 *
 * Heading + tiles rise in on scroll via useReveal (each is a `data-reveal-item`,
 * staggered).
 */
export function Projects({
  content = oNasProjects,
}: {
  content?: LocalizedONas['oNasProjects']
}) {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section
      className={s.section}
      data-theme="cream"
      data-onas-section="projects"
    >
      <div ref={revealRef} data-reveal-style="wipe" className={s.inner}>
        <h2 data-reveal-item className={cn('h2', s.heading)}>
          <span className={s.headingLead}>{content.headingLead}</span>{' '}
          <span className={s.headingRest}>{content.headingRest}</span>
        </h2>

        <ul className={s.grid}>
          {content.items.map((item) => (
            <li key={item.href} data-reveal-item className={s.card}>
              <Link className={s.cardLink} href={item.href}>
                <div className={s.media} data-onas-img="project">
                  <Image
                    src={item.image}
                    alt={`${item.client} — ${item.name}`}
                    fill
                    objectFit="cover"
                    mobileSize="92vw"
                    desktopSize="33vw"
                  />
                </div>

                <div className={s.scrim} aria-hidden="true" />

                <div className={s.content}>
                  <span className={s.logo}>
                    <Image
                      src={item.logo}
                      alt={item.client}
                      width={item.logoW}
                      height={item.logoH}
                      objectFit="contain"
                    />
                  </span>

                  <p className={s.title}>{item.name}</p>

                  <p className={s.meta}>
                    <span className={s.year}>{item.year}</span>
                    <span className={s.cta}>
                      {content.cta}
                      <ArrowRight className={s.ctaIcon} aria-hidden="true" />
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
