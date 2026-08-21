import type { ReactNode } from 'react'
import { getPublishedCaseStudySlugs } from '@/lib/payload/queries'
import { gateOnPublishedSlug } from '@/lib/payload/slug-gate'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

/** Status gate above this segment's `loading.tsx`. See `gateOnPublishedSlug`.
 *  Case-study slugs are not localized, so both locales gate on the same list. */
export default async function EnCaseStudyLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params
  await gateOnPublishedSlug(slug, getPublishedCaseStudySlugs)
  return children
}
