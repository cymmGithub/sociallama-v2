import type { MetadataRoute } from 'next'
import { APP_BASE_URL } from '@/lib/env'
import { getCategories, getPostsForSitemap } from '@/lib/payload/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Published posts only — getPostsForSitemap constrains _status; drafts
  // never appear here.
  const [posts, categories] = await Promise.all([
    getPostsForSitemap(),
    getCategories(),
  ])

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_BASE_URL}/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${APP_BASE_URL}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...baseRoutes, ...postRoutes, ...categoryRoutes]
}
