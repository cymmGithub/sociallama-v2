import cn from 'clsx'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from '@/components/ui/link'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './blog.module.css'

interface PaginationProps {
  /** Base listing path, e.g. `/blog`, `/en/blog` or `/category/seo`. */
  listingPath: string
  content: Localized<typeof pl.pagination>
  page: number
  totalPages: number
}

function pageHref(listingPath: string, page: number): string {
  return page <= 1 ? listingPath : `${listingPath}/page/${page}`
}

/** Parse a `/page/[number]` route param; null unless a positive integer. */
export function parsePageNumber(raw: string): number | null {
  const page = Number(raw)
  return Number.isInteger(page) && page >= 1 ? page : null
}

/**
 * Crawlable numbered pagination; page 1 lives at the base path itself. Shared
 * by both locales: `listingPath` localizes the page links, `content` the
 * labels.
 */
export function Pagination({
  listingPath,
  content,
  page,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className={s.pagination} aria-label={content.navAria}>
      {page > 1 && (
        <Link
          className={cn(s.pageLink, s.pageNav)}
          href={pageHref(listingPath, page - 1)}
        >
          <ArrowLeft aria-hidden="true" /> {content.newer}
        </Link>
      )}
      {pages.map((n) => (
        <Link
          key={n}
          className={cn(s.pageLink, n === page && s.pageCurrent)}
          href={pageHref(listingPath, n)}
          {...(n === page ? { 'aria-current': 'page' } : {})}
        >
          {n}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          className={cn(s.pageLink, s.pageNav)}
          href={pageHref(listingPath, page + 1)}
        >
          {content.older} <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}
