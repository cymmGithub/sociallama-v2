/**
 * Chrome copy for the `/case-studies` listing and detail pages — the section
 * headings, breadcrumb, card CTA, and closing CTA that are page furniture, not
 * CMS content (the study fields come from Payload). `case-studies.en.ts` supplies
 * the English twin; the detail/listing components take these as props so both
 * locales reuse them (design 5.5).
 */

import type { Localized } from '@/lib/i18n/parity'

export const caseStudiesListing = {
  metaTitle: 'Case studies',
  metaDescription:
    'Case studies Social Lama — realne efekty naszej pracy w social mediach: strategie, kampanie i twarde liczby dla marek z handlu, nieruchomości, FMCG, rozrywki i e-commerce.',
  heading: 'Case studies',
  // Two lines by construction rather than by luck: the second clause always
  // opens the second line, and the brand name is tied so a wrap can never
  // split it.
  subhead: {
    lead: 'Jak pracujemy i\u00A0co z\u00A0tego wynika',
    tail: 'Wybrane projekty Social\u00A0Lama wraz z\u00A0liczbami, które je opisują.',
  },
  cardRead: 'ZOBACZ CASE STUDY',
  empty: {
    title: 'Już wkrótce',
    text: 'Pracujemy nad opisami naszych projektów — zajrzyj niebawem.',
  },
} as const

export const caseStudyChrome = {
  breadcrumbAria: 'Ścieżka nawigacji',
  listingLabel: 'Case studies',
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
