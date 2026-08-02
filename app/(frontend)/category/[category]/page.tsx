import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { LocaleCounterpart } from '@/components/layout/chrome-provider'
import { listing } from '@/lib/content/blog'
import {
  getCategories,
  getCategoryBySlug,
  getCategorySlugInLocale,
  getPostsPage,
  staticParamsOrPlaceholder,
} from '@/lib/payload/queries'
import { categoryMetadata } from '@/lib/utils/metadata'

/*
 * Category listings at /category/{slug} — exact URL parity with the live
 * WordPress site's indexed category pages.
 */

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return staticParamsOrPlaceholder(
    'category',
    categories.map((category) => category.slug),
    'placeholder-bez-tresci'
  )
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) {
    return {}
  }

  const counterSlug = await getCategorySlugInLocale(category.id, 'en')

  return categoryMetadata({
    title: `${category.title} — Blog`,
    description: `Wpisy w kategorii ${category.title} na blogu Social Lama.`,
    path: `/category/${category.slug}`,
    counterpartUrl: counterSlug ? `/en/blog/category/${counterSlug}` : null,
  })
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  // Sequential, not `Promise.all`: see the build-time DB concurrency constraint
  // documented in `app/(frontend)/blog/page.tsx`. A parallel burst against the
  // prod instance during static generation is what times a build out.
  const postsPage = await getPostsPage(1, category.id)
  const categories = await getCategories()

  const counterSlug = await getCategorySlugInLocale(category.id, 'en')

  return (
    <LocaleCounterpart
      path={counterSlug ? `/en/blog/category/${counterSlug}` : undefined}
    >
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
    </LocaleCounterpart>
  )
}
