import type { Metadata } from 'next'
import type { LocalizedErrorView } from '@/lib/content/site'

/** English brand identity — EN twin of `site.ts` (same names, English strings). */
export const APP_NAME = 'Social Lama'
export const APP_DEFAULT_TITLE = 'Social Lama'
export const APP_TITLE_TEMPLATE = '%s | Social Lama'
export const APP_DESCRIPTION =
  'Social media agency. Full-service brand management on social media: strategy, content, sales, creative, and video.'

export const OG_BASE = {
  siteName: APP_NAME,
  locale: 'en_US',
} satisfies Metadata['openGraph']

/** Error boundary + 404 copy for the `(frontend-en)` tree — EN twin of `site.ts`. */
export const errorView = {
  boundary: {
    title: 'Something went wrong',
    description:
      "We're sorry, but something unexpected happened. Please try again.",
    retryLabel: 'Try Again',
    homeLabel: 'Go Home',
  },
  notFound: {
    label: 'Error',
    message: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved.",
    cta: 'Go Home',
  },
} satisfies LocalizedErrorView
