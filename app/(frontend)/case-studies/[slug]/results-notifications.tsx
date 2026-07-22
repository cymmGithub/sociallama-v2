'use client'

import { Bell, RotateCcw } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'
import { usePreferredReducedMotion } from '@/lib/hooks'
import s from './case-study.module.css'
import { CountUp } from './count-up'

interface ResultItem {
  platform: string
  metric: string
  value: string
}

type BandStrings = LocalizedCaseStudies['caseStudyChrome']['resultsBand']

/* Real network marks in their own brand colors, as lock-screen app tiles.
 * Inline (not the CMS `social-platforms` logos): those are the site's
 * plum-toned marks, wrong vocabulary for an app icon. */
const NETWORK_ICONS: Record<string, ReactNode> = {
  tiktok: (
    <svg viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" fill="#010101" />
      <g transform="translate(7 6)">
        <path
          d="M13.2 0c.35 2.1 1.85 3.75 4.3 4.1v3.4c-1.6 0-3-.5-4.3-1.3v7.1c0 4.05-2.85 6.8-6.6 6.8C3.1 20.1.2 17.5.2 13.7c0-3.7 3-6.5 6.85-6.3v3.6c-1.75-.3-3.3.9-3.3 2.65 0 1.65 1.3 2.85 2.95 2.85 1.75 0 3.1-1.2 3.1-3.3V0h3.4Z"
          fill="#25f4ee"
          transform="translate(-1 -0.6)"
        />
        <path
          d="M13.2 0c.35 2.1 1.85 3.75 4.3 4.1v3.4c-1.6 0-3-.5-4.3-1.3v7.1c0 4.05-2.85 6.8-6.6 6.8C3.1 20.1.2 17.5.2 13.7c0-3.7 3-6.5 6.85-6.3v3.6c-1.75-.3-3.3.9-3.3 2.65 0 1.65 1.3 2.85 2.95 2.85 1.75 0 3.1-1.2 3.1-3.3V0h3.4Z"
          fill="#fe2c55"
          transform="translate(1 .6)"
        />
        <path
          d="M13.2 0c.35 2.1 1.85 3.75 4.3 4.1v3.4c-1.6 0-3-.5-4.3-1.3v7.1c0 4.05-2.85 6.8-6.6 6.8C3.1 20.1.2 17.5.2 13.7c0-3.7 3-6.5 6.85-6.3v3.6c-1.75-.3-3.3.9-3.3 2.65 0 1.65 1.3 2.85 2.95 2.85 1.75 0 3.1-1.2 3.1-3.3V0h3.4Z"
          fill="#fff"
        />
      </g>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" fill="#f00" />
      <path d="m14 11.1 8 5.5-8 5.5Z" fill="#fff" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 34 34" aria-hidden="true">
      <defs>
        <radialGradient id="cs-ig-tile" cx="0.3" cy="1.1" r="1.3">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.35" stopColor="#fd5949" />
          <stop offset="0.65" stopColor="#d6249f" />
          <stop offset="1" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="34" height="34" fill="url(#cs-ig-tile)" />
      <rect
        x="8"
        y="8"
        width="18"
        height="18"
        rx="5.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle
        cx="17"
        cy="17"
        r="4.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="22.6" cy="11.4" r="1.5" fill="#fff" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" fill="#1877f2" />
      <path
        d="M19 28v-8.4h2.9l.45-3.4H19v-2.1c0-.98.3-1.65 1.7-1.65h1.75V9.4c-.3-.04-1.35-.13-2.55-.13-2.55 0-4.3 1.55-4.3 4.4v2.55h-2.9v3.4h2.9V28Z"
        fill="#fff"
      />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" fill="#0a66c2" />
      <circle cx="11" cy="11" r="2.1" fill="#fff" />
      <rect x="9.3" y="14.6" width="3.4" height="10.4" fill="#fff" />
      <path
        d="M15.9 14.6h3.3v1.5c.55-.95 1.8-1.8 3.5-1.8 2.75 0 4.2 1.6 4.2 4.6V25h-3.4v-5.1c0-1.4-.6-2.3-1.8-2.3-1.15 0-1.9.85-1.9 2.3V25h-3.9Z"
        fill="#fff"
      />
    </svg>
  ),
}

/** Approximate magnitude of a hand-formatted value ("11 mln", "+7.9k") so the
 *  metric list can lead with the biggest number. Suffixes cover both locales. */
function magnitude(value: string): number {
  const num = Number(
    value
      .match(/\d+(?:[\s.,]\d+)*/)?.[0]
      ?.replace(/\s/g, '')
      .replace(',', '.') ?? ''
  )
  if (!Number.isFinite(num)) return 0
  const suffix = value.toLowerCase()
  if (suffix.includes('mln') || suffix.includes('m')) return num * 1_000_000
  if (suffix.includes('tys') || suffix.includes('k')) return num * 1_000
  return num
}

/** Lowercase a metric's first letter for mid-sentence use. */
const midSentence = (metric: string) =>
  metric.charAt(0).toLowerCase() + metric.slice(1)

/** Fill a notification template, bolding the value. */
function fillTemplate(template: string, item: ResultItem) {
  return template.split(/(?<token>\{value\}|\{metric\})/).map((part, index) => {
    if (part === '{value}') {
      // biome-ignore lint/suspicious/noArrayIndexKey: static template segments
      return <b key={index}>{item.value}</b>
    }
    if (part === '{metric}') {
      const atStart = template.startsWith('{metric}')
      const label = atStart ? item.metric : midSentence(item.metric)
      // biome-ignore lint/suspicious/noArrayIndexKey: static template segments
      return <span key={index}>{label}</span>
    }
    return part
  })
}

/** Match a metric to its network icon: platform name first, metric text second
 *  (Volvo: the sender is the dealership, the network sits in the metric). */
function iconFor(item: ResultItem): ReactNode {
  const haystack = `${item.platform} ${item.metric}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  for (const key of Object.keys(NETWORK_ICONS)) {
    if (haystack.includes(key)) return NETWORK_ICONS[key]
  }
  return <Bell size={18} aria-hidden="true" />
}

const STAGGER_MS = 260

/**
 * The "Wyniki" section body: an editorial metric list (the crawlable payload,
 * orange count-up values on the page's cream ground) beside a phone lock
 * screen — wallpaper = the study's cover under a dark scrim — filling with one
 * push notification per metric. The caption under the phone doubles as the
 * replay control. Reduced motion renders the final state, with the caption as
 * plain text.
 */
export function ResultsNotifications({
  results,
  coverUrl,
  strings,
}: {
  results: ResultItem[]
  coverUrl?: string | undefined
  strings: BandStrings
}) {
  const reducedMotion = usePreferredReducedMotion()
  const phoneRef = useRef<HTMLDivElement>(null)
  // `run` remounts the stack so transition-delays restart; 0 = not yet played.
  const [run, setRun] = useState(0)
  // Played is stamped a frame after the (re)mount so the entrance transition
  // actually fires — setting it synchronously would skip the initial state.
  const [played, setPlayed] = useState(false)

  const sorted = [...results].sort(
    (a, b) => magnitude(b.value) - magnitude(a.value)
  )

  // First play when the phone scrolls into view.
  useEffect(() => {
    if (reducedMotion) return
    const phone = phoneRef.current
    if (!phone) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect()
            setRun(1)
          }
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(phone)
    return () => observer.disconnect()
  }, [reducedMotion])

  // Each run: reset, wait a frame so the remounted stack paints its hidden
  // state, then flip `played` to fire the stagger.
  useEffect(() => {
    if (run === 0) return
    setPlayed(false)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPlayed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [run])

  if (sorted.length === 0) return null

  return (
    <div className={s.resultsGrid}>
      <ul className={s.metricList}>
        {sorted.map((item) => (
          <li key={`${item.platform}-${item.metric}`} className={s.metricRow}>
            <CountUp className={s.metricValue} value={item.value} />
            <span className={s.metricMeta}>
              <span className={s.metricName}>{item.metric}</span>
              <span className={s.metricPlatform}>{item.platform}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={s.resultsMedia}>
        <div className={s.phone} ref={phoneRef}>
          <div className={s.phoneScreen}>
            {coverUrl && (
              <Image
                src={coverUrl}
                alt=""
                fill
                objectFit="cover"
                mobileSize="90vw"
                desktopSize="26vw"
                className={s.wallpaper}
              />
            )}
            <div className={s.scrim} aria-hidden="true" />
            <div className={s.island} aria-hidden="true" />
            <div className={s.lockClock} aria-hidden="true">
              <div className={s.lockTime}>{strings.clock}</div>
              <div className={s.lockDate}>{strings.clockDate}</div>
            </div>
            <ul
              className={s.notifStack}
              key={run}
              data-played={reducedMotion || played ? '' : undefined}
            >
              {sorted.map((item, index) => {
                const template =
                  strings.notifTemplates[
                    index % strings.notifTemplates.length
                  ] ?? ''
                return (
                  <li
                    key={`${item.platform}-${item.metric}`}
                    className={s.notif}
                    style={{ transitionDelay: `${index * STAGGER_MS}ms` }}
                  >
                    <span className={s.notifApp}>{iconFor(item)}</span>
                    <span className={s.notifBody}>
                      <span className={s.notifFrom}>{item.platform}</span>
                      <span className={s.notifMsg}>
                        {fillTemplate(template, item)}
                      </span>
                    </span>
                    <span className={s.notifWhen}>{strings.now}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        {reducedMotion ? (
          <p className={s.phoneCaption}>{strings.replay}</p>
        ) : (
          <button
            type="button"
            className={s.replayLink}
            onClick={() => setRun((count) => count + 1)}
          >
            <RotateCcw size={13} aria-hidden="true" />
            {strings.replay}
          </button>
        )}
      </div>
    </div>
  )
}
