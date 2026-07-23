import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { chrome, findIndustry, INDUSTRIES } from '@/lib/content/branze'
import { OG_BASE } from '@/lib/content/site'
import { IndustryPage } from './industry-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return INDUSTRIES.map((industry) => ({ slug: industry.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const industry = findIndustry(slug)
  if (!industry) {
    return {}
  }
  const plPath = `/branze/${industry.slug}`
  const enPath = `/en/industries/${industry.pairSlug}`
  const { title, description } = industry.meta

  return {
    title,
    description,
    // Hreflang pair per the canonical slug mapping, x-default → PL (design D6).
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

export default async function BranzaPage({ params }: PageProps) {
  const { slug } = await params
  const industry = findIndustry(slug)
  if (!industry) {
    notFound()
  }
  const index = INDUSTRIES.findIndex((entry) => entry.slug === slug) + 1

  return (
    <Wrapper theme={industry.caseStudy ? 'plum' : 'cream'}>
      <IndustryPage
        industry={industry}
        chrome={chrome}
        index={index}
        caseStudyBase="/case-studies"
      />
    </Wrapper>
  )
}
