'use client'

import { useLenis } from 'lenis/react'
import { LayoutGrid, List, Search, X } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react'
import { Link } from '@/components/ui/link'
import {
  type CaseStudySearchCopy,
  type LocalizedCaseStudies,
  caseStudiesListing as listingPl,
  caseStudySearch as searchPl,
} from '@/lib/content/case-studies'
import {
  caseStudiesListing as listingEn,
  caseStudySearch as searchEn,
} from '@/lib/content/case-studies.en'
import { useIsDesktop, usePreferredReducedMotion } from '@/lib/hooks'
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
 *
 * Two filters share this one context rather than taking one each, because they
 * have to AND: a query and a platform both narrow the same set, and one
 * derived `visible` set is both simpler and the only way the announced count
 * can be right when both are on.
 */

const SEARCH_COPY: Record<Locale, CaseStudySearchCopy> = {
  pl: searchPl,
  en: searchEn,
}

const LISTING_COPY: Record<Locale, LocalizedCaseStudies['caseStudiesListing']> =
  {
    pl: listingPl,
    en: listingEn,
  }

/** Which industry the rail has selected; `all` is the resting state. */
export type IndustryFilter = string
export type HubView = 'grid' | 'ledger'

/** One rail entry, built on the server so its count and name never move. */
export interface IndustryRailItem {
  id: string
  label: string
  count: number
  /** The branża's own page, when one has been written for it yet. */
  href?: string | undefined
}

interface SearchState {
  query: string
  setQuery: (value: string) => void
  /** True once the query has non-whitespace content. */
  searching: boolean
  industry: IndustryFilter
  setIndustry: (value: IndustryFilter) => void
  view: HubView
  setView: (value: HubView) => void
  /** True while either filter is narrowing the set. */
  filtering: boolean
  /** Slugs passing both filters. Every slug while neither is active. */
  visible: Set<string>
  content: CaseStudySearchCopy
  listing: LocalizedCaseStudies['caseStudiesListing']
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
  const [industry, setIndustry] = useState<IndustryFilter>('all')
  const [view, setView] = useState<HubView>('grid')
  const content = SEARCH_COPY[locale]
  const listing = LISTING_COPY[locale]

  const value = useMemo<SearchState>(() => {
    const searching = query.trim().length > 0
    const matches = searching ? matchingSlugs(entries, query) : null
    return {
      query,
      setQuery,
      searching,
      industry,
      setIndustry,
      view,
      setView,
      filtering: searching || industry !== 'all',
      visible: new Set(
        entries
          .filter(
            (entry) =>
              (!matches || matches.has(entry.slug)) &&
              (industry === 'all' || entry.industry === industry)
          )
          .map((entry) => entry.slug)
      ),
      content,
      listing,
    }
  }, [content, entries, industry, listing, query, view])

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
  const { visible } = useSearch()
  return (
    <div className={visible.has(slug) ? s.cardVeil : s.cardHidden}>
      {children}
    </div>
  )
}

/**
 * The industry index — `Wszystkie` plus every branża at least one study has,
 * each with its build-time count.
 *
 * Keyed on the branża's own `id`, which is the same string in both locales, so
 * the Polish and English hubs offer the same categories and count them the
 * same. The labels arrive already localized: the server picked them out of
 * `branze.ts` or `branze.en.ts`, which is also where the site's industry pages
 * take their names, so there is one taxonomy rather than two that agree by
 * accident.
 *
 * A sticky rail in the left column from the desktop breakpoint, a horizontal
 * chip row above the grid below it: one DOM, two layouts, so the selected
 * state cannot drift between them.
 */
export function IndustryRail({
  items,
  total,
}: {
  items: IndustryRailItem[]
  total: number
}) {
  const { industry, setIndustry, listing } = useSearch()
  const lenis = useLenis()
  const reducedMotion = usePreferredReducedMotion()

  /**
   * Picking a category takes the visitor back to the top of the list.
   *
   * Without it the grid re-flows under a viewport that is still 4000px down a
   * list that is now 300px long, so the click appears to have emptied the
   * page. Lenis owns scrolling here, so this goes through it rather than
   * `window.scrollTo`, which would fight the smooth-scroll loop.
   */
  const select = (id: string) => {
    setIndustry(id)
    lenis?.scrollTo(0, { immediate: reducedMotion })
  }

  const entries: IndustryRailItem[] = [
    { id: 'all', label: listing.filters.all, count: total },
    ...items,
  ]
  // Only when a real industry is selected, and only when it has a page — seven
  // of the categories are waiting for theirs to be written.
  const selected = items.find((item) => item.id === industry)

  return (
    <nav aria-label={listing.filters.label} className={s.railNav}>
      <p className={s.railLabel}>{listing.filters.label}</p>
      <ul className={s.railList}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              className={s.railChip}
              onClick={() => select(entry.id)}
              type="button"
              // The state IS the pressed state; no parallel class to keep in
              // step with it, and assistive technology gets it for free.
              aria-pressed={industry === entry.id}
            >
              <span className={s.railChipLabel}>{entry.label}</span>
              <span className={s.railChipCount}>{entry.count}</span>
            </button>
          </li>
        ))}
      </ul>
      {selected?.href && (
        <Link className={s.railPageLink} href={selected.href}>
          {listing.filters.page}
        </Link>
      )}
    </nav>
  )
}

/**
 * Grid / ledger. Desktop only — a ledger row is a wide shape, and below the
 * breakpoint it would just be the card again with worse pictures. Rendered
 * conditionally rather than hidden, so a phone has no unreachable control in
 * its tab order.
 */
export function ViewToggle() {
  const { view, setView, listing } = useSearch()
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return null
  }

  return (
    <div aria-label={listing.views.label} className={s.viewToggle} role="group">
      <button
        aria-pressed={view === 'grid'}
        className={s.viewButton}
        onClick={() => setView('grid')}
        type="button"
      >
        <LayoutGrid aria-hidden="true" size={15} />
        {listing.views.grid}
      </button>
      <button
        aria-pressed={view === 'ledger'}
        className={s.viewButton}
        onClick={() => setView('ledger')}
        type="button"
      >
        <List aria-hidden="true" size={15} />
        {listing.views.ledger}
      </button>
    </div>
  )
}

/**
 * The two view containers. Both stay mounted and one is `hidden`, so switching
 * never unmounts a card and never refetches an image — the same reason the
 * filters hide rather than unmount.
 */
export function ViewPane({
  view,
  children,
}: {
  view: HubView
  children: ReactNode
}) {
  const { view: current } = useSearch()
  return <div hidden={current !== view}>{children}</div>
}

/**
 * The announced count and the no-match state.
 *
 * Both live here rather than in the veils because only the provider knows
 * how many survived. Rendered after the grid, which stays mounted with all its
 * children hidden — unmounting it would drop 48 images and refetch them the
 * moment the query cleared.
 */
export function CaseStudySearchStatus() {
  const { filtering, visible, content } = useSearch()

  return (
    <>
      {/* Announced on change; empty while idle so clearing says nothing. The
          count is the visible set, so it is right when a query and a platform
          are narrowing together. */}
      <p aria-live="polite" className="sr-only">
        {filtering ? content.results(visible.size) : ''}
      </p>
      {filtering && visible.size === 0 && (
        <div className={s.empty}>
          <p className={s.emptyTitle}>{content.emptyTitle}</p>
          <p className={s.emptyText}>{content.emptyText}</p>
        </div>
      )}
    </>
  )
}
