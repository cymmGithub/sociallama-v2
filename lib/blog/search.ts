import type { SearchEntry } from '@/lib/payload/queries'

/**
 * Diacritic-insensitive matching for the hub's client-side archive filter.
 *
 * Folding runs on both the query and the content, so `wpisow` finds `wpisów`
 * and `lodz` finds `Łódź` — a Polish reader typing without diacritics is the
 * common case, not the exception.
 */

/**
 * Strip Polish diacritics and case.
 *
 * NFD decomposes most Polish letters into a base plus a combining mark, which
 * the range below removes. `ł` is the exception: it is a base letter with a
 * bar through it rather than a composed character, so NFD leaves it untouched
 * and it has to be mapped by hand. Everything else (ą ć ę ń ó ś ź ż) falls out
 * of the decomposition.
 */
export function foldDiacritics(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
}

/**
 * Posts whose title or excerpt contains the query.
 *
 * Deliberately a substring match on the whole phrase rather than per-word
 * scoring: at this catalogue size the reader is looking for a post they can
 * half-remember, and ranking machinery would cost more than it returns.
 * An all-whitespace query returns everything, so the caller can treat "empty
 * query" and "blank query" identically.
 */
export function filterPosts(
  index: SearchEntry[],
  query: string
): SearchEntry[] {
  const needle = foldDiacritics(query.trim())
  if (!needle) {
    return index
  }
  return index.filter((entry) => {
    const haystack = foldDiacritics(`${entry.title} ${entry.excerpt}`)
    return haystack.includes(needle)
  })
}
