import {
  absoluteUrl,
  breadcrumbList,
  jsonLdScript,
  organizationRef,
} from '@/components/seo/structured-data'
import type { ResolvedAuthor } from '@/lib/blog/author'
import { APP_BASE_URL } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import type { Post } from '@/payload-types'

/**
 * Author node for the post. A named human is an inline `Person`; the Social
 * Lama default is a bare reference to the Organization the root layout
 * already emits, so the two collapse into one entity instead of competing.
 */
function authorNode(author: ResolvedAuthor) {
  if (author.kind === 'org') {
    return organizationRef()
  }
  return {
    '@type': 'Person',
    name: author.name,
    ...(author.url ? { sameAs: [author.url] } : {}),
  }
}

/**
 * Structured data for a blog post: a `BlogPosting` plus a `BreadcrumbList`,
 * emitted as one JSON-LD script carrying both — mirroring the case-study
 * page's convention.
 */
export function BlogPostJsonLd({
  post,
  author,
  imageUrl,
  basePath,
  hubPath,
  hubLabel,
  locale,
}: {
  post: Post
  author: ResolvedAuthor
  imageUrl: string | null | undefined
  /** Post URL prefix: `''` (PL, root-level) or `/en/blog`. */
  basePath: string
  /** Blog hub path for the first breadcrumb: `/blog` or `/en/blog`. */
  hubPath: string
  /** Its label — pass the same string as the visible breadcrumb. */
  hubLabel: string
  locale: Locale
}) {
  const pageUrl = `${APP_BASE_URL}${basePath}/${post.slug}`
  const image = absoluteUrl(imageUrl)
  const description = post.seo?.metaDescription || post.excerpt || undefined

  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    inLanguage: locale,
    headline: post.title,
    ...(description ? { description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    author: authorNode(author),
    publisher: organizationRef(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }

  const breadcrumbs = breadcrumbList([
    { name: hubLabel, url: `${APP_BASE_URL}${hubPath}` },
    { name: post.title, url: pageUrl },
  ])

  return jsonLdScript([blogPosting, breadcrumbs])
}
