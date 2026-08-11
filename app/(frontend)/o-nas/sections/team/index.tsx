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
 * step-to-step swap is a true crossfade (see Slider below).
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

// The background peers are washed by re-drawing the peer's own photo through
// this filter (see Peer). Kept in sync with `.peerWash`'s `filter: url(...)` in
// team.module.css — the id is a plain literal in this file rather than an
// import, so nothing has to reach through a 'use client' barrel to name it.
const PEER_WASH_FILTER_ID = 'onas-peer-wash'

// Every cutout render — warmers, featured, peers and their washes — asks for
// the same variant, and shares one declaration so it stays that way. Peers are
// displayed smaller than the featured slot but request its bucket anyway, so a
// promoted neighbour reuses the already-fetched variant; the warmers fetch that
// same bucket up front; and the wash layer depends on it outright, since an
// identical src/sizes pair is what resolves to one URL and one cache entry.
const CUTOUT_IMAGE_PROPS = {
  alt: '',
  fill: true,
  objectFit: 'contain',
  mobileSize: '60vw',
  desktopSize: '30vw',
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

export function Team({ content }: { content: LocalizedONas['oNasTeam'] }) {
  // "ZESPÓŁ SOCIAL LAMA" → "ZESPÓŁ" / "SOCIAL LAMA" (two lines, per the mock).
  const [headLead, ...headRest] = content.heading.split(' ')

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

      {/* The `?lama=` deep link must be applied in the same render commit the
          navigation paints: a post-commit swap (the old effect chain) flashed
          member one before the linked member appeared (spike, 2026-08-04).
          So the param read wraps the slider itself. The Suspense boundary is
          still what keeps `useSearchParams` from punching a CSR hole in the
          prerendered page — but its fallback is the slider at member one,
          byte-for-byte the markup a param-less render produces, so the team
          section stays complete in the static shell (onas-team spec). */}
      <Suspense fallback={<Slider content={content} slug={null} />}>
        <DeepLinkedSlider content={content} />
      </Suspense>

      {/* Off-screen warmers: fetch every member once (below the fold, before the
          first click) at the exact variant the coverflow renders, so stepping
          the slider never waits on a network round-trip. ~32 KB WebP each. */}
      <div className={s.preload} aria-hidden="true">
        {content.members.map((m) => (
          <Image
            key={m.photo}
            src={m.photo}
            {...CUTOUT_IMAGE_PROPS}
            loading="eager"
          />
        ))}
      </div>

      <PeerWashFilter />
    </section>
  )
}

/*
 * The peer duotone, as a filter rather than a mask.
 *
 * Zeroed RGB rows with constant offsets discard every pixel's colour and
 * replace it with one flat value; the alpha row passes through untouched, so
 * the figure's own silhouette survives and gets filled — exactly what the old
 * `::after` + `mask-image` produced, but computed from pixels the page has
 * already loaded (see Peer for why that matters).
 *
 * The offsets are `color-mix(in srgb, var(--color-primary) 60%, #d1568c)`
 * resolved against the plum theme (`--color-primary: #913155`) → rgb(170.6,
 * 63.8, 107), divided by 255. They are baked, not live: if brand plum moves,
 * re-derive them here.
 *
 * `color-interpolation-filters="sRGB"` is load-bearing — the SVG default is
 * linearRGB, which would read these sRGB offsets in linear space and paint the
 * wash markedly lighter than the colour it replaces.
 */
function PeerWashFilter() {
  return (
    <svg className={s.filterDefs} aria-hidden="true" role="presentation">
      <filter id={PEER_WASH_FILTER_ID} colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6690  0 0 0 0 0.2502  0 0 0 0 0.4196  0 0 0 1 0"
        />
      </filter>
    </svg>
  )
}

// Reads `?lama=` and renders the slider with it. During client-side
// navigation renders the param is available synchronously, so the slider's
// first committed frame already features the deep-linked member.
function DeepLinkedSlider({ content }: { content: LocalizedONas['oNasTeam'] }) {
  const slug = useSearchParams().get('lama')
  return <Slider content={content} slug={slug} />
}

function Slider({
  content,
  slug,
}: {
  content: LocalizedONas['oNasTeam']
  /** Cutout slug from `?lama=`, or null when absent (and in the prerendered
   *  fallback, where a URL param can never influence static markup). */
  slug: string | null
}) {
  const revealRef = useReveal<HTMLDivElement>()
  const reducedMotion = usePreferredReducedMotion()
  const members = content.members
  const count = members.length

  // Unknown or absent slug changes nothing: -1 falls back to member one on
  // mount and keeps the current member on a repeat visit.
  const indexFor = (value: string | null) =>
    value ? members.findIndex((m) => slugOf(m.photo) === value) : -1

  const [index, setIndex] = useState(() => Math.max(0, indexFor(slug)))
  // `prev` is the outgoing member index during a step — non-null only while the
  // crossfade runs, so both slides are mounted and can dissolve past each other
  // (no blank frame). `busyRef` locks the arrows for that window so a fast
  // double-click can't leave a half-faded ghost mounted.
  const [prev, setPrev] = useState<number | null>(null)
  const busyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Start point of an in-progress touch, for the swipe gesture (mobile).
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // Deep link while the page stays mounted (Next keeps it alive across
  // navigations): apply the changed param DURING render — the adjust-state-on-
  // prop-change pattern — so the same commit the navigation paints already
  // features the member. An instant swap — no crossfade layer, no arrow lock —
  // because there is nothing to fade *from*.
  const [appliedSlug, setAppliedSlug] = useState(slug)
  if (slug !== appliedSlug) {
    setAppliedSlug(slug)
    const target = indexFor(slug)
    if (target >= 0) {
      setIndex(target)
      setPrev(null)
    }
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

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
  )
}

// One coverflow trio (featured + two plum-tinted neighbours). Purely decorative
// — every image is alt="" — so the whole group can be aria-hidden while it fades
// out.
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
      <Peer member={leftPeer} side={s.peerLeft} />
      <Peer member={rightPeer} side={s.peerRight} />
      <span className={cn(s.photo, s.featured)}>
        <Image src={featured.photo} {...CUTOUT_IMAGE_PROPS} />
      </span>
    </div>
  )
}

// A background neighbour: the photo, and over it the very same image drawn a
// second time through PeerWashFilter, which is what tints it.
//
// The two layers deliberately share every prop, so they resolve to one
// optimized URL and one cache entry: the wash cannot paint later than the photo
// it is meant to cover, because they are the same bytes. The mask this replaced
// pointed at the raw `/o-nas/slider/*.png` — a resource nothing else on the
// page loads — so on a cold cache the photo arrived first and the peer flashed
// full-colour before snapping to plum.
function Peer({
  member,
  side,
}: {
  member: Member
  /** `.peerLeft` / `.peerRight` — the CSS-module lookup that places it. */
  side: string | undefined
}) {
  return (
    <span className={cn(s.photo, s.peer, side)} aria-hidden="true">
      <Image src={member.photo} {...CUTOUT_IMAGE_PROPS} />
      <Image
        src={member.photo}
        {...CUTOUT_IMAGE_PROPS}
        className={s.peerWash}
      />
    </span>
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
