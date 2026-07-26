import type { TocEntry } from '@/lib/blog/toc'
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
}: {
  toc: readonly TocEntry[]
  shareUrl: string
  title: string
}) {
  return (
    <aside className={s.rail}>
      <nav aria-label="Spis treści" className={s.railBox}>
        <p className={s.railLabel}>W tym wpisie</p>
        <Toc entries={toc} />
      </nav>

      <PostShare className={s.railShare} title={title} url={shareUrl} />
    </aside>
  )
}
