import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { parsePageNumber } from '@/app/(frontend)/blog/pagination'
import { listing } from '@/lib/content/blog'
import { getCategories, getPostsPage } from '@/lib/payload/queries'

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
  return {
    title: `Blog — strona ${number}`,
    // Canonical only, deliberately (task 7.4). Page counts differ per locale
    // under the D6 gate — English paginates over translated posts alone — so
    // /blog/page/5 and /en/blog/page/5 are not the same set of posts, and
    // often the English one does not exist at all. A reciprocal hreflang pair
    // here would assert an equivalence that is false.
    alternates: { canonical: `/blog/page/${number}` },
  }
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

  const [postsPage, categories] = await Promise.all([
    getPostsPage(page),
    getCategories(),
  ])
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
