import { Wrapper } from '@/components/layout/wrapper'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import type { BlogHubData, PostsPage, SearchEntry } from '@/lib/payload/queries'
import type { Category } from '@/payload-types'
import s from './blog.module.css'
import { HubFeatured } from './hub-featured'
import { HubHeader } from './hub-header'
import { HubPopular } from './hub-popular'
import { HubPromo } from './hub-promo'
import { HubArchive, HubCurated, HubSearch } from './hub-search'
import { HubVideo } from './hub-video'
import { Pagination } from './pagination'
import { PostCard } from './post-card'

/**
 * The hub's copy — `lib/content/blog.ts`'s `hubView`, spelled out here because
 * `video` keeps a call signature and `Localized` maps over object types, which
 * would strip it.
 */
interface HubViewCopy {
  hub: Localized<typeof pl.hub>
  promo: Localized<typeof pl.hubPromo>
  video: {
    badge: string
    play: string
    label: string
    posterLabel: (title: string) => string
  }
  postCard: Localized<typeof pl.postCard>
  pagination: Localized<typeof pl.pagination>
  emptyTitle: string
  emptyText: string
}

/**
 * The blog hub: curated sections over the complete archive, shared by `/blog`
 * and `/en/blog`.
 *
 * Posts in the curation slots deliberately appear in the grid as well — the
 * grid is the whole archive, and excluding them would give page 1 a different
 * length from every other page and break the pagination arithmetic
 * (design decision 3).
 *
 * Everything editorial is locale-resolved by the page; `content` carries the
 * labels and the path props localize every link. Pagination rides `hubPath`:
 * page 1 is the hub itself.
 */
export function BlogHubView({
  data,
  postsPage,
  categories,
  searchIndex,
  content,
  basePath,
  hubPath,
  categoryPath,
  locale,
}: {
  data: BlogHubData
  postsPage: PostsPage
  categories: Category[]
  searchIndex: SearchEntry[]
  content: HubViewCopy
  /** Post URL prefix: empty in Polish, where posts live at the site root. */
  basePath: string
  /** Blog hub root — its own URL, and the base for the numbered pages. */
  hubPath: string
  /** Category listing prefix, e.g. `/category`. */
  categoryPath: string
  locale: Locale
}) {
  return (
    <Wrapper theme="cream">
      <div className={s.listing}>
        <HubSearch index={searchIndex} locale={locale}>
          <HubHeader
            categories={categories}
            categoryPath={categoryPath}
            content={content.hub}
            hubPath={hubPath}
          />

          {/* An empty catalogue gets the header and the empty state only —
              curated furniture over nothing reads as a broken page. */}
          {data.featured && (
            <HubCurated>
              <HubFeatured
                basePath={basePath}
                content={content.hub}
                featured={data.featured}
                locale={locale}
                picks={data.picks}
              />
              <HubPromo content={content.promo} />
              <HubPopular
                basePath={basePath}
                content={content.hub}
                locale={locale}
                popular={data.popular}
                shortList={data.shortList}
              />
              {/* Absent video = no section at all, not an empty frame. */}
              {data.video && (
                <HubVideo content={content.video} video={data.video} />
              )}
            </HubCurated>
          )}

          <HubArchive
            archiveTitle={content.hub.archiveTitle}
            basePath={basePath}
          >
            {postsPage.docs.length > 0 ? (
              <>
                <div className={s.grid}>
                  {postsPage.docs.map((post) => (
                    <PostCard
                      basePath={basePath}
                      content={content.postCard}
                      key={post.id}
                      locale={locale}
                      post={post}
                    />
                  ))}
                </div>
                <Pagination
                  content={content.pagination}
                  listingPath={hubPath}
                  page={postsPage.page}
                  totalPages={postsPage.totalPages}
                />
              </>
            ) : (
              <div className={s.empty}>
                <p className={s.emptyTitle}>{content.emptyTitle}</p>
                <p className={s.emptyText}>{content.emptyText}</p>
              </div>
            )}
          </HubArchive>
        </HubSearch>
      </div>
    </Wrapper>
  )
}
