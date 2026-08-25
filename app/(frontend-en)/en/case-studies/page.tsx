import type { Metadata } from 'next'
import { CaseStudiesListingView } from '@/app/(frontend)/case-studies/listing-view'
import { caseStudiesListing } from '@/lib/content/case-studies.en'
import { getCaseStudies } from '@/lib/payload/queries'
import { pairMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = pairMetadata({
  title: caseStudiesListing.metaTitle,
  description: caseStudiesListing.metaDescription,
  path: '/en/case-studies',
})

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
