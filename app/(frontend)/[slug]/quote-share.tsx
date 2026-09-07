'use client'

import cn from 'clsx'
import { useLenis } from 'lenis/react'
import { Check, Copy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from '@/components/ui/link'
import { SocialGlyph } from '@/components/ui/social-glyph'
import social from '@/components/ui/social-links/social-links.module.css'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './post.module.css'

/**
 * Share the sentence you just highlighted (design D8).
 *
 * ## Why it is gated on a fine pointer
 *
 * On touch, selecting text already summons the platform's own bar — Copy,
 * Look Up, Share. A second bar would either cover it or fight it for the space
 * above the selection, and the reader cannot dismiss ours the way they dismiss
 * the system's. So there is simply no toolbar on touch.
 *
 * ## What each destination actually accepts
 *
 * X takes the quote and the URL. LinkedIn's share endpoint takes a URL and
 * nothing else — it has ignored a `text`/`summary` parameter for years — so its
 * button shares the POST, and its label says so rather than promising a quote
 * it will not carry.
 */

/** Below this a "selection" is a stray double-click, not a quote. */
const MIN_QUOTE = 12

/** Gap between the top of the selection and the bottom of the toolbar. */
const OFFSET = 10

interface Quote {
  text: string
  /** Viewport coordinates — the toolbar is `position: fixed`. */
  top: number
  left: number
}

export function QuoteShare({
  title,
  url,
  content,
}: {
  title: string
  /** Absolute post URL — share intents reject relative paths. */
  url: string
  content: Localized<typeof pl.postQuote>
}) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [copied, setCopied] = useState(false)

  const read = useCallback(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return null
    }
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null
    }
    const text = selection.toString().trim()
    if (text.length < MIN_QUOTE) {
      return null
    }
    const range = selection.getRangeAt(0)
    // The rail, the author card and the related grid are all selectable text
    // that is not the post — quoting them would attribute the site's own
    // furniture to the article.
    const body = document.querySelector('[data-post-body]')
    if (!body?.contains(range.commonAncestorContainer)) {
      return null
    }
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      return null
    }
    return { text, top: rect.top - OFFSET, left: rect.left + rect.width / 2 }
  }, [])

  useEffect(() => {
    const update = () => {
      setQuote(read())
      setCopied(false)
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [read])

  // Lenis drives the page, so there is no `scroll` event to listen to and the
  // toolbar would sit at a fixed viewport position while its selection slid
  // away underneath it. Re-reading the live range each frame keeps them glued.
  useLenis(() => {
    setQuote((current) => (current ? read() : current))
  }, [read])

  if (!quote) {
    return null
  }

  const fill = (into: string) =>
    into
      .replace('{quote}', () => quote.text)
      .replace('{title}', () => title)
      .replace('{url}', () => url)

  const quoted = fill(content.format)
  // X puts the URL in its own parameter, so the text carries everything but
  // that. Built from the same format string rather than hardcoded quotation
  // marks — „…” and “…” are a language difference, not a styling one.
  const quotedForX = fill(content.format.replace('{url}', '')).trim()

  // Without this the browser collapses the selection on mousedown, and by the
  // time the click lands there is no quote left to share. It sits on each
  // control rather than on the bar: a handler on the container makes it an
  // interactive element that neither takes focus nor has a role.
  const keepSelection = (event: { preventDefault: () => void }) =>
    event.preventDefault()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(quoted)
      setCopied(true)
    } catch {
      // Clipboard denied (insecure context, or the user said no) — the two
      // share links still work, so there is nothing useful to report.
    }
  }

  return (
    <div
      className={s.quoteBar}
      style={{ top: `${quote.top}px`, left: `${quote.left}px` }}
    >
      <Link
        aria-label={content.x}
        className={cn(social.link, s.quoteButton)}
        data-social="x"
        href={`https://x.com/intent/post?text=${encodeURIComponent(
          quotedForX
        )}&url=${encodeURIComponent(url)}`}
        newTab
        onMouseDown={keepSelection}
      >
        <SocialGlyph className={social.icon} name="x" />
      </Link>
      <Link
        aria-label={content.linkedin}
        className={cn(social.link, s.quoteButton)}
        data-social="linkedin"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`}
        newTab
        onMouseDown={keepSelection}
      >
        <SocialGlyph className={social.icon} name="linkedin" />
      </Link>
      <button
        aria-label={copied ? content.copied : content.copy}
        className={s.quoteButton}
        onClick={copy}
        onMouseDown={keepSelection}
        type="button"
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
    </div>
  )
}
