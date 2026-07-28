import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServicePage } from '@/app/(frontend)/uslugi/[slug]/service-page'
import { Wrapper } from '@/components/layout/wrapper'
import { OG_BASE } from '@/lib/content/site.en'
import { chrome, findService, SERVICES } from '@/lib/content/uslugi.en'
import {
  buildRelatedByPlatform,
  buildTopicalPosts,
} from '@/lib/payload/related-posts'

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

  // Blog links (D5). This route previously fetched neither, because the blog
  // was Polish-only — `uslugi.en.ts` has carried an unused `relatedKicker`
  // ever since. Sequential, never parallel: see the note in related-posts.ts.
  // Both return [] until posts are translated, and the blocks then omit
  // themselves, so this is correct before and after the translation batch.
  const relatedByPlatform = await buildRelatedByPlatform(service.sections, 'en')
  const topicalPosts = await buildTopicalPosts(service.sections, 'en')

  return (
    <Wrapper theme="plum">
      <ServicePage
        sections={service.sections}
        chrome={chrome}
        caseStudyBase="/en/case-studies"
        postBase="/en/blog"
        relatedByPlatform={relatedByPlatform}
        topicalPosts={topicalPosts}
      />
    </Wrapper>
  )
}
