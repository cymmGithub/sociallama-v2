'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/lib/i18n/slug-map'

/**
 * Count-up metric value. Renders the final value on the server (correct with
 * JS disabled / before hydration), then animates 0 → target the first time it
 * scrolls into view. Respects `prefers-reduced-motion` (shows the final value,
 * no animation).
 *
 * The source values are hand-formatted strings — a prefix (`+`), a number, and
 * a unit suffix (` mln`, `M`, ` tys.`, `k`). Their separators follow the
 * locale the study was authored in, and the two conventions collide:
 *
 *   pl  1,28 mln   788 753     comma decimal, space grouping
 *   en  1.28M      788,753     period decimal, comma grouping
 *
 * So the separators cannot be sniffed from the string — `1,280` is one
 * thousand two hundred eighty in English and one-point-two-eight in Polish.
 * The locale is therefore passed in explicitly, and both parsing and the
 * `Intl.NumberFormat` locale derive from it, so grouping and the decimal mark
 * stay correct at every frame in both languages.
 */

const DURATION_MS = 1400

// easeOutExpo — fast start, gentle settle; the familiar "data counter" feel.
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t))

interface Parsed {
  prefix: string
  number: number
  suffix: string
  decimals: number
}

const NUMBER_FORMAT_LOCALE: Record<Locale, string> = {
  pl: 'pl-PL',
  en: 'en-US',
}

/** Exported for unit tests — see count-up.test.ts. */
export function parseValue(value: string, locale: Locale): Parsed | null {
  const prefix = value.match(/^\D*/)?.[0] ?? ''
  const rest = value.slice(prefix.length)
  const numStr = rest.match(/^\d+(?:[\s.,]\d+)*/)?.[0]
  if (!numStr) {
    return null
  }
  const suffix = rest.slice(numStr.length)

  // Polish groups with (possibly non-breaking) spaces and marks decimals with a
  // comma; English groups with commas and marks decimals with a period.
  const decimalSep = locale === 'pl' ? ',' : '.'
  const groupSep = locale === 'pl' ? /[\s ]/g : /,/g

  const decIdx = numStr.lastIndexOf(decimalSep)
  const decimals = decIdx >= 0 ? numStr.length - decIdx - 1 : 0

  const grouped = numStr.replace(groupSep, '')
  const number = Number(locale === 'pl' ? grouped.replace(',', '.') : grouped)
  if (Number.isNaN(number)) {
    return null
  }
  return { prefix, number, suffix, decimals }
}

export function CountUp({
  value,
  className,
  locale,
}: {
  value: string
  className: string | undefined
  locale: Locale
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const parsed = parseValue(value, locale)
    const node = ref.current
    if (!(parsed && node)) {
      return
    }
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const format = new Intl.NumberFormat(NUMBER_FORMAT_LOCALE[locale], {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    })
    const render = (n: number) =>
      `${parsed.prefix}${format.format(n)}${parsed.suffix}`

    // Reset to zero before the first paint of the animation (the tile is below
    // the fold, so this is never visible as a flash).
    setDisplay(render(0))

    let raf = 0
    let start = 0
    const step = (now: number) => {
      if (!start) {
        start = now
      }
      const t = Math.min((now - start) / DURATION_MS, 1)
      setDisplay(render(parsed.number * easeOutExpo(t)))
      if (t < 1) {
        raf = requestAnimationFrame(step)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect()
          raf = requestAnimationFrame(step)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, locale])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
