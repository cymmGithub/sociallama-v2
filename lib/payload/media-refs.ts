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

/** The file an `<Image>` should point at, with the box it actually is. */
export type MediaSource = {
  url: string
  width: number | null
  height: number | null
}

/**
 * Pick which file to render for a media document.
 *
 * An optimized render hands the optimizer the original and lets it resize —
 * that is what it is for. An `unoptimized` render ships `src` verbatim, so it
 * must not be handed the original: the blog archive's covers are unprocessed
 * stock at camera resolution, and Payload has already generated a `card`
 * beside each one. Measured on production, over the 60 covers of the
 * out-of-window posts (reduce-media-serving-costs §6):
 *
 *   /social-lama-podsumowanie-2021-roku   20.7 MiB @ 6240px → card 128 KiB
 *   /tiktok-zmienil-zasady-…              11.4 MiB @ 8256px → card  45 KiB
 *
 * The hero carries `preload` and `fetchPriority: high`, so the original is the
 * LCP element — a 165× regression dressed as a saving.
 *
 * `card` and not `og`: `og` is cropped to 1200×630 by design, so substituting
 * it would silently re-frame the picture. A source too small for a `card`
 * variant has none, and is already small enough to serve whole.
 */
export function mediaSource(
  media: Media | null,
  unoptimized: boolean
): MediaSource | null {
  const card = unoptimized ? media?.sizes?.card : undefined
  const url = (card?.url ?? media?.url) || null
  if (!url) {
    return null
  }
  return card?.url
    ? { url, width: card.width ?? null, height: card.height ?? null }
    : { url, width: media?.width ?? null, height: media?.height ?? null }
}
