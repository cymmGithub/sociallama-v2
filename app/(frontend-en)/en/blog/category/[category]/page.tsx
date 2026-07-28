import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogListing } from '@/app/(frontend)/blog/listing'
import { listing } from '@/lib/content/blog.en'
import {
  getCategories,
  getCategoryBySlug,
  getPostsPage,
} from '@/lib/payload/queries'

/*
 * English category listings at /en/blog/category/{en-slug}. Category slugs are
 * localized, so these are separate URLs from the Polish /category/{slug} pages
 * rather than a translated view of them.
 */

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories('en')
  // Cache Components requires a non-empty result; with no category translated
  // yet, prerender one guaranteed-404 path so the build succeeds.
  if (categories.length === 0) {
    return [{ category: 'placeholder-no-content' }]
  }
  return categories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug, 'en')
  if (!category) {
    return {}
  }
  return {
    title: `${category.title} — Blog`,
    description: `Posts in the ${category.title} category on the Social Lama blog.`,
    alternates: { canonical: `/en/blog/category/${category.slug}` },
  }
}

export default async function EnCategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug, 'en')
  if (!category) {
    notFound()
  }

  // Sequential, never Promise.all: the project's build-time DB
  // concurrency constraint. These prerender against the unpooled prod
  // instance alongside every other blog page, and a concurrent burst
  // there exhausts connection headroom and times the build out.
  const postsPage = await getPostsPage(1, category.id, 'en')
  const categories = await getCategories('en')

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
