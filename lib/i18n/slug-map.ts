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
  ['/blog', '/en/blog'],
  ['/polityka-prywatnosci', '/en/privacy-policy'],
] as const

/**
 * Sections whose detail pages carry translated slugs (`pairSlug` in the content
 * modules). Deliberately kept out of `pathPairs`: the sitemap derives these URLs
 * straight from the content files (`app/sitemap.ts`), so listing them there too
 * would emit every URL twice.
 *
 * The slug tables are literals rather than imports because this module reaches
 * the browser through `<LocaleToggle>` — importing `uslugi.ts`/`branze.ts` would
 * ship ~4k lines of page copy in every bundle to read 19 strings.
 * `slug-map.test.ts` asserts the tables match the content modules exactly, in
 * both directions, so a new service or industry cannot silently go unmapped.
 */
export const SECTIONS = [
  {
    pl: '/uslugi',
    en: '/en/services',
    hasIndex: true,
    slugs: [
      ['strategia', 'strategy'],
      ['content', 'content'],
      ['sprzedaz', 'sales'],
      ['kampanie-reklamowe', 'ad-campaigns'],
      ['kreacje-wideo', 'creative-video'],
      ['audyt-i-konsultacje', 'audit-consulting'],
      ['influencer-marketing', 'influencer-marketing'],
    ],
  },
  {
    pl: '/branze',
    en: '/en/industries',
    hasIndex: true,
    slugs: [
      ['automotive', 'automotive'],
      ['elektronika-i-agd', 'electronics'],
      ['beauty', 'beauty'],
      ['health', 'health'],
      ['finanse', 'finance'],
      ['petcare', 'pet'],
      ['alkohole', 'alcohol'],
      ['fashion', 'fashion'],
      ['horeca', 'horeca'],
      ['hotele-i-miejsca-wypoczynkowe', 'hospitality'],
      ['nieruchomosci-i-deweloperzy', 'real-estate'],
      ['rozrywka', 'entertainment'],
    ],
  },
] as const satisfies readonly {
  pl: string
  en: string
  hasIndex: boolean
  slugs: readonly (readonly [string, string])[]
}[]

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
 * Counterpart for a section index or detail page — `/uslugi/strategia` ↔
 * `/en/services/strategy`. Unlike case studies these slugs are translated, so
 * they resolve through the section's slug table rather than a prefix swap.
 * Returns null when `path` belongs to no section, or names a slug the table
 * doesn't carry (a retired page), so the caller keeps its home fallback.
 */
function sectionCounterpart(path: string): string | null {
  for (const { pl, en, hasIndex, slugs } of SECTIONS) {
    if (hasIndex && path === pl) return en
    if (hasIndex && path === en) return pl

    if (path.startsWith(`${pl}/`)) {
      const slug = path.slice(pl.length + 1)
      const pair = slugs.find(([plSlug]) => plSlug === slug)
      return pair ? `${en}/${pair[1]}` : null
    }
    if (path.startsWith(`${en}/`)) {
      const slug = path.slice(en.length + 1)
      const pair = slugs.find(([, enSlug]) => enSlug === slug)
      return pair ? `${pl}/${pair[0]}` : null
    }
  }
  return null
}

/**
 * The other-locale path for `path`. Unmapped paths resolve to the other
 * locale's home.
 *
 * `override` exists for the one category of path this module cannot resolve on
 * its own: a blog post or category, whose slug differs per locale and lives in
 * the database. Those routes already load the document server-side and so
 * already know both slugs — they pass the counterpart in rather than this
 * module growing a lookup table (design D11). It must stay literal-only: it
 * reaches the browser through `<LocaleToggle>`, and shipping 79 slug pairs to
 * read one is exactly the bundle cost the header above exists to avoid.
 */
export function counterpartPath(path: string, override?: string): string {
  if (override) {
    return override
  }
  const p = normalize(path)
  const detail = caseStudyDetailCounterpart(p)
  if (detail) return detail
  const section = sectionCounterpart(p)
  if (section) return section
  const mapped = PL_TO_EN.get(p) ?? EN_TO_PL.get(p)
  if (mapped) return mapped
  return localeOf(p) === 'en' ? PL_HOME : EN_HOME
}

/** The PL and EN URLs for the same content — for hreflang pairs. */
export function hreflangPairsForPath(
  path: string,
  override?: string
): { pl: string; en: string } {
  const p = normalize(path)
  return localeOf(p) === 'pl'
    ? { pl: p, en: counterpartPath(p, override) }
    : { pl: counterpartPath(p, override), en: p }
}

/**
 * `alternates` metadata for a mapped page: its own canonical plus the hreflang
 * `languages` map (with `x-default` → the Polish version, per design D8).
 */
export function alternatesForPath(
  path: string,
  override?: string
): {
  canonical: string
  languages: Record<string, string>
} {
  const { pl, en } = hreflangPairsForPath(path, override)
  return {
    canonical: normalize(path),
    languages: { pl, en, 'x-default': pl },
  }
}
