'use client'

import { Check, Link2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@/components/ui/link'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './post.module.css'

/**
 * Fill the `{title}` slot in a brand share label. The labels are templates
 * rather than functions like `hubVideo.posterLabel` because they arrive here as
 * props, and a function does not cross the server/client boundary. Replacing
 * through a callback keeps a `$` in a post title out of the substitution
 * grammar.
 */
const fillTitle = (label: string, title: string) =>
  label.replace('{title}', () => title)

/**
 * Share row for the rail. LinkedIn and Facebook are plain share-intent links;
 * copy-link needs the clipboard, which is why the whole row is a client
 * component rather than just the button.
 *
 * The two brand marks are CSS masks over the same `/assets/icon-*.svg` files
 * the footer's social row uses — lucide dropped its brand icons, and a mask
 * inherits `currentColor` so the marks invert on hover with the button.
 */
export function PostShare({
  url,
  title,
  content,
  className,
}: {
  /** Absolute post URL — share intents reject relative paths. */
  url: string
  title: string
  content: Localized<typeof pl.postShare>
  className?: string | undefined
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard denied (insecure context, or the user said no) — the two
      // share links still work, so there's nothing useful to report here.
    }
  }

  const encoded = encodeURIComponent(url)

  return (
    <div className={className}>
      <p className={s.railLabel}>{content.title}</p>
      <div className={s.shareRow}>
        <Link
          aria-label={fillTitle(content.linkedin, title)}
          className={s.shareButton}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
          newTab
        >
          <span
            aria-hidden="true"
            className={s.shareBrandIcon}
            style={{
              maskImage: 'url(/assets/icon-linkedin.svg)',
              WebkitMaskImage: 'url(/assets/icon-linkedin.svg)',
            }}
          />
        </Link>
        <Link
          aria-label={fillTitle(content.facebook, title)}
          className={s.shareButton}
          href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
          newTab
        >
          <span
            aria-hidden="true"
            className={s.shareBrandIcon}
            style={{
              maskImage: 'url(/assets/icon-facebook.svg)',
              WebkitMaskImage: 'url(/assets/icon-facebook.svg)',
            }}
          />
        </Link>
        <button
          aria-label={copied ? content.copied : content.copy}
          className={s.shareButton}
          onClick={copy}
          type="button"
        >
          {copied ? (
            <Check aria-hidden="true" className={s.shareIcon} />
          ) : (
            <Link2 aria-hidden="true" className={s.shareIcon} />
          )}
        </button>
      </div>
    </div>
  )
}
