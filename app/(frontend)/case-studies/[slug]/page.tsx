import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { caseStudyChrome } from '@/lib/content/case-studies'
import {
  getCaseStudyBySlug,
  getDraftCaseStudyBySlug,
  getPublishedCaseStudySlugs,
  getSocialPlatforms,
  staticParamsOrPlaceholder,
} from '@/lib/payload/queries'
import { caseStudyMetadata } from '@/lib/utils/metadata'
import type { CaseStudy } from '@/payload-types'
import { CaseStudyArticle } from './case-study-article'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedCaseStudySlugs()
  return staticParamsOrPlaceholder('slug', slugs, 'placeholder-bez-tresci')
}

async function loadCaseStudy(slug: string): Promise<CaseStudy | null> {
  const { isEnabled: isDraft } = await draftMode()
  return isDraft ? getDraftCaseStudyBySlug(slug) : getCaseStudyBySlug(slug)
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const study = await loadCaseStudy(slug)
  if (!study) {
    return {}
  }

  return caseStudyMetadata(study, `/case-studies/${study.slug}`)
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const [study, platforms] = await Promise.all([
    loadCaseStudy(slug),
    getSocialPlatforms(),
  ])
  if (!study) {
    notFound()
  }

  return (
    <Wrapper theme="cream">
      <CaseStudyArticle
        study={study}
        platforms={platforms}
        chrome={caseStudyChrome}
        basePath="/case-studies"
        contactHref="/kontakt"
        locale="pl"
      />
    </Wrapper>
  )
}
