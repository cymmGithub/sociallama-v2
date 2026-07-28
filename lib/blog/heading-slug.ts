import type { Locale } from '@/lib/i18n/slug-map'

/**
 * Heading text → URL anchor. Called from exactly one place: the table-of-
 * contents walk in `lib/blog/toc.ts`. The heading renderer never slugifies —
 * it consumes the slugs the walk produced (design D1), so a table-of-contents
 * link and the heading it targets cannot drift apart.
 */

/** Polish letters whose Unicode decomposition doesn't strip to ASCII. */
const UNDECOMPOSABLE: Record<string, string> = {
  ł: 'l',
  đ: 'd',
  ø: 'o',
}

/**
 * Used when a heading is only punctuation or emoji, so the slug isn't empty.
 * Locale-aware because it lands in a URL fragment an English reader can see
 * and share — `#sekcja-2` on an English post would be a Polish leak.
 */
const FALLBACK: Record<Locale, string> = {
  pl: 'sekcja',
  en: 'section',
}

/**
 * NFD-normalize, drop combining marks (`ą` → `a`, `ż` → `z`), map the letters
 * that have no combining decomposition, then collapse everything that isn't
 * `[a-z0-9]` into single hyphens.
 *
 * Pass the `seen` set to de-duplicate: repeated heading text yields
 * `ile-to-kosztuje`, then `ile-to-kosztuje-2`. The set is the caller's
 * accumulator and **is mutated** with each returned slug.
 */
export function slugifyHeading(
  text: string,
  seen?: Set<string>,
  locale: Locale = 'pl'
): string {
  const base =
    text
      .normalize('NFD')
      // Combining marks — the ogonek, acute, and dot-above of Polish letters.
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[łđø]/g, (char) => UNDECOMPOSABLE[char] ?? char)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || FALLBACK[locale]

  if (!seen) {
    return base
  }

  let slug = base
  let suffix = 2
  while (seen.has(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  seen.add(slug)
  return slug
}
