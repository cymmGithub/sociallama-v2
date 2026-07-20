'use client'

/*
 * Team slider ("NASZE LAMY" / "ZESPÓŁ SOCIAL LAMA") — plum band, id="zespol"
 * (anchor for the about-intro CTA). One featured member shown whole, circular
 * prev/next arrows stepping oNasTeam.members with wrap-around, and the member's
 * name (surname over big orange given name) + role + bio on the right.
 *
 * Photos are transparent portrait cutouts (public/o-nas/slider) that drop
 * straight onto the plum band. Entrance uses the house reveal primitive.
 */

import cn from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Image } from '@/components/ui/image'
import { oNasTeam } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './team.module.css'

export function Team() {
  const revealRef = useReveal<HTMLDivElement>()
  const members = oNasTeam.members
  const count = members.length

  const [index, setIndex] = useState(0)
  // `?? members[0]` satisfies noUncheckedIndexedAccess; index is always wrapped
  // in-bounds so the fallback never actually runs. Peers are the members either
  // side of the featured one — shown whole and plum-tinted, framing the hero.
  const featured = members[index] ?? members[0]
  const leftPeer = members[(index - 1 + count) % count] ?? members[0]
  const rightPeer = members[(index + 1) % count] ?? members[0]

  // "ZESPÓŁ SOCIAL LAMA" → "ZESPÓŁ" / "SOCIAL LAMA" (two lines, per the mock).
  const [headLead, ...headRest] = oNasTeam.heading.split(' ')

  function prev() {
    setIndex((i) => (i - 1 + count) % count)
  }

  function next() {
    setIndex((i) => (i + 1) % count)
  }

  return (
    <section
      id="zespol"
      data-theme="plum"
      data-onas-section="team"
      className={s.section}
    >
      <header className={s.head}>
        {/* Homepage "Usługi" pattern: small white eyebrow over a big orange word. */}
        <div className={s.label}>
          <p className={s.eyebrow}>{oNasTeam.kickerLead}</p>
          <p className={s.title}>{oNasTeam.kickerRest}</p>
        </div>
        <p className={s.heading}>
          <span>{headLead}</span>
          <span>{headRest.join(' ')}</span>
        </p>
      </header>

      <div ref={revealRef} data-reveal-style="wipe" className={s.slider}>
        {/* Coverflow stack: the featured cutout in front (full colour), the two
            neighbours behind it plum-tinted and whole, flanked by the nav
            arrows that cycle through the members. */}
        <div data-reveal-item className={s.stage}>
          <span
            className={cn(s.photo, s.peer, s.peerLeft)}
            style={{ '--peer-src': `url(${leftPeer.photo})` }}
            aria-hidden="true"
          >
            <Image
              src={leftPeer.photo}
              alt=""
              fill
              objectFit="contain"
              mobileSize="34vw"
              desktopSize="20vw"
            />
          </span>
          <span
            className={cn(s.photo, s.peer, s.peerRight)}
            style={{ '--peer-src': `url(${rightPeer.photo})` }}
            aria-hidden="true"
          >
            <Image
              src={rightPeer.photo}
              alt=""
              fill
              objectFit="contain"
              mobileSize="34vw"
              desktopSize="20vw"
            />
          </span>
          <span className={cn(s.photo, s.featured)}>
            <Image
              src={featured.photo}
              alt=""
              fill
              objectFit="contain"
              mobileSize="60vw"
              desktopSize="30vw"
            />
          </span>

          <button
            type="button"
            className={cn(s.nav, s.navPrev)}
            onClick={prev}
            aria-label="Poprzednia osoba"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(s.nav, s.navNext)}
            onClick={next}
            aria-label="Następna osoba"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        {/* Details for the active member. aria-live announces the switch. */}
        <div data-reveal-item className={s.text} aria-live="polite">
          <p className={s.surname}>{featured.surname}</p>
          <p className={cn('h2', s.given)}>{featured.given}</p>
          <p className={s.role}>{featured.role}</p>
          <p className={s.bio}>{featured.bio}</p>
        </div>
      </div>
    </section>
  )
}
