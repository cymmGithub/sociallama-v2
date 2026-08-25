import cn from 'clsx'
import s from './news-lama.module.css'

const HEADING_ACCENT = 'LAMA'

/**
 * Suspense fallback for the NewsLAMA hole: the real heading plus a
 * card-shaped set of pulsing bones, reusing the section's own layout classes
 * so nothing shifts when the post streams in. Server-rendered (no hooks) —
 * it ships in the static shell and is replaced as the segment parses; on a
 * fast connection it never paints.
 */
export function NewsLamaSkeleton({ heading }: { heading: string }) {
  // "NewsLAMA" → "News" + accented "LAMA", same split as the live section.
  const hasAccent = heading.endsWith(HEADING_ACCENT)
  const headingPrefix = hasAccent
    ? heading.slice(0, -HEADING_ACCENT.length)
    : heading

  return (
    <section className={s.section} aria-hidden="true">
      {/* Not an <h2>: the fallback stays in the streamed HTML source, so a
          real heading here doubles "News LAMA" for crawlers' heading
          extractors. Same classes, so the layout hold is identical. */}
      <div className={s.heading}>
        {headingPrefix}
        {hasAccent && <span className={s.headingAccent}>{HEADING_ACCENT}</span>}
      </div>

      <div className={s.card}>
        <div className={cn(s.media, s.bone)} />
        <div className={s.body}>
          <div className={s.meta}>
            <span className={cn(s.bone, s.boneChip)} />
            <span className={cn(s.bone, s.boneChip)} />
          </div>
          <span className={cn(s.bone, s.boneTitle)} />
          <span className={cn(s.bone, s.boneLine)} />
          <span className={cn(s.bone, s.boneLineShort)} />
        </div>
      </div>
    </section>
  )
}
