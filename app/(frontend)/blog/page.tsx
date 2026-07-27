import type { Metadata } from 'next'
import { BlogNewsletter } from '@/components/blog/newsletter'
import { Wrapper } from '@/components/layout/wrapper'
import {
  getBlogHub,
  getCategories,
  getPostsPage,
  getSearchIndex,
} from '@/lib/payload/queries'
import s from './blog.module.css'
import { HubFeatured } from './hub-featured'
import { HubHeader } from './hub-header'
import { HubPopular } from './hub-popular'
import { HubPromo } from './hub-promo'
import { HubArchive, HubCurated, HubSearch } from './hub-search'
import { HubVideo } from './hub-video'
import { Pagination } from './pagination'
import { PostCard } from './post-card'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Blog Social Lama — marketing, reklama, SEO i social media w praktyce. Strategie, case studies i konkretne wskazówki dla marek.',
  alternates: { canonical: '/blog' },
}

/**
 * The /blog hub: curated sections over the complete archive.
 *
 * Posts in the curation slots deliberately appear in the grid as well — the
 * grid is the whole archive, and excluding them would give page 1 a different
 * length from every other page and break the pagination arithmetic
 * (design decision 3).
 *
 * Every Payload read here is SEQUENTIAL. The previous `Promise.all` conflicted
 * with the project's build-time DB concurrency constraint, and this route now
 * makes four reads rather than two, so a concurrent burst against the unpooled
 * prod instance during static generation would be that much likelier to time
 * the build out.
 */
export default async function BlogPage() {
  const hub = await getBlogHub()
  const postsPage = await getPostsPage(1)
  const categories = await getCategories()
  const searchIndex = await getSearchIndex()

  return (
    <Wrapper theme="cream">
      <div className={s.listing}>
        <HubSearch index={searchIndex}>
          <HubHeader categories={categories} />

          {/* An empty catalogue gets the header and the empty state only —
              curated furniture over nothing reads as a broken page. */}
          {hub.featured && (
            <HubCurated>
              <HubFeatured featured={hub.featured} picks={hub.picks} />
              <HubPromo />
              <HubPopular popular={hub.popular} shortList={hub.shortList} />
              <BlogNewsletter />
              {/* Absent video = no section at all, not an empty frame. */}
              {hub.video && <HubVideo video={hub.video} />}
            </HubCurated>
          )}

          <HubArchive>
            {postsPage.docs.length > 0 ? (
              <>
                <div className={s.grid}>
                  {postsPage.docs.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                <Pagination
                  basePath="/blog"
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
          </HubArchive>
        </HubSearch>
      </div>
    </Wrapper>
  )
}
