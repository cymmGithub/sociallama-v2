import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { parsePageNumber } from '@/app/(frontend)/blog/pagination'
import { listing } from '@/lib/content/blog.en'
import { getCategories, getPostsPage } from '@/lib/payload/queries'
import { paginatedIndexMetadata } from '@/lib/utils/metadata'

interface PageProps {
  params: Promise<{ number: string }>
}

export async function generateStaticParams() {
  // Page count over the translated set only, so English pagination never
  // reaches a page whose posts exist in Polish alone.
  const { totalPages } = await getPostsPage(1, undefined, 'en')
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
  return paginatedIndexMetadata(
    `Blog — page ${number}`,
    `/en/blog/page/${number}`
  )
}

export default async function EnBlogPageN({ params }: PageProps) {
  const { number } = await params
  const page = parsePageNumber(number)
  if (page === null) {
    notFound()
  }
  if (page === 1) {
    // Page 1 is canonical at /en/blog
    permanentRedirect('/en/blog')
  }

  // Sequential, never Promise.all: the project's build-time DB
  // concurrency constraint. These prerender against the unpooled prod
  // instance alongside every other blog page, and a concurrent burst
  // there exhausts connection headroom and times the build out.
  const postsPage = await getPostsPage(page, undefined, 'en')
  const categories = await getCategories('en')
  if (postsPage.docs.length === 0) {
    notFound()
  }

  return (
    <BlogListing
      heading="Blog"
      content={listing}
      listingPath="/en/blog"
      basePath="/en/blog"
      hubPath="/en/blog"
      categoryPath="/en/blog/category"
      locale="en"
      postsPage={postsPage}
      categories={categories}
    />
  )
}
