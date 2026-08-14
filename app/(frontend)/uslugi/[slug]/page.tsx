import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { FaqJsonLd } from '@/components/seo/structured-data'
import {
  chrome,
  faqItemsOf,
  findService,
  USLUGI_PAGES,
} from '@/lib/content/uslugi'
import {
  buildRelatedByPlatform,
  buildTopicalPosts,
} from '@/lib/payload/related-posts'
import { pairMetadata } from '@/lib/utils/metadata'
import { ServicePage } from './service-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Roster ∪ SEO landings: the landing shares this route and this template, and
// differs only in that no navigation surface lists it.
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

  return pairMetadata({ ...service.meta, path: `/uslugi/${service.slug}` })
}

export default async function UslugaPage({ params }: PageProps) {
  const { slug } = await params
  const service = findService(slug)
  if (!service) {
    notFound()
  }

  // Blog links (D5); empty for services without the relevant section. Awaited
  // one after the other, never in parallel — see the note in related-posts.ts.
  const relatedByPlatform = await buildRelatedByPlatform(service.sections, 'pl')
  const topicalPosts = await buildTopicalPosts(service.sections, 'pl')

  // Empty for every page without an `faq` section, which is all seven services.
  const faqItems = faqItemsOf(service.sections)

  return (
    // Plum chrome — the hero paints plum; sections paint their own bands.
    <Wrapper theme="plum">
      {/* Generated from the very array the page renders, so the markup cannot
          drift from the visible copy. Server-rendered here rather than in the
          section component: structured data has no reason to wait on hydration. */}
      {faqItems.length > 0 && (
        <FaqJsonLd items={faqItems} path={`/uslugi/${service.slug}`} />
      )}
      <ServicePage
        serviceId={service.id}
        sections={service.sections}
        chrome={chrome}
        hubHref="/uslugi"
        caseStudyBase="/case-studies"
        // Polish posts sit at the root: `${''}/${slug}`.
        postBase=""
        relatedByPlatform={relatedByPlatform}
        topicalPosts={topicalPosts}
      />
    </Wrapper>
  )
}
