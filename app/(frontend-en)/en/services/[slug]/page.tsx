import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServicePage } from '@/app/(frontend)/uslugi/[slug]/service-page'
import { Wrapper } from '@/components/layout/wrapper'
import { FaqJsonLd } from '@/components/seo/structured-data'
import { faqItemsOf } from '@/lib/content/uslugi'
import { chrome, findService, USLUGI_PAGES } from '@/lib/content/uslugi.en'
import {
  buildRelatedByPlatform,
  buildTopicalPosts,
} from '@/lib/payload/related-posts'
import { pairMetadata } from '@/lib/utils/metadata'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Roster ∪ SEO landings — see the note on the Polish route.
export function generateStaticParams() {
  return USLUGI_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = findService(slug)
  if (!service) {
    return {}
  }

  return pairMetadata({ ...service.meta, path: `/en/services/${service.slug}` })
}

export default async function EnServicePage({ params }: PageProps) {
  const { slug } = await params
  const service = findService(slug)
  if (!service) {
    notFound()
  }

  // Blog links (D5). This route previously fetched neither, because the blog
  // was Polish-only — `uslugi.en.ts` has carried an unused `relatedKicker`
  // ever since. Sequential, never parallel: see the note in related-posts.ts.
  // Both return [] until posts are translated, and the blocks then omit
  // themselves, so this is correct before and after the translation batch.
  const relatedByPlatform = await buildRelatedByPlatform(service.sections, 'en')
  const topicalPosts = await buildTopicalPosts(service.sections, 'en')

  // Empty for every page without an `faq` section — see the Polish route.
  const faqItems = faqItemsOf(service.sections)

  return (
    <Wrapper theme="plum">
      {faqItems.length > 0 && (
        <FaqJsonLd items={faqItems} path={`/en/services/${service.slug}`} />
      )}
      <ServicePage
        serviceId={service.id}
        sections={service.sections}
        chrome={chrome}
        hubHref="/en/services"
        caseStudyBase="/en/case-studies"
        postBase="/en/blog"
        relatedByPlatform={relatedByPlatform}
        topicalPosts={topicalPosts}
      />
    </Wrapper>
  )
}
