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
import { formatPostDate } from '@/lib/utils/format-date'
import type { Post } from '@/payload-types'
import s from './blog.module.css'

/**
 * The lead block: one large post beside the editors' picks.
 *
 * Both halves come from the `blog-hub` global with newest-first fallbacks
 * applied upstream, so this renders whatever it is handed and never has to
 * reason about empty curation.
 *
 * Shared by the Polish and English hubs: posts are locale-resolved by the page,
 * `content` carries the labels, and `basePath` prefixes the post links.
 */

function FeaturedPost({
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
  const category = resolveCategory(post.category)
  const author = resolvePostAuthor(post, locale)
  const cover = resolveMedia(post.cover)
  const readingTime = post.content ? readingTimeMinutes(post.content) : null

  return (
    <Link className={s.lead} href={`${basePath}/${post.slug}`}>
      {/* No cover means no empty media box — the block just closes up. */}
      {cover?.url && (
        <span className={s.leadMedia}>
          {/* LCP candidate on the hub, so it preloads. `preload` is the
              wrapper's own prop — passing Next's deprecated `priority` instead
              collides with the lazy loading it applies by default. */}
          <Image
            alt={cover.alt ?? ''}
            desktopSize="55vw"
            fill
            mobileSize="100vw"
            objectFit="cover"
            preload
            src={cover.url}
            style={focalPosition(cover)}
          />
        </span>
      )}
      {category && <span className={s.leadCategory}>{category.title}</span>}
      <span className={s.leadTitle}>{post.title}</span>
      {post.excerpt && <span className={s.leadExcerpt}>{post.excerpt}</span>}

      {/* Non-interactive: the whole block is already one <a>. */}
      <span className={s.byline}>
        <AuthorAvatar author={author} className={s.bylineAvatar} />
        <span>
          <span className={s.bylineName}>{author.name}</span>
          <span className={s.bylineMeta}>
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {formatPostDate(post.publishedAt, locale)}
              </time>
            )}
            {post.publishedAt && readingTime !== null && ' · '}
            {readingTime !== null &&
              `${readingTime} ${content.readingTimeSuffix}`}
          </span>
        </span>
      </span>
    </Link>
  )
}

export function HubFeatured({
  featured,
  picks,
  content,
  basePath,
  locale,
}: {
  featured: Post
  picks: Post[]
  content: Localized<typeof pl.hub>
  basePath: string
  locale: Locale
}) {
  return (
    <section className={s.featured}>
      <FeaturedPost
        basePath={basePath}
        content={content}
        locale={locale}
        post={featured}
      />

      {picks.length > 0 && (
        <div className={s.picks}>
          <h2 className={s.picksTitle}>{content.picksTitle}</h2>
          {picks.map((post) => {
            const category = resolveCategory(post.category)
            return (
              <Link
                className={s.pick}
                href={`${basePath}/${post.slug}`}
                key={post.id}
              >
                {category && (
                  <span className={s.pickCategory}>{category.title}</span>
                )}
                <span className={s.pickTitle}>{post.title}</span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
