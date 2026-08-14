'use client'

import { Check, Link2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@/components/ui/link'
import { SocialGlyph } from '@/components/ui/social-glyph'

/**
 * Share row — LinkedIn intent, Facebook sharer, copy-link. One behaviour for
 * every surface (blog post rail, careers role panel); each caller keeps its own
 * look through the class hooks, exactly as `SocialLinks` does.
 *
 * LinkedIn and Facebook are plain share-intent links; copy-link needs the
 * clipboard, which is why the whole row is a client component rather than just
 * the button.
 *
 * The two brand marks are inline SVGs (`SocialGlyph`) inheriting `currentColor`,
 * so they invert with the button on hover — lucide dropped its brand icons, and
 * the earlier mask + background-color paint washed out under forced dark modes.
 */

/** The copy a share row needs, in one locale. */
export interface ShareLabels {
  /** Heading above the row ("Udostępnij" / "Share"). */
  title: string
  /** Accessible labels; `{title}` is filled with the shared thing's name. */
  linkedin: string
  facebook: string
  copy: string
  /** Replaces `copy` while the confirmation is showing. */
  copied: string
}

/**
 * Fill the `{title}` slot in a brand share label. The labels are templates
 * rather than functions like `hubVideo.posterLabel` because they arrive here as
 * props, and a function does not cross the server/client boundary. Replacing
 * through a callback keeps a `$` in a post title out of the substitution
 * grammar.
 */
const fillTitle = (label: string, title: string) =>
  label.replace('{title}', () => title)

export function ShareRow({
  url,
  title,
  labels,
  className,
  labelClassName,
  rowClassName,
  buttonClassName,
  iconClassName,
  brandIconClassName,
}: {
  /** Absolute URL — share intents reject relative paths. */
  url: string
  /** Name of the shared thing, filled into the `{title}` slots. */
  title: string
  labels: ShareLabels
  className?: string | undefined
  labelClassName?: string | undefined
  rowClassName?: string | undefined
  buttonClassName?: string | undefined
  iconClassName?: string | undefined
  brandIconClassName?: string | undefined
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
      <p className={labelClassName}>{labels.title}</p>
      <div className={rowClassName}>
        <Link
          aria-label={fillTitle(labels.linkedin, title)}
          className={buttonClassName}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
          newTab
        >
          <SocialGlyph name="linkedin" className={brandIconClassName} />
        </Link>
        <Link
          aria-label={fillTitle(labels.facebook, title)}
          className={buttonClassName}
          href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
          newTab
        >
          <SocialGlyph name="facebook" className={brandIconClassName} />
        </Link>
        <button
          aria-label={copied ? labels.copied : labels.copy}
          className={buttonClassName}
          onClick={copy}
          type="button"
        >
          {copied ? (
            <Check aria-hidden="true" className={iconClassName} />
          ) : (
            <Link2 aria-hidden="true" className={iconClassName} />
          )}
        </button>
      </div>
    </div>
  )
}
