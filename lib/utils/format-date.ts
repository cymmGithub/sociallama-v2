import type { Locale } from '@/lib/i18n/slug-map'

/**
 * Post dates as rendered across the site (blog cards, post pages, NewsLAMA).
 * Runtime-dependency-free so both server and client components can import it;
 * the `Locale` import is type-only and erased.
 *
 * `en-US` rather than `en-GB`: the EN voice bar specifies American spelling,
 * so "January 5, 2026" is the consistent choice even though the audience is
 * European. Worth revisiting as a content decision, not a code one.
 */
const DATE_TAG: Record<Locale, string> = {
  pl: 'pl-PL',
  en: 'en-US',
}

export function formatPostDate(iso: string, locale: Locale = 'pl'): string {
  return new Date(iso).toLocaleDateString(DATE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
