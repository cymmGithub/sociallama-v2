/**
 * Copy + data for the `/zostan-lama` careers page (redesign-careers-page).
 *
 * Components never hardcode strings — every label, role and status
 * message on the page reads from this module (repo rule; mirrors contact.ts).
 * The Zod schema in `lib/integrations/email/careers-schema.ts` also sources its
 * field-error and status messages from here, and the set of accepted role
 * values from `careersRoles`. `zostan-lama.en.ts` supplies the English twin.
 *
 * Role `id`s are locale-independent — they are the values the form submits and
 * the action validates against, so the English file MUST repeat them verbatim
 * (same contract as contact.ts's service `value`s). Only labels translate.
 *
 * Non-breaking spaces are written as escapes, never as a raw U+00A0 — a raw one
 * is invisible in review (see lib/typography/orphan-rules.ts).
 */

import type { Localized } from '@/lib/i18n/parity'

// —— Page metadata ———————————————————————————————————————————————————————————

export const careersMeta = {
  title: 'Zostań lamą',
  description:
    'Dołącz do stada Social Lama — aktualne oferty pracy w social media i performance marketingu. Wybierz rolę, wyślij CV, odpowiadamy w 7 dni.',
} as const

// —— Marquee hero ————————————————————————————————————————————————————————————

// One word set on two counter-scrolling rows (orange fill over outline stroke),
// the /kontakt hero treatment. The outline row is a merged-union SVG path, not
// this text — see lib/wordmark-paths.ts; if this copy changes, regenerate it.
export const careersMarquee = { text: 'Zostań lamą' } as const

// Line under the marquee — it introduces the role tabs directly below it, so
// it is a label, not a pitch. The page's pitch (the WordPress page's own copy)
// sits above the form instead, where it argues for filling the form in.
export const careersLede = { text: 'Obecnie szukamy:' } as const

// —— Open roles ——————————————————————————————————————————————————————————————

/** Accessible name for the role tablist. */
export const careersRolesLabel = 'Otwarte role'

/**
 * Open roles, rendered as tab panels (one visible at a time). `id` is the
 * submitted form value — locale-independent, see the module header. Adding a
 * role here and in the English file is the only change a new opening needs.
 *
 * `id` is also the URL segment of the role's own page (`/zostan-lama/{id}`),
 * which is what `seo` describes: the title and description that page emits, and
 * therefore what a shared link unfurls with. `seo.title` renders through the
 * site title template (`%s | Social Lama`), so it must not repeat the brand.
 */
export const careersRoles = [
  {
    id: 'social-media-specialist',
    title: 'Social Media Specialist',
    seo: {
      title: 'Social Media Specialist — oferta pracy',
      description:
        'Oferta pracy: Social Media Specialist w Social Lama. Content, kampanie, kontakt z klientem, min. 2 lata doświadczenia. Wyślij CV — odpowiadamy w 7 dni.',
    },
    blocks: [
      {
        head: 'Szukamy osoby, która',
        items: [
          'z\u00A0pasją tworzy treści przyciągające uwagę i\u00A0prowokujące do interakcji',
          'swobodnie porusza się po ekosystemie wszystkich mediów społecznościowych',
          'ceni miejsce pracy, gdzie relacje są motorem napędowym',
        ],
      },
      {
        head: 'Będziesz odpowiadać za',
        items: [
          'projektowanie i\u00A0wdrażanie kampanii, które skłaniają do działania',
          'realizację projektów SM zgodnie ze strategią',
          'kontakt z\u00A0klientami i\u00A0budżetowanie projektów',
          'raportowanie i\u00A0analizę działań',
        ],
      },
      {
        head: 'Oczekujemy',
        items: [
          'min. 2 lata doświadczenia w\u00A0SM — warunek konieczny',
          'biegłości w\u00A0Reels i\u00A0InstaStories, pasji do TikToka',
          'bardzo dobrego pióra i\u00A0znajomości angielskiego',
          'mile widziane: certyfikaty META',
        ],
      },
    ],
  },
] as const

/**
 * Share row in each role panel. `{title}` is filled with the role's own title,
 * so the accessible labels name the position being shared, not the page.
 */
export const careersShare = {
  title: 'Udostępnij ofertę',
  linkedin: 'Udostępnij ofertę „{title}” na LinkedInie',
  facebook: 'Udostępnij ofertę „{title}” na Facebooku',
  copy: 'Kopiuj link do oferty',
  copied: 'Link skopiowany',
} as const

// —— Application form ————————————————————————————————————————————————————————

/**
 * Spontaneous-application value. Locale-independent like the role ids, and
 * kept out of `careersRoles` so it never renders as a panel — it is only ever
 * an option in the role select.
 */
export const CAREERS_SPONTANEOUS_VALUE = 'spontaniczna'

/** Attachment cap, shared by the field hint, the client check and the schema. */
export const CAREERS_CV_MAX_BYTES = 5 * 1024 * 1024

export const careersForm = {
  eyebrow: 'Aplikacja',
  heading: 'Aplikuj śmiało\ni kreatywnie',
  lede: 'Chcesz zdobywać nowe umiejętności w\u00A0świecie social mediów? Aplikuj do Social Lamy',
  fields: {
    name: { label: 'Imię i nazwisko', placeholder: 'Anna Kowalska' },
    email: { label: 'E-mail', placeholder: 'anna@example.com' },
    role: {
      label: 'Stanowisko',
      spontaneous: 'Zgłoszenie spontaniczne',
    },
    message: {
      label: 'Kilka zdań o\u00A0sobie',
      placeholder: 'Co robisz najlepiej i\u00A0dlaczego akurat u\u00A0nas?',
    },
    cv: {
      label: 'Dodaj CV',
      attached: 'CV dodane',
      hint: 'PDF lub DOCX, do 5\u00A0MB',
      dropHint: 'Upu\u015B\u0107 plik tutaj',
      change: 'Zmie\u0144',
      remove: 'Usu\u0144',
    },
  },
  // RODO consents, both unchecked by default. The first is required — the
  // submission is rejected without it. The second is optional and separate,
  // because bundling a marketing permission into a consent you must give in
  // order to apply is not freely given consent at all.
  // Wording supplied by the client, not drafted here — do not reword it
  // without asking (design D12).
  consent: {
    required: {
      label:
        'Wyrażam zgodę na przechowywanie podanych danych osobowych i\u00A0przetwarzanie ich w\u00A0celu kontaktu zwrotnego.',
    },
    // Split so the component wraps only the policy name in <Link>.
    marketing: {
      text: 'Wyrażam zgodę na przechowywanie i\u00A0przetwarzanie danych osobowych w\u00A0celach marketingowych, zgodnie z\u00A0naszą ',
      linkLabel: 'Polityką Prywatności',
      linkHref: '/polityka-prywatnosci',
    },
  },
  submit: {
    default: 'Wyślij aplikację',
    pending: 'Wysyłamy…',
    success: 'Wysłane!',
    error: 'Spróbuj ponownie',
  },
  // Application-email labels (server action) — localized so EN applications
  // arrive with English field labels, matching the contact form.
  email: {
    subjectPrefix: 'Aplikacja',
    name: 'Imię i nazwisko',
    email: 'E-mail',
    role: 'Stanowisko',
    message: 'O sobie',
    cv: 'CV',
    consent: 'Zgoda rekrutacyjna',
    marketing: 'Zgoda marketingowa',
    granted: 'udzielona',
    declined: 'nieudzielona',
    // Heads the verbatim consent-wording snapshot at the bottom of the email.
    consentBody: 'Treść udzielonych zgód',
    none: '—',
  },
  // FormState.message returned by the server action; the form's
  // onSuccess/onError callbacks surface it as a toast.
  messages: {
    success: 'Dzięki! Odezwiemy się w\u00A0ciągu 7 dni.',
    error: 'Nie udało się wysłać aplikacji. Spróbuj ponownie za chwilę.',
    security: 'Weryfikacja bezpieczeństwa nie powiodła się. Odśwież stronę.',
    rateLimit: 'Za dużo prób. Odczekaj chwilę i\u00A0spróbuj ponownie.',
  },
  // Per-field validation messages. Used server-side by the Zod schema and
  // client-side via the form kit's `invalidMessage` formatter and FileField.
  errors: {
    name: 'Podaj imię i nazwisko.',
    email: 'Podaj poprawny adres e-mail.',
    role: 'Wybierz stanowisko z\u00A0listy.',
    message: 'Napisz kilka zdań o\u00A0sobie.',
    consent: 'Bez zgody nie możemy rozpatrzyć aplikacji.',
    cvRequired: 'Dołącz CV.',
    cvType: 'CV musi być plikiem PDF lub DOCX.',
    cvSize: 'Plik jest za duży — maksymalnie 5\u00A0MB.',
    fallback: 'Uzupełnij to pole.',
    required: 'Wymagane',
  },
} as const

/**
 * The shape of every `/zostan-lama` content export. `zostan-lama.en.ts`
 * supplies the English equivalent, each block `satisfies LocalizedCareers[…]`.
 */
export type CareersContent = {
  careersMeta: typeof careersMeta
  careersMarquee: typeof careersMarquee
  careersLede: typeof careersLede
  careersRolesLabel: typeof careersRolesLabel
  careersRoles: typeof careersRoles
  careersShare: typeof careersShare
  careersForm: typeof careersForm
}

/** Same shape, literals widened so translations compile. */
export type LocalizedCareers = Localized<CareersContent>
