import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IndustryPage } from '@/app/(frontend)/branze/[slug]/industry-page'
import { Wrapper } from '@/components/layout/wrapper'
import { chrome, findIndustry, INDUSTRIES } from '@/lib/content/branze.en'
import { pairMetadata } from '@/lib/utils/metadata'

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

  return pairMetadata({
    ...industry.meta,
    path: `/en/industries/${industry.slug}`,
  })
}

export default async function EnIndustryPage({ params }: PageProps) {
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
        hubHref="/en/industries"
        caseStudyBase="/en/case-studies"
      />
    </Wrapper>
  )
}
