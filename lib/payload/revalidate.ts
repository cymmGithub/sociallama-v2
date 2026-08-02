import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  TypeWithID,
} from 'payload'
import type {
  Author,
  CaseStudy,
  Category,
  Post,
  SocialPlatform,
} from '@/payload-types'

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

/**
 * Hook pair for slug-routed collections: expire the list tag and the
 * document's own `<prefix>:<slug>` tag. Draft-only saves don't affect public
 * pages; changes are skipped until something published (or previously
 * published) changes. A slug rename also expires the old slug's tag.
 */
function slugScopedHooks<
  T extends TypeWithID & {
    slug: string
    _status?: ('draft' | 'published') | null
  },
>(listTag: string, slugPrefix: string) {
  const afterChange: CollectionAfterChangeHook<T> = ({ doc, previousDoc }) => {
    const touchesPublished =
      doc._status === 'published' || previousDoc?._status === 'published'
    if (!touchesPublished) {
      return doc
    }

    safeRevalidate(listTag, `${slugPrefix}:${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      safeRevalidate(`${slugPrefix}:${previousDoc.slug}`)
    }
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<T> = ({ doc }) => {
    safeRevalidate(listTag, `${slugPrefix}:${doc.slug}`)
    return doc
  }

  return { afterChange, afterDelete }
}

/** Hook pair for collections whose edits expire fixed tags unconditionally. */
function tagOnlyHooks<T extends TypeWithID>(...tags: string[]) {
  const afterChange: CollectionAfterChangeHook<T> = ({ doc }) => {
    safeRevalidate(...tags)
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<T> = ({ doc }) => {
    safeRevalidate(...tags)
    return doc
  }

  return { afterChange, afterDelete }
}

const postHooks = slugScopedHooks<Post>('posts', 'post')
export const revalidatePostAfterChange = postHooks.afterChange
export const revalidatePostAfterDelete = postHooks.afterDelete

const caseStudyHooks = slugScopedHooks<CaseStudy>('case-studies', 'case-study')
export const revalidateCaseStudyAfterChange = caseStudyHooks.afterChange
export const revalidateCaseStudyAfterDelete = caseStudyHooks.afterDelete

const platformHooks = tagOnlyHooks<SocialPlatform>('social-platforms')
export const revalidatePlatformAfterChange = platformHooks.afterChange
export const revalidatePlatformAfterDelete = platformHooks.afterDelete

const categoryHooks = tagOnlyHooks<Category>('categories', 'posts')
export const revalidateCategoryAfterChange = categoryHooks.afterChange
export const revalidateCategoryAfterDelete = categoryHooks.afterDelete

// An author's name/avatar/bio is rendered inside post pages and listing cards,
// so an edit has to expire the whole `posts` tag — there is no author route of
// its own to invalidate.
const authorHooks = tagOnlyHooks<Author>('posts')
export const revalidateAuthorAfterChange = authorHooks.afterChange
export const revalidateAuthorAfterDelete = authorHooks.afterDelete

// Curation only affects the /blog hub, so it gets its own tag rather than
// expiring `posts` — reordering the editors' picks should not invalidate 79
// post pages, the category listings, and the homepage along with it.
export const revalidateBlogHubAfterChange: GlobalAfterChangeHook = ({
  doc,
}) => {
  safeRevalidate('blog-hub')
  return doc
}
