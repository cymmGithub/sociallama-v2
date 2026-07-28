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
import { Link } from '@/components/ui/link'
import { filterPosts } from '@/lib/blog/search'
import { hubSearch as hubSearchPl } from '@/lib/content/blog'
import { hubSearch as hubSearchEn } from '@/lib/content/blog.en'
import type { Locale } from '@/lib/i18n/slug-map'
import type { SearchEntry } from '@/lib/payload/queries'
import s from './blog.module.css'

/**
 * Client-side archive search for the hub.
 *
 * The input sits in the statement header and the results replace the archive
 * grid at the foot of the page, so the query has to be shared across a long
 * stretch of the tree. A context is what makes that possible while keeping
 * every post-rendering section on the server: the provider takes the curated
 * sections and the server-rendered grid as `children` and never re-renders
 * them, it only decides whether the grid is shown at all.
 *
 * Shared by both locales, and the copy rides that same context: the input is
 * rendered inside `<HubHeader>`, which has nothing to do with searching, so
 * making it a prop would mean drilling the search copy through a component that
 * never reads it. The provider takes a `locale` rather than the copy itself,
 * because `results` pluralizes a count computed in the browser and a function
 * cannot cross the server/client boundary — so this is the one blog component
 * that still reads the content modules directly.
 */

/**
 * The hub's search copy. Typed structurally rather than through `Localized`,
 * which maps over object types and would strip `results`'s callability — the
 * count is pluralized per locale, so the wording stays a function.
 */
interface HubSearchCopy {
  label: string
  placeholder: string
  clear: string
  results: (count: number) => string
  emptyTitle: string
  emptyText: string
}

const HUB_SEARCH: Record<Locale, HubSearchCopy> = {
  pl: hubSearchPl,
  en: hubSearchEn,
}

interface SearchState {
  query: string
  setQuery: (value: string) => void
  /** True once the query has non-whitespace content. */
  searching: boolean
  /** Matches for the current query; empty while not searching. */
  results: SearchEntry[]
  content: HubSearchCopy
}

const SearchContext = createContext<SearchState | null>(null)

function useSearch(): SearchState {
  const state = useContext(SearchContext)
  if (!state) {
    throw new Error('Hub search components must render inside HubSearch.')
  }
  return state
}

export function HubSearch({
  index,
  locale,
  children,
}: {
  index: SearchEntry[]
  locale: Locale
  children: ReactNode
}) {
  const [query, setQuery] = useState('')
  const content = HUB_SEARCH[locale]

  const value = useMemo<SearchState>(() => {
    const searching = query.trim().length > 0
    return {
      query,
      setQuery,
      searching,
      results: searching ? filterPosts(index, query) : [],
      content,
    }
  }, [content, index, query])

  return <SearchContext value={value}>{children}</SearchContext>
}

export function HubSearchInput() {
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
 * The curated sections, hidden while a search is active.
 *
 * The search field sits in the statement header but its results land in the
 * archive at the foot of the page. Without this, typing would change only what
 * is three screens below the reader and the filter would look broken. Standing
 * the curated furniture down puts the results directly under the input.
 */
export function HubCurated({ children }: { children: ReactNode }) {
  const { searching } = useSearch()
  return searching ? null : children
}

/**
 * The archive section: the server-rendered grid and its pagination while
 * idle, the filtered list while searching.
 *
 * Pagination lives inside `children`, so an active query hides it simply by
 * not rendering them — there is no separate "hide pagination" branch to keep
 * in sync, and clearing the query restores page 1 exactly as the server sent it.
 *
 * Results render from the shipped index, which carries no covers or bylines —
 * hence the compact rows rather than the full card grid.
 *
 * The heading belongs to the hub copy rather than the search copy, so the page
 * passes it in; `basePath` localizes the result links, Polish posts sitting at
 * the root and English ones under `/en/blog`.
 */
export function HubArchive({
  archiveTitle,
  basePath,
  children,
}: {
  archiveTitle: string
  basePath: string
  children: ReactNode
}) {
  const { searching, results, content } = useSearch()

  return (
    <section className={s.archive}>
      <div className={s.archiveHead}>
        <h2 className={s.archiveTitle}>{archiveTitle}</h2>
      </div>

      {/* Announced on change; empty while idle so clearing says nothing. */}
      <p aria-live="polite" className="sr-only">
        {searching ? content.results(results.length) : ''}
      </p>

      {!searching && children}

      {searching &&
        (results.length > 0 ? (
          <ul className={s.results}>
            {results.map((entry) => (
              <li key={entry.slug}>
                <Link className={s.result} href={`${basePath}/${entry.slug}`}>
                  {entry.category && (
                    <span className={s.resultCategory}>{entry.category}</span>
                  )}
                  <span className={s.resultTitle}>{entry.title}</span>
                  {entry.excerpt && (
                    <span className={s.resultExcerpt}>{entry.excerpt}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className={s.empty}>
            <p className={s.emptyTitle}>{content.emptyTitle}</p>
            <p className={s.emptyText}>{content.emptyText}</p>
          </div>
        ))}
    </section>
  )
}
