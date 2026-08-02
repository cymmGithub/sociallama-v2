import { resolveCategory, resolveMedia } from '@/lib/payload/queries'
import type { Post } from '@/payload-types'
import type { NewsLamaPost } from './index'

/**
 * Build the <NewsLama> view-model from a Payload post.
 *
 * Server-only by construction, which is why it sits beside `index.tsx` rather
 * than inside it: that module is `'use client'`, and the section's three hosts
 * (the Polish and English homepages, /o-nas) all map the post on the server.
 *
 * @param hrefBase Route prefix for the post link — `''` where posts sit at the
 * site root (Polish), `'/en/blog'` on the English site.
 */
export function toNewsLamaPost(post: Post, hrefBase: string): NewsLamaPost {
  const cover = resolveMedia(post.cover)
  return {
    title: post.title,
    excerpt: post.excerpt ?? '',
    category: resolveCategory(post.category)?.title ?? '',
    date: post.publishedAt ?? post.createdAt,
    href: `${hrefBase}/${post.slug}`,
    cover: cover?.sizes?.card?.url ?? cover?.url ?? '',
    coverAlt: cover?.alt ?? '',
  }
}
