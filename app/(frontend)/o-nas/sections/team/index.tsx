'use client'

/*
 * Team slider ("NASZE LAMY" / "ZESPÓŁ SOCIAL LAMA") — plum band, id="zespol"
 * (anchor for the about-intro CTA). A featured member with faded teammates
 * behind, circular prev/next arrows stepping oNasTeam.members with wrap-around,
 * and the member's name (surname big in orange) + role + bio on the right.
 *
 * Photos are PLACEHOLDER boxes (data-onas-img="team-photo") until the real
 * cutout PNGs are dropped in. Entrance uses the house reveal primitive.
 */

import cn from 'clsx'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'
import { useState } from 'react'
import { oNasTeam } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './team.module.css'

export function Team() {
  const revealRef = useReveal<HTMLDivElement>()
  const members = oNasTeam.members
  const count = members.length

  const [index, setIndex] = useState(0)
  // `?? members[0]` satisfies noUncheckedIndexedAccess; index is always wrapped
  // in-bounds so the fallback never actually runs.
  const featured = members[index] ?? members[0]

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
        {/* Figure stack: featured cutout centered, faded teammates left/right
            behind it, flanked by the circular nav arrows. */}
        <div data-reveal-item className={s.stage}>
          <span
            className={cn(s.photo, s.peer, s.peerLeft)}
            data-onas-img="team-photo-peer"
          />
          <span
            className={cn(s.photo, s.peer, s.peerRight)}
            data-onas-img="team-photo-peer"
          />
          <span className={cn(s.photo, s.featured)} data-onas-img="team-photo">
            <User className={s.photoIcon} aria-hidden="true" strokeWidth={1} />
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
          <p className={s.firstName}>{featured.firstName}</p>
          <p className={cn('h2', s.lastName)}>{featured.lastName}</p>
          <p className={s.role}>{featured.role}</p>
          <p className={s.bio}>{featured.bio}</p>
        </div>
      </div>
    </section>
  )
}
