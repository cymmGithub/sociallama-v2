import type { ReactNode } from 'react'
import { getPublishedPostSlugs } from '@/lib/payload/queries'
import { gateOnPublishedSlug } from '@/lib/payload/slug-gate'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

/** Status gate above this segment's `loading.tsx`. See `gateOnPublishedSlug`.
 *  `slug` is localized, so English URLs gate on the English slug list alone. */
export default async function EnPostLayout({ children, params }: LayoutProps) {
  const { slug } = await params
  await gateOnPublishedSlug(slug, () => getPublishedPostSlugs('en'))
  return children
}
