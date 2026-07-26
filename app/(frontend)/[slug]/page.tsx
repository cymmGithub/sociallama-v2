import cn from 'clsx'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
} from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { PostCard } from '@/app/(frontend)/blog/post-card'
import { Wrapper } from '@/components/layout/wrapper'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { resolvePostAuthor } from '@/lib/blog/author'
import { readingTimeMinutes } from '@/lib/blog/reading-time'
import { ctaSplitOrdinal, splitBeforeHeading } from '@/lib/blog/split-content'
import { buildToc } from '@/lib/blog/toc'
import { postCta, postRelated } from '@/lib/content/blog'
import { OG_BASE } from '@/lib/content/site'
import { APP_BASE_URL } from '@/lib/env'
import {
  getDraftPostBySlug,
  getPostBySlug,
  getPublishedPostSlugs,
  getRelatedPosts,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import { formatPostDate } from '@/lib/utils/format-date'
import type { Post } from '@/payload-types'
import { AuthorCard } from './author-card'
import { BlogPostJsonLd } from './json-ld'
import s from './post.module.css'
import { PostNewsletter } from './post-newsletter'
import { PostRail } from './post-rail'
import { PostShare } from './post-share'
import { PostRichText } from './rich-text'
import { Toc } from './toc'

/*
 * Root-level post URLs (/{slug}) for exact parity with the live WordPress
 * site. Static routes (/blog, /category/*, …) always win over this dynamic
 * segment; the posts collection additionally validates slugs against
 * RESERVED_SLUGS so content can never collide with app routes.
 */

interface PageProps {
  params: Promise<{ slug: string }>
}

/** The in-article CTA lands just before this `h2`, so it follows a whole
 *  section rather than interrupting one. */
const CTA_BEFORE_H2 = 3

/** Below this a table of contents is noise rather than a map (design D3). */
const MIN_TOC_ENTRIES = 3

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs()
  // Cache Components requires generateStaticParams to be non-empty; on an
  // empty CMS (fresh deploy before seeding) prerender one guaranteed-404 path
  // so the build succeeds.
  if (slugs.length === 0) {
    return [{ slug: 'placeholder-bez-tresci' }]
  }
  return slugs.map((slug) => ({ slug }))
}

async function loadPost(slug: string): Promise<Post | null> {
  const { isEnabled: isDraft } = await draftMode()
  return isDraft ? getDraftPostBySlug(slug) : getPostBySlug(slug)
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) {
    return {}
  }

  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt || undefined
  const ogMedia = resolveMedia(post.seo?.ogImage) ?? resolveMedia(post.cover)
  const ogUrl = ogMedia?.sizes?.og?.url ?? ogMedia?.url

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: 'article',
      ...OG_BASE,
      title,
      ...(description ? { description } : {}),
      url: `/${post.slug}`,
      ...(ogUrl ? { images: [{ url: ogUrl, width: 1200, height: 630 }] } : {}),
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) {
    notFound()
  }

  const category = resolveCategory(post.category)
  const author = resolvePostAuthor(post)
  const cover = resolveMedia(post.cover)
  const toc = post.content ? buildToc(post.content) : []
  const readingTime = post.content ? readingTimeMinutes(post.content) : null
  const publishedDate = post.publishedAt
    ? formatPostDate(post.publishedAt)
    : null
  // Same precedence as generateMetadata's og:image, so the two agree.
  const schemaMedia = resolveMedia(post.seo?.ogImage) ?? cover
  const schemaImage = schemaMedia?.sizes?.og?.url ?? schemaMedia?.url
  const shareUrl = `${APP_BASE_URL}/${post.slug}`

  // Fetched after the post resolves — it depends on the post's category, and
  // must not run concurrently with other Payload reads during static
  // generation (build-time DB concurrency constraint). Fail soft: a transient
  // error drops the section rather than the page.
  let related: Post[] = []
  try {
    related = await getRelatedPosts(post.id, category?.id ?? null)
  } catch {
    related = []
  }

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
        <p className={s.inlineCtaTitle}>{postCta.title}</p>
        <p className={s.inlineCtaText}>{postCta.text}</p>
      </div>
      <Link className={s.pillButton} href={postCta.href}>
        {postCta.label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </aside>
  )

  return (
    <Wrapper theme="cream">
      <BlogPostJsonLd author={author} imageUrl={schemaImage} post={post} />
      <article className={s.article}>
        <header className={cn(s.stage, s.header)}>
          <nav aria-label="Ścieżka nawigacji" className={s.crumbs}>
            <Link href="/blog">Blog</Link>
            {category && (
              <>
                <ChevronRight aria-hidden="true" className={s.crumbsIcon} />
                <Link href={`/category/${category.slug}`}>
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
                    {readingTime} min czytania
                  </span>
                )}
              </div>
            </div>
            {/* No cover means no empty media box — the stage just closes up. */}
            {cover?.url && (
              <div className={s.cover}>
                <Image
                  src={cover.url}
                  alt={cover.alt}
                  fill
                  objectFit="cover"
                  mobileSize="100vw"
                  desktopSize="48vw"
                  preload
                />
              </div>
            )}
          </div>
        </header>

        <div className={cn(s.layout, !showToc && s.layoutNoRail)}>
          {showToc && (
            <PostRail shareUrl={shareUrl} title={post.title} toc={toc} />
          )}

          <div className={s.bodyColumn}>
            {showToc && (
              <details className={s.tocDetails}>
                <summary className={s.tocSummary}>
                  W tym wpisie
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
                <PostRichText data={body.before} toc={toc} />
                {inlineCta}
                {body.after && (
                  <PostRichText
                    data={body.after}
                    headingOffset={body.headingsBefore}
                    toc={toc}
                  />
                )}
              </div>
            )}

            <AuthorCard author={author} />
            <PostShare
              className={s.bodyShare}
              title={post.title}
              url={shareUrl}
            />
          </div>
        </div>

        <PostNewsletter />

        {related.length > 0 && (
          <section className={s.related}>
            <div className={s.relatedHead}>
              <h2 className={s.relatedTitle}>{postRelated.title}</h2>
              <Link className={s.relatedAll} href={postRelated.allHref}>
                {postRelated.allLabel}
              </Link>
            </div>
            <ul className={s.relatedGrid}>
              {related.map((item) => (
                <li key={item.id}>
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </Wrapper>
  )
}
