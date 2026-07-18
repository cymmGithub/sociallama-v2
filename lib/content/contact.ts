/**
 * Copy + data for the `/kontakt` contact page (add-contact-page change).
 *
 * Components never hardcode strings — every label, placeholder, message, and
 * metric on the page reads from this module (repo rule; mirrors home.ts).
 * The Zod schema in `lib/integrations/email/action.ts` also sources its
 * field-error and status messages from here so the Polish copy stays in one
 * place.
 */

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

// Lede under the marquee (rendered with a CornerDownRight icon).
export const contactLede =
  'Masz pomysł, markę do rozkręcenia albo po prostu chcesz pogadać? Napisz kilka słów — odezwiemy się z konkretami.'

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
    services: { label: 'Czego dotyczy?', optional: 'opcjonalnie' },
    message: {
      label: 'Twoja wiadomość',
      placeholder: 'Opowiedz nam krótko o swoim projekcie.',
    },
  },
  submit: {
    default: 'Wyślij wiadomość',
    pending: 'Wysyłamy…',
    success: 'Wysłane!',
    error: 'Spróbuj ponownie',
  },
  // Reassurance next to the submit pill (mock's send-row note).
  note: 'Odpisujemy w ciągu jednego dnia roboczego.',
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
