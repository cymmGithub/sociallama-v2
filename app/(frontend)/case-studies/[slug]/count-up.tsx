'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Count-up metric value. Renders the final value on the server (correct with
 * JS disabled / before hydration), then animates 0 → target the first time it
 * scrolls into view. Respects `prefers-reduced-motion` (shows the final value,
 * no animation).
 *
 * The source values are hand-formatted Polish strings — a prefix (`+`), a
 * number that may use a space thousands separator and a comma decimal, and a
 * unit suffix (` mln`, ` tys.`). We parse those three parts, animate the
 * number, and re-format it with `Intl.NumberFormat('pl-PL')` so grouping and
 * the decimal comma stay correct at every frame.
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

function parseValue(value: string): Parsed | null {
  const prefix = value.match(/^\D*/)?.[0] ?? ''
  const rest = value.slice(prefix.length)
  const numStr = rest.match(/^\d+(?:[\s.,]\d+)*/)?.[0]
  if (!numStr) {
    return null
  }
  const suffix = rest.slice(numStr.length)
  const commaIdx = numStr.indexOf(',')
  const decimals = commaIdx >= 0 ? numStr.length - commaIdx - 1 : 0
  const number = Number(numStr.replace(/\s/g, '').replace(',', '.'))
  return { prefix, number, suffix, decimals }
}

export function CountUp({
  value,
  className,
}: {
  value: string
  className: string | undefined
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const parsed = parseValue(value)
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

    const format = new Intl.NumberFormat('pl-PL', {
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
  }, [value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
