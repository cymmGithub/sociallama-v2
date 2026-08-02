import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { chrome, findService, SERVICES } from '@/lib/content/uslugi'
import {
  buildRelatedByPlatform,
  buildTopicalPosts,
} from '@/lib/payload/related-posts'
import { pairMetadata } from '@/lib/utils/metadata'
import { ServicePage } from './service-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }))
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

  return (
    // Plum chrome — the hero paints plum; sections paint their own bands.
    <Wrapper theme="plum">
      <ServicePage
        sections={service.sections}
        chrome={chrome}
        caseStudyBase="/case-studies"
        // Polish posts sit at the root: `${''}/${slug}`.
        postBase=""
        relatedByPlatform={relatedByPlatform}
        topicalPosts={topicalPosts}
      />
    </Wrapper>
  )
}
