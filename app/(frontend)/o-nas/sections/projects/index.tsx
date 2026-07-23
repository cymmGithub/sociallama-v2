'use client'

import cn from 'clsx'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { type LocalizedONas, oNasProjects } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './projects.module.css'

/*
 * "Zrealizowane projekty" — cream band (data-theme="cream"). A centered
 * two-tone heading over a row of three project cards. Each card stacks the case
 * study's hero image (4:3), a plum caption bar carrying the project name, and a
 * thin orange sub-bar carrying "year / client".
 *
 * Each card is a nested link to its `/case-studies/<slug>` detail page (the link
 * wraps the media + captions so the `<li>` reveal + list semantics are kept;
 * design D2). Heading + cards rise in on scroll via useReveal (each is a
 * `data-reveal-item`, staggered).
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

                <p className={s.caption}>{item.name}</p>
                <p className={s.meta}>
                  {item.year} / {item.client}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
