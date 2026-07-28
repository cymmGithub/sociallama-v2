import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { parsePageNumber } from '@/app/(frontend)/blog/pagination'
import { listing } from '@/lib/content/blog'
import {
  getCategories,
  getCategoryBySlug,
  getPostsPage,
} from '@/lib/payload/queries'

interface PageProps {
  params: Promise<{ category: string; number: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug, number } = await params
  // Cached query (React cache + 'use cache') — shared with the page body.
  const category = await getCategoryBySlug(slug)
  return {
    title: `Kategoria ${category?.title ?? slug} — strona ${number}`,
    alternates: { canonical: `/category/${slug}/page/${number}` },
  }
}

export default async function CategoryPageN({ params }: PageProps) {
  const { category: slug, number } = await params
  const page = parsePageNumber(number)
  if (page === null) {
    notFound()
  }
  if (page === 1) {
    permanentRedirect(`/category/${slug}`)
  }

  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  // Sequential, not `Promise.all`: see the build-time DB concurrency constraint
  // documented in `app/(frontend)/blog/page.tsx`. A parallel burst against the
  // prod instance during static generation is what times a build out.
  const postsPage = await getPostsPage(page, category.id)
  const categories = await getCategories()
  if (postsPage.docs.length === 0) {
    notFound()
  }

  return (
    <BlogListing
      heading={category.title}
      content={listing}
      listingPath={`/category/${category.slug}`}
      basePath=""
      hubPath="/blog"
      categoryPath="/category"
      locale="pl"
      postsPage={postsPage}
      categories={categories}
      activeCategory={category.slug}
    />
  )
}
