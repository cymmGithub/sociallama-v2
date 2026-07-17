/**
 * Slugs a post can never use.
 *
 * Posts live at root-level URLs (`/{slug}`) for parity with the live
 * WordPress site, so a post slug must not shadow — or be shadowed by — an
 * app route or root metadata file. Next.js static routes always win over
 * the dynamic `[slug]` segment, so a colliding post would silently never
 * render; this list turns that silent failure into a validation error.
 *
 * Extend this list whenever a new top-level route is added to `app/`.
 */
export const RESERVED_SLUGS = [
  // App routes
  'admin',
  'api',
  'blog',
  'category',
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
] as const
