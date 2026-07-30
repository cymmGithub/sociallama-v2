/**
 * Copy + vendor data for the cookie-consent mechanism (add-cookie-consent).
 *
 * Two things live here, deliberately together:
 *
 *  1. Every string the banner, the settings panel and the footer trigger show.
 *  2. `consentCategories` — the category→vendor→cookie table, as data.
 *
 * (2) is the important one. It feeds the settings panel AND Artykuł 7 of the
 * privacy policy, so the two cannot drift: a policy that lists cookies the site
 * does not set (or omits ones it does) is a defect no amount of proofreading
 * reliably catches. The e2e suite asserts the observed cookies against this
 * array for the same reason.
 *
 * ADDING A VENDOR HERE IS NOT A CONTENT-ONLY CHANGE. It requires bumping
 * `CONSENT_VERSION` in `lib/consent/cookie.ts` — see the comment there.
 *
 * `consent.en.ts` supplies the English twin.
 */

import type { Localized } from '@/lib/i18n/parity'

// —— Banner ——————————————————————————————————————————————————————————————————

/**
 * `acceptAll` and `rejectAll` are rendered at identical size and prominence,
 * differing only in fill — equal-weight refusal is the single most-enforced
 * point in European banner decisions. The component puts them in an equal-track
 * grid, so label length cannot make refusal the smaller target in any locale.
 *
 * The heading is split into three parts because a cookie icon stands where the
 * noun would go. `headingIcon` is that noun: the icon is `aria-hidden` and this
 * word is rendered visually-hidden in its place, so the sentence is complete
 * when spoken. Do not fold these back into one string without also giving the
 * icon a text alternative — a heading that reads "A może trochę?" out loud is a
 * different, worse sentence.
 */
export const consentBanner = {
  regionLabel: 'Zgoda na pliki cookies',
  headingBefore: 'A może trochę',
  headingIcon: 'ciasteczek',
  headingAfter: '?',
  body: 'Używamy ciasteczek do niezbędnych funkcji i\u00A0po to, żeby lepiej rozumieć, jak korzystasz z\u00A0Social Lamy — dzięki temu robimy tę stronę lepiej dla Ciebie.',
  acceptAll: 'Akceptuję',
  rejectAll: 'Odrzucam',
  settings: 'Ustawienia',
} as const

// —— Settings panel ——————————————————————————————————————————————————————————

export const consentSettings = {
  title: 'Ustawienia plików cookies',
  intro:
    'Zdecyduj, których plików cookies możemy używać. Niezbędne działają zawsze — bez nich strona nie zadziała. Twój wybór zapiszemy na 12 miesięcy i\u00A0możesz go zmienić w\u00A0każdej chwili.',
  save: 'Zapisz wybór',
  close: 'Zamknij',
  /** Shown instead of a switch on the necessary row (Decision 8). */
  alwaysOn: 'Zawsze aktywne',
  /** Precedes each vendor's own privacy policy link. */
  vendorPolicy: 'Polityka prywatności',
} as const

/** Column headers, shared by the settings panel and the privacy-policy table. */
export const consentTable = {
  category: 'Kategoria',
  vendor: 'Dostawca',
  cookie: 'Plik cookie',
  purpose: 'Cel',
  retention: 'Przechowywanie',
} as const

// —— Withdrawal trigger ——————————————————————————————————————————————————————

/** Footer legal-row control. Reopens the panel; this is the withdrawal path. */
export const consentTrigger = 'Ustawienia cookies'

// —— Categories ——————————————————————————————————————————————————————————————

/**
 * The categories the site actually operates.
 *
 * `required: true` renders as a statement, not a control — a permanently-checked
 * disabled switch presents a choice that does not exist (Decision 8). Exactly
 * one optional category exists today, so the panel binds `required: false` to
 * the analytics flag directly rather than keying off `id`; introducing a second
 * optional category is the moment to add id-keyed binding, and that change is
 * already gated behind a `CONSENT_VERSION` bump.
 *
 * Marketing is deliberately absent. No marketing tag exists, and a switch that
 * controls nothing is a worse answer than no switch (user decision 2026-07-30,
 * reversing design.md Decision 9).
 */
export const consentCategories = [
  {
    id: 'necessary',
    name: 'Niezbędne',
    required: true,
    purpose:
      'Potrzebne, żeby strona działała i\u00A0żeby zapamiętać Twoją decyzję o\u00A0cookies. Nie da się ich wyłączyć.',
    vendors: [
      {
        name: 'Social Lama',
        provider: 'Good One sp. z o.o.',
        purpose: 'Zapamiętuje Twój wybór kategorii plików cookies.',
        privacyHref: '/polityka-prywatnosci',
        cookies: [
          {
            name: 'sl_consent',
            purpose:
              'Wybrane kategorie, data wyboru i\u00A0wersja listy dostawców, wobec której go dokonano.',
            retention: '12 miesięcy',
          },
        ],
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analityczne',
    required: false,
    purpose:
      'Pokazują nam, które treści czytacie i\u00A0skąd trafiacie na stronę. Statystyki oglądamy zbiorczo, nie po to, żeby rozpoznawać pojedyncze osoby.',
    vendors: [
      {
        name: 'Google Analytics 4',
        provider: 'Google Ireland Limited',
        purpose:
          'Statystyki odwiedzin: liczba użytkowników, źródła ruchu, popularność podstron.',
        privacyHref: 'https://policies.google.com/privacy',
        cookies: [
          {
            name: '_ga',
            purpose: 'Odróżnia użytkowników od siebie.',
            retention: '2 lata',
          },
          {
            name: '_ga_*',
            purpose:
              'Utrzymuje stan sesji pomiarowej (przyrostek to identyfikator usługi).',
            retention: '2 lata',
          },
        ],
      },
    ],
  },
] as const

/**
 * The shape of every consent content export. `consent.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedConsent['<key>']`.
 */
export type ConsentContent = {
  consentBanner: typeof consentBanner
  consentSettings: typeof consentSettings
  consentTable: typeof consentTable
  consentTrigger: typeof consentTrigger
  consentCategories: typeof consentCategories
}

/** Same shape, literals widened so translations compile. */
export type LocalizedConsent = Localized<ConsentContent>

/** One category row as the components receive it (locale-agnostic). */
export type ConsentCategory = LocalizedConsent['consentCategories'][number]
