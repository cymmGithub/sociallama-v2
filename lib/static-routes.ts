import type { MetadataRoute } from 'next'

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]['changeFrequency']
>

interface StaticRoute {
  path: string
  changeFrequency: ChangeFrequency
  priority: number
}

/**
 * Indexable static top-level routes.
 *
 * Single source of truth consumed by `app/sitemap.ts` and by the app-route
 * section of `lib/payload/reserved-slugs.ts`. Extend this list whenever a
 * new indexable page is added to `app/`.
 */
export const STATIC_ROUTES: readonly StaticRoute[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
  { path: '/kontakt', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/zostan-lama', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/polityka-prywatnosci', changeFrequency: 'yearly', priority: 0.3 },
]
