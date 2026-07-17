import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import type { Category, Post } from '@/payload-types'

/**
 * On-demand invalidation of the blog's cache tags (see
 * lib/payload/queries.ts). Publishing in the admin panel revalidates the
 * post page, /blog, category pages, and the homepage NewsLAMA card within
 * seconds — no rebuild or redeploy.
 *
 * The seed script runs these hooks outside a Next request scope where
 * revalidateTag throws; there is no cache to invalidate there, so it is
 * safely swallowed.
 */
function safeRevalidate(...tags: string[]) {
  for (const tag of tags) {
    try {
      // 'max' = expire the tag immediately (Next 16.2 two-arg signature)
      revalidateTag(tag, 'max')
    } catch {
      // Outside Next (payload CLI / seed script) — nothing to invalidate.
    }
  }
}

export const revalidatePostAfterChange: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
}) => {
  // Draft-only saves don't affect public pages; skip until something
  // published (or previously published) changes.
  const touchesPublished =
    doc._status === 'published' || previousDoc?._status === 'published'
  if (!touchesPublished) {
    return doc
  }

  safeRevalidate('posts', `post:${doc.slug}`)
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    safeRevalidate(`post:${previousDoc.slug}`)
  }
  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
}) => {
  safeRevalidate('posts', `post:${doc.slug}`)
  return doc
}

export const revalidateCategoryAfterChange: CollectionAfterChangeHook<
  Category
> = ({ doc }) => {
  safeRevalidate('categories', 'posts')
  return doc
}

export const revalidateCategoryAfterDelete: CollectionAfterDeleteHook<
  Category
> = ({ doc }) => {
  safeRevalidate('categories', 'posts')
  return doc
}
