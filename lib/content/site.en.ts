import type { Metadata } from 'next'

/** English brand identity — EN twin of `site.ts` (same names, English strings). */
export const APP_NAME = 'Social Lama'
export const APP_DEFAULT_TITLE = 'Social Lama'
export const APP_TITLE_TEMPLATE = '%s — Social Lama'
export const APP_DESCRIPTION =
  'Social media agency. Full-service brand management on social media: strategy, content, sales, creative, and video.'

export const OG_BASE = {
  siteName: APP_NAME,
  locale: 'en_US',
} satisfies Metadata['openGraph']
