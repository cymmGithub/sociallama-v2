import cn from 'clsx'
import { Link } from '@/components/ui/link'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import type { Category } from '@/payload-types'
import s from './blog.module.css'
import { HubSearchInput } from './hub-search'

/**
 * The hub's statement header: what this blog is, the category filters, and the
 * archive search. The `<h1>` is the site's editorial promise rather than the
 * word "Blog" — the plain listing keeps that job on `/blog/page/{n}`.
 *
 * Shared by both locales: the categories come from Payload (locale-resolved by
 * the page), the copy from `content`, and `hubPath` / `categoryPath` localize
 * the filter links.
 */
export function HubHeader({
  categories,
  content,
  hubPath,
  categoryPath,
}: {
  categories: Category[]
  content: Localized<typeof pl.hub>
  hubPath: string
  categoryPath: string
}) {
  return (
    <header className={s.hubHeader}>
      <p className={s.hubEyebrow}>{content.eyebrow}</p>
      <h1 className={s.hubTitle}>{content.title}</h1>
      <p className={s.hubLead}>{content.lead}</p>

      <div className={s.hubFilters}>
        <nav aria-label={content.categoriesAria} className={s.categories}>
          <Link
            aria-current="page"
            className={cn(s.categoryPill, s.pillActive)}
            href={hubPath}
          >
            {content.allCategories}
          </Link>
          {categories.map((category) => (
            <Link
              className={s.categoryPill}
              href={`${categoryPath}/${category.slug}`}
              key={category.id}
            >
              {category.title}
            </Link>
          ))}
        </nav>
        <HubSearchInput />
      </div>
    </header>
  )
}
