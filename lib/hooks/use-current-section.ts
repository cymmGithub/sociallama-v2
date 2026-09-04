'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Which of a set of in-page sections the reader is currently in.
 *
 * Two rails ask this — the blog post's table of contents and the case-study
 * section rail — and they were two copies of the same twenty lines, one of
 * which already carried a fix the other did not.
 *
 * The observer is only a trigger: it fires as each target crosses the header
 * line, and the answer is then re-derived from live rects. That matters more
 * than it looks — an observer's own `rootMargin` is a resize behind, so
 * reading `isIntersecting` directly gives a stale answer once the viewport
 * changes. The last target whose top has passed the line is the section.
 *
 * `scope` says where to resolve the ids. The case-study rail returns its own
 * `<article>`, because Next's Activity keeps the previous page mounted across
 * a navigation: between two studies there are briefly two `#wyniki` elements,
 * and a document-wide lookup would mark the other page's headings. The blog
 * returns nothing and gets the document.
 *
 * The setter comes back with the answer because both rails also set it
 * directly — clicking an entry marks it without waiting for the scroll.
 */
export function useCurrentSection({
  ids,
  offset,
  scope,
}: {
  /** Element ids to track, in document order. */
  ids: readonly string[]
  /** Px above a target that counts as "reached" — the fixed header's cut. */
  offset: (target: HTMLElement) => number
  /** Subtree to resolve the ids in. Defaults to the whole document. */
  scope?: () => ParentNode | null | undefined
}): [string | null, (id: string) => void] {
  const [current, setCurrent] = useState<string | null>(null)

  // Read through refs so a caller may pass inline closures — `scope` usually
  // is one, since it reads a ref — without rebuilding the observer on every
  // render. The ids are the only thing that should tear it down.
  const offsetRef = useRef(offset)
  offsetRef.current = offset
  const scopeRef = useRef(scope)
  scopeRef.current = scope

  // Derived key rather than the array: a fresh identity every render would
  // tear the observer down and rebuild it for nothing.
  const idKey = ids.join(',')

  useEffect(() => {
    const root = scopeRef.current?.() ?? document
    if (!root) {
      return
    }
    const targets = idKey
      .split(',')
      .filter(Boolean)
      .map((id) => root.querySelector<HTMLElement>(`[id="${id}"]`))
      .filter((element): element is HTMLElement => element !== null)

    const first = targets[0]
    if (!first) {
      return
    }

    const update = () => {
      const line = offsetRef.current(first) + 1
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
      rootMargin: `-${offsetRef.current(first)}px 0px 0px 0px`,
    })
    for (const target of targets) {
      observer.observe(target)
    }
    update()

    return () => observer.disconnect()
  }, [idKey])

  return [current, setCurrent]
}
