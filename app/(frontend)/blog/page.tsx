import type { Metadata } from 'next'
import { getCategories, getPostsPage } from '@/lib/payload/queries'
import { BlogListing } from './listing'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Blog Social Lama — marketing, reklama, SEO i social media w praktyce. Strategie, case studies i konkretne wskazówki dla marek.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  const [postsPage, categories] = await Promise.all([
    getPostsPage(1),
    getCategories(),
  ])

  return (
    <BlogListing
      heading="Blog"
      basePath="/blog"
      postsPage={postsPage}
      categories={categories}
    />
  )
}
