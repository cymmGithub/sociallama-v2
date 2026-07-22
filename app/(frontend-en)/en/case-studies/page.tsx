import type { Metadata } from 'next'
import { CaseStudiesListingView } from '@/app/(frontend)/case-studies/listing-view'
import { caseStudiesListing } from '@/lib/content/case-studies.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { getCaseStudies } from '@/lib/payload/queries'

export const metadata: Metadata = {
  title: caseStudiesListing.metaTitle,
  description: caseStudiesListing.metaDescription,
  alternates: alternatesForPath('/en/case-studies'),
}

export default async function EnCaseStudiesPage() {
  const studies = await getCaseStudies('en')
  return (
    <CaseStudiesListingView
      studies={studies}
      content={caseStudiesListing}
      basePath="/en/case-studies"
    />
  )
}
