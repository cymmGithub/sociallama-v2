import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { getCategories, getPostsPage } from '@/lib/payload/queries'

interface PageProps {
  params: Promise<{ number: string }>
}

function parsePageNumber(raw: string): number | null {
  const page = Number(raw)
  return Number.isInteger(page) && page >= 1 ? page : null
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
      basePath="/blog"
      postsPage={postsPage}
      categories={categories}
    />
  )
}
