import type { Metadata } from 'next'
import * as sitePl from '@/lib/content/site'
import * as siteEn from '@/lib/content/site.en'
import { APP_BASE_URL, env } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import { alternatesForPath, localeOf } from '@/lib/i18n/slug-map'
import { resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy, Post } from '@/payload-types'

/**
 * `generateMetadata` builders shared by the two locales of a route pair, plus
 * the root-layout metadata both documents start from.
 *
 * Each builder owns one content type's whole metadata shape, so the PL and EN
 * routes cannot drift apart. The locale is derived from `path` rather than
 * passed alongside it, so the OG locale can never disagree with the URL the
 * page is actually emitting.
 */

/** The brand identity of each locale — `site.ts` and its English twin. */
const SITE = { pl: sitePl, en: siteEn } as const

/** The locale root's canonical path and its absolute `og:url`. */
const ROOT_URL = {
  pl: { canonical: '/', og: APP_BASE_URL },
  en: { canonical: '/en', og: `${APP_BASE_URL}/en` },
} as const

/**
 * Page-level `openGraph` replaces the layout's whole og object (no deep merge),
 * so every builder restates the brand identity — see `lib/content/site.ts`.
 */
function ogBase(locale: Locale): { siteName: string; locale: string } {
  return SITE[locale].OG_BASE
}

/**
 * The brand OG card. Named in ONE place because replacing the asset means
 * bumping the URL on every surface that points at it — the image optimizer
 * caches by URL for 30 days and a CDN purge cannot reach those variants, so a
 * missed copy keeps serving the old card with no error anywhere.
 */
export function brandOgImages(alt: string) {
  return [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt }]
}

/**
 * The og object for a locale ROOT — brand identity, the locale root's own
 * `og:url`, and the brand card. `rootMetadata` layers the layout's title
 * template on top; a home page spreads this and overrides only its own copy,
 * which is how it keeps `og:url`/`og:image` while stating a different
 * `og:description` from its meta description.
 */
export function rootOpenGraph(locale: Locale) {
  return {
    type: 'website' as const,
    ...ogBase(locale),
    url: ROOT_URL[locale].og,
    images: brandOgImages(SITE[locale].APP_DEFAULT_TITLE),
  }
}

/**
 * The metadata each root layout exports — the base every page's own metadata
 * merges into. Written once so the two documents cannot drift.
 */
export function rootMetadata(locale: Locale): Metadata {
  const site = SITE[locale]
  const url = ROOT_URL[locale]
  const title = {
    default: site.APP_DEFAULT_TITLE,
    template: site.APP_TITLE_TEMPLATE,
  }

  return {
    metadataBase: new URL(APP_BASE_URL),
    applicationName: site.APP_NAME,
    title,
    description: site.APP_DESCRIPTION,
    alternates: {
      canonical: url.canonical,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: site.APP_DEFAULT_TITLE,
    },
    formatDetection: { telephone: false },
    openGraph: {
      ...rootOpenGraph(locale),
      title,
      description: site.APP_DESCRIPTION,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: site.APP_DESCRIPTION,
    },
    ...(env.NEXT_PUBLIC_FACEBOOK_APP_ID
      ? { other: { 'fb:app_id': env.NEXT_PUBLIC_FACEBOOK_APP_ID } }
      : {}),
  }
}

interface DocumentPaths {
  /** The page's own URL — canonical and `og:url`. */
  path: string
  /** The other locale's URL, or null when the document has no counterpart. */
  counterpartUrl: string | null
}

/**
 * `alternates` for a document whose slug differs per locale and lives in the
 * database. The literal path table in `slug-map.ts` cannot map those (design
 * D11), so the route — which already loaded the document — reads the
 * counterpart slug and passes the URL in. A null counterpart means no
 * `languages` at all: an untranslated document must not claim one.
 */
function documentAlternates(
  path: string,
  counterpartUrl: string | null
): Metadata['alternates'] {
  return counterpartUrl
    ? alternatesForPath(path, counterpartUrl)
    : { canonical: path }
}

interface ArticleSeo {
  title: string
  description: string | undefined
  ogUrl: string | null | undefined
  ogAlt: string | undefined
}

/**
 * The SEO overrides an editor may set, each falling back to the document's own
 * field.
 *
 * `||`, not `??`: Payload stores a cleared text field as an empty string, and
 * an empty override has to fall through to the document rather than blank the
 * tag out.
 */
function articleSeo(doc: CaseStudy | Post): ArticleSeo {
  const ogMedia = resolveMedia(doc.seo?.ogImage) ?? resolveMedia(doc.cover)
  return {
    title: doc.seo?.metaTitle || doc.title,
    description: doc.seo?.metaDescription || doc.excerpt || undefined,
    ogUrl: ogMedia?.sizes?.og?.url ?? ogMedia?.url,
    ogAlt: ogMedia?.alt,
  }
}

/** Blog post detail pages — `/{slug}` (PL) and `/en/blog/{slug}` (EN). */
export function postMetadata(
  post: Post,
  { path, counterpartUrl }: DocumentPaths
): Metadata {
  const { title, description, ogUrl } = articleSeo(post)

  return {
    title,
    ...(description ? { description } : {}),
    alternates: documentAlternates(path, counterpartUrl),
    openGraph: {
      type: 'article',
      ...ogBase(localeOf(path)),
      title,
      ...(description ? { description } : {}),
      url: path,
      ...(ogUrl ? { images: [{ url: ogUrl, width: 1200, height: 630 }] } : {}),
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  }
}

/**
 * Case-study detail pages. Their slug is a brand name shared across locales,
 * so unlike posts and categories the path table resolves the pair on its own.
 */
export function caseStudyMetadata(study: CaseStudy, path: string): Metadata {
  const { title, description, ogUrl, ogAlt } = articleSeo(study)

  return {
    title,
    ...(description ? { description } : {}),
    alternates: alternatesForPath(path),
    openGraph: {
      type: 'article',
      ...ogBase(localeOf(path)),
      title,
      ...(description ? { description } : {}),
      url: path,
      ...(ogUrl
        ? { images: [{ url: ogUrl, width: 1200, height: 630, alt: ogAlt }] }
        : {}),
      ...(study.publishedAt ? { publishedTime: study.publishedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  }
}

interface CategoryMetadataOptions extends DocumentPaths {
  title: string
  description: string
}

/**
 * Blog category listings. No `openGraph`/`twitter` block by design: these are
 * paginated indexes, not shareable documents.
 */
export function categoryMetadata({
  title,
  description,
  path,
  counterpartUrl,
}: CategoryMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: documentAlternates(path, counterpartUrl),
  }
}

interface PairMetadataOptions {
  title: string
  description: string
  /** The page's own URL — canonical and `og:url`. */
  path: string
}

/**
 * Static PL↔EN pages whose slugs live in the content modules (services,
 * industries, careers positions). `alternatesForPath` resolves the hreflang pair
 * from the literal slug table, with `x-default` → PL.
 *
 * The brand OG image is restated here rather than inherited: page-level
 * `openGraph` REPLACES the layout's object outright, so every page built on this
 * builder was unfurling as a text-only card.
 */
export function pairMetadata({
  title,
  description,
  path,
}: PairMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: alternatesForPath(path),
    openGraph: {
      type: 'website',
      ...ogBase(localeOf(path)),
      title,
      description,
      url: path,
      images: brandOgImages(title),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
