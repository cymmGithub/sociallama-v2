import { ShareRow } from '@/components/ui/share'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './post.module.css'

/**
 * The post's share row — `<ShareRow/>` wearing this route's styling.
 *
 * Behaviour lives in `components/ui/share` (shared with the careers role
 * panels); this file is only the binding of `post.module.css` hooks, so the two
 * call sites — the rail on desktop, below the body on mobile — keep passing
 * nothing but their own root class.
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
  return (
    <ShareRow
      brandIconClassName={s.shareBrandIcon}
      buttonClassName={s.shareButton}
      className={className}
      iconClassName={s.shareIcon}
      labelClassName={s.railLabel}
      labels={content}
      rowClassName={s.shareRow}
      title={title}
      url={url}
    />
  )
}
