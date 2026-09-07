import {
  absoluteUrl,
  breadcrumbList,
  jsonLdScript,
  organizationRef,
} from '@/components/seo/structured-data'
import type { ResolvedAuthor } from '@/lib/blog/author'
import type { FaqSection } from '@/lib/blog/faq'
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
 *
 * A `FAQPage` joins them when — and only when — the page actually renders the
 * disclosure list, because it is built from the SAME detection result the
 * renderer used. Deriving it separately would let the two drift, and a
 * `FAQPage` describing questions the page does not show is a structured-data
 * lie rather than a missing feature.
 */
export function BlogPostJsonLd({
  post,
  author,
  imageUrl,
  basePath,
  hubPath,
  hubLabel,
  locale,
  faq,
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
  /** The rendered FAQ section, or null when the body has none. */
  faq: FaqSection | null
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

  // Plain text on both sides: the answers render as prose with links, and
  // schema.org's `acceptedAnswer.text` is a string, not markup.
  const faqPage = faq
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: faq.pairs.map((pair) => ({
          '@type': 'Question',
          name: pair.questionText,
          acceptedAnswer: { '@type': 'Answer', text: pair.answerText },
        })),
      }
    : null

  return jsonLdScript(
    faqPage ? [blogPosting, breadcrumbs, faqPage] : [blogPosting, breadcrumbs]
  )
}
