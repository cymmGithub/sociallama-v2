import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServicePage } from '@/app/(frontend)/uslugi/[slug]/service-page'
import { Wrapper } from '@/components/layout/wrapper'
import { OG_BASE } from '@/lib/content/site.en'
import { chrome, findService, SERVICES } from '@/lib/content/uslugi.en'

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
  const enPath = `/en/services/${service.slug}`
  const plPath = `/uslugi/${service.pairSlug}`
  const { title, description } = service.meta

  return {
    title,
    description,
    // Hreflang pair per the canonical slug mapping, x-default → PL.
    alternates: {
      canonical: enPath,
      languages: { pl: plPath, en: enPath, 'x-default': plPath },
    },
    openGraph: {
      type: 'website',
      ...OG_BASE,
      title,
      description,
      url: enPath,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function EnServicePage({ params }: PageProps) {
  const { slug } = await params
  const service = findService(slug)
  if (!service) {
    notFound()
  }

  return (
    <Wrapper theme="plum">
      <ServicePage
        sections={service.sections}
        chrome={chrome}
        caseStudyBase="/en/case-studies"
      />
    </Wrapper>
  )
}
