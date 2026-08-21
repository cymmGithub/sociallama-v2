import { foldDiacritics } from '@/lib/blog/search'
import type { CaseStudy } from '@/payload-types'

/**
 * The hub's search index — one folded string per card.
 *
 * A plain module rather than part of `hub-search.tsx` because the server
 * builds the index and the client matches against it: every export of a
 * `'use client'` file is a client reference, so a server component calling
 * `caseStudySearchEntries` from there would be calling a proxy.
 */

export interface CaseStudySearchEntry {
  slug: string
  /**
   * Client name, title, tags and excerpt, folded once on the server. Folding
   * here rather than per keystroke means the browser only ever folds the
   * query — ~50 bytes per study, against fields the card already renders.
   */
  haystack: string
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
  }))
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
