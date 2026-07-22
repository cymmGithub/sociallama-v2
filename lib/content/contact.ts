/**
 * Copy + data for the `/kontakt` contact page (add-contact-page change).
 *
 * Components never hardcode strings — every label, placeholder, message, and
 * metric on the page reads from this module (repo rule; mirrors home.ts).
 * The Zod schema in `lib/integrations/email/action.ts` also sources its
 * field-error and status messages from here so the Polish copy stays in one
 * place. `contact.en.ts` supplies the English twin.
 */

import type { Localized } from '@/lib/i18n/parity'

// —— Page metadata ———————————————————————————————————————————————————————————

export const contactMeta = {
  title: 'Kontakt',
  description:
    'Porozmawiajmy o Twoim biznesie. Napisz do Social Lama — social media, kampanie, wideo, strategia i współpraca. Odpowiadamy szybko.',
} as const

// —— Marquee hero ————————————————————————————————————————————————————————————

// Two stacked lines, homepage BigMarquee treatment: orange fill over
// outline-stroke, counter-scrolling.
export const contactMarquee = {
  fill: 'Porozmawiajmy',
  outline: 'o Twoim biznesie',
} as const

// Lede under the marquee (rendered with a CornerDownRight icon). Offer-forward:
// a short CTA to get in touch. `cta` is emphasised (orange bold) by the hero;
// the 24h promise lives in the "Co dalej?" strip and the submit-row note.
export const contactLede = {
  text: 'Masz pomysł albo markę do rozkręcenia? Napisz kilka słów i ',
  cta: 'umów bezpłatną konsultację',
} as const

// —— "Co dalej?" steps ———————————————————————————————————————————————————————

// What-happens-next strip. Exactly three ordered steps: write → we respond in
// 24h → we talk specifics. Step 3 deliberately promises a conversation, not
// finished deliverables (honesty over inflation — see design.md).
export const contactStepsHead = 'Co dalej?'

export const contactSteps = [
  { step: '1', title: 'Piszesz', text: 'Kilka słów wystarczy.' },
  { step: '2', title: 'Odzywamy się', text: 'W 24h, w dni robocze.' },
  {
    step: '3',
    title: 'Rozmawiamy o konkretach',
    text: 'Pomysły, zakres, następne kroki.',
  },
] as const

// —— Contact form ————————————————————————————————————————————————————————————

/** Service tags — optional multi-select. `value` is what lands in the email. */
export const contactServices = [
  { label: 'Social media', value: 'social-media' },
  { label: 'Kampanie', value: 'kampanie' },
  { label: 'Wideo', value: 'wideo' },
  { label: 'Strategia', value: 'strategia' },
  { label: 'Współpraca', value: 'wspolpraca' },
] as const

export const contactForm = {
  fields: {
    name: { label: 'Imię', placeholder: 'Jak się do Ciebie zwracać?' },
    email: { label: 'E-mail', placeholder: 'twoj@adres.pl' },
    // Optional callback channel — opt-in nudge keeps friction near zero.
    phone: {
      label: 'Telefon',
      optional: 'opcjonalnie',
      placeholder: 'Wolisz, żebyśmy oddzwonili? Zostaw numer.',
    },
    services: { label: 'Czego dotyczy?', optional: 'opcjonalnie' },
    message: {
      label: 'Twoja wiadomość',
      placeholder: 'Opowiedz nam krótko o swoim projekcie.',
    },
  },
  submit: {
    default: 'Umów bezpłatną konsultację',
    pending: 'Wysyłamy…',
    success: 'Wysłane!',
    error: 'Spróbuj ponownie',
  },
  // Reassurance next to the submit pill — aligned to the lede's 24h promise.
  note: 'Odzywamy się w 24h, w dni robocze.',
  // RODO note near the submit row. Split so the component can wrap only the
  // link in <Link>; the href points at the existing privacy page.
  privacyNote: {
    text: 'Twoje dane wykorzystamy tylko po to, żeby odpowiedzieć na wiadomość (i oddzwonić, jeśli zostawisz numer).',
    linkLabel: 'Polityka prywatności',
    linkHref: '/polityka-prywatnosci',
  },
  // Lead-email labels (server action) — localized so EN submissions arrive with
  // English field labels (design D7). `subjectPrefix` gets `— <name>` appended.
  email: {
    subjectPrefix: 'Nowa wiadomość z formularza',
    name: 'Imię',
    email: 'E-mail',
    phone: 'Telefon',
    services: 'Zainteresowania',
    message: 'Wiadomość',
    none: '—',
  },
  // FormState.message returned by the server action (surfaced by <Messages/>).
  messages: {
    success: 'Dzięki! Odezwiemy się najszybciej, jak to możliwe.',
    error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.',
    security: 'Weryfikacja bezpieczeństwa nie powiodła się. Odśwież stronę.',
    rateLimit: 'Za dużo prób. Odczekaj chwilę i spróbuj ponownie.',
  },
  // Per-field validation messages. Used server-side by the Zod schema and
  // client-side via the form kit's `invalidMessage` formatter.
  errors: {
    name: 'Podaj imię.',
    email: 'Podaj poprawny adres e-mail.',
    message: 'Napisz wiadomość.',
    fallback: 'Uzupełnij to pole.',
    // Short inline hint shown under a missing required field.
    required: 'Wymagane',
  },
} as const

// —— Metrics band ————————————————————————————————————————————————————————————

// Intro line above the numbers (mock's band head, next to the Smile icon).
export const contactMetricsHead = 'Kilka liczb o tym, co robimy dla marek:'

export const contactMetrics = [
  { value: '500 000', caption: 'zaangażowanych fanów' },
  { value: '528', caption: 'przeprowadzonych kampanii' },
  { value: '80', caption: 'zadowolonych klientów' },
  { value: '7 000 000', caption: 'zasięgu na Facebooku' },
] as const

/**
 * The shape of every `/kontakt` content export. `contact.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedContact['<key>']`.
 */
export type ContactContent = {
  contactMeta: typeof contactMeta
  contactMarquee: typeof contactMarquee
  contactLede: typeof contactLede
  contactStepsHead: typeof contactStepsHead
  contactSteps: typeof contactSteps
  contactServices: typeof contactServices
  contactForm: typeof contactForm
  contactMetricsHead: typeof contactMetricsHead
  contactMetrics: typeof contactMetrics
}

/** Same shape, literals widened so translations compile. */
export type LocalizedContact = Localized<ContactContent>
