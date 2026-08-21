import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

/**
 * Answers 404 for a slug no published document owns, from a segment's
 * `layout.tsx` rather than its `page.tsx`.
 *
 * Placement is the whole point. Within one segment the App Router nests
 * `layout.tsx` above `loading.tsx`, which sits above `page.tsx`, so a
 * `notFound()` in the page runs *after* the Suspense fallback has committed the
 * response. Next has already sent `200` and can only render the not-found body
 * into it. Every param-driven route with a `loading.tsx` answered 200 for
 * unknown slugs until this gate moved the decision one level up (measured
 * 2026-08-21: twelve URL families, no counter-example).
 *
 * The `draftMode()` short-circuit keeps the authenticated preview flow working:
 * an unpublished draft is by definition absent from `publishedSlugs`, and
 * `blog-post-page`'s Draft preview requirement says the editor must still see
 * it at its future URL. Reading it here is safe because the layout resolves
 * before the boundary below it, unlike the root layout, where the same await
 * once pushed every route into a hidden late segment (see
 * `components/layout/root-document`).
 *
 * `publishedSlugs` is a thunk so the query is skipped entirely in draft mode.
 * Every caller passes a `'use cache'` query, which is why gating costs a cache
 * hit rather than a request-time round trip and the page body still streams.
 */
export async function gateOnPublishedSlug(
  slug: string,
  publishedSlugs: () => Promise<string[]>
): Promise<void> {
  const { isEnabled: isDraft } = await draftMode()
  if (isDraft) {
    return
  }

  const slugs = await publishedSlugs()
  // An empty collection means `staticParamsOrPlaceholder` invented a synthetic
  // `placeholder-*` param to satisfy Cache Components' non-empty requirement,
  // and the build prerenders it. That param 404s by design, which is harmless
  // inside the boundary below and a build crash above it
  // (`TypeError: Cannot read properties of undefined`). With nothing published
  // there is nothing to gate on, so fall through and let the page decide.
  if (slugs.length === 0) {
    return
  }

  if (!slugs.includes(slug)) {
    notFound()
  }
}
