import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Wrapper } from '@/components/layout/wrapper'
import { caseStudyChrome } from '@/lib/content/case-studies'
import { OG_BASE } from '@/lib/content/site'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import {
  getCaseStudyBySlug,
  getDraftCaseStudyBySlug,
  getPublishedCaseStudySlugs,
  getSocialPlatforms,
  resolveMedia,
} from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import { CaseStudyArticle } from './case-study-article'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedCaseStudySlugs()
  // Cache Components requires a non-empty param set; on an empty CMS prerender
  // one guaranteed-404 path so the build succeeds before seeding.
  if (slugs.length === 0) {
    return [{ slug: 'placeholder-bez-tresci' }]
  }
  return slugs.map((slug) => ({ slug }))
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

  const title = study.seo?.metaTitle || study.title
  const description = study.seo?.metaDescription || study.excerpt || undefined
  const ogMedia = resolveMedia(study.seo?.ogImage) ?? resolveMedia(study.cover)
  const ogUrl = ogMedia?.sizes?.og?.url ?? ogMedia?.url

  return {
    title,
    ...(description ? { description } : {}),
    alternates: alternatesForPath(`/case-studies/${study.slug}`),
    openGraph: {
      type: 'article',
      ...OG_BASE,
      title,
      ...(description ? { description } : {}),
      url: `/case-studies/${study.slug}`,
      ...(ogUrl ? { images: [{ url: ogUrl, width: 1200, height: 630 }] } : {}),
      ...(study.publishedAt ? { publishedTime: study.publishedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  }
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
