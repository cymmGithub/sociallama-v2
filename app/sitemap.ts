import type { MetadataRoute } from 'next'
import { APP_BASE_URL } from '@/lib/env'
import { getCategories, getPostsForSitemap } from '@/lib/payload/queries'
import { STATIC_ROUTES } from '@/lib/static-routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: path === '/' ? APP_BASE_URL : `${APP_BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })
  )

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
