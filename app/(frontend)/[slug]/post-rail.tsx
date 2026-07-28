import type { TocEntry } from '@/lib/blog/toc'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './post.module.css'
import { PostShare } from './post-share'
import { Toc } from './toc'

/**
 * Sticky companion to the article body on desktop: where you are in the post,
 * and how to pass it on. Attribution is deliberately not here — the author card
 * after the body is the single place the author is presented (user decision
 * 2026-07-26), so the rail stays pure utility.
 *
 * Mobile drops the rail entirely: the table of contents becomes a disclosure
 * above the body and the share row moves below it (design D10).
 */

/**
 * Only rendered when the post has a table of contents — the page owns that
 * decision, since without one there is no rail at all (see `MIN_TOC_ENTRIES`
 * in page.tsx).
 */
export function PostRail({
  toc,
  shareUrl,
  title,
  content,
  share,
}: {
  toc: readonly TocEntry[]
  shareUrl: string
  title: string
  content: Localized<typeof pl.postToc>
  /** Forwarded to the share row, which the rail owns but does not read. */
  share: Localized<typeof pl.postShare>
}) {
  return (
    <aside className={s.rail}>
      <nav aria-label={content.navLabel} className={s.railBox}>
        <p className={s.railLabel}>{content.title}</p>
        <Toc entries={toc} />
      </nav>

      <PostShare
        className={s.railShare}
        content={share}
        title={title}
        url={shareUrl}
      />
    </aside>
  )
}
