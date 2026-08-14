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
  subhead:
    'Jak pracujemy i\u00A0co z\u00A0tego wynika — wybrane projekty Social Lama wraz z\u00A0liczbami, które je opisują.',
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
