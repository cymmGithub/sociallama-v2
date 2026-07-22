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
    'Case studies Social Lama — realne efekty naszej pracy w social mediach. Strategie, kampanie i liczby dla marek takich jak iRobot, Pracuj.pl i Volvo.',
  heading: 'Case studies',
  subhead:
    'Jak pracujemy i co z tego wynika — wybrane projekty Social Lama wraz z liczbami, które je opisują.',
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
  cta: {
    eyebrow: 'Twój ruch',
    title: 'Zbudujmy coś podobnego dla Twojej marki',
    text: 'Opowiedz nam o swoim wyzwaniu — pokażemy, jak możemy pomóc.',
    primary: 'Bezpłatna konsultacja',
    secondary: 'Zobacz inne case studies',
  },
} as const

/** The shape of the case-studies chrome exports; `case-studies.en.ts` mirrors it. */
export type CaseStudiesContent = {
  caseStudiesListing: typeof caseStudiesListing
  caseStudyChrome: typeof caseStudyChrome
}

/** Same shape, literals widened so translations compile. */
export type LocalizedCaseStudies = Localized<CaseStudiesContent>
