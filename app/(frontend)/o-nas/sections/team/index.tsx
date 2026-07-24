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
import { useEffect, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { type LocalizedONas, oNasTeam } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './team.module.css'

// Fade-out beat before the cutout + copy swap to the next member. Kept in sync
// with `--fade-dur` in team.module.css — the CSS animates the opacity, this
// times the src swap to land while the group is invisible.
const FADE_MS = 180

export function Team({
  content = oNasTeam,
}: {
  content?: LocalizedONas['oNasTeam']
}) {
  const revealRef = useReveal<HTMLDivElement>()
  const members = content.members
  const count = members.length

  const [index, setIndex] = useState(0)
  // `fading` dims the cutout + copy to opacity 0 for one beat so the src swap is
  // invisible (a fade-through, not a hard cut). `busyRef` locks the arrows for
  // that beat so a double-click can't desync the swap from the fade.
  const [fading, setFading] = useState(false)
  const busyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  // `first` is the guaranteed fallback — members is non-empty by design, and the
  // guard narrows away the widened-array `undefined` so featured/peers are
  // definite. index is always wrapped in-bounds, so the fallback never runs.
  const first = members[0]
  if (!first) return null

  const featured = members[index] ?? first
  const leftPeer = members[(index - 1 + count) % count] ?? first
  const rightPeer = members[(index + 1) % count] ?? first

  // "ZESPÓŁ SOCIAL LAMA" → "ZESPÓŁ" / "SOCIAL LAMA" (two lines, per the mock).
  const [headLead, ...headRest] = content.heading.split(' ')

  // Step the slider with a fade-through. Reduced-motion users get an instant
  // swap (no dim, no delay); everyone else sees the group fade out, swap while
  // invisible, then fade back in.
  function go(dir: 1 | -1) {
    if (busyRef.current) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setIndex((i) => (i + dir + count) % count)
      return
    }

    busyRef.current = true
    setFading(true)
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + dir + count) % count)
      setFading(false)
      busyRef.current = false
    }, FADE_MS)
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
          <p className={s.eyebrow}>{content.kickerLead}</p>
          <p className={s.title}>{content.kickerRest}</p>
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
          {/* The cutouts crossfade together; the arrows sit outside this box so
              they stay put and clickable through the fade. Peers request the
              same size bucket as the featured slot (displayed smaller) so a
              promoted neighbour reuses the already-fetched variant — no refetch,
              no flash. */}
          <div className={s.figures} data-fading={fading || undefined}>
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
                mobileSize="60vw"
                desktopSize="30vw"
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
                mobileSize="60vw"
                desktopSize="30vw"
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
          </div>

          <button
            type="button"
            className={cn(s.nav, s.navPrev)}
            onClick={() => go(-1)}
            aria-label={content.prevLabel}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(s.nav, s.navNext)}
            onClick={() => go(1)}
            aria-label={content.nextLabel}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        {/* Details for the active member. aria-live announces the switch. */}
        <div
          data-reveal-item
          className={s.text}
          data-fading={fading || undefined}
          aria-live="polite"
        >
          <p className={s.surname}>{featured.surname}</p>
          <p className={cn('h2', s.given)}>{featured.given}</p>
          <p className={s.role}>{featured.role}</p>
          <p className={s.bio}>{featured.bio}</p>
        </div>
      </div>

      {/* Off-screen warmers: fetch every member once (below the fold, before the
          first click) at the exact variant the coverflow renders, so stepping
          the slider never waits on a network round-trip. ~32 KB WebP each. */}
      <div className={s.preload} aria-hidden="true">
        {members.map((m) => (
          <Image
            key={m.photo}
            src={m.photo}
            alt=""
            fill
            objectFit="contain"
            mobileSize="60vw"
            desktopSize="30vw"
            loading="eager"
          />
        ))}
      </div>
    </section>
  )
}
