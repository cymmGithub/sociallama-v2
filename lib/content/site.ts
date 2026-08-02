import type { Metadata } from 'next'
import type { Localized } from '@/lib/i18n/parity'

/** Brand identity shared by the root layout and page-level metadata. */
export const APP_NAME = 'Social Lama'
export const APP_DEFAULT_TITLE = 'Social Lama'
export const APP_TITLE_TEMPLATE = '%s — Social Lama'
export const APP_DESCRIPTION =
  'Agencja social media. Kompleksowa obsługa marek w mediach społecznościowych: strategia, content, sprzedaż, kreacje i wideo.'

/**
 * Page-level `openGraph` replaces the layout's whole og object (no deep
 * merge), so pages that set their own og must restate brand identity —
 * spread OG_BASE instead of retyping it.
 */
export const OG_BASE = {
  siteName: APP_NAME,
  locale: 'pl_PL',
} satisfies Metadata['openGraph']

/**
 * Copy for the two failure surfaces of the `(frontend)` tree: the error
 * boundary (`error.tsx`, rendered through `ErrorView`) and the 404 page
 * (`not-found.tsx`). `site.en.ts` supplies the English twin.
 *
 * `app/global-error.tsx` deliberately does not read from here — it replaces the
 * root layout, has its own harsher copy, and is Polish-only because the
 * visitor's locale is unknowable outside the router.
 *
 * NOTE: the orphan auditor (`lib/scripts/audit-static-orphans.ts`) excludes
 * `site.ts` whole, on the assumption that everything in it is `<meta>` content.
 * This block is the exception, so Polish copy added here must be checked for
 * single-letter line-end orphans by hand.
 */
export const errorView = {
  boundary: {
    title: 'Coś poszło nie tak',
    description:
      'Przepraszamy — wystąpił nieoczekiwany błąd po naszej stronie.',
    retryLabel: 'Spróbuj ponownie',
    homeLabel: 'Wróć na stronę główną',
  },
  notFound: {
    label: 'Błąd',
    message: 'Nie znaleziono strony',
    description:
      'Strona, której szukasz, nie istnieje albo została przeniesiona.',
    cta: 'Wróć na stronę główną',
  },
} as const

/** Same shape, literals widened so the English twin compiles. */
export type LocalizedErrorView = Localized<typeof errorView>
