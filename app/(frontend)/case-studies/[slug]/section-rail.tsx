'use client'

import { useLenis } from 'lenis/react'
import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { headerOffset } from '@/app/(frontend)/[slug]/toc'
import { Link } from '@/components/ui/link'
import { useIsDesktop } from '@/lib/hooks'
import s from './case-study.module.css'

/**
 * The article's sticky section index.
 *
 * Two things separate this from the blog's table of contents, which is
 * otherwise the same idea:
 *
 * 1. It resolves its targets inside its own `<article>`, not through
 *    `document.getElementById`. Next 16's Activity keeps the previous page
 *    mounted across a navigation, so between two case studies there are
 *    briefly two `#wyniki` elements in the document — a document-wide lookup
 *    would hand this rail the other study's headings and mark a section the
 *    reader cannot see. `closest('article')` is how a client child reaches a
 *    server-rendered ancestor; each rail finds the article it lives in.
 *
 * 2. It does not render at all below the desktop breakpoint, rather than
 *    hiding with CSS. A hidden rail still observes, and on mobile there is no
 *    column for it to live in — so there is nothing to keep in sync.
 *
 * The header offset is read back from the target's computed
 * `scroll-margin-top` — via the blog TOC's `headerOffset`, which asks the same
 * question of the same contract — so `case-study.module.css` stays the single
 * source for it and a direct `/case-studies/x#wyniki` landing lands in the
 * same place.
 */

export interface RailSection {
  /** The heading's existing element id. */
  id: string
  label: string
}

/**
 * The desktop gate is a separate component from the rail itself, rather than
 * an early return inside it, so that mounting the rail and starting its
 * observer are the same event. With one component the observer's effect would
 * run on the hydration render — where `useIsDesktop` still reports the
 * mobile-first server snapshot and there is no rail in the DOM to observe —
 * and would not run again on the desktop re-render that follows.
 */
export function SectionRail(props: {
  sections: RailSection[]
  label: string
  aria: string
}) {
  const isDesktop = useIsDesktop()
  return isDesktop && props.sections.length > 0 ? <Rail {...props} /> : null
}

function Rail({
  sections,
  label,
  aria,
}: {
  sections: RailSection[]
  label: string
  aria: string
}) {
  const navRef = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState<string | null>(null)
  const lenis = useLenis()

  // Derived key rather than the array: a fresh identity every render would
  // tear the observer down and rebuild it for nothing.
  const idKey = sections.map((section) => section.id).join(',')

  useEffect(() => {
    const article = navRef.current?.closest('article')
    if (!article) {
      return
    }
    const targets = idKey
      .split(',')
      .map((id) => article.querySelector<HTMLElement>(`[id="${id}"]`))
      .filter((element): element is HTMLElement => element !== null)

    const first = targets[0]
    if (!first) {
      return
    }

    // The last heading whose top has passed the header line is the section the
    // reader is in. Recomputed from live rects on every trigger, so the answer
    // survives a resize the observer's own margin has not caught up with.
    const update = () => {
      const line = headerOffset(first) + 1
      let now = first.id
      for (const target of targets) {
        if (target.getBoundingClientRect().top > line) {
          break
        }
        now = target.id
      }
      setCurrent(now)
    }

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${headerOffset(first)}px 0px 0px 0px`,
    })
    for (const target of targets) {
      observer.observe(target)
    }
    update()

    return () => observer.disconnect()
  }, [idKey])

  const handleClick = (event: MouseEvent<HTMLElement>, id: string) => {
    const target = navRef.current
      ?.closest('article')
      ?.querySelector<HTMLElement>(`[id="${id}"]`)
    if (!target) {
      // Nothing to scroll to — let the browser handle the href as it is.
      return
    }
    // Lenis drives page scrolling; a native jump would fight it.
    event.preventDefault()
    if (lenis) {
      lenis.scrollTo(target, { offset: -headerOffset(target) })
    } else {
      target.scrollIntoView()
    }
    // replaceState, not push: an in-page jump should not add a history entry
    // the back button has to walk out of.
    window.history.replaceState(null, '', `#${id}`)
    setCurrent(id)
  }

  return (
    <nav aria-label={aria} className={s.rail} ref={navRef}>
      <p className={s.railLabel}>{label}</p>
      <ol className={s.railList}>
        {sections.map((section) => (
          <li key={section.id}>
            <Link
              className={s.railLink}
              href={`#${section.id}`}
              onClick={(event) => handleClick(event, section.id)}
              {...(current === section.id ? { 'aria-current': true } : {})}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
