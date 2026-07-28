import type { Metadata } from 'next'
import { BlogHubView } from '@/app/(frontend)/blog/hub-view'
import { hubView } from '@/lib/content/blog.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import {
  getBlogHub,
  getCategories,
  getPostsPage,
  getSearchIndex,
} from '@/lib/payload/queries'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'The Social Lama blog — marketing, advertising, SEO, and social media in practice. Strategies, case studies, and concrete advice for brands.',
  alternates: alternatesForPath('/en/blog'),
}

/**
 * The English /en/blog hub. The composition is `BlogHubView`, shared with the
 * Polish hub; everything here reads under `locale: 'en'`, so a post with no
 * English translation does not exist on this surface.
 *
 * Every Payload read is SEQUENTIAL, like its Polish twin: four reads per hub
 * against the unpooled prod instance during static generation, and a concurrent
 * burst there times the build out.
 */
export default async function EnBlogPage() {
  const hub = await getBlogHub('en')
  const postsPage = await getPostsPage(1, undefined, 'en')
  const categories = await getCategories('en')
  const searchIndex = await getSearchIndex('en')

  return (
    <BlogHubView
      basePath="/en/blog"
      categories={categories}
      categoryPath="/en/blog/category"
      content={hubView}
      data={hub}
      hubPath="/en/blog"
      locale="en"
      postsPage={postsPage}
      searchIndex={searchIndex}
    />
  )
}
