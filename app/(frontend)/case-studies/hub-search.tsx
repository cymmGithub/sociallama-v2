'use client'

import { Search, X } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react'
import {
  type CaseStudySearchCopy,
  caseStudySearch as searchPl,
} from '@/lib/content/case-studies'
import { caseStudySearch as searchEn } from '@/lib/content/case-studies.en'
import type { Locale } from '@/lib/i18n/slug-map'
import s from './case-studies.module.css'
import { type CaseStudySearchEntry, matchingSlugs } from './search'

/**
 * Client-side filter for the `/case-studies` grid.
 *
 * Every study is already on the page, so the cards themselves are the index:
 * the provider takes the server-rendered grid as `children` and never
 * re-renders it, and each card is wrapped in a `<Filtered>` veil that flips a
 * CSS class. Cards stay server components — `CaseStudyCard` keeps `Image` and
 * `resolveMedia` on the server, and hiding rather than unmounting means
 * clearing the query refetches nothing.
 *
 * The provider takes a `locale` rather than the copy itself, for the same
 * reason the blog hub does: `results` pluralizes a count computed in the
 * browser, and a function cannot cross the server/client boundary as a prop.
 */

const SEARCH_COPY: Record<Locale, CaseStudySearchCopy> = {
  pl: searchPl,
  en: searchEn,
}

interface SearchState {
  query: string
  setQuery: (value: string) => void
  /** True once the query has non-whitespace content. */
  searching: boolean
  /** Slugs matching the current query; empty while not searching. */
  matches: Set<string>
  content: CaseStudySearchCopy
}

const SearchContext = createContext<SearchState | null>(null)

function useSearch(): SearchState {
  const state = useContext(SearchContext)
  if (!state) {
    throw new Error(
      'Case-study search components must render inside CaseStudySearch.'
    )
  }
  return state
}

export function CaseStudySearch({
  entries,
  locale,
  children,
}: {
  entries: CaseStudySearchEntry[]
  locale: Locale
  children: ReactNode
}) {
  const [query, setQuery] = useState('')
  const content = SEARCH_COPY[locale]

  const value = useMemo<SearchState>(() => {
    const searching = query.trim().length > 0
    return {
      query,
      setQuery,
      searching,
      matches: searching ? matchingSlugs(entries, query) : new Set<string>(),
      content,
    }
  }, [content, entries, query])

  return <SearchContext value={value}>{children}</SearchContext>
}

export function CaseStudySearchInput() {
  const { query, setQuery, content } = useSearch()
  const inputId = useId()

  return (
    <div className={s.search}>
      <label className="sr-only" htmlFor={inputId}>
        {content.label}
      </label>
      <Search aria-hidden="true" className={s.searchIcon} />
      <input
        className={s.searchInput}
        id={inputId}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={content.placeholder}
        type="search"
        value={query}
      />
      {query && (
        <button
          className={s.searchClear}
          onClick={() => setQuery('')}
          type="button"
        >
          <X aria-hidden="true" />
          <span className="sr-only">{content.clear}</span>
        </button>
      )}
    </div>
  )
}

/**
 * One card's veil. `display: none` rather than the `hidden` attribute so the
 * hook sits in the CSS module, where whoever adds the grid's first
 * `nth-child` rule will see it.
 *
 * Idle, the wrapper is `display: contents`, so the card itself stays the grid
 * item and the row keeps stretching cards to equal height exactly as it did
 * before this element existed.
 */
export function Filtered({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) {
  const { searching, matches } = useSearch()
  const hidden = searching && !matches.has(slug)
  return <div className={hidden ? s.cardHidden : s.cardVeil}>{children}</div>
}

/**
 * The announced count and the no-match state.
 *
 * Both live here rather than in the veils because only the provider knows
 * `matches.size`. Rendered after the grid, which stays mounted with all its
 * children hidden — unmounting it would drop 48 images and refetch them the
 * moment the query cleared.
 */
export function CaseStudySearchStatus() {
  const { searching, matches, content } = useSearch()

  return (
    <>
      {/* Announced on change; empty while idle so clearing says nothing. */}
      <p aria-live="polite" className="sr-only">
        {searching ? content.results(matches.size) : ''}
      </p>
      {searching && matches.size === 0 && (
        <div className={s.empty}>
          <p className={s.emptyTitle}>{content.emptyTitle}</p>
          <p className={s.emptyText}>{content.emptyText}</p>
        </div>
      )}
    </>
  )
}
