'use client'

import { Check, Link2 } from 'lucide-react'
import { useState } from 'react'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './post.module.css'

/**
 * Copy a link to this section (design D7).
 *
 * A SIBLING of the heading, never part of it: inside the `h2` the button's
 * label would join the heading's accessible name, and every screen reader
 * would announce "Ile kosztuje reklama, copy a link to this section" as the
 * section title. The wrapper row in `rich-text.tsx` is what keeps them apart.
 *
 * The URL is built at click time from `location`, not from a prop: the same
 * body is rendered at `/{slug}` and `/en/blog/{slug}`, and the page already
 * knows which one it is.
 */
export function HeadingAnchor({
  id,
  content,
}: {
  id: string
  content: Localized<typeof pl.postHeading>
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#${id}`
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1000)
    } catch {
      // Clipboard denied (insecure context, or the user said no). The heading
      // is still a real anchor the address bar can be read off, so there is
      // nothing useful to report here.
    }
  }

  return (
    <button
      aria-label={copied ? content.copied : content.copyLink}
      className={s.headingAnchor}
      onClick={copy}
      type="button"
    >
      {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
    </button>
  )
}
