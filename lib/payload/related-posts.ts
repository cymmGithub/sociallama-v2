import type { RelatedPost } from '@/app/(frontend)/uslugi/[slug]/service-page'
import type { ServiceSection } from '@/lib/content/uslugi'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import {
  getCategories,
  getPostsForCategories,
  getPostsForPlatform,
  resolveCategory,
} from '@/lib/payload/queries'

/*
 * Blog-link wiring for the service pages (design D5). Server-only: it reads
 * Payload via the cached queries and hands the route plain, serializable data
 * to pass into the client renderer.
 *
 * Two shapes, because the two sections match differently: platform blocks match
 * on post title (platform relevance isn't in the taxonomy), while a `posts`
 * section matches on category (which is exactly what the taxonomy encodes).
 */

/**
 * Title search term per platform. `x` is intentionally absent — a single-letter
 * `like` match is far too noisy to surface relevant posts.
 */
/**
 * Sections as the EN data supplies them. `Localized` widens every string
 * literal, so `kind` arrives as `string` and TypeScript cannot narrow the
 * union — the same constraint `service-page.tsx` handles by dispatching on
 * `kind` at runtime and casting per branch (design D8).
 */
type Section = Localized<ServiceSection>
type PlatformsSection = Extract<ServiceSection, { kind: 'platforms' }>
type PostsSection = Extract<ServiceSection, { kind: 'posts' }>

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
  sections: readonly Section[],
  locale: Locale = 'pl'
): Promise<Record<string, readonly RelatedPost[]>> {
  const platforms = sections
    .filter((section) => section.kind === 'platforms')
    .flatMap((section) => (section as PlatformsSection).items)
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
      const posts = await getPostsForPlatform(term, locale)
      const cards: RelatedPost[] = posts.map((post) => {
        const category = resolveCategory(post.category)
        // Conditional spread — `exactOptionalPropertyTypes` forbids an explicit
        // `category: undefined` on the optional field. The title is tested
        // rather than the relation, because a category with no row in this
        // locale populates with a null title under `fallbackLocale: false`.
        return {
          slug: post.slug,
          title: post.title,
          ...(category?.title ? { category: category.title } : {}),
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

/**
 * Posts for a service's `posts` section, matched by the category slugs the
 * section declares. Returns `[]` when the service has no such section, when no
 * declared slug resolves to a category, or when nothing matches — in every case
 * the renderer drops the section, heading included (the D5 omission contract).
 */
export async function buildTopicalPosts(
  sections: readonly Section[],
  locale: Locale = 'pl'
): Promise<readonly RelatedPost[]> {
  const section = sections.find((item) => item.kind === 'posts') as
    | PostsSection
    | undefined
  if (!section) {
    return []
  }

  // Sequential and fail-soft for the same reason as above: this runs during
  // static generation against the unpooled prod DB.
  try {
    // Category ids are resolved under `pl` in BOTH locales, deliberately.
    // `section.categories` holds Polish slug literals (lib/content/uslugi.ts),
    // and `categories.slug` is now localized — so an `en` read returns English
    // slugs, matches nothing, and the section silently disappears instead of
    // erroring. The ids are shared across locales; only the slugs differ.
    const categories = await getCategories('pl')
    const ids = categories
      .filter((category) => section.categories.includes(category.slug))
      .map((category) => category.id)
    if (ids.length === 0) {
      return []
    }

    // The posts themselves are read in the requested locale, so their
    // populated categories carry localized titles for the cards below.
    const posts = await getPostsForCategories(ids.join(','), locale)
    return posts.map((post) => {
      const category = resolveCategory(post.category)
      return {
        slug: post.slug,
        title: post.title,
        ...(category?.title ? { category: category.title } : {}),
      }
    })
  } catch {
    // Transient DB/connection error at build — omit the section.
    return []
  }
}
