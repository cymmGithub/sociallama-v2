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

  // Queried SEQUENTIALLY, not via Promise.all: this runs during static
  // generation at build time, and a concurrent burst of connections to the
  // (unpooled) prod Neon DB — on top of ~79 blog pages prerendering in parallel
  // — exhausts connection headroom and times out the whole build (ETIMEDOUT).
  // One-at-a-time keeps our build-time DB footprint flat. Each query is also
  // wrapped so a transient timeout degrades to "no related posts" (the D5
  // graceful-omission contract) instead of failing the page build.
  const result: Record<string, readonly RelatedPost[]> = {}
  const unique = [...new Set(platforms)]
  for (const platform of unique) {
    const term = PLATFORM_SEARCH[platform]
    if (!term) {
      continue
    }
    try {
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
      if (cards.length > 0) {
        result[platform] = cards
      }
    } catch {
      // Transient DB/connection error at build — omit this platform's block.
    }
  }

  return result
}
