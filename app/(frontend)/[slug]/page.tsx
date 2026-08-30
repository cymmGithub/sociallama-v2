import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { LocaleCounterpart } from '@/components/layout/chrome-provider'
import { Wrapper } from '@/components/layout/wrapper'
import { postArticle } from '@/lib/content/blog'
import {
  getDraftPostBySlug,
  getPostBySlug,
  getPostSlugInLocale,
  getPublishedPostSlugs,
  staticParamsOrPlaceholder,
} from '@/lib/payload/queries'
import { postMetadata } from '@/lib/utils/metadata'
import type { Post } from '@/payload-types'
import { PostArticle } from './post-article'

/*
 * Root-level post URLs (/{slug}) for exact parity with the live WordPress
 * site. Static routes (/blog, /category/*, …) always win over this dynamic
 * segment; the posts collection additionally validates slugs against
 * RESERVED_SLUGS so content can never collide with app routes.
 */

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Post URL prefix — empty by design, see the note above. The English route
 *  builds the same URLs under `/en/blog`. */
const BASE_PATH = ''

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs('pl')
  return staticParamsOrPlaceholder('slug', slugs, 'placeholder-bez-tresci')
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

  const enSlug = await getPostSlugInLocale(post.id, 'en')

  return postMetadata(post, {
    // Built from BASE_PATH, like the article's own share and breadcrumb URLs,
    // so the canonical can never disagree with what the page renders.
    path: `${BASE_PATH}/${post.slug}`,
    counterpartUrl: enSlug ? `/en/blog/${enSlug}` : null,
  })
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) {
    notFound()
  }

  // The toggle lives in <Header>/<Footer>, which <Wrapper> renders — so
  // wrapping here does reach it. Undefined when the post has no English
  // version, which sends the toggle to /en, as it should.
  const enSlug = await getPostSlugInLocale(post.id, 'en')

  return (
    <LocaleCounterpart path={enSlug ? `/en/blog/${enSlug}` : undefined}>
      <Wrapper theme="cream">
        <PostArticle
          basePath={BASE_PATH}
          categoryPath="/category"
          content={postArticle}
          hubPath="/blog"
          locale="pl"
          post={post}
        />
      </Wrapper>
    </LocaleCounterpart>
  )
}
