import type { ReactNode } from 'react'
import { getPublishedCaseStudySlugs } from '@/lib/payload/queries'
import { gateOnPublishedSlug } from '@/lib/payload/slug-gate'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

/** Status gate above this segment's `loading.tsx`. See `gateOnPublishedSlug`. */
export default async function CaseStudyLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params
  await gateOnPublishedSlug(slug, getPublishedCaseStudySlugs)
  return children
}
