import cn from 'clsx'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import type { PostsPage } from '@/lib/payload/queries'
import type { Category } from '@/payload-types'
import s from './blog.module.css'
import { Pagination } from './pagination'
import { PostCard } from './post-card'

interface BlogListingProps {
  heading: string
  /** Base listing path for pagination links, e.g. `/blog`. */
  basePath: string
  postsPage: PostsPage
  categories: Category[]
  /** Slug of the active category page, if any. */
  activeCategory?: string
}

/**
 * Shared listing layout for the /blog hub and /category/{slug} pages:
 * display heading, category pills, card grid, numbered pagination, and an
 * intentional empty state.
 */
export function BlogListing({
  heading,
  basePath,
  postsPage,
  categories,
  activeCategory,
}: BlogListingProps) {
  return (
    <Wrapper theme="cream">
      <section className={s.listing}>
        <header className={s.listingHeader}>
          <h1 className={s.listingHeading}>{heading}</h1>
          <nav className={s.categories} aria-label="Kategorie">
            <Link
              className={cn(s.categoryPill, !activeCategory && s.pillActive)}
              href="/blog"
            >
              Wszystkie
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                className={cn(
                  s.categoryPill,
                  category.slug === activeCategory && s.pillActive
                )}
                href={`/category/${category.slug}`}
              >
                {category.title}
              </Link>
            ))}
          </nav>
        </header>

        {postsPage.docs.length > 0 ? (
          <>
            <div className={s.grid}>
              {postsPage.docs.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              basePath={basePath}
              page={postsPage.page}
              totalPages={postsPage.totalPages}
            />
          </>
        ) : (
          <div className={s.empty}>
            <p className={s.emptyTitle}>Jeszcze tu pusto</p>
            <p className={s.emptyText}>
              Pracujemy nad nowymi wpisami — zajrzyj wkrótce.
            </p>
          </div>
        )}
      </section>
    </Wrapper>
  )
}
