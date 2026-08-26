import type { Media } from '@/payload-types'

/**
 * Pure narrowing over Payload's depth-dependent relation unions.
 *
 * A leaf module on purpose. This lives apart from `queries.ts` because that
 * module imports `@payload-config` at module scope, which runs the CMS env
 * check the moment anything in its graph is imported. `lib/utils/metadata.ts`
 * needs nothing from Payload but this four-line type guard, and reaching it
 * through `queries.ts` dragged the whole CMS into every consumer of the
 * metadata builders — including a unit test that touches no database and
 * still could not run without `DATABASE_URL`.
 *
 * `queries.ts` re-exports this, so its existing consumers import it from
 * exactly where they always did.
 */

/** Resolve a maybe-unpopulated media relation (depth-dependent union). */
export function resolveMedia(
  value: number | Media | null | undefined
): Media | null {
  return typeof value === 'object' && value !== null ? value : null
}
