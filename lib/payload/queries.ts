import config from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Locale } from '@/lib/i18n/slug-map'
import type {
  BlogHub,
  CaseStudy,
  Category,
  Media,
  Post,
  SocialPlatform,
} from '@/payload-types'

/**
 * Cached Local API queries for the blog routes.
 *
 * Every public read goes through a `'use cache'` function (Cache Components
 * is enabled globally — uncached data access in prerendered pages is a build
 * error) tagged for on-demand invalidation. The Payload `afterChange` /
 * `afterDelete` hooks revalidate these tags, so published edits appear
 * within seconds without a redeploy while pages stay static-speed.
 *
 * Cache tags:
 * - `posts`        — any post list (hub, categories, sitemap, homepage)
 * - `post:{slug}`  — a single post page
 * - `categories`   — the category list
 * - `blog-hub`     — the /blog hub's editorial curation
 *
 * IMPORTANT: the Local API runs with overrideAccess: true, so access
 * control does NOT filter drafts here — every public query must constrain
 * `_status` explicitly.
 */

/** Posts per page on /blog and /category/{slug}. */
export const POSTS_PER_PAGE = 9

/** Posts in a post page's closing "Czytaj dalej" row. */
export const RELATED_POSTS_COUNT = 3

const PUBLISHED = { _status: { equals: 'published' as const } }

/**
 * The English gate (design D6): a post with no English translation does not
 * exist in English.
 *
 * This has to be a `where` predicate, not `fallbackLocale`. `fallbackLocale`
 * is applied in Payload's `afterRead` field pass, i.e. after the SQL has
 * already selected and counted the rows — it turns Polish text into `null`,
 * it does not remove the row. Used as the gate it would give `/en/blog` a
 * page count computed over all 79 posts, pages mostly full of nulls, and
 * `findLatestPost` / `findRelatedPosts` returning zero English results while
 * translated posts exist, because those take the newest N *before* any
 * filter could run.
 *
 * `exists` maps to `isNotNull` in the adapter, and `buildQuery` scopes a
 * localized field's predicate to the active locale, so this joins
 * `posts_locales` on `_locale = 'en'`. The migration backfilled only `pl`
 * rows, so an untranslated post has no English row at all and is excluded
 * from selection *and* from `countDistinct` — which is what makes the
 * pagination arithmetic correct.
 */
const TRANSLATED = { title: { exists: true } } as const

/** As an `and:` member, for the queries that carry other predicates too. */
const translated = (locale: Locale) => (locale === 'en' ? [TRANSLATED] : [])

/**
 * `fallbackLocale: false` is still threaded, but only as a read guard so a
 * partially written document cannot render half-Polish. It is not the gate.
 */
const READ = { fallbackLocale: false } as const

async function findPostBySlug(
  slug: string,
  locale: Locale = 'pl'
): Promise<Post | null> {
  'use cache'
  cacheTag('posts', `post:${slug}`)
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, ...translated(locale), PUBLISHED],
    },
    limit: 1,
    depth: 2,
    locale,
    ...READ,
  })
  return result.docs[0] ?? null
}

/**
 * Latest draft version of a post, for authenticated preview only
 * (Next draft mode). Deliberately uncached: preview requests are dynamic.
 */
async function findDraftPostBySlug(
  slug: string,
  locale: Locale = 'pl'
): Promise<Post | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    // No `translated()` gate: this is an authenticated preview of one
    // deliberately targeted document, and the slug lookup is already scoped
    // to the locale — an English slug only matches an English row.
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: true,
    locale,
    ...READ,
  })
  return result.docs[0] ?? null
}

async function findPublishedPostSlugs(
  locale: Locale = 'pl'
): Promise<string[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [...translated(locale), PUBLISHED] },
    limit: 0,
    pagination: false,
    select: { slug: true },
    locale,
    ...READ,
  })
  return result.docs.map((doc) => doc.slug)
}

/** Newest published post, for the homepage NewsLAMA section. */
async function findLatestPost(locale: Locale = 'pl'): Promise<Post | null> {
  'use cache'
  cacheTag('posts')
  // On-demand-only, no time-based revalidate: any finite revalidate makes
  // every consuming route ISR, and Vercel's cold-PoP path for ISR routes
  // buffers the WHOLE document (~3-5s) even when the prerender is fresh —
  // measured on /o-nas vs the pure-static /zostan-lama, 2026-07-30. The
  // profiles can't express "never" ('max' = 30d), so this passes Next's own
  // INFINITE_CACHE sentinel (0xfffffffe) directly; the routes then prerender
  // with `revalidate: false` and serve as plain static. Freshness is
  // unaffected: the Payload publish hook fires revalidateTag('posts').
  cacheLife({ stale: 300, revalidate: 0xfffffffe, expire: 0xfffffffe })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [...translated(locale), PUBLISHED] },
    sort: '-publishedAt',
    limit: 1,
    depth: 2,
    locale,
    ...READ,
  })
  return result.docs[0] ?? null
}

export interface PostsPage {
  docs: Post[]
  page: number
  totalPages: number
  totalDocs: number
}

/**
 * Published posts, newest first, for /blog and /category/{slug}.
 * Pass a category id to filter; page is 1-based.
 */
async function findPostsPage(
  page: number,
  categoryId?: number,
  locale: Locale = 'pl'
): Promise<PostsPage> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        ...(categoryId ? [{ category: { equals: categoryId } }] : []),
        ...translated(locale),
        PUBLISHED,
      ],
    },
    sort: '-publishedAt',
    limit: POSTS_PER_PAGE,
    page,
    depth: 2,
    locale,
    ...READ,
  })
  return {
    docs: result.docs,
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  }
}

async function findCategories(locale: Locale = 'pl'): Promise<Category[]> {
  'use cache'
  cacheTag('categories')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    // Gated like posts: an untranslated category would otherwise surface in
    // the English UI under its Polish name, pointing at a Polish slug. Written
    // as a bare `where` rather than an `and:` because there is no other
    // predicate to join it to.
    where: locale === 'en' ? TRANSLATED : {},
    sort: 'title',
    limit: 0,
    pagination: false,
    locale,
    ...READ,
  })
  return result.docs
}

async function findCategoryBySlug(
  slug: string,
  locale: Locale = 'pl'
): Promise<Category | null> {
  'use cache'
  cacheTag('categories')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    // Gated even though the localized `slug` predicate cannot match a missing
    // English row on its own. Relying on that would make the exclusion
    // incidental — true only for as long as nobody adds a fallback or a
    // second lookup key — where every other query states it outright.
    where: { and: [{ slug: { equals: slug } }, ...translated(locale)] },
    limit: 1,
    locale,
    ...READ,
  })
  return result.docs[0] ?? null
}

/** Published posts with slug + updatedAt, for the sitemap. */
async function findPostsForSitemap(
  locale: Locale = 'pl'
): Promise<Pick<Post, 'id' | 'slug' | 'updatedAt'>[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [...translated(locale), PUBLISHED] },
    limit: 0,
    pagination: false,
    // `id` is selected so the sitemap can join the two locales' rows and emit
    // hreflang alternates without one lookup per post.
    select: { id: true, slug: true, updatedAt: true },
    locale,
    ...READ,
  })
  return result.docs
}

/** Published posts, newest first, with the fields the /llms.txt index needs. */
async function findPostsForLlms(
  locale: Locale = 'pl'
): Promise<Pick<Post, 'title' | 'slug' | 'excerpt'>[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [...translated(locale), PUBLISHED] },
    sort: '-publishedAt',
    limit: 0,
    pagination: false,
    select: { title: true, slug: true, excerpt: true },
    locale,
    ...READ,
  })
  return result.docs
}

/*
 * Case studies — same drafts/caching discipline as posts. Cache tags:
 * - `case-studies`         — any case-study list (listing, sitemap)
 * - `case-study:{slug}`    — a single case-study page
 */

async function findCaseStudyBySlug(
  slug: string,
  locale: Locale = 'pl'
): Promise<CaseStudy | null> {
  'use cache'
  cacheTag('case-studies', `case-study:${slug}`)
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'case-studies',
    where: { and: [{ slug: { equals: slug } }, PUBLISHED] },
    limit: 1,
    depth: 2,
    locale,
  })
  return result.docs[0] ?? null
}

/** Latest draft version of a case study, for authenticated preview only. */
async function findDraftCaseStudyBySlug(
  slug: string,
  locale: Locale = 'pl'
): Promise<CaseStudy | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: true,
    locale,
  })
  return result.docs[0] ?? null
}

async function findPublishedCaseStudySlugs(): Promise<string[]> {
  'use cache'
  cacheTag('case-studies')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'case-studies',
    where: PUBLISHED,
    limit: 0,
    pagination: false,
    select: { slug: true },
  })
  return result.docs.map((doc) => doc.slug)
}

/** Published case studies, in the manual admin order, for the listing. */
async function findCaseStudies(locale: Locale = 'pl'): Promise<CaseStudy[]> {
  'use cache'
  cacheTag('case-studies')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'case-studies',
    where: PUBLISHED,
    // `_order` is not localized, so PL and EN list the portfolio identically.
    sort: '_order',
    limit: 0,
    pagination: false,
    depth: 2,
    locale,
  })
  return result.docs
}

/** Published case studies with slug + updatedAt, for the sitemap. */
async function findCaseStudiesForSitemap(): Promise<
  Pick<CaseStudy, 'slug' | 'updatedAt'>[]
> {
  'use cache'
  cacheTag('case-studies')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'case-studies',
    where: PUBLISHED,
    limit: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
  })
  return result.docs
}

/**
 * Up to three published posts whose title matches a platform term, for the
 * CONTENT page's related-posts blocks (design D5). The blog taxonomy is topical
 * (SEO / Marketing / Reklama / Social media), so platform relevance lives only
 * in titles — hence the case-insensitive title `like`. Returns `[]` when nothing
 * matches, so the caller omits the whole block rather than showing empty slots.
 */
async function findPostsForPlatform(
  term: string,
  locale: Locale = 'pl'
): Promise<Post[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    // `title like` is itself locale-scoped, so under `en` it already matches
    // English titles only. The gate stays for the same reason it is
    // everywhere else: `like` on a missing locale row matches nothing, but
    // relying on that would make the exclusion incidental rather than stated.
    where: {
      and: [{ title: { like: term } }, ...translated(locale), PUBLISHED],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 2,
    locale,
    ...READ,
  })
  return result.docs
}

/**
 * Up to three published posts drawn from the given categories, for a service
 * page's `posts` section (design D5). Unlike the platform blocks — which have
 * to match on title because platform relevance isn't in the taxonomy — the blog
 * categories are already topical, so this matches on the relation directly.
 *
 * Takes comma-joined category IDs rather than an array because the React
 * `cache()` wrapper keys on argument identity: a fresh array literal per call
 * would never hit, defeating the dedup the wrapper exists for.
 */
async function findPostsForCategories(
  ids: string,
  locale: Locale = 'pl'
): Promise<Post[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { category: { in: ids.split(',').map(Number) } },
        ...translated(locale),
        PUBLISHED,
      ],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 2,
    locale,
    ...READ,
  })
  return result.docs
}

/**
 * The "Czytaj dalej" trio at the end of a post: same category first, topped up
 * with the newest published posts when that category is sparse (design D9).
 *
 * The two reads are SEQUENTIAL, never `Promise.all`'d — this runs during static
 * generation of ~80 post pages against the unpooled prod DB, and a concurrent
 * burst there exhausts connection headroom and times out the build.
 *
 * Scalar arguments only: the React `cache()` wrapper keys on argument identity,
 * so a fresh array literal per call would never hit.
 */
async function findRelatedPosts(
  excludeId: number,
  categoryId: number | null,
  locale: Locale = 'pl'
): Promise<Post[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const picked: Post[] = []

  if (categoryId !== null) {
    const sameCategory = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { category: { equals: categoryId } },
          { id: { not_equals: excludeId } },
          ...translated(locale),
          PUBLISHED,
        ],
      },
      sort: '-publishedAt',
      limit: RELATED_POSTS_COUNT,
      depth: 2,
      locale,
      ...READ,
    })
    picked.push(...sameCategory.docs)
  }

  if (picked.length < RELATED_POSTS_COUNT) {
    const excluded = [excludeId, ...picked.map((post) => post.id)]
    const newest = await payload.find({
      collection: 'posts',
      where: {
        and: [{ id: { not_in: excluded } }, ...translated(locale), PUBLISHED],
      },
      sort: '-publishedAt',
      limit: RELATED_POSTS_COUNT - picked.length,
      depth: 2,
      locale,
      ...READ,
    })
    picked.push(...newest.docs)
  }

  return picked
}

/**
 * A post's slug in a given locale, or null if it has none there.
 *
 * The locale toggle and `hreflang` need the OTHER locale's URL, and only the
 * route can supply it: post slugs differ per locale and live in the database,
 * so `slug-map.ts` cannot resolve them without shipping every pair to the
 * browser (design D11). The route already loaded the document, so this is one
 * extra id lookup rather than a search.
 *
 * Null is a real answer, not a failure: an untranslated post genuinely has no
 * English counterpart, and the toggle must then fall back to the locale home
 * rather than invent a URL that 404s.
 */
async function findPostSlugInLocale(
  id: number,
  locale: Locale
): Promise<string | null> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [{ id: { equals: id } }, PUBLISHED] },
    limit: 1,
    depth: 0,
    select: { slug: true },
    locale,
    ...READ,
  })
  return result.docs[0]?.slug ?? null
}

/** A category's slug in a given locale, for the same reason. */
async function findCategorySlugInLocale(
  id: number,
  locale: Locale
): Promise<string | null> {
  'use cache'
  cacheTag('categories')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    where: { id: { equals: id } },
    limit: 1,
    depth: 0,
    select: { slug: true },
    locale,
    ...READ,
  })
  return result.docs[0]?.slug ?? null
}

/** One row of the client-side search index shipped to the hub. */
export interface SearchEntry {
  slug: string
  title: string
  excerpt: string
  category: string
}

/**
 * Every published post, reduced to the four fields the hub's client filter
 * needs. At ~79 posts this is roughly 16KB — smaller than one cover thumbnail,
 * which is why search is a shipped index rather than a route (design decision 4).
 */
async function findSearchIndex(locale: Locale = 'pl'): Promise<SearchEntry[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [...translated(locale), PUBLISHED] },
    sort: '-publishedAt',
    limit: 0,
    pagination: false,
    // depth 1 populates `category` enough to read its title, and nothing more.
    depth: 1,
    select: { slug: true, title: true, excerpt: true, category: true },
    locale,
    ...READ,
  })

  return result.docs.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    category: resolveCategory(post.category)?.title ?? '',
  }))
}

/*
 * Blog hub curation (blog-hub global). Tagged `blog-hub` for curation edits and
 * `posts` because the resolved slots render post titles, covers, and bylines —
 * editing a curated post has to refresh the hub too.
 */

/** A spotlight only reaches the front end with all three parts present. */
export interface VideoSpotlight {
  title: string
  url: string
  poster: Media
  description?: string
  duration?: string
}

export interface BlogHubData {
  /** Never null when any post is published — falls back to the newest. */
  featured: Post | null
  picks: Post[]
  /** Null omits the most-read block entirely (design decision 2). */
  popular: Post | null
  /** Compact rows beside the most-read block. */
  shortList: Post[]
  /** Null omits the whole spotlight section. */
  video: VideoSpotlight | null
}

/** Editors' picks, plus the short list and the featured fallback, come from here. */
const HUB_POOL_SIZE = 12

/** Posts in the editors' picks list, and in the short list beside most-read. */
const HUB_LIST_SIZE = 4

/**
 * A curation slot resolves only to a populated, published post.
 *
 * Both halves matter. The Local API runs with `overrideAccess: true`, so a slot
 * pointing at an unpublished post populates the draft rather than filtering it
 * — without the `_status` check the hub would link to a post the public cannot
 * open. The `typeof` check covers the depth-dependent `number | Post` union.
 *
 * The title check is the same rule for the other locale: the `where` gate
 * cannot reach a slot, because a curation slot is a relationship an editor
 * sets by hand, not a row the query selects. Under `locale: 'en'` an
 * untranslated pick populates with a null title, so it degrades to the
 * empty-slot behaviour instead of rendering a headless card.
 */
function publishedPost(value: number | Post | null | undefined): Post | null {
  return typeof value === 'object' &&
    value !== null &&
    value._status === 'published' &&
    value.title
    ? value
    : null
}

/** Drop already-used posts, then take the next `count`. */
function fillFrom(pool: Post[], usedIds: Set<number>, count: number): Post[] {
  return pool.filter((post) => !usedIds.has(post.id)).slice(0, count)
}

/**
 * Normalize the video group: a spotlight missing its title, destination, or
 * poster is treated as absent, so the section disappears rather than rendering
 * a headless block or an empty frame. The admin already refuses to save that
 * state (see the blog-hub global) — this is the render-side half of the rule,
 * covering rows written before the validation existed.
 */
function resolveSpotlight(video: BlogHub['video']): VideoSpotlight | null {
  const poster = resolveMedia(video?.poster)
  if (!(video?.title && video.url && poster)) {
    return null
  }
  return {
    title: video.title,
    url: video.url,
    poster,
    ...(video.description ? { description: video.description } : {}),
    ...(video.duration ? { duration: video.duration } : {}),
  }
}

/**
 * The /blog hub's curated sections, with every slot's empty behaviour applied.
 *
 * Two reads, SEQUENTIAL rather than `Promise.all`'d, per the project's
 * build-time DB concurrency constraint: this runs during static generation
 * against the unpooled prod DB, where a concurrent burst times the build out.
 */
async function findBlogHub(locale: Locale = 'pl'): Promise<BlogHubData> {
  'use cache'
  cacheTag('blog-hub', 'posts')
  cacheLife('days')

  const payload = await getPayload({ config })

  // `fallbackLocale: false` is load-bearing here rather than defensive: with
  // the config's global fallback, an empty English curation slot would
  // inherit the Polish one and feature a post that has no English version.
  // Empty English slots must stay empty so the fallbacks below fill them
  // from the gated pool (task 6.4).
  const global = await payload.findGlobal({
    slug: 'blog-hub',
    depth: 2,
    locale,
    ...READ,
  })

  const pool = await payload.find({
    collection: 'posts',
    where: { and: [...translated(locale), PUBLISHED] },
    sort: '-publishedAt',
    limit: HUB_POOL_SIZE,
    depth: 2,
    locale,
    ...READ,
  })
  const newest = pool.docs

  const featured = publishedPost(global.featured) ?? newest[0] ?? null
  const used = new Set<number>(featured ? [featured.id] : [])

  const curatedPicks = (global.picks ?? [])
    .map(publishedPost)
    .filter((post): post is Post => post !== null)
    .filter((post) => post.id !== featured?.id)
  const picks = curatedPicks.length
    ? curatedPicks
    : fillFrom(newest, used, HUB_LIST_SIZE)
  for (const post of picks) {
    used.add(post.id)
  }

  const popular = publishedPost(global.popular)
  if (popular) {
    used.add(popular.id)
  }

  return {
    featured,
    picks,
    popular,
    shortList: fillFrom(newest, used, HUB_LIST_SIZE),
    video: resolveSpotlight(global.video),
  }
}

/** Social-platform logos, for matching a result's platform to its mark. */
async function findSocialPlatforms(): Promise<SocialPlatform[]> {
  'use cache'
  cacheTag('social-platforms')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'social-platforms',
    limit: 0,
    pagination: false,
    depth: 1,
  })
  return result.docs
}

/*
 * Public API — each query is wrapped in React cache() so that
 * generateMetadata and the page body share ONE invocation per request.
 * Besides the usual dedup, this avoids a dev-mode deadlock: two concurrent
 * fills of the same 'use cache' key that both enter Payload's getPayload
 * hang the request (observed Next 16.2.10 + Payload 3.86).
 */
export const getPostBySlug = cache(findPostBySlug)
export const getLatestPost = cache(findLatestPost)
export const getDraftPostBySlug = cache(findDraftPostBySlug)
export const getPublishedPostSlugs = cache(findPublishedPostSlugs)
export const getPostsPage = cache(findPostsPage)
export const getCategories = cache(findCategories)
export const getCategoryBySlug = cache(findCategoryBySlug)
export const getPostsForSitemap = cache(findPostsForSitemap)
export const getPostsForLlms = cache(findPostsForLlms)
export const getPostsForPlatform = cache(findPostsForPlatform)
export const getPostsForCategories = cache(findPostsForCategories)
export const getRelatedPosts = cache(findRelatedPosts)
export const getBlogHub = cache(findBlogHub)
export const getSearchIndex = cache(findSearchIndex)
export const getPostSlugInLocale = cache(findPostSlugInLocale)
export const getCategorySlugInLocale = cache(findCategorySlugInLocale)
export const getCaseStudyBySlug = cache(findCaseStudyBySlug)
export const getDraftCaseStudyBySlug = cache(findDraftCaseStudyBySlug)
export const getPublishedCaseStudySlugs = cache(findPublishedCaseStudySlugs)
export const getCaseStudies = cache(findCaseStudies)
export const getCaseStudiesForSitemap = cache(findCaseStudiesForSitemap)
export const getSocialPlatforms = cache(findSocialPlatforms)

/**
 * Static params for a CMS-driven dynamic route, with a fallback entry.
 *
 * Cache Components requires `generateStaticParams` to return a non-empty set.
 * On an empty CMS — a fresh deploy before seeding, or a locale with nothing
 * translated yet — prerendering one guaranteed-404 path keeps the build green.
 */
export function staticParamsOrPlaceholder<Key extends string>(
  key: Key,
  slugs: string[],
  placeholder: string
): Record<Key, string>[] {
  const values = slugs.length > 0 ? slugs : [placeholder]
  return values.map((value) => ({ [key]: value }) as Record<Key, string>)
}

/**
 * Display headline for a case study: strips the leading "Client — " from the
 * title, since the client already appears as the logo/name in the hero and on
 * the card. The full title is kept for the SEO <title> and JSON-LD.
 */
export function caseStudyHeadline(title: string): string {
  const rest = title.match(/^.+?\s[—–]\s(.+)$/)?.[1] ?? title
  return rest.charAt(0).toUpperCase() + rest.slice(1)
}

/** Resolve a maybe-unpopulated media relation (depth-dependent union). */
export function resolveMedia(
  value: number | Media | null | undefined
): Media | null {
  return typeof value === 'object' && value !== null ? value : null
}

/**
 * Resolve a maybe-unpopulated category relation.
 *
 * `category` is a shared field, not a localized one, so it populates on an
 * English post whether or not the category itself has been translated — and
 * under `fallbackLocale: false` an untranslated one arrives with `title` and
 * `slug` null. `payload-types.ts` declares both non-nullable, so nothing in
 * the type system catches it: the chip renders empty and the crumb links to
 * `/en/blog/category/null`.
 *
 * Treating that as "no category" is the same rule `publishedPost` applies to
 * a curation slot, and it keeps every consumer honest without each having to
 * remember the check.
 */
export function resolveCategory(
  value: number | Category | null | undefined
): Category | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  return value.title && value.slug ? value : null
}
