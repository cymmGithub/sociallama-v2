import type { RelatedPost } from '@/app/(frontend)/uslugi/[slug]/service-page'
import type { ServiceSection } from '@/lib/content/uslugi'
import { getPostsForPlatform, resolveCategory } from '@/lib/payload/queries'

/*
 * Related-posts wiring for the CONTENT page's platform sections (design D5).
 * Server-only: it reads Payload via the cached queries and hands the route a
 * plain, serializable map to pass into the client renderer. Blog is PL-only, so
 * this runs for PL pages only.
 */

/**
 * Title search term per platform. `x` is intentionally absent — a single-letter
 * `like` match is far too noisy to surface relevant posts.
 */
const PLATFORM_SEARCH: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
}

/**
 * Build the platform → related-posts map for a service's CONTENT-style platform
 * sections. Dashboard-media items (Sprzedaż) and platforms with no search term
 * or no matches are dropped, so a block renders only where there's something to
 * show — the graceful-omission contract (D5).
 */
export async function buildRelatedByPlatform(
  sections: readonly ServiceSection[]
): Promise<Record<string, readonly RelatedPost[]>> {
  const platforms = sections
    .filter(
      (section): section is Extract<ServiceSection, { kind: 'platforms' }> =>
        section.kind === 'platforms'
    )
    .flatMap((section) => section.items)
    .filter((item) => !item.dashboard)
    .map((item) => item.platform)

  const unique = [...new Set(platforms)]
  const entries = await Promise.all(
    unique.map(async (platform) => {
      const term = PLATFORM_SEARCH[platform]
      if (!term) {
        return [platform, [] as RelatedPost[]] as const
      }
      const posts = await getPostsForPlatform(term)
      const cards: RelatedPost[] = posts.map((post) => {
        const category = resolveCategory(post.category)
        // Conditional spread — `exactOptionalPropertyTypes` forbids an explicit
        // `category: undefined` on the optional field.
        return {
          slug: post.slug,
          title: post.title,
          ...(category ? { category: category.title } : {}),
        }
      })
      return [platform, cards] as const
    })
  )

  return Object.fromEntries(entries.filter(([, cards]) => cards.length > 0))
}
