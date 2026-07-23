import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IndustryPage } from '@/app/(frontend)/branze/[slug]/industry-page'
import { Wrapper } from '@/components/layout/wrapper'
import { chrome, findIndustry, INDUSTRIES } from '@/lib/content/branze.en'
import { OG_BASE } from '@/lib/content/site.en'

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
  const enPath = `/en/industries/${industry.slug}`
  const plPath = `/branze/${industry.pairSlug}`
  const { title, description } = industry.meta

  return {
    title,
    description,
    // Hreflang pair per the canonical slug mapping, x-default → PL (design D6).
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

export default async function EnIndustryPage({ params }: PageProps) {
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
        caseStudyBase="/en/case-studies"
      />
    </Wrapper>
  )
}
