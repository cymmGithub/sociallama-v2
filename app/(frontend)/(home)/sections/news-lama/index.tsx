'use client'

import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { news } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './news-lama.module.css'

/**
 * Serializable view-model built server-side from the latest published
 * Payload post (see app/(frontend)/(home)/page.tsx). Static labels
 * (heading, read label) stay in lib/content/home.ts.
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

export function NewsLama({ post }: { post: NewsLamaPost }) {
  const ref = useReveal<HTMLElement>()

  const formattedDate = new Date(post.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // "NewsLAMA" → "News" + accented "LAMA" (copy stays in lib/content/home.ts)
  const hasAccent = news.heading.endsWith(HEADING_ACCENT)
  const headingPrefix = hasAccent
    ? news.heading.slice(0, -HEADING_ACCENT.length)
    : news.heading

  return (
    <section ref={ref} className={s.section}>
      <h2 className={s.heading}>
        {headingPrefix}
        {hasAccent && (
          <span className={s.headingAccent}>{HEADING_ACCENT}</span>
        )}
      </h2>

      <Link data-reveal-item className={s.card} href={post.href}>
        <div className={s.media}>
          {post.cover && (
            <Image
              src={post.cover}
              alt={post.coverAlt}
              fill
              objectFit="cover"
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
          <span className={s.read}>{news.readLabel}</span>
        </div>
      </Link>
    </section>
  )
}
