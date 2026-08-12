import cn from 'clsx'
import { AuthorAvatar } from '@/components/blog/author-avatar'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { resolvePostAuthor } from '@/lib/blog/author'
import { readingTimeMinutes } from '@/lib/blog/reading-time'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import {
  focalPosition,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import type { Post } from '@/payload-types'
import s from './blog.module.css'

/**
 * A short list of further reading beside the most-read pick.
 *
 * `popular` is an editorial choice, not a measurement, so it is genuinely
 * optional: when it is empty the whole right-hand block goes and the short
 * list spans the full width rather than leaving a gap (design decision 2).
 *
 * Shared by the Polish and English hubs: posts are locale-resolved by the page,
 * `content` carries the labels, and `basePath` prefixes the post links.
 */

function PopularPost({
  post,
  content,
  basePath,
  locale,
}: {
  post: Post
  content: Localized<typeof pl.hub>
  basePath: string
  locale: Locale
}) {
  const author = resolvePostAuthor(post, locale)
  const cover = resolveMedia(post.cover)
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url
  const readingTime = post.content ? readingTimeMinutes(post.content) : null

  return (
    <div className={s.popular}>
      <h2 className={s.popularTitle}>{content.popularTitle}</h2>
      <Link className={s.popularCard} href={`${basePath}/${post.slug}`}>
        {coverUrl && (
          <span className={s.popularMedia}>
            <Image
              alt={cover?.alt ?? ''}
              desktopSize="33vw"
              fill
              mobileSize="100vw"
              objectFit="cover"
              src={coverUrl}
              style={focalPosition(cover)}
            />
          </span>
        )}
        <span className={s.popularHeading}>{post.title}</span>
        {post.excerpt && (
          <span className={s.popularExcerpt}>{post.excerpt}</span>
        )}
        <span className={s.byline}>
          <AuthorAvatar author={author} className={s.bylineAvatar} />
          <span>
            <span className={s.bylineName}>{author.name}</span>
            {readingTime !== null && (
              <span className={s.bylineMeta}>
                {readingTime} {content.readingTimeSuffix}
              </span>
            )}
          </span>
        </span>
      </Link>
    </div>
  )
}

export function HubPopular({
  popular,
  shortList,
  content,
  basePath,
  locale,
}: {
  popular: Post | null
  shortList: Post[]
  content: Localized<typeof pl.hub>
  basePath: string
  locale: Locale
}) {
  if (shortList.length === 0 && !popular) {
    return null
  }

  return (
    <section className={cn(s.twoUp, !popular && s.twoUpWide)}>
      {shortList.length > 0 && (
        <div className={s.rows}>
          {shortList.map((post) => {
            const category = resolveCategory(post.category)
            const cover = resolveMedia(post.cover)
            const coverUrl = cover?.sizes?.thumbnail?.url ?? cover?.url
            return (
              <Link
                className={s.row}
                href={`${basePath}/${post.slug}`}
                key={post.id}
              >
                <span className={s.rowMedia}>
                  {coverUrl && (
                    <Image
                      alt={cover?.alt ?? ''}
                      desktopSize="10vw"
                      fill
                      mobileSize="30vw"
                      objectFit="cover"
                      src={coverUrl}
                      style={focalPosition(cover)}
                    />
                  )}
                </span>
                <span>
                  {category && (
                    <span className={s.rowCategory}>{category.title}</span>
                  )}
                  <span className={s.rowTitle}>{post.title}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {popular && (
        <PopularPost
          basePath={basePath}
          content={content}
          locale={locale}
          post={popular}
        />
      )}
    </section>
  )
}
