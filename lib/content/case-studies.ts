/**
 * Chrome copy for the `/case-studies` listing and detail pages — the section
 * headings, breadcrumb, card CTA, and closing CTA that are page furniture, not
 * CMS content (the study fields come from Payload). `case-studies.en.ts` supplies
 * the English twin; the detail/listing components take these as props so both
 * locales reuse them (design 5.5).
 */

import type { Localized } from '@/lib/i18n/parity'
import type { PlatformKey } from '@/lib/payload/case-study-scoreboard'

/**
 * Display names for the five platforms the read rules know.
 *
 * One export, not a key in each locale file: these are brand names, so a
 * translation of one would be a mistake rather than a variant. The detail
 * page's meta rail names them; the locale-parity test holds the two files
 * equal in case someone re-inlines it.
 *
 * `satisfies` ties the set to `PlatformKey`, so a sixth platform cannot ship
 * without a name here — or, via `brand-icons.tsx`, without a mark.
 */
export const PLATFORM_NAMES = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
} satisfies Record<PlatformKey, string>

export const caseStudiesListing = {
  metaTitle: 'Case studies',
  metaDescription:
    'Case studies Social Lama — realne efekty naszej pracy w social mediach: strategie, kampanie i twarde liczby dla marek z handlu, nieruchomości, FMCG, rozrywki i e-commerce.',
  heading: 'Case studies',
  // One line, wrapping only where the viewport forces it. The brand name is
  // tied so a wrap can never split it.
  subhead:
    'Jak pracujemy i\u00A0co z\u00A0tego wynika. Wybrane projekty Social\u00A0Lama wraz z\u00A0liczbami, które je opisują.',
  cardRead: 'ZOBACZ CASE STUDY',
  // The hub's industry index. The category NAMES are not here: they come from
  // `lib/content/branze.ts`, which is where the site's industry pages already
  // take theirs, so the filter and the pages cannot end up calling the same
  // branża two different things.
  filters: {
    label: 'Branże',
    all: 'Wszystkie',
    page: 'Zobacz stronę branży',
  },
  views: {
    label: 'Widok listy',
    grid: 'Siatka',
    // Not translated, in either locale: it is the name of the view, and the
    // Polish alternatives ("Zestawienie", "Tabela") describe a spreadsheet.
    ledger: 'Ledger',
  },
  empty: {
    title: 'Już wkrótce',
    text: 'Pracujemy nad opisami naszych projektów — zajrzyj niebawem.',
  },
} as const

export const caseStudyChrome = {
  breadcrumbAria: 'Ścieżka nawigacji',
  listingLabel: 'Case studies',
  // Hero meta rail — three derived rows, each omitted when the study has
  // nothing for it. `scope` reads the distinct pillar hashtags, which is the
  // closest thing the model holds to "what we did".
  meta: {
    platforms: 'Platformy',
    industry: 'Branża',
    tags: 'Tagi',
    scope: 'Zakres',
  },
  // The body's sticky section index.
  rail: {
    label: 'Na tej stronie',
    aria: 'Sekcje case study',
  },
  sections: {
    client: 'Nasz klient',
    challenge: 'Wyzwanie',
    approach: 'Podejście',
    results: 'Wyniki',
    gallery: 'Galeria',
  },
  // One action, worded exactly like the header CTA (`nav.cta` in home.ts), so a
  // visitor meets one phrasing for one action across the site. The route back to
  // the listing is the breadcrumb at the top of the page, not a second button
  // competing with the conversion one.
  cta: {
    title: 'Zbudujmy coś wyjątkowego dla Twojej marki',
    text: 'Opowiedz nam o\u00A0swoim wyzwaniu — pokażemy, jak możemy pomóc.',
    primary: 'Porozmawiajmy o Twoim biznesie',
  },
} as const

/** The shape of the case-studies chrome exports; `case-studies.en.ts` mirrors it. */
export type CaseStudiesContent = {
  caseStudiesListing: typeof caseStudiesListing
  caseStudyChrome: typeof caseStudyChrome
}

/** Same shape, literals widened so translations compile. */
export type LocalizedCaseStudies = Localized<CaseStudiesContent>

/**
 * The count noun for the hub's search results.
 *
 * Polish needs three forms where English needs two, and `case study` is an
 * indeclinable loan — "3 case study" is what a Polish writer would actually
 * type, which reads as a bug in a result count. `realizacja` is the native
 * noun the subhead already uses for the same thing ("Wybrane projekty"), and
 * it declines properly. Same shape as `postsPlural` in `lib/content/blog.ts`.
 */
function studiesPlural(count: number): string {
  const lastTwo = count % 100
  if (count === 1) {
    return 'realizację'
  }
  if (lastTwo >= 12 && lastTwo <= 14) {
    return 'realizacji'
  }
  const last = count % 10
  return last >= 2 && last <= 4 ? 'realizacje' : 'realizacji'
}

/**
 * The listing's search copy. Typed structurally rather than through
 * `Localized`, which maps over object types and would strip `results`'s
 * callability — the count is pluralized per locale, so the wording stays a
 * function. Same exemption `hubSearch` takes in `lib/content/blog.ts`.
 */
export interface CaseStudySearchCopy {
  label: string
  placeholder: string
  clear: string
  results: (count: number) => string
  emptyTitle: string
  emptyText: string
}

export const caseStudySearch: CaseStudySearchCopy = {
  label: 'Szukaj w case studies',
  placeholder: 'Marka, temat, kampania…',
  clear: 'Wyczyść',
  /** Announced to assistive technology whenever the result count changes. */
  results: (count: number) => `Znaleziono ${count} ${studiesPlural(count)}.`,
  emptyTitle: 'Nic nie pasuje',
  emptyText: 'Spróbuj innej nazwy marki albo wyczyść wyszukiwanie.',
}
