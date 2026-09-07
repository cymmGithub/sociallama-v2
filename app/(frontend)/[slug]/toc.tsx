'use client'

import { useLenis } from 'lenis/react'
import { type MouseEvent, useEffect, useRef } from 'react'
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
 * Open every `details` the target sits inside, before anything scrolls to it.
 *
 * An FAQ question's anchor is on its `details` (see `PostFaq`), and browsers
 * do reveal an anchor inside a closed one on their own — but only for a NATIVE
 * fragment navigation. Lenis drives this page's scrolling, so a
 * table-of-contents jump bypasses that entirely and would land on a closed row
 * with the answer still hidden. Opening first also means the scroll is
 * computed against the row's final height rather than its collapsed one.
 */
function revealTarget(target: HTMLElement): void {
  let node: HTMLElement | null = target
  while (node) {
    const details: HTMLDetailsElement | null = node.closest('details')
    if (!details) {
      return
    }
    details.open = true
    node = details.parentElement
  }
}

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
  const listRef = useRef<HTMLOListElement>(null)
  const [activeSlug, setActiveSlug] = useCurrentSection({
    ids: entries.map((entry) => entry.slug),
    offset: headerOffset,
  })

  const activeIndex = entries.findIndex((entry) => entry.slug === activeSlug)

  /*
   * The guide line's fill, in pixels down the list.
   *
   * Measured from the DOM rather than computed from the index: the entries are
   * different heights (an `h3` sets smaller, a long heading wraps to two
   * lines), so "index × row height" would drift a few pixels further off with
   * every entry. `offsetTop` is relative to the list, which is the offset
   * parent — `.tocList` is `position: relative` for exactly this — and it is
   * measured inside the list's own scrollport, so a long table of contents
   * scrolling its content moves the fill with it.
   */
  useEffect(() => {
    const list = listRef.current
    if (!list) {
      return
    }
    const item = list.children[activeIndex] as HTMLElement | undefined
    list.style.setProperty(
      '--toc-fill',
      item ? `${item.offsetTop + item.offsetHeight}px` : '0px'
    )
  }, [activeIndex])

  // A direct `/{slug}#pytanie` landing is the browser's own scroll, so it
  // reaches the closed row correctly — the anchor is the `details`, whose
  // summary is always visible. What it does not do is open it, and an answer
  // the reader was linked to should be readable on arrival.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    const target = id ? document.getElementById(id) : null
    if (target) {
      revealTarget(target)
    }
  }, [])

  const handleClick = (event: MouseEvent<HTMLElement>, slug: string) => {
    const target = document.getElementById(slug)
    if (!target) {
      // Nothing to scroll to — let the browser handle the href as-is.
      return
    }
    // Lenis drives page scrolling; letting the browser jump natively would
    // fight it, so take the click over entirely.
    event.preventDefault()
    revealTarget(target)
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
    <ol className={s.tocList} ref={listRef}>
      {entries.map((entry, index) => (
        <li key={entry.slug}>
          <Link
            className={entry.level === 3 ? s.tocLinkNested : s.tocLink}
            href={`#${entry.slug}`}
            onClick={(event) => handleClick(event, entry.slug)}
            {...(activeSlug === entry.slug ? { 'aria-current': true } : {})}
            {...(activeIndex > index ? { 'data-passed': true } : {})}
          >
            {entry.text}
          </Link>
        </li>
      ))}
    </ol>
  )
}
