import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { parsePageNumber } from '@/app/(frontend)/blog/pagination'
import { listing } from '@/lib/content/blog'
import { getCategories, getPostsPage } from '@/lib/payload/queries'
import { paginatedIndexMetadata } from '@/lib/utils/metadata'

interface PageProps {
  params: Promise<{ number: string }>
}

export async function generateStaticParams() {
  const { totalPages } = await getPostsPage(1)
  const pages = Array.from(
    { length: Math.max(totalPages - 1, 0) },
    (_, index) => ({ number: String(index + 2) })
  )
  // Cache Components requires generateStaticParams to be non-empty; with a
  // single page of posts, prerender page 2 as its (out-of-range) 404.
  return pages.length > 0 ? pages : [{ number: '2' }]
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { number } = await params
  // Canonical-only alternates and a card-less og block — see
  // `paginatedIndexMetadata`, which carries the reasoning for both.
  return paginatedIndexMetadata({
    title: `Blog — strona ${number}`,
    path: `/blog/page/${number}`,
  })
}

export default async function BlogPageN({ params }: PageProps) {
  const { number } = await params
  const page = parsePageNumber(number)
  if (page === null) {
    notFound()
  }
  if (page === 1) {
    // Page 1 is canonical at /blog
    permanentRedirect('/blog')
  }

  // Sequential, not `Promise.all`: see the build-time DB concurrency constraint
  // documented in `app/(frontend)/blog/page.tsx`. A parallel burst against the
  // prod instance during static generation is what times a build out.
  const postsPage = await getPostsPage(page)
  const categories = await getCategories()
  if (postsPage.docs.length === 0) {
    notFound()
  }

  return (
    <BlogListing
      heading="Blog"
      content={listing}
      listingPath="/blog"
      basePath=""
      hubPath="/blog"
      categoryPath="/category"
      locale="pl"
      postsPage={postsPage}
      categories={categories}
    />
  )
}
