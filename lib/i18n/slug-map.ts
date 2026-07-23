/**
 * PL↔EN path mapping — the single source of truth for locale routing.
 *
 * Three consumers (design D3): the PL/EN toggle (current path → counterpart),
 * `hreflang` alternates in page metadata, and the sitemap. Case-study detail
 * slugs are brand names shared across locales, so they pass through by prefix
 * rather than being enumerated here.
 */

export type Locale = 'pl' | 'en'

export const PL_HOME = '/'
export const EN_HOME = '/en'

/** Static PL↔EN page pairs. Order is the canonical marketing/legal ordering. */
export const pathPairs = [
  ['/', '/en'],
  ['/o-nas', '/en/about-us'],
  ['/kontakt', '/en/contact'],
  ['/zostan-lama', '/en/become-a-lama'],
  ['/case-studies', '/en/case-studies'],
  ['/polityka-prywatnosci', '/en/privacy-policy'],
] as const

const PL_TO_EN = new Map<string, string>(pathPairs.map(([pl, en]) => [pl, en]))
const EN_TO_PL = new Map<string, string>(pathPairs.map(([pl, en]) => [en, pl]))

/** Drop a trailing slash except on the bare root. */
function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

/** Which locale a path belongs to (EN = `/en` or anything under `/en/`). */
export function localeOf(path: string): Locale {
  const p = normalize(path)
  return p === EN_HOME || p.startsWith('/en/') ? 'en' : 'pl'
}

/**
 * Case-study detail pages share their slug across locales, so map them by
 * prefix swap instead of enumerating every slug. Returns null for non-detail
 * paths (including the bare `/case-studies` listing, handled by the static map).
 */
function caseStudyDetailCounterpart(path: string): string | null {
  if (path.startsWith('/case-studies/')) return `/en${path}`
  if (path.startsWith('/en/case-studies/')) return path.slice(EN_HOME.length)
  return null
}

/**
 * The other-locale path for `path`. Unmapped paths (e.g. a blog post, which is
 * PL-only) resolve to the other locale's home.
 */
export function counterpartPath(path: string): string {
  const p = normalize(path)
  const detail = caseStudyDetailCounterpart(p)
  if (detail) return detail
  const mapped = PL_TO_EN.get(p) ?? EN_TO_PL.get(p)
  if (mapped) return mapped
  return localeOf(p) === 'en' ? PL_HOME : EN_HOME
}

/** True when `path` has an explicit counterpart (not a home-fallback). */
export function hasCounterpart(path: string): boolean {
  const p = normalize(path)
  return (
    caseStudyDetailCounterpart(p) !== null || PL_TO_EN.has(p) || EN_TO_PL.has(p)
  )
}

/** The PL and EN URLs for the same content — for hreflang pairs. */
export function hreflangPairsForPath(path: string): { pl: string; en: string } {
  const p = normalize(path)
  return localeOf(p) === 'pl'
    ? { pl: p, en: counterpartPath(p) }
    : { pl: counterpartPath(p), en: p }
}

/**
 * `alternates` metadata for a mapped page: its own canonical plus the hreflang
 * `languages` map (with `x-default` → the Polish version, per design D8).
 */
export function alternatesForPath(path: string): {
  canonical: string
  languages: Record<string, string>
} {
  const { pl, en } = hreflangPairsForPath(path)
  return {
    canonical: normalize(path),
    languages: { pl, en, 'x-default': pl },
  }
}
