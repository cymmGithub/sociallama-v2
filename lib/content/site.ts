import type { Metadata } from 'next'

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
