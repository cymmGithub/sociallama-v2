'use client'

import { useLenis } from 'lenis/react'
import { useState } from 'react'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './post.module.css'

/**
 * How much of the post is left, beside the rail's table-of-contents label
 * (design D6).
 *
 * There is deliberately no second progress surface — no bar at the edge of the
 * viewport. The site header hides on scroll-down to give the body the screen,
 * and a bar pinned to the top would either need an exception to that or would
 * scroll away with it; the rail is already the page's "where am I" furniture,
 * so the number goes there.
 *
 * The fraction is read off the BODY's box rather than the document's: the
 * article is followed by an author card, a share row and a related-posts grid,
 * and counting those would report the post half-read at its last paragraph.
 */

/** Where in the viewport a line counts as read — eye level, not the top. */
const READ_LINE = 0.6

/** The body element to measure. Set by `post-article.tsx` on the same div. */
const BODY_SELECTOR = '[data-post-body]'

export function ReadingProgress({
  content,
  readingTime,
}: {
  content: Localized<typeof pl.postToc>
  /** The post's own estimate, in minutes. Null when there is no body. */
  readingTime: number | null
}) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useLenis(() => {
    if (readingTime === null) {
      return
    }
    const body = document.querySelector<HTMLElement>(BODY_SELECTOR)
    if (!body) {
      return
    }
    const rect = body.getBoundingClientRect()
    if (rect.height === 0) {
      return
    }
    const read = (window.innerHeight * READ_LINE - rect.top) / rect.height
    const fraction = Math.min(1, Math.max(0, read))
    // Ceil, not round: at the very top this has to return the post's own
    // estimate rather than a minute less than it, and the estimate is what the
    // header already showed the reader.
    setRemaining(Math.ceil(readingTime * (1 - fraction)))
  }, [readingTime])

  // Nothing until the first scroll frame: server and client would otherwise
  // have to agree on a viewport height, and they cannot.
  if (remaining === null) {
    return null
  }

  return (
    <span className={s.railRemaining}>
      {remaining === 0
        ? content.finished
        : content.remaining.replace('{minutes}', () => String(remaining))}
    </span>
  )
}
