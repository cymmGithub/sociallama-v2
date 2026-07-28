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
  // Cache Components requires a non-empty result; on an empty CMS prerender
  // one guaranteed-404 path so the build succeeds.
  if (categories.length === 0) {
    return [{ category: 'placeholder-bez-tresci' }]
  }
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

  const counterSlug = await getCategorySlugInLocale(category.id, 'en')

  return {
    title: `${category.title} — Blog`,
    description: `Wpisy w kategorii ${category.title} na blogu Social Lama.`,
    // Resolved from the document: a category's slug differs per locale, so the
    // literal path table cannot map it (design D11). Absent when the category
    // has no row in the other locale.
    alternates: {
      canonical: `/category/${category.slug}`,
      ...(counterSlug
        ? {
            languages: {
              pl: `/category/${category.slug}`,
              en: `/en/blog/category/${counterSlug}`,
              'x-default': `/category/${category.slug}`,
            },
          }
        : {}),
    },
  }
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
