import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { Image } from '@/components/ui/image'
import {
  getDraftPostBySlug,
  getPostBySlug,
  getPublishedPostSlugs,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import type { Post } from '@/payload-types'
import s from './post.module.css'
import { PostRichText } from './rich-text'

/*
 * Root-level post URLs (/{slug}) for exact parity with the live WordPress
 * site. Static routes (/blog, /category/*, …) always win over this dynamic
 * segment; the posts collection additionally validates slugs against
 * RESERVED_SLUGS so content can never collide with app routes.
 */

interface PageProps {
  params: Promise<{ slug: string }>
}

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
      // Page-level openGraph replaces the layout's whole og object (no deep
      // merge), so brand identity must be restated here.
      siteName: 'Social Lama',
      locale: 'pl_PL',
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
  const cover = resolveMedia(post.cover)
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <Wrapper theme="cream">
      <article className={s.article}>
        <header className={s.header}>
          <div className={s.meta}>
            {category && <span className={s.category}>{category.title}</span>}
            {publishedDate && (
              <time className={s.date} dateTime={post.publishedAt ?? ''}>
                {publishedDate}
              </time>
            )}
          </div>
          <h1 className={s.title}>{post.title}</h1>
          {post.excerpt && <p className={s.lead}>{post.excerpt}</p>}
        </header>

        {cover?.url && (
          <div className={s.cover}>
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              objectFit="cover"
              mobileSize="100vw"
              desktopSize="72vw"
              preload
            />
          </div>
        )}

        {post.content && (
          <div className={s.body}>
            <PostRichText data={post.content} />
          </div>
        )}
      </article>
    </Wrapper>
  )
}
