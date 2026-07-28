import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { parsePageNumber } from '@/app/(frontend)/blog/pagination'
import { listing } from '@/lib/content/blog.en'
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
  const category = await getCategoryBySlug(slug, 'en')
  return {
    title: `Category ${category?.title ?? slug} — page ${number}`,
    alternates: { canonical: `/en/blog/category/${slug}/page/${number}` },
  }
}

export default async function EnCategoryPageN({ params }: PageProps) {
  const { category: slug, number } = await params
  const page = parsePageNumber(number)
  if (page === null) {
    notFound()
  }
  if (page === 1) {
    permanentRedirect(`/en/blog/category/${slug}`)
  }

  const category = await getCategoryBySlug(slug, 'en')
  if (!category) {
    notFound()
  }

  const [postsPage, categories] = await Promise.all([
    getPostsPage(page, category.id, 'en'),
    getCategories('en'),
  ])
  if (postsPage.docs.length === 0) {
    notFound()
  }

  return (
    <BlogListing
      heading={category.title}
      content={listing}
      listingPath={`/en/blog/category/${category.slug}`}
      basePath="/en/blog"
      hubPath="/en/blog"
      categoryPath="/en/blog/category"
      locale="en"
      postsPage={postsPage}
      categories={categories}
      activeCategory={category.slug}
    />
  )
}
