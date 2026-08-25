import type { MetadataRoute } from 'next'
import { INDUSTRIES } from '@/lib/content/branze'
import { USLUGI_PAGES } from '@/lib/content/uslugi'
import { careersRoles } from '@/lib/content/zostan-lama'
import { APP_BASE_URL } from '@/lib/env'
import {
  getCaseStudiesForSitemap,
  getCategories,
  getPostsForSitemap,
  getPostsPage,
} from '@/lib/payload/queries'
import { STATIC_PAGES } from '@/lib/static-routes'

type SitemapEntry = MetadataRoute.Sitemap[number]
type ChangeFrequency = SitemapEntry['changeFrequency']

/**
 * Absolute URL for a path. The home path is the bare origin: `<loc>`, canonical
 * and every hreflang `href` for it have to be the same string, and
 * `${APP_BASE_URL}/` is not.
 */
const absolute = (path: string) =>
  path === '/' ? APP_BASE_URL : `${APP_BASE_URL}${path}`

function entry(
  path: string,
  changeFrequency: ChangeFrequency,
  priority: number,
  lastModified: Date = new Date()
): SitemapEntry {
  return {
    url: absolute(path),
    lastModified,
    changeFrequency,
    priority,
  }
}

/**
 * hreflang for a pair, `x-default` on Polish (design D8).
 *
 * Built ONCE per pair and spread onto BOTH halves. hreflang is a reciprocal
 * contract: an annotation the counterpart does not return is dropped whole, so
 * a one-sided cluster buys nothing. Sharing the object rather than calling this
 * twice is what keeps the two halves from drifting on the next edit.
 */
const languagesFor = (pl: string, en: string) => ({
  languages: {
    pl: absolute(pl),
    en: absolute(en),
    'x-default': absolute(pl),
  },
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages, both locales, from the shared PL↔EN registry
  // (lib/static-routes.ts, derived from pathPairs). Both halves carry the
  // pair's hreflang cluster; the EN half keeps its flat monthly cadence.
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.flatMap(
    ({ pl, en, changeFrequency, priority }) => {
      const alternates = languagesFor(pl, en)
      return [
        { ...entry(pl, changeFrequency, priority), alternates },
        { ...entry(en, 'monthly', en === '/en' ? 0.9 : 0.6), alternates },
      ]
    }
  )

  // Published only — every query constrains _status; drafts never appear here.
  //
  // Read SEQUENTIALLY rather than with Promise.all, per the project's
  // build-time DB concurrency constraint (see app/(frontend)/blog/page.tsx).
  // This runs during static generation alongside every other page; the English
  // locale doubled the number of reads here, which is the wrong direction to
  // take a concurrent burst against the unpooled prod instance.
  const posts = await getPostsForSitemap('pl')
  const enPosts = await getPostsForSitemap('en')
  const categories = await getCategories('pl')
  const enCategories = await getCategories('en')
  const caseStudies = await getCaseStudiesForSitemap()
  const plHub = await getPostsPage(1, undefined, 'pl')
  const enHub = await getPostsPage(1, undefined, 'en')

  // Joined by id, so neither locale needs one lookup per document to name the
  // other's URL. What the join carries is the finished CLUSTER, not the
  // counterpart slug: both halves then read one object out of one map, which is
  // the same "build once, spread onto both" rule the rest of this file follows.
  // Deriving it twice — once per locale, from opposite ends — would make
  // reciprocity a coincidence of two mirrored expressions instead of a fact.
  //
  // A document missing from the other locale's list is simply absent from the
  // map and stays bare: a post without an English version — the D6 gate already
  // excluded it — gets no `alternates` rather than a guess.
  const enSlugByPostId = new Map(enPosts.map((post) => [post.id, post.slug]))
  const enSlugByCategoryId = new Map(
    enCategories.map((category) => [category.id, category.slug])
  )

  const postClusters = new Map(
    posts.flatMap((post) => {
      const enSlug = enSlugByPostId.get(post.id)
      return enSlug
        ? [
            [
              post.id,
              languagesFor(`/${post.slug}`, `/en/blog/${enSlug}`),
            ] as const,
          ]
        : []
    })
  )

  const categoryClusters = new Map(
    categories.flatMap((category) => {
      const enSlug = enSlugByCategoryId.get(category.id)
      return enSlug
        ? ([
            [
              category.id,
              languagesFor(
                `/category/${category.slug}`,
                `/en/blog/category/${enSlug}`
              ),
            ],
          ] as const)
        : []
    })
  )

  /** `{ alternates }` for a translated document, `{}` for an untranslated one. */
  const cluster = (found: ReturnType<typeof languagesFor> | undefined) =>
    found ? { alternates: found } : {}

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    ...entry(`/${post.slug}`, 'monthly', 0.7, new Date(post.updatedAt)),
    ...cluster(postClusters.get(post.id)),
  }))

  const enPostRoutes: MetadataRoute.Sitemap = enPosts.map((post) => ({
    ...entry(`/en/blog/${post.slug}`, 'monthly', 0.7, new Date(post.updatedAt)),
    ...cluster(postClusters.get(post.id)),
  }))

  // Case-study details exist at the same slug in both locales (same docs,
  // same updatedAt), so one cluster serves the pair.
  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.flatMap(
    (study) => {
      const pl = `/case-studies/${study.slug}`
      const en = `/en/case-studies/${study.slug}`
      const alternates = languagesFor(pl, en)
      const lastModified = new Date(study.updatedAt)
      return [
        { ...entry(pl, 'monthly', 0.7, lastModified), alternates },
        { ...entry(en, 'monthly', 0.7, lastModified), alternates },
      ]
    }
  )

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    ...entry(`/category/${category.slug}`, 'weekly', 0.6),
    ...cluster(categoryClusters.get(category.id)),
  }))

  const enCategoryRoutes: MetadataRoute.Sitemap = enCategories.map(
    (category) => ({
      ...entry(`/en/blog/category/${category.slug}`, 'weekly', 0.6),
      ...cluster(categoryClusters.get(category.id)),
    })
  )

  /**
   * Hub pagination, missing entirely until now — in either locale.
   *
   * No `alternates`: page counts differ per locale under the D6 gate, so
   * /blog/page/2 and /en/blog/page/2 are different sets of posts (task 7.4).
   * Page 1 is omitted because it is canonical at the hub itself.
   */
  const paginationRoutes: MetadataRoute.Sitemap = (
    [
      ['/blog', plHub],
      ['/en/blog', enHub],
    ] as const
  ).flatMap(([base, hub]) =>
    Array.from({ length: Math.max(hub.totalPages - 1, 0) }, (_, i) =>
      entry(`${base}/page/${i + 2}`, 'weekly', 0.4)
    )
  )

  // Section pages — index + every detail URL in both locales, from the
  // canonical content lists (design D6). Each pair's hreflang cluster is built
  // from `item.slug`/`item.pairSlug` and carried by both halves. The index URLs
  // are listed even though desktop chrome no longer links them (design D4), so
  // they stay crawlable.
  //
  // Services read `USLUGI_PAGES`, not the roster: the SEO landings are kept out
  // of navigation, which makes the sitemap the main way a crawler finds them.
  const sectionRoutes: MetadataRoute.Sitemap = [
    { pl: '/branze', en: '/en/industries', items: INDUSTRIES },
    { pl: '/uslugi', en: '/en/services', items: USLUGI_PAGES },
  ].flatMap(({ pl, en, items }) => {
    const indexAlternates = languagesFor(pl, en)
    return [
      { ...entry(pl, 'monthly', 0.8), alternates: indexAlternates },
      { ...entry(en, 'monthly', 0.8), alternates: indexAlternates },
      ...items.flatMap((item) => {
        const plPath = `${pl}/${item.slug}`
        const enPath = `${en}/${item.pairSlug}`
        const alternates = languagesFor(plPath, enPath)
        return [
          { ...entry(plPath, 'monthly', 0.7), alternates },
          { ...entry(enPath, 'monthly', 0.7), alternates },
        ]
      }),
    ]
  })

  // Open positions — one URL per role per locale, from the same array the
  // careers page renders its tabs from, so a closed position leaves the sitemap
  // the moment it leaves the content. Ranked below the careers page itself:
  // these are its details, and they turn over faster than it does.
  const careersRoleRoutes: MetadataRoute.Sitemap = careersRoles.flatMap(
    (role) => {
      const pl = `/zostan-lama/${role.id}`
      const en = `/en/become-a-lama/${role.id}`
      const alternates = languagesFor(pl, en)
      return [
        { ...entry(pl, 'weekly', 0.6), alternates },
        { ...entry(en, 'weekly', 0.6), alternates },
      ]
    }
  )

  return [
    ...staticRoutes,
    ...careersRoleRoutes,
    ...postRoutes,
    ...enPostRoutes,
    ...caseStudyRoutes,
    ...categoryRoutes,
    ...enCategoryRoutes,
    ...paginationRoutes,
    ...sectionRoutes,
  ]
}
