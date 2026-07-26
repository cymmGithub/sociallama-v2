import { organizationRef } from '@/components/seo/structured-data'
import type { ResolvedAuthor } from '@/lib/blog/author'
import { APP_BASE_URL } from '@/lib/env'
import type { Post } from '@/payload-types'

/** Absolute-ify a Payload media URL (local dev uploads are relative). */
function absolute(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined
  }
  return url.startsWith('http') ? url : `${APP_BASE_URL}${url}`
}

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
}: {
  post: Post
  author: ResolvedAuthor
  imageUrl: string | null | undefined
}) {
  const pageUrl = `${APP_BASE_URL}/${post.slug}`
  const image = absolute(imageUrl)
  const description = post.seo?.metaDescription || post.excerpt || undefined

  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    inLanguage: 'pl',
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

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Blog',
        item: `${APP_BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: pageUrl,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline script content
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([blogPosting, breadcrumbs]),
      }}
    />
  )
}
