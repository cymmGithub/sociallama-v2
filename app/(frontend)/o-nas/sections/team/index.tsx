'use client'

/*
 * Team slider ("NASZE LAMY" / "ZESPÓŁ SOCIAL LAMA") — plum band, id="zespol"
 * (anchor for the about-intro CTA). One featured member shown whole, circular
 * prev/next arrows stepping oNasTeam.members with wrap-around, and the member's
 * name (small orange given name over big cream surname) + role + certificate
 * chips + bio on the right.
 *
 * Photos are transparent portrait cutouts (public/o-nas/slider) that drop
 * straight onto the plum band. Entrance uses the house reveal primitive; the
 * step-to-step swap is a true crossfade (see Team below).
 */

import cn from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  type TouchEvent as ReactTouchEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type { CertKey, LocalizedONas } from '@/lib/content/o-nas'
import { usePreferredReducedMotion } from '@/lib/hooks'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './team.module.css'

// Full crossfade duration. FADE_MS runs a touch longer than `--fade-dur` in
// team.module.css so the outgoing layer is always fully faded before we prune
// it (no snap on unmount).
const FADE_MS = 340

// Key -> mark, at its own intrinsic dimensions. Certificate marks are
// trademarks: the chip sizes them but never recolours, crops or stretches them,
// which is why the ratios are the artwork's own and the chip ground is light.
// The homepage keeps its own copy of this registry (design non-goal: two
// entries do not justify lifting a working surface into a shared module).
const CERT_MARKS = {
  dimaq: { src: '/assets/certs/dimaq.png', width: 347, height: 143 },
  meta: { src: '/assets/certs/meta.png', width: 627, height: 345 },
} as const

type Member = LocalizedONas['oNasTeam']['members'][number]

// The cutout filename stem ('/o-nas/slider/anna-ozga.png' -> 'anna-ozga') — the
// only key this slider and the homepage team grid already share. The homepage
// deep links by it rather than by position, because the two surfaces are
// deliberately ordered differently (see the onas-team spec).
function slugOf(photo: string) {
  return (
    photo
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '') ?? ''
  )
}

/**
 * Reads `?lama=` and hands it up. It exists as its own component purely so the
 * Suspense boundary `useSearchParams` demands can wrap *nothing visible*:
 * reading the param inside <Team> would put the boundary around the whole team
 * section, and its fallback would punch a hole in the prerendered HTML.
 */
function LamaParam({ onSlug }: { onSlug: (slug: string | null) => void }) {
  const lama = useSearchParams().get('lama')

  useEffect(() => {
    onSlug(lama)
  }, [lama, onSlug])

  return null
}

export function Team({ content }: { content: LocalizedONas['oNasTeam'] }) {
  const revealRef = useReveal<HTMLDivElement>()
  const reducedMotion = usePreferredReducedMotion()
  const members = content.members
  const count = members.length

  const [index, setIndex] = useState(0)
  // `prev` is the outgoing member index during a step — non-null only while the
  // crossfade runs, so both slides are mounted and can dissolve past each other
  // (no blank frame). `busyRef` locks the arrows for that window so a fast
  // double-click can't leave a half-faded ghost mounted.
  const [prev, setPrev] = useState<number | null>(null)
  const busyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Start point of an in-progress touch, for the swipe gesture (mobile).
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  // Deep link from the homepage grid: feature the named member on arrival. An
  // instant swap — no crossfade layer, no arrow lock — because there is nothing
  // to fade *from*. Keyed on the slug value rather than on mount, so it re-fires
  // when Next keeps this page alive across navigations and the visitor comes
  // back with a different member. Unknown or absent slug changes nothing.
  const [lama, setLama] = useState<string | null>(null)

  useEffect(() => {
    if (!lama) return
    const target = members.findIndex((m) => slugOf(m.photo) === lama)
    if (target < 0) return
    setPrev(null)
    setIndex(target)
  }, [lama, members])

  // `first` is the guaranteed fallback — members is non-empty by design, and the
  // guard narrows away the widened-array `undefined`. index/prev are always
  // wrapped in-bounds, so the fallback never actually runs.
  const first = members[0]
  if (!first) return null

  // The coverflow trio for a given centre index: featured in front, the two
  // wrap-around neighbours behind it.
  const trioAt = (i: number) => ({
    featured: members[i] ?? first,
    leftPeer: members[(i - 1 + count) % count] ?? first,
    rightPeer: members[(i + 1) % count] ?? first,
  })

  // "ZESPÓŁ SOCIAL LAMA" → "ZESPÓŁ" / "SOCIAL LAMA" (two lines, per the mock).
  const [headLead, ...headRest] = content.heading.split(' ')

  // Step the slider. Reduced-motion users get an instant swap (no second layer,
  // no delay); everyone else keeps the outgoing member mounted for one beat so
  // it dissolves out while the incoming dissolves in over it.
  function go(dir: 1 | -1) {
    if (busyRef.current) return

    if (reducedMotion) {
      setIndex((i) => (i + dir + count) % count)
      return
    }

    busyRef.current = true
    setIndex((i) => {
      setPrev(i)
      return (i + dir + count) % count
    })
    timerRef.current = setTimeout(() => {
      setPrev(null)
      busyRef.current = false
    }, FADE_MS)
  }

  // Finger-swipe the stage (touch only, so desktop mouse-drag / text selection
  // is untouched). A mostly-horizontal drag past the threshold steps the
  // slider; a mostly-vertical one is left alone so the page still scrolls.
  function onTouchStart(e: ReactTouchEvent) {
    const t = e.touches[0]
    if (t) touchStart.current = { x: t.clientX, y: t.clientY }
  }

  function onTouchEnd(e: ReactTouchEvent) {
    const start = touchStart.current
    const t = e.changedTouches[0]
    touchStart.current = null
    if (!(start && t)) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1) // swipe left → next, swipe right → prev
    }
  }

  const current = trioAt(index)
  const outgoing = prev !== null ? trioAt(prev) : null

  return (
    <section
      id="zespol"
      data-theme="plum"
      data-onas-section="team"
      className={s.section}
    >
      <Suspense fallback={null}>
        <LamaParam onSlug={setLama} />
      </Suspense>

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
            arrows. During a step the outgoing trio (rendered first, so it sits
            under) fades out while the incoming fades in on top. */}
        {/* Wrapper owns sizing + the arrows; the reveal-clipped .stage inside
            holds only the crossfading cutouts, so the arrows can straddle the
            portrait edges on mobile without the wipe clip slicing them. Swipe
            is bound here so it covers the arrows' area too. */}
        <div
          className={s.stageWrap}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div data-reveal-item className={s.stage}>
            {outgoing && (
              <Trio
                key={`fig-out-${prev}`}
                {...outgoing}
                className={cn(s.figures, s.exit)}
                hidden
              />
            )}
            <Trio
              key={`fig-in-${index}`}
              {...current}
              // Enter animation only on a real step — never on first mount,
              // where the wipe reveal already owns the entrance.
              className={cn(s.figures, prev !== null && s.enter)}
            />
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

        {/* Details for the active member. aria-live announces the switch; the
            outgoing copy is aria-hidden so only the incoming is read. The
            incoming layer stays in flow (it sizes the column); the outgoing is
            an absolute overlay fading out on top of it. */}
        <div data-reveal-item className={s.text} aria-live="polite">
          {outgoing && (
            <Details
              key={`txt-out-${prev}`}
              member={outgoing.featured}
              certLabels={content.certLabels}
              className={cn(s.details, s.exit)}
              hidden
            />
          )}
          <Details
            key={`txt-in-${index}`}
            member={current.featured}
            certLabels={content.certLabels}
            className={cn(s.details, prev !== null && s.enter)}
          />
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

// One coverflow trio (featured + two plum-tinted neighbours). Purely decorative
// — every image is alt="" — so the whole group can be aria-hidden while it fades
// out. Peers request the same size bucket as the featured slot (displayed
// smaller) so a promoted neighbour reuses the already-fetched variant.
function Trio({
  featured,
  leftPeer,
  rightPeer,
  className,
  hidden,
}: {
  featured: Member
  leftPeer: Member
  rightPeer: Member
  className?: string
  hidden?: boolean
}) {
  return (
    <div className={className} aria-hidden={hidden || undefined}>
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
  )
}

// The name / role / certs / bio block for the active member.
function Details({
  member,
  certLabels,
  className,
  hidden,
}: {
  member: Member
  certLabels: LocalizedONas['oNasTeam']['certLabels']
  className?: string
  hidden?: boolean
}) {
  const certs = 'certs' in member ? member.certs : undefined
  const link = 'link' in member ? member.link : undefined
  return (
    <div className={className} aria-hidden={hidden || undefined}>
      <p className={s.nameSmall}>{member.given}</p>
      <p className={cn('h2', s.nameBig)}>{member.surname}</p>
      <p className={s.role}>{member.role}</p>
      {certs && certs.length > 0 && (
        <ul className={s.certs}>
          {certs.map((raw) => {
            // `Localized` widens content string literals to `string` so the EN
            // module can carry real translations. A cert key is an identifier
            // rather than copy, so this is the one place that has to be undone.
            const key = raw as CertKey
            const mark = CERT_MARKS[key]
            return (
              <li key={key} className={s.cert}>
                <Image
                  src={mark.src}
                  alt={certLabels[key]}
                  width={mark.width}
                  height={mark.height}
                  objectFit="contain"
                />
              </li>
            )
          })}
        </ul>
      )}
      <p className={s.bio}>{member.bio}</p>
      {link && (
        // The outgoing layer is inert (aria-hidden) but still in the DOM during
        // the crossfade, so its link must leave the tab order too — otherwise
        // Tab can land on a control that is fading out.
        <p className={s.link}>
          <Link href={link.href} tabIndex={hidden ? -1 : undefined}>
            {link.label}
          </Link>
        </p>
      )}
    </div>
  )
}
