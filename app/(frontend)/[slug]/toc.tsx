'use client'

import { useLenis } from 'lenis/react'
import type { MouseEvent } from 'react'
import { Link } from '@/components/ui/link'
import type { TocEntry } from '@/lib/blog/toc'
import { useCurrentSection } from '@/lib/hooks'
import s from './post.module.css'

/**
 * Table of contents with active-section tracking.
 *
 * The header offset is never hardcoded here: it's read back from the target
 * heading's computed `scroll-margin-top`. That keeps one source of truth in
 * post.module.css, shared with the two paths this component doesn't control —
 * a direct `/{slug}#heading` landing and no-JS anchor clicks, both of which use
 * `scroll-margin-top` natively (design D4).
 */

/**
 * Resolved px offset a heading wants above itself to clear the fixed header.
 *
 * Exported because the case-study section rail asks the same question of the
 * same contract: the number lives in CSS as `scroll-margin-top`, so a direct
 * `#heading` landing and a no-JS anchor click get it natively, and anything
 * driving the scroll itself has to read it back rather than hardcode it.
 */
export function headerOffset(target: HTMLElement): number {
  const value = Number.parseFloat(
    getComputedStyle(target).scrollMarginTop || '0'
  )
  return Number.isFinite(value) ? value : 0
}

export function Toc({ entries }: { entries: readonly TocEntry[] }) {
  const lenis = useLenis()
  const [activeSlug, setActiveSlug] = useCurrentSection({
    ids: entries.map((entry) => entry.slug),
    offset: headerOffset,
  })

  const handleClick = (event: MouseEvent<HTMLElement>, slug: string) => {
    const target = document.getElementById(slug)
    if (!target) {
      // Nothing to scroll to — let the browser handle the href as-is.
      return
    }
    // Lenis drives page scrolling; letting the browser jump natively would
    // fight it, so take the click over entirely.
    event.preventDefault()
    if (lenis) {
      lenis.scrollTo(target, { offset: -headerOffset(target) })
    } else {
      target.scrollIntoView()
    }
    // replaceState, not push: a table-of-contents jump shouldn't add a history
    // entry the back button has to walk out of.
    window.history.replaceState(null, '', `#${slug}`)
    setActiveSlug(slug)
  }

  return (
    <ol className={s.tocList}>
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link
            className={entry.level === 3 ? s.tocLinkNested : s.tocLink}
            href={`#${entry.slug}`}
            onClick={(event) => handleClick(event, entry.slug)}
            {...(activeSlug === entry.slug ? { 'aria-current': true } : {})}
          >
            {entry.text}
          </Link>
        </li>
      ))}
    </ol>
  )
}
