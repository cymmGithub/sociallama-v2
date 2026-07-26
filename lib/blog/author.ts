import { APP_DESCRIPTION, APP_NAME } from '@/lib/content/site'
import { resolveMedia } from '@/lib/payload/queries'
import type { Author, Post } from '@/payload-types'

/**
 * The one place the "who wrote this post?" rule lives. The author card, the
 * listing byline, and the `BlogPosting` JSON-LD all read this shape, so
 * presentation and structured data can never disagree about attribution.
 *
 * `kind` drives the schema.org split: named humans become a `Person`, while
 * the default becomes a reference to the site `Organization` — which is why
 * the Social Lama default is synthesized here rather than stored as a row in
 * the `authors` collection.
 */
export interface ResolvedAuthor {
  kind: 'person' | 'org'
  name: string
  /** Avatar to render; absent means the card falls back to a monogram. */
  avatarUrl?: string
  bio?: string
  /** External profile — the card's link and the `Person`'s `sameAs`. */
  url?: string
}

/**
 * The default author. Avatar is the lama mark the Organization node already
 * uses as its `logo`; `bio`/`url` are presentation only — the JSON-LD builder
 * emits a bare `@id` reference for `kind: 'org'` and never reads them.
 */
const SOCIAL_LAMA: ResolvedAuthor = {
  kind: 'org',
  name: APP_NAME,
  avatarUrl: '/icon.png',
  bio: APP_DESCRIPTION,
  url: '/o-nas',
}

/** Resolve a maybe-unpopulated author relation (depth-dependent union). */
function resolveAuthorRelation(
  value: number | Author | null | undefined
): Author | null {
  return typeof value === 'object' && value !== null ? value : null
}

export function resolvePostAuthor(post: Post): ResolvedAuthor {
  const author = resolveAuthorRelation(post.author)
  if (!author) {
    return SOCIAL_LAMA
  }

  const avatar = resolveMedia(author.avatar)
  const avatarUrl = avatar?.sizes?.thumbnail?.url ?? avatar?.url

  return {
    kind: 'person',
    name: author.name,
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(author.bio ? { bio: author.bio } : {}),
    ...(author.profileUrl ? { url: author.profileUrl } : {}),
  }
}

/** Initials for the monogram shown when an author has no avatar. */
export function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
