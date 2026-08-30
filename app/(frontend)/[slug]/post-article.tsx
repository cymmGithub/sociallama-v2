import cn from 'clsx'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
} from 'lucide-react'
import { PostCard } from '@/app/(frontend)/blog/post-card'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { resolvePostAuthor } from '@/lib/blog/author'
import { readingTimeMinutes } from '@/lib/blog/reading-time'
import { ctaSplitOrdinal, splitBeforeHeading } from '@/lib/blog/split-content'
import { buildToc } from '@/lib/blog/toc'
import type * as pl from '@/lib/content/blog'
import { APP_BASE_URL } from '@/lib/env'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import { mediaSource } from '@/lib/payload/media-refs'
import {
  focalPosition,
  getRecentPostSlugs,
  getRelatedPosts,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import { formatPostDate } from '@/lib/utils/format-date'
import type { Post } from '@/payload-types'
import { AuthorCard } from './author-card'
import { BlogPostJsonLd } from './json-ld'
import s from './post.module.css'
import { PostRail } from './post-rail'
import { PostShare } from './post-share'
import { PostRichText } from './rich-text'
import { Toc } from './toc'

/** The in-article CTA lands just before this `h2`, so it follows a whole
 *  section rather than interrupting one. */
const CTA_BEFORE_H2 = 3

/** Below this a table of contents is noise rather than a map (design D3). */
const MIN_TOC_ENTRIES = 3

/**
 * The full post article, shared by the Polish (`/{slug}`) and English
 * (`/en/blog/{slug}`) post pages. The post comes from Payload (locale-resolved
 * by the page); the page furniture — breadcrumb, CTA, share row, related
 * header — comes from `content`, and the three path props localize
 * every internal link.
 *
 * Related posts are read here rather than in the page: the query depends on
 * this post's id and category, and it must not run concurrently with the
 * page's own reads during static generation (build-time DB concurrency
 * constraint). Keeping it inside is what stops a second locale re-deriving
 * that.
 */
export async function PostArticle({
  post,
  content,
  basePath,
  hubPath,
  categoryPath,
  locale,
}: {
  post: Post
  content: Localized<typeof pl.postArticle>
  /** Post URL prefix: empty in Polish, where posts live at the site root. */
  basePath: string
  /** Blog hub root, behind the first breadcrumb. */
  hubPath: string
  /** Category listing prefix, e.g. `/category`. */
  categoryPath: string
  locale: Locale
}) {
  const category = resolveCategory(post.category)
  const author = resolvePostAuthor(post, locale)
  const cover = resolveMedia(post.cover)
  const toc = post.content ? buildToc(post.content, locale) : []
  const readingTime = post.content ? readingTimeMinutes(post.content) : null
  const publishedDate = post.publishedAt
    ? formatPostDate(post.publishedAt, locale)
    : null
  // Same precedence as generateMetadata's og:image, so the two agree.
  const schemaMedia = resolveMedia(post.seo?.ogImage) ?? cover
  const schemaImage = schemaMedia?.sizes?.og?.url ?? schemaMedia?.url
  const shareUrl = `${APP_BASE_URL}${basePath}/${post.slug}`

  // Fail soft: a transient error drops the section rather than the page.
  let related: Post[] = []
  try {
    related = await getRelatedPosts(post.id, category?.id ?? null, locale)
  } catch {
    related = []
  }

  // Sequential, not concurrent with the read above: parallel Payload queries
  // deadlock static generation. Derived from an already-cached slug list, so
  // this costs no extra DB round trip.
  const recentSlugs = await getRecentPostSlugs(locale)
  const unoptimized = !recentSlugs.has(post.slug)
  /* The cover stays on the optimizer whatever the post's age. It is one image
     per page and the preloaded LCP element, and `minimumCacheTTL` is a year
     now — a few hundred transformations a year is not the cost this change
     exists to remove; that was the whole 726-file corpus re-expiring monthly
     across 16 widths. Body images and listing cards, which are many per page,
     still opt out. */
  const coverSource = mediaSource(cover, false)

  const body = post.content
    ? splitBeforeHeading(post.content, ctaSplitOrdinal(toc, CTA_BEFORE_H2))
    : null
  const showToc = toc.length >= MIN_TOC_ENTRIES

  const inlineCta = (
    <aside className={cn(s.stage, s.inlineCta)}>
      <span className={s.inlineCtaIcon}>
        <Mail aria-hidden="true" />
      </span>
      <div>
        <p className={s.inlineCtaTitle}>{content.cta.title}</p>
        <p className={s.inlineCtaText}>{content.cta.text}</p>
      </div>
      <Link className={s.pillButton} href={content.cta.href}>
        {content.cta.label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </aside>
  )

  return (
    <>
      <BlogPostJsonLd
        author={author}
        basePath={basePath}
        hubLabel={content.hubLabel}
        hubPath={hubPath}
        imageUrl={schemaImage}
        locale={locale}
        post={post}
      />
      <article className={s.article}>
        {/* Above the header card, on the page's own sand ground — a page-level
            way out of the article. Same destination as the first crumb inside
            the card, deliberately: the trail says where you are, this says how
            to leave. The row matches the card's width so the two share a left
            edge at every viewport.

            Bare arrow, no label: `backAria` is the only accessible name it has,
            so it is not optional here. */}
        <div className={s.backRow}>
          <Link
            aria-label={content.backAria}
            className={s.backLink}
            href={hubPath}
          >
            <ArrowLeft aria-hidden="true" className={s.backIcon} />
          </Link>
        </div>

        <header className={cn(s.stage, s.header)}>
          <nav aria-label={content.breadcrumbAria} className={s.crumbs}>
            <Link href={hubPath}>{content.hubLabel}</Link>
            {category && (
              <>
                <ChevronRight aria-hidden="true" className={s.crumbsIcon} />
                <Link href={`${categoryPath}/${category.slug}`}>
                  {category.title}
                </Link>
              </>
            )}
          </nav>

          <div className={s.headerGrid}>
            <div>
              <h1 className={s.title}>{post.title}</h1>
              {post.excerpt && <p className={s.lead}>{post.excerpt}</p>}
              <div className={s.meta}>
                {publishedDate && (
                  <time dateTime={post.publishedAt ?? ''}>{publishedDate}</time>
                )}
                {publishedDate && readingTime !== null && (
                  <span aria-hidden="true" className={s.metaDot} />
                )}
                {readingTime !== null && (
                  <span className={s.readingTime}>
                    <Clock aria-hidden="true" className={s.readingTimeIcon} />
                    {readingTime} {content.readingTimeSuffix}
                  </span>
                )}
              </div>
            </div>
            {/* No cover means no empty media box — the stage just closes up. */}
            {cover && coverSource && (
              <div className={s.cover}>
                <Image
                  src={coverSource.url}
                  alt={cover.alt}
                  fill
                  objectFit="cover"
                  mobileSize="100vw"
                  desktopSize="48vw"
                  style={focalPosition(cover)}
                  preload
                  unoptimized={false}
                />
              </div>
            )}
          </div>
        </header>

        <div className={cn(s.layout, !showToc && s.layoutNoRail)}>
          {showToc && (
            <PostRail
              content={content.toc}
              share={content.share}
              shareUrl={shareUrl}
              title={post.title}
              toc={toc}
            />
          )}

          <div className={s.bodyColumn}>
            {showToc && (
              <details className={s.tocDetails}>
                <summary className={s.tocSummary}>
                  {content.toc.title}
                  <ChevronDown
                    aria-hidden="true"
                    className={s.tocSummaryIcon}
                  />
                </summary>
                <Toc entries={toc} />
              </details>
            )}

            {body && (
              <div className={s.body}>
                <PostRichText
                  basePath={basePath}
                  categoryPath={categoryPath}
                  data={body.before}
                  fallbackHref={hubPath}
                  locale={locale}
                  toc={toc}
                  unoptimized={unoptimized}
                />
                {inlineCta}
                {body.after && (
                  <PostRichText
                    basePath={basePath}
                    categoryPath={categoryPath}
                    data={body.after}
                    fallbackHref={hubPath}
                    headingOffset={body.headingsBefore}
                    locale={locale}
                    toc={toc}
                    unoptimized={unoptimized}
                  />
                )}
              </div>
            )}

            <AuthorCard author={author} content={content.author} />
            <PostShare
              className={s.bodyShare}
              content={content.share}
              title={post.title}
              url={shareUrl}
            />
          </div>
        </div>

        {related.length > 0 && (
          <section className={s.related}>
            <div className={s.relatedHead}>
              <h2 className={s.relatedTitle}>{content.related.title}</h2>
              <Link className={s.relatedAll} href={content.related.allHref}>
                {content.related.allLabel}
              </Link>
            </div>
            <ul className={s.relatedGrid}>
              {related.map((item) => (
                <li key={item.id}>
                  <PostCard
                    basePath={basePath}
                    content={content.postCard}
                    locale={locale}
                    post={item}
                    unoptimized={!recentSlugs.has(item.slug)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}
