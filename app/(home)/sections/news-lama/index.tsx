'use client'

import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { news } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './news-lama.module.css'

const formattedDate = new Date(news.post.date).toLocaleDateString('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function NewsLama() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className={s.section}>
      <h2 className={s.heading}>{news.heading}</h2>

      <Link data-reveal-item className={s.card} href={news.post.href}>
        <div className={s.media}>
          <Image
            src={news.post.cover}
            alt=""
            fill
            objectFit="cover"
            mobileSize="100vw"
            desktopSize="50vw"
          />
        </div>
        <div className={s.body}>
          <div className={s.meta}>
            <span className={s.category}>{news.post.category}</span>
            <span className={s.date}>{formattedDate}</span>
          </div>
          <h3 className={s.title}>{news.post.title}</h3>
          <p className={s.excerpt}>{news.post.excerpt}</p>
          <span className={s.read}>{news.post.readLabel}</span>
        </div>
      </Link>
    </section>
  )
}
