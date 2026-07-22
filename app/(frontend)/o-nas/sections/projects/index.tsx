'use client'

import cn from 'clsx'
import { ImageIcon } from 'lucide-react'
import { type LocalizedONas, oNasProjects } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './projects.module.css'

/*
 * "Zrealizowane projekty" — cream band (data-theme="cream"). A centered
 * two-tone heading over a row of three project cards. Each card stacks an
 * image placeholder (4:3), a plum caption bar carrying the project name, and a
 * thin orange sub-bar carrying "year / client". The middle card adds a small
 * circular avatar overlapping its image.
 *
 * Images are placeholder boxes (real assets pending): `data-onas-img` marks
 * each slot so a PNG can be dropped in later. Heading + cards rise in on scroll
 * via useReveal (each is a `data-reveal-item`, staggered).
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
          {content.items.map((item, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list; items carry no unique field until real project data lands
              key={index}
              data-reveal-item
              className={s.card}
            >
              <div className={s.media} data-onas-img="project">
                <ImageIcon
                  className={s.mediaIcon}
                  aria-hidden="true"
                  strokeWidth={1.25}
                />
              </div>

              <p className={s.caption}>{item.name}</p>
              <p className={s.meta}>
                {item.year} / {item.client}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
