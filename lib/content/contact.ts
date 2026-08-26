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

export const contactForm = {
  fields: {
    name: { label: 'Imię', placeholder: 'Jak się do Ciebie zwracać?' },
    email: { label: 'E-mail', placeholder: 'twoj@adres.pl' },
    // Optional callback channel — opt-in nudge keeps friction near zero.
    // Kept short on purpose: the inputs render at 21px display type on mobile,
    // where a single-line placeholder is clipped (not wrapped) past ~30 chars.
    phone: {
      label: 'Telefon',
      optional: 'opcjonalnie',
      placeholder: 'Zostaw numer, oddzwonimy.',
    },
    message: {
      label: 'Twoja wiadomość',
      placeholder: 'Opowiedz nam krótko o\u00A0swoim projekcie.',
    },
  },
  submit: {
    default: 'Umów bezpłatną konsultację',
    pending: 'Wysyłamy…',
    success: 'Wysłane!',
    error: 'Spróbuj ponownie',
  },
  // Reassurance next to the submit pill — aligned to the lede's 24h promise.
  note: 'Odzywamy się w\u00A024h, w\u00A0dni robocze.',
  // RODO consent, unchecked by default — the submission is rejected without it.
  // It replaces the passive privacy note that used to sit under the send row,
  // keeping that note's substance (a reply, plus the callback the phone field
  // invites) and its link. Split so the component wraps only the policy name
  // in <Link>; the href points at the existing privacy page.
  consent: {
    text: 'Wyrażam zgodę na przetwarzanie podanych danych osobowych w\u00A0celu odpowiedzi na wiadomość (i\u00A0oddzwonienia, jeśli zostawię numer), zgodnie z\u00A0',
    linkLabel: 'Polityką prywatności',
    linkHref: '/polityka-prywatnosci',
  },
  // Lead-email labels (server action) — localized so EN submissions arrive with
  // English field labels (design D7). `subjectPrefix` gets `— <name>` appended.
  email: {
    subjectPrefix: 'Nowa wiadomość z formularza',
    name: 'Imię',
    email: 'E-mail',
    phone: 'Telefon',
    message: 'Wiadomość',
    // Proof-of-consent lines: the schema rejects unconsented submissions, so
    // the label always pairs with `granted`; `consentBody` heads the verbatim
    // wording snapshot at the bottom of the email.
    consent: 'Zgoda (RODO)',
    granted: 'udzielona',
    consentBody: 'Treść udzielonej zgody',
    none: '—',
  },
  // FormState.message returned by the server action; the form's
  // onSuccess/onError callbacks surface it as a toast.
  messages: {
    success: 'Dzięki! Odezwiemy się najszybciej, jak to możliwe.',
    error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.',
    security: 'Weryfikacja bezpieczeństwa nie powiodła się. Odśwież stronę.',
    rateLimit: 'Za dużo prób. Odczekaj chwilę i\u00A0spróbuj ponownie.',
  },
  // Per-field validation messages. Used server-side by the Zod schema and
  // client-side via the form kit's `invalidMessage` formatter.
  errors: {
    name: 'Podaj imię.',
    email: 'Podaj poprawny adres e-mail.',
    message: 'Napisz wiadomość.',
    consent: 'Bez zgody nie możemy odpowiedzieć na wiadomość.',
    fallback: 'Uzupełnij to pole.',
    // Short inline hint shown under a missing required field.
    required: 'Wymagane',
  },
} as const

// —— Metrics band ————————————————————————————————————————————————————————————

// Intro line above the numbers (mock's band head, next to the Smile icon).
export const contactMetricsHead = 'Kilka liczb o\u00A0tym, co robimy dla marek:'

export const contactMetrics = [
  { value: '514 000', caption: 'zaangażowanych fanów' },
  { value: '528', caption: 'przeprowadzonych kampanii' },
  { value: '80', caption: 'zadowolonych klientów' },
  { value: '7 260 000', caption: 'zasięgu na Facebooku' },
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
  contactForm: typeof contactForm
  contactMetricsHead: typeof contactMetricsHead
  contactMetrics: typeof contactMetrics
}

/** Same shape, literals widened so translations compile. */
export type LocalizedContact = Localized<ContactContent>
