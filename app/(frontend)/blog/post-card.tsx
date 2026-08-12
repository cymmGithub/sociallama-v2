import { AuthorAvatar } from '@/components/blog/author-avatar'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { resolvePostAuthor } from '@/lib/blog/author'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import {
  focalPosition,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import { formatPostDate } from '@/lib/utils/format-date'
import type { Post } from '@/payload-types'
import s from './blog.module.css'

/**
 * Listing card used by the blog hub, /category/{slug} and the related row under
 * a post. Shared by both locales: the post is locale-resolved by the page,
 * `content` carries the read label, and `basePath` prefixes the post URL —
 * empty in Polish, where posts live at the site root.
 */
export function PostCard({
  post,
  content,
  basePath,
  locale,
}: {
  post: Post
  content: Localized<typeof pl.postCard>
  basePath: string
  locale: Locale
}) {
  const category = resolveCategory(post.category)
  const author = resolvePostAuthor(post, locale)
  const cover = resolveMedia(post.cover)
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url

  return (
    <Link className={s.card} href={`${basePath}/${post.slug}`}>
      <span className={s.cardMedia}>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={cover?.alt ?? ''}
            fill
            objectFit="cover"
            mobileSize="100vw"
            desktopSize="33vw"
            style={focalPosition(cover)}
          />
        )}
      </span>
      <span className={s.cardBody}>
        <span className={s.cardMeta}>
          {category && <span className={s.cardCategory}>{category.title}</span>}
          {post.publishedAt && (
            <time className={s.cardDate} dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt, locale)}
            </time>
          )}
          {/* Non-interactive: the whole card is already one <a>. */}
          <span className={s.cardAuthor}>
            <AuthorAvatar author={author} className={s.cardAuthorAvatar} />
            {author.name}
          </span>
        </span>
        <span className={s.cardTitle}>{post.title}</span>
        {post.excerpt && <span className={s.cardExcerpt}>{post.excerpt}</span>}
        <span className={s.cardRead}>{content.read}</span>
      </span>
    </Link>
  )
}
