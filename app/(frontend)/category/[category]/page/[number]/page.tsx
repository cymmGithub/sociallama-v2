import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { parsePageNumber } from '@/app/(frontend)/blog/pagination'
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

  const [postsPage, categories] = await Promise.all([
    getPostsPage(page, category.id),
    getCategories(),
  ])
  if (postsPage.docs.length === 0) {
    notFound()
  }

  return (
    <BlogListing
      heading={category.title}
      basePath={`/category/${category.slug}`}
      postsPage={postsPage}
      categories={categories}
      activeCategory={category.slug}
    />
  )
}
