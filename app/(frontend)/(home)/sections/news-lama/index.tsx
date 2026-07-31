'use client'

import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type * as pl from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import { formatPostDate } from '@/lib/utils/format-date'
import s from './news-lama.module.css'

/**
 * Serializable view-model built server-side from the latest published
 * Payload post (see app/(frontend)/(home)/page.tsx). Static labels arrive as
 * a `content` prop: this is a 'use client' module, so a module-scope import
 * of the Polish copy would render Polish on the English homepage no matter
 * which locale the route is.
 */
export interface NewsLamaPost {
  title: string
  excerpt: string
  category: string
  /** ISO date string (publishedAt). */
  date: string
  href: string
  cover: string
  coverAlt: string
}

const HEADING_ACCENT = 'LAMA'

export function NewsLama({
  post,
  content,
  locale,
}: {
  post: NewsLamaPost
  content: Localized<typeof pl.news>
  locale: Locale
}) {
  const ref = useReveal<HTMLElement>()

  const formattedDate = formatPostDate(post.date, locale)

  // "NewsLAMA" → "News" + accented "LAMA"
  const hasAccent = content.heading.endsWith(HEADING_ACCENT)
  const headingPrefix = hasAccent
    ? content.heading.slice(0, -HEADING_ACCENT.length)
    : content.heading

  return (
    <section ref={ref} className={s.section}>
      <h2 className={s.heading}>
        {headingPrefix}
        {hasAccent && <span className={s.headingAccent}>{HEADING_ACCENT}</span>}
      </h2>

      <Link data-reveal-item className={s.card} href={post.href}>
        {/* Bias the crop toward the top of the cover. On desktop `.media` keeps
            a 340px floor while its column widens with the viewport, so the box
            grows steadily wider than the 16/10 art and discards over 40% of its
            height by 1920 — centred, that takes the llama's ears off on most of
            the cover library. The base of these illustrations is mostly ground
            and empty plum, so the height is cheaper to spend there. No-op on
            mobile, where `.media` is 16/10 and matches the art exactly. */}
        <div className={s.media}>
          {post.cover && (
            <Image
              src={post.cover}
              alt={post.coverAlt}
              fill
              objectFit="cover"
              style={{ objectPosition: '50% 25%' }}
              mobileSize="100vw"
              desktopSize="50vw"
            />
          )}
        </div>
        <div className={s.body}>
          <div className={s.meta}>
            <span className={s.category}>{post.category}</span>
            <span className={s.date}>{formattedDate}</span>
          </div>
          <h3 className={s.title}>{post.title}</h3>
          <p className={s.excerpt}>{post.excerpt}</p>
          <span className={s.read}>{content.readLabel}</span>
        </div>
      </Link>
    </section>
  )
}
