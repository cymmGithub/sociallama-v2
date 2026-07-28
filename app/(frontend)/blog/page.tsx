import type { Metadata } from 'next'
import { hubView } from '@/lib/content/blog'
import {
  getBlogHub,
  getCategories,
  getPostsPage,
  getSearchIndex,
} from '@/lib/payload/queries'
import { BlogHubView } from './hub-view'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Blog Social Lama — marketing, reklama, SEO i social media w praktyce. Strategie, case studies i konkretne wskazówki dla marek.',
  alternates: { canonical: '/blog' },
}

/**
 * The Polish /blog hub. The composition lives in `BlogHubView`, shared with
 * /en/blog.
 *
 * Every Payload read here is SEQUENTIAL. The previous `Promise.all` conflicted
 * with the project's build-time DB concurrency constraint, and this route now
 * makes four reads rather than two, so a concurrent burst against the unpooled
 * prod instance during static generation would be that much likelier to time
 * the build out.
 */
export default async function BlogPage() {
  const hub = await getBlogHub()
  const postsPage = await getPostsPage(1)
  const categories = await getCategories()
  const searchIndex = await getSearchIndex()

  return (
    <BlogHubView
      basePath=""
      categories={categories}
      categoryPath="/category"
      content={hubView}
      data={hub}
      hubPath="/blog"
      locale="pl"
      postsPage={postsPage}
      searchIndex={searchIndex}
    />
  )
}
