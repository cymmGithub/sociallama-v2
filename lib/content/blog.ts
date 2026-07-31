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

export const postRelated = {
  title: 'Czytaj dalej',
  allLabel: 'Wszystkie wpisy',
  allHref: '/blog',
} as const

/** Rail heading, plus the accessible name for the table-of-contents nav. */
export const postToc = {
  title: 'W tym wpisie',
  navLabel: 'Spis treści',
} as const

/**
 * The share row. The two brand labels carry a `{title}` slot instead of being
 * functions like `hubVideo.posterLabel`: the row is a client component and its
 * copy arrives as props, so it has to be serializable.
 */
export const postShare = {
  title: 'Udostępnij',
  linkedin: 'Udostępnij „{title}” na LinkedInie',
  facebook: 'Udostępnij „{title}” na Facebooku',
  copy: 'Kopiuj link do wpisu',
  copied: 'Link skopiowany',
} as const

/** The author card's outbound link — one wording per `ResolvedAuthor.kind`. */
export const postAuthor = {
  personLink: 'Profil autora',
  brandLink: 'Poznaj Social Lamę',
} as const

/**
 * Static copy for the /blog hub. Everything editorial (which post leads, what
 * the picks are, the video) comes from the `blog-hub` global; these are the
 * fixed labels the curated slots hang off.
 */
export const hub = {
  eyebrow: 'Blog Social Lamy',
  title: 'Co działa w\u00A0social mediach — i\u00A0dlaczego',
  lead: 'Konkretne rozbiórki kampanii, liczby zamiast trendów i\u00A0rzeczy, które sprawdziliśmy na własnych klientach, zanim je tu opisaliśmy.',
  categoriesAria: 'Kategorie',
  allCategories: 'Wszystkie',
  picksTitle: 'Wybór redakcji',
  popularTitle: 'Najczęściej czytane',
  archiveTitle: 'Wszystkie wpisy',
  /** Follows the minute count in a byline: "5 min czytania". */
  readingTimeSuffix: 'min czytania',
} as const

/**
 * The strip between the featured block and the most-read row. Fixed copy
 * pointing at the case-study index rather than an editable CMS slot: the
 * destination is a permanent section of the site, and the reviewed mock's
 * budget calculator does not exist (resolved 2026-07-27).
 */
export const hubPromo = {
  title: 'Nie tylko piszemy — robimy',
  text: 'Zobacz, jak te zasady wyglądają w\u00A0prawdziwych kampaniach.',
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

/** The listing card, wherever it sits: hub grid, category page, related row. */
export const postCard = {
  read: 'PRZECZYTAJ',
} as const

/** The numbered pager under a card grid. */
export const pagination = {
  navAria: 'Paginacja',
  newer: 'Nowsze',
  older: 'Starsze',
} as const

/**
 * The plain listing behind /category/{slug} and /blog/page/{n}. Its category
 * nav is the hub's, so those two labels are read from `hub` rather than
 * restated; the card and pager copy rides along because the listing owns both.
 */
export const listing = {
  categoriesAria: hub.categoriesAria,
  allCategories: hub.allCategories,
  emptyTitle: 'Jeszcze tu pusto',
  emptyText: 'Pracujemy nad nowymi wpisami — zajrzyj wkrótce.',
  postCard,
  pagination,
} as const

/**
 * Everything the post template renders around a post, so the page passes one
 * prop. The blocks are referenced rather than restated — including the hub's
 * reading-time suffix, which is the same byline wording — so the article and
 * the hub can never drift.
 */
export const postArticle = {
  breadcrumbAria: 'Ścieżka nawigacji',
  /** The hub crumb, and the same label in the BreadcrumbList JSON-LD. */
  hubLabel: 'Blog',
  readingTimeSuffix: hub.readingTimeSuffix,
  cta: postCta,
  toc: postToc,
  share: postShare,
  author: postAuthor,
  related: postRelated,
  postCard,
} as const

/**
 * The same, for the /blog hub. Its English twin is `as const` rather than
 * parity-checked: `hubVideo` carries a function, and every member is a block
 * already checked at its own declaration, so nothing goes unchecked.
 */
export const hubView = {
  hub,
  promo: hubPromo,
  video: hubVideo,
  postCard,
  pagination,
  emptyTitle: listing.emptyTitle,
  emptyText: listing.emptyText,
} as const
