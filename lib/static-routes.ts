import type { MetadataRoute } from 'next'
import { pathPairs } from '@/lib/i18n/slug-map'

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]['changeFrequency']
>

interface RouteMeta {
  changeFrequency: ChangeFrequency
  priority: number
}

/**
 * Sitemap metadata per static page pair. Keyed by the PL paths of
 * `pathPairs` (lib/i18n/slug-map.ts) — the single registry of static
 * PL↔EN pages — so adding a pair there without metadata here (or removing
 * one without the other) is a type error, not silent sitemap drift.
 */
const ROUTE_META: Record<(typeof pathPairs)[number][0], RouteMeta> = {
  '/': { changeFrequency: 'daily', priority: 1 },
  '/o-nas': { changeFrequency: 'monthly', priority: 0.7 },
  '/kontakt': { changeFrequency: 'monthly', priority: 0.7 },
  '/zostan-lama': { changeFrequency: 'monthly', priority: 0.7 },
  '/case-studies': { changeFrequency: 'weekly', priority: 0.8 },
  '/blog': { changeFrequency: 'daily', priority: 0.8 },
  '/polityka-prywatnosci': { changeFrequency: 'yearly', priority: 0.3 },
}

export interface StaticPage extends RouteMeta {
  pl: string
  en: string
}

/**
 * Indexable static top-level page pairs.
 *
 * Consumed by `app/sitemap.ts` (both locale halves) and by the app-route
 * section of `lib/payload/reserved-slugs.ts`. Derived from `pathPairs`, so
 * extending that registry is the only step when a new static page is added.
 */
export const STATIC_PAGES: readonly StaticPage[] = pathPairs.map(
  ([pl, en]) => ({ pl, en, ...ROUTE_META[pl] })
)
