import { STATIC_ROUTES } from '@/lib/static-routes'

/**
 * Slugs a post can never use.
 *
 * Posts live at root-level URLs (`/{slug}`) for parity with the live
 * WordPress site, so a post slug must not shadow — or be shadowed by — an
 * app route or root metadata file. Next.js static routes always win over
 * the dynamic `[slug]` segment, so a colliding post would silently never
 * render; this list turns that silent failure into a validation error.
 *
 * Indexable pages come from STATIC_ROUTES (lib/static-routes.ts); extend
 * this list whenever a new non-indexable top-level route or chrome-linked
 * planned page is added.
 */
export const RESERVED_SLUGS: readonly string[] = [
  // Indexable static pages (all single-segment paths)
  ...STATIC_ROUTES.filter((route) => route.path !== '/').map((route) =>
    route.path.slice(1)
  ),
  // Non-indexable app routes
  'admin',
  'api',
  'category',
  // Planned pages already linked from the menu and footer
  'uslugi',
  'szkolenia',
  'branze',
  'regulamin',
  'cookies',
  // Preview-only Storybook proxy (next.config.ts rewrites)
  'storybook',
  // Root metadata files served from app/
  'sitemap.xml',
  'robots.txt',
  'manifest.webmanifest',
  'icon.png',
  'apple-icon.png',
  'opengraph-image.jpg',
  'twitter-image.jpg',
]
