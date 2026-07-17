import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import {
  getCategories,
  getCategoryBySlug,
  getPostsPage,
} from '@/lib/payload/queries'

/*
 * Category listings at /category/{slug} — exact URL parity with the live
 * WordPress site's indexed category pages.
 */

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) {
    return {}
  }
  return {
    title: `${category.title} — Blog`,
    description: `Wpisy w kategorii ${category.title} na blogu Social Lama.`,
    alternates: { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  const [postsPage, categories] = await Promise.all([
    getPostsPage(1, category.id),
    getCategories(),
  ])

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
