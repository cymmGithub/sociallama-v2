/**
 * Static copy for the blog post template. Post-specific text (title, lead,
 * body) comes from Payload; these are the site-wide blocks that sit around it.
 *
 * The in-article call to action is one fixed offer rather than a per-post field
 * — the reviewed mock shows a single CTA, and treating it as static is the
 * smaller change. It can become a Payload field if editors want per-post offers.
 */

export const postCta = {
  title: 'Porozmawiajmy o Twojej marce',
  text: 'Napisz do nas — odpowiadamy szybko, bez formularzy na trzy strony.',
  label: 'Umów konsultację',
  href: '/kontakt',
} as const

export const postNewsletter = {
  title: 'NewsLAMA raz w miesiącu',
  text: 'Jeden mail, trzy rzeczy, które faktycznie zmieniły się w social mediach. Bez „10 trendów, które musisz znać”.',
  placeholder: 'Twój adres e-mail',
  label: 'Zapisz się',
  note: 'Możesz wypisać się jednym kliknięciem. Nie wysyłamy nic poza newsletterem.',
  /**
   * The subscription action returns untranslated placeholder keys (the satus
   * `foo_` convention), so the reader-facing wording is mapped here.
   */
  messages: {
    success: 'Jesteś na liście. Sprawdź skrzynkę i potwierdź zapis.',
    invalidEmail: 'Ten adres e-mail wygląda na niepoprawny.',
    failure: 'Nie udało się zapisać. Spróbuj ponownie za chwilę.',
  },
} as const

export const postRelated = {
  title: 'Czytaj dalej',
  allLabel: 'Wszystkie wpisy',
  allHref: '/blog',
} as const
