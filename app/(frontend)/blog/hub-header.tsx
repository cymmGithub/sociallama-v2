import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { hub } from '@/lib/content/blog'
import type { Category } from '@/payload-types'
import s from './blog.module.css'
import { HubSearchInput } from './hub-search'

/**
 * The hub's statement header: what this blog is, the category filters, and the
 * archive search. The `<h1>` is the site's editorial promise rather than the
 * word "Blog" — the plain listing keeps that job on `/blog/page/{n}`.
 */
export function HubHeader({ categories }: { categories: Category[] }) {
  return (
    <header className={s.hubHeader}>
      <p className={s.hubEyebrow}>{hub.eyebrow}</p>
      <h1 className={s.hubTitle}>{hub.title}</h1>
      <p className={s.hubLead}>{hub.lead}</p>

      <div className={s.hubFilters}>
        <nav aria-label="Kategorie" className={s.categories}>
          <Link
            aria-current="page"
            className={cn(s.categoryPill, s.pillActive)}
            href="/blog"
          >
            Wszystkie
          </Link>
          {categories.map((category) => (
            <Link
              className={s.categoryPill}
              href={`/category/${category.slug}`}
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
