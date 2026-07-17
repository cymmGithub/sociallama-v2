import cn from 'clsx'
import { Link } from '@/components/ui/link'
import s from './blog.module.css'

interface PaginationProps {
  /** Base listing path, e.g. `/blog` or `/category/seo`. */
  basePath: string
  page: number
  totalPages: number
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`
}

/** Parse a `/page/[number]` route param; null unless a positive integer. */
export function parsePageNumber(raw: string): number | null {
  const page = Number(raw)
  return Number.isInteger(page) && page >= 1 ? page : null
}

/** Crawlable numbered pagination; page 1 lives at the base path itself. */
export function Pagination({ basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className={s.pagination} aria-label="Paginacja">
      {page > 1 && (
        <Link className={s.pageLink} href={pageHref(basePath, page - 1)}>
          ← Nowsze
        </Link>
      )}
      {pages.map((n) => (
        <Link
          key={n}
          className={cn(s.pageLink, n === page && s.pageCurrent)}
          href={pageHref(basePath, n)}
          {...(n === page ? { 'aria-current': 'page' } : {})}
        >
          {n}
        </Link>
      ))}
      {page < totalPages && (
        <Link className={s.pageLink} href={pageHref(basePath, page + 1)}>
          Starsze →
        </Link>
      )}
    </nav>
  )
}
