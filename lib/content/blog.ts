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

/**
 * Static copy for the /blog hub. Everything editorial (which post leads, what
 * the picks are, the video) comes from the `blog-hub` global; these are the
 * fixed labels the curated slots hang off.
 */
export const hub = {
  eyebrow: 'Blog Social Lamy',
  title: 'Co działa w social mediach — i dlaczego',
  lead: 'Konkretne rozbiórki kampanii, liczby zamiast trendów i rzeczy, które sprawdziliśmy na własnych klientach, zanim je tu opisaliśmy.',
  picksTitle: 'Wybór redakcji',
  popularTitle: 'Najczęściej czytane',
  archiveTitle: 'Wszystkie wpisy',
} as const

/**
 * The strip between the featured block and the most-read row. Fixed copy
 * pointing at the case-study index rather than an editable CMS slot: the
 * destination is a permanent section of the site, and the reviewed mock's
 * budget calculator does not exist (resolved 2026-07-27).
 */
export const hubPromo = {
  title: 'Nie tylko piszemy — robimy',
  text: 'Zobacz, jak te zasady wyglądają w prawdziwych kampaniach.',
  label: 'Zobacz case studies',
  href: '/case-studies',
} as const

/** The video spotlight's fixed furniture; the video itself comes from the CMS. */
export const hubVideo = {
  badge: 'Wideo',
  play: 'Obejrzyj',
  label: 'Obejrzyj na YouTube',
  /** Screen-reader name for the poster link — "Obejrzyj" alone says nothing. */
  posterLabel: (title: string) => `Obejrzyj na YouTube: ${title}`,
} as const

/**
 * Polish has three plural forms, and the count here is read aloud by screen
 * readers, so "Znaleziono 22 wpisów" is a real error rather than a nicety:
 * 1 → wpis, 2–4 → wpisy, 5+ → wpisów, with the teens always taking wpisów
 * (12 wpisów, but 22 wpisy).
 */
function postsPlural(count: number): string {
  const lastTwo = count % 100
  if (count === 1) {
    return 'wpis'
  }
  if (lastTwo >= 12 && lastTwo <= 14) {
    return 'wpisów'
  }
  const last = count % 10
  return last >= 2 && last <= 4 ? 'wpisy' : 'wpisów'
}

export const hubSearch = {
  label: 'Szukaj we wpisach',
  placeholder: 'Czego szukasz?',
  clear: 'Wyczyść',
  /** Announced to assistive technology whenever the result count changes. */
  results: (count: number) => `Znaleziono ${count} ${postsPlural(count)}.`,
  emptyTitle: 'Nic nie pasuje',
  emptyText: 'Spróbuj innego słowa albo wyczyść wyszukiwanie.',
} as const
