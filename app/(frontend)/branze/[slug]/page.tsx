import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { chrome, findIndustry, INDUSTRIES } from '@/lib/content/branze'
import { pairMetadata } from '@/lib/utils/metadata'
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

  return pairMetadata({ ...industry.meta, path: `/branze/${industry.slug}` })
}

export default async function BranzaPage({ params }: PageProps) {
  const { slug } = await params
  const industry = findIndustry(slug)
  if (!industry) {
    notFound()
  }

  return (
    // Plum chrome on both variants — the header/logo match the brand (the cream
    // theme rendered a sand-gray header bar); sections paint their own bands.
    <Wrapper theme="plum">
      <IndustryPage
        industry={industry}
        chrome={chrome}
        hubHref="/branze"
        caseStudyBase="/case-studies"
      />
    </Wrapper>
  )
}
