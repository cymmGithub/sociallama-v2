import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { OG_BASE } from '@/lib/content/site'
import { chrome, findService, SERVICES } from '@/lib/content/uslugi'
import { buildRelatedByPlatform } from '@/lib/payload/related-posts'
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
  const plPath = `/uslugi/${service.slug}`
  const enPath = `/en/services/${service.pairSlug}`
  const { title, description } = service.meta

  return {
    title,
    description,
    // Hreflang pair per the canonical slug mapping, x-default → PL.
    alternates: {
      canonical: plPath,
      languages: { pl: plPath, en: enPath, 'x-default': plPath },
    },
    openGraph: {
      type: 'website',
      ...OG_BASE,
      title,
      description,
      url: plPath,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function UslugaPage({ params }: PageProps) {
  const { slug } = await params
  const service = findService(slug)
  if (!service) {
    notFound()
  }

  // Related posts for CONTENT-style platform sections (D5); {} for services
  // without them. Blog is PL-only, so only the PL route fetches these.
  const relatedByPlatform = await buildRelatedByPlatform(service.sections)

  return (
    // Plum chrome — the hero paints plum; sections paint their own bands.
    <Wrapper theme="plum">
      <ServicePage
        sections={service.sections}
        chrome={chrome}
        caseStudyBase="/case-studies"
        relatedByPlatform={relatedByPlatform}
      />
    </Wrapper>
  )
}
