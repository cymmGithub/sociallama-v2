import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { resolveCategory, resolveMedia } from '@/lib/payload/queries'
import { formatPostDate } from '@/lib/utils/format-date'
import type { Post } from '@/payload-types'
import s from './blog.module.css'

/** Listing card used by /blog and /category/{slug}. Links to the
 *  root-level post URL. */
export function PostCard({ post }: { post: Post }) {
  const category = resolveCategory(post.category)
  const cover = resolveMedia(post.cover)
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url

  return (
    <Link className={s.card} href={`/${post.slug}`}>
      <span className={s.cardMedia}>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={cover?.alt ?? ''}
            fill
            objectFit="cover"
            mobileSize="100vw"
            desktopSize="33vw"
          />
        )}
      </span>
      <span className={s.cardBody}>
        <span className={s.cardMeta}>
          {category && <span className={s.cardCategory}>{category.title}</span>}
          {post.publishedAt && (
            <time className={s.cardDate} dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt)}
            </time>
          )}
        </span>
        <span className={s.cardTitle}>{post.title}</span>
        {post.excerpt && <span className={s.cardExcerpt}>{post.excerpt}</span>}
        <span className={s.cardRead}>PRZECZYTAJ</span>
      </span>
    </Link>
  )
}
