import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { PostArticle } from '@/app/(frontend)/[slug]/post-article'
import { LocaleCounterpart } from '@/components/layout/chrome-provider'
import { Wrapper } from '@/components/layout/wrapper'
import { postArticle } from '@/lib/content/blog.en'
import {
  getDraftPostBySlug,
  getPostBySlug,
  getPostSlugInLocale,
  getPublishedPostSlugs,
  staticParamsOrPlaceholder,
} from '@/lib/payload/queries'
import { postMetadata } from '@/lib/utils/metadata'
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
  return staticParamsOrPlaceholder('slug', slugs, 'placeholder-no-content')
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

  // Every English post is the translation of a Polish one, so the Polish
  // counterpart always exists — but it is still read rather than assumed, and
  // omitted if it somehow does not.
  const plSlug = await getPostSlugInLocale(post.id, 'pl')

  return postMetadata(post, {
    // Built from BASE_PATH, like the article's own share and breadcrumb URLs,
    // so the canonical can never disagree with what the page renders.
    path: `${BASE_PATH}/${post.slug}`,
    counterpartUrl: plSlug ? `/${plSlug}` : null,
  })
}

export default async function EnPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) {
    notFound()
  }

  const plSlug = await getPostSlugInLocale(post.id, 'pl')

  return (
    <LocaleCounterpart path={plSlug ? `/${plSlug}` : undefined}>
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
    </LocaleCounterpart>
  )
}
