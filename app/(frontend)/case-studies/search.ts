import { foldDiacritics } from '@/lib/blog/search'
import type { CaseStudy } from '@/payload-types'

/**
 * The hub's filter index — what the client needs to decide whether a card is
 * visible, and nothing else.
 *
 * A plain module rather than part of `hub-search.tsx` because the server
 * builds the index and the client matches against it: every export of a
 * `'use client'` file is a client reference, so a server component calling
 * `caseStudySearchEntries` from there would be calling a proxy.
 *
 * Deliberately not carrying what the cards and rows show. Both surfaces are
 * server-rendered and already on the page; copying their logos, titles and
 * metrics into this index would ship every study's content twice for no
 * consumer. The filters need a haystack and a platform list — that is the
 * whole of it.
 */

export interface CaseStudySearchEntry {
  slug: string
  /**
   * Client name, title, tags and excerpt, folded once on the server. Folding
   * here rather than per keystroke means the browser only ever folds the
   * query — ~50 bytes per study, against fields the card already renders.
   */
  haystack: string
  /** The study's industry key — what the hub's rail filters on. Null only
   *  for a study nobody has filed yet, which the rail leaves under `all`. */
  industry: string | null
}

export function caseStudySearchEntries(
  studies: CaseStudy[]
): CaseStudySearchEntry[] {
  return studies.map((study) => ({
    slug: study.slug,
    haystack: foldDiacritics(
      [study.client.name, study.title, ...(study.tags ?? []), study.excerpt]
        .filter(Boolean)
        .join(' ')
    ),
    industry: study.industry ?? null,
  }))
}

/**
 * How many published studies each industry has.
 *
 * Computed at build and passed to the rail as props: "Motoryzacja 4" therefore
 * means four studies exist under it, not four match the current query. A count
 * that moved while you filtered would only be telling you what you can already
 * see, and would stop telling you what else is there.
 *
 * An industry with no studies is not counted here, so the rail never offers a
 * category that would empty the grid — `Finanse` and `Moda` have pages but no
 * case studies yet, and the rail simply does not list them.
 */
export function industryCounts(
  entries: CaseStudySearchEntry[]
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    if (entry.industry) {
      counts.set(entry.industry, (counts.get(entry.industry) ?? 0) + 1)
    }
  }
  return counts
}

/**
 * Slugs whose haystack contains the query.
 *
 * Whole-phrase substring, like the blog's `filterPosts`, and for the same
 * reason: at 48 studies the reader is looking for one they can half-remember,
 * and ranking machinery would cost more than it returns. An all-whitespace
 * query matches everything, so the caller can treat "empty" and "blank"
 * identically.
 */
export function matchingSlugs(
  entries: CaseStudySearchEntry[],
  query: string
): Set<string> {
  const needle = foldDiacritics(query.trim())
  return new Set(
    entries
      .filter((entry) => !needle || entry.haystack.includes(needle))
      .map((entry) => entry.slug)
  )
}
