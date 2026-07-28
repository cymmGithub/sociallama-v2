import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { PostArticle } from '@/app/(frontend)/[slug]/post-article'
import { Wrapper } from '@/components/layout/wrapper'
import { postArticle } from '@/lib/content/blog.en'
import { OG_BASE } from '@/lib/content/site.en'
import {
  getDraftPostBySlug,
  getPostBySlug,
  getPublishedPostSlugs,
  resolveMedia,
} from '@/lib/payload/queries'
import type { Post } from '@/payload-types'

/*
 * English posts are namespaced under /en/blog/{en-slug} rather than sharing the
 * Polish root-level URLs: `slug` is localized, so the two locales are
 * independent namespaces. `page` and `category` are static siblings here and
 * always win over this dynamic segment, which is why the posts collection
 * reserves them for English slugs.
 */

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Post URL prefix — the English half of the pair; Polish posts sit at the
 *  site root. */
const BASE_PATH = '/en/blog'

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs('en')
  // Cache Components requires generateStaticParams to be non-empty; with no
  // post translated yet, prerender one guaranteed-404 path so the build
  // succeeds.
  if (slugs.length === 0) {
    return [{ slug: 'placeholder-no-content' }]
  }
  return slugs.map((slug) => ({ slug }))
}

/** Resolves by ENGLISH slug: the slug predicate is scoped to the read locale,
 *  so an English slug matches no Polish row, and vice versa. */
async function loadPost(slug: string): Promise<Post | null> {
  const { isEnabled: isDraft } = await draftMode()
  return isDraft ? getDraftPostBySlug(slug, 'en') : getPostBySlug(slug, 'en')
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
  // Built from BASE_PATH, like the article's own share and breadcrumb URLs, so
  // the canonical can never disagree with what the page renders.
  const pageUrl = `${BASE_PATH}/${post.slug}`

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      ...OG_BASE,
      title,
      ...(description ? { description } : {}),
      url: pageUrl,
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

export default async function EnPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) {
    notFound()
  }

  return (
    <Wrapper theme="cream">
      <PostArticle
        basePath={BASE_PATH}
        categoryPath="/en/blog/category"
        content={postArticle}
        hubPath="/en/blog"
        locale="en"
        post={post}
      />
    </Wrapper>
  )
}
