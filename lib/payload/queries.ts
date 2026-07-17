import config from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import type { Category, Media, Post } from '@/payload-types'

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
 *
 * IMPORTANT: the Local API runs with overrideAccess: true, so access
 * control does NOT filter drafts here — every public query must constrain
 * `_status` explicitly.
 */

/** Posts per page on /blog and /category/{slug}. */
export const POSTS_PER_PAGE = 9

const PUBLISHED = { _status: { equals: 'published' as const } }

export async function getPostBySlug(slug: string): Promise<Post | null> {
  'use cache'
  cacheTag('posts', `post:${slug}`)
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, PUBLISHED] },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

/**
 * Latest draft version of a post, for authenticated preview only
 * (Next draft mode). Deliberately uncached: preview requests are dynamic.
 */
export async function getDraftPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: true,
  })
  return result.docs[0] ?? null
}

export async function getPublishedPostSlugs(): Promise<string[]> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: PUBLISHED,
    limit: 0,
    pagination: false,
    select: { slug: true },
  })
  return result.docs.map((doc) => doc.slug)
}

/** Resolve a maybe-unpopulated media relation (depth-dependent union). */
export function resolveMedia(
  value: number | Media | null | undefined
): Media | null {
  return typeof value === 'object' && value !== null ? value : null
}

/** Resolve a maybe-unpopulated category relation. */
export function resolveCategory(
  value: number | Category | null | undefined
): Category | null {
  return typeof value === 'object' && value !== null ? value : null
}
