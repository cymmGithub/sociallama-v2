import config from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'
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

async function findPostBySlug(slug: string): Promise<Post | null> {
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
async function findDraftPostBySlug(slug: string): Promise<Post | null> {
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

async function findPublishedPostSlugs(): Promise<string[]> {
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
  categoryId?: number
): Promise<PostsPage> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: categoryId
      ? { and: [{ category: { equals: categoryId } }, PUBLISHED] }
      : PUBLISHED,
    sort: '-publishedAt',
    limit: POSTS_PER_PAGE,
    page,
    depth: 2,
  })
  return {
    docs: result.docs,
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  }
}

async function findCategories(): Promise<Category[]> {
  'use cache'
  cacheTag('categories')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    sort: 'title',
    limit: 0,
    pagination: false,
  })
  return result.docs
}

async function findCategoryBySlug(slug: string): Promise<Category | null> {
  'use cache'
  cacheTag('categories')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

/** Published posts with slug + updatedAt, for the sitemap. */
async function findPostsForSitemap(): Promise<
  Pick<Post, 'slug' | 'updatedAt'>[]
> {
  'use cache'
  cacheTag('posts')
  cacheLife('days')

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: PUBLISHED,
    limit: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
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
export const getDraftPostBySlug = cache(findDraftPostBySlug)
export const getPublishedPostSlugs = cache(findPublishedPostSlugs)
export const getPostsPage = cache(findPostsPage)
export const getCategories = cache(findCategories)
export const getCategoryBySlug = cache(findCategoryBySlug)
export const getPostsForSitemap = cache(findPostsForSitemap)

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
