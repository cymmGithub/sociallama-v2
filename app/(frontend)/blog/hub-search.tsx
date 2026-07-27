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
import { hub, hubSearch } from '@/lib/content/blog'
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
 */

interface SearchState {
  query: string
  setQuery: (value: string) => void
  /** True once the query has non-whitespace content. */
  searching: boolean
  /** Matches for the current query; empty while not searching. */
  results: SearchEntry[]
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
  children,
}: {
  index: SearchEntry[]
  children: ReactNode
}) {
  const [query, setQuery] = useState('')

  const value = useMemo<SearchState>(() => {
    const searching = query.trim().length > 0
    return {
      query,
      setQuery,
      searching,
      results: searching ? filterPosts(index, query) : [],
    }
  }, [index, query])

  return <SearchContext value={value}>{children}</SearchContext>
}

export function HubSearchInput() {
  const { query, setQuery } = useSearch()
  const inputId = useId()

  return (
    <div className={s.search}>
      <label className="sr-only" htmlFor={inputId}>
        {hubSearch.label}
      </label>
      <Search aria-hidden="true" className={s.searchIcon} />
      <input
        className={s.searchInput}
        id={inputId}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={hubSearch.placeholder}
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
          <span className="sr-only">{hubSearch.clear}</span>
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
 */
export function HubArchive({ children }: { children: ReactNode }) {
  const { searching, results } = useSearch()

  return (
    <section className={s.archive}>
      <div className={s.archiveHead}>
        <h2 className={s.archiveTitle}>{hub.archiveTitle}</h2>
      </div>

      {/* Announced on change; empty while idle so clearing says nothing. */}
      <p aria-live="polite" className="sr-only">
        {searching ? hubSearch.results(results.length) : ''}
      </p>

      {!searching && children}

      {searching &&
        (results.length > 0 ? (
          <ul className={s.results}>
            {results.map((entry) => (
              <li key={entry.slug}>
                <Link className={s.result} href={`/${entry.slug}`}>
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
            <p className={s.emptyTitle}>{hubSearch.emptyTitle}</p>
            <p className={s.emptyText}>{hubSearch.emptyText}</p>
          </div>
        ))}
    </section>
  )
}
