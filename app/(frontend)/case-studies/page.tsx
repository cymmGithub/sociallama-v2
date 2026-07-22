import type { Metadata } from 'next'
import { caseStudiesListing } from '@/lib/content/case-studies'
import { getCaseStudies } from '@/lib/payload/queries'
import { CaseStudiesListingView } from './listing-view'

export const metadata: Metadata = {
  title: caseStudiesListing.metaTitle,
  description: caseStudiesListing.metaDescription,
  alternates: { canonical: '/case-studies' },
}

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies()
  return (
    <CaseStudiesListingView
      studies={studies}
      content={caseStudiesListing}
      basePath="/case-studies"
    />
  )
}
