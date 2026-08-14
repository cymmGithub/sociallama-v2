/**
 * Social Lama homepage content.
 *
 * Single source of truth for all homepage copy — mirrors the verified content
 * export verbatim (Polish copy unchanged, English display headlines as-authored).
 * Components MUST NOT hardcode copy; import from here instead.
 *
 * Excluded from v1 (content-starved, per proposal): the multi-post blog grid
 * (1 real post → a single card). Every quote on the page is real and attributed.
 */

import type { ClientCopy } from '@/lib/content/clients'
import { industryNav } from '@/lib/content/branze'
import type { Localized } from '@/lib/i18n/parity'

export interface MenuItem {
  label: string
  href: string
  /** Hidden in the overlay menu on mobile (≤799.98px); still shown on desktop. */
  mobileHidden?: boolean
}

export interface MenuColumn {
  label: string
  items: MenuItem[]
  /** Mobile-only link appended after the trimmed list (e.g. "all industries"). */
  more?: MenuItem
}

export interface StagePanel {
  /** Screenshot path (under /assets or /case-studies). */
  src: string
  alt: string
  /** Natural pixel dimensions of the screenshot. */
  width: number
  height: number
}

export interface StageClip {
  /** Clip path under /clips. */
  src: string
  /** Poster still path under /clips. */
  poster: string
  alt: string
}

/** One of the two committed crops used by the purchase-journey vignettes. */
export interface JourneyImage {
  /** Crop path under /assets. */
  src: string
  alt: string
}

/**
 * Fields every purchase-journey vignette carries: its place in the sequence,
 * a name for screen readers (the cards are drawn UI, not screenshots), and the
 * role strip naming what the agency does at that step.
 */
export interface JourneyStep {
  /** Step chip, "01"–"05". */
  number: string
  /** Names the vignette for screen readers. */
  label: string
  /** Display verb opening the role strip (TWORZYMY / WE CREATE …). */
  verb: string
  /** The rest of the role sentence, following the verb. */
  role: string
}

/**
 * The SPRZEDAŻ stage's five-step purchase journey: post → klik → strona
 * produktu → koszyk → zamówienie. Every string here renders as real HTML text
 * so both locales read crisp and nothing is baked into a raster; the shop is
 * fictional, so no client brand appears anywhere in the stage.
 */
export interface StageJourney {
  post: JourneyStep & {
    image: JourneyImage
    /** Fictional brand handle in the post header. */
    handle: string
    /** Pill overlaid on the creative. */
    pill: string
    /** Headline overlaid on the creative. */
    headline: string
    /** Post caption; `captionCta` is its accented tail ("link w bio"). */
    caption: string
    captionCta: string
  }
  click: JourneyStep & {
    /** Ad call-to-action the cursor lands on. */
    cta: string
    /** Note under the button naming the interaction. */
    hint: string
  }
  shop: JourneyStep & {
    image: JourneyImage
    /** Address-bar text of the fictional shop. */
    url: string
    product: string
    price: string
    addToCart: string
  }
  cart: JourneyStep & {
    /** Item count on the cart badge. */
    count: string
    title: string
    /** Line item under the title. */
    line: string
  }
  order: JourneyStep & {
    title: string
    /** Order number and timestamp. */
    meta: string
    rows: readonly { label: string; value: string }[]
  }
}

/**
 * Per-service stage media for the autoplay-tabs services section.
 * `panels` float real screenshots over the grain-gradient, `video` renders
 * phone-framed clips playing only while their tab is active, `journey` draws
 * the five purchase-journey vignettes on their flow path.
 */
export type ServiceStage =
  | { kind: 'panels'; panels: StagePanel[] }
  | { kind: 'video'; clips: StageClip[] }
  | { kind: 'journey'; journey: StageJourney }

export interface Service {
  id: string
  title: string
  /** One-sentence description shown in the tab column. */
  body: string
  /** Original long-form description, reserved for the /uslugi/* detail pages. */
  bodyLong: string
  link: { label: string; href: string }
  /** Media composition for the shared services stage. */
  stage: ServiceStage
  /** Autoplay dwell override in ms (default 6000) — e.g. longer for video tabs. */
  dwellMs?: number
}

/**
 * One fragment of a proof panel's supporting sentence. Figures are their own
 * part so the component can accent them without string-matching the copy —
 * the numbers are the load-bearing content and they read as such.
 */
export type SayPart = string | { figure: string }

export interface Step {
  number: string
  /** Rail heading — the step's name from the client's process list. */
  title: string
  /* The rail carried a one-sentence description under each title until
     2026-08-09. Every one of them moved: 01–03 became their panel's headline,
     04–05 were dropped as duplicates of the panel's own copy. The rail is
     title-only now, so the field is gone rather than left unused. */
  image: string
  /**
   * Proof copy (see the `how-it-works-proof` capability). Each step carries one
   * sentence drawn from a real client report, optionally a headline above it,
   * plus a link to the case-study section holding the same figures. Every
   * figure is a real measurement, reproduced without rounding for effect.
   *
   * Nothing here may carry a year, a full date or a month name — elapsed time
   * is expressed as a duration. `how-it-works.test.ts` enforces it.
   */
  proof: {
    /**
     * Panel headline — since 2026-08-09 the step's own description, moved out
     * of the rail card. It runs one size above the sentence below it. Still
     * optional: the panel renders without one, and the layout accounts for it.
     */
    title?: string
    /** The supporting copy, carrying one or two figures. */
    say: SayPart[]
    /**
     * The step's figures, restated at display scale beneath the sentence.
     *
     * These are the same measurements the sentence already carries, lifted out
     * of the prose so they read at a glance — the panel is 1000px wide and a
     * 60ch sentence left most of it empty. Two or three per step: below two the
     * row reads as a stray number, above three the figures stop being scannable
     * at the size that makes them worth lifting.
     *
     * Steps whose sentence carries no digits (02, 04) take their figures from
     * their own copy — the two dealership profiles, and the monthly/annual
     * reporting cadence. Nothing here may be a measurement the copy does not
     * already make.
     */
    stats: readonly { figure: string; label: string }[]
    /**
     * Roster key for the wordmark shown in the step's proof card. Absent on
     * the closing step, which addresses the reader rather than a client.
     */
    client?: 'irobot' | 'volvo' | 'pracuj-pl'
    /**
     * Case-study slug plus the section anchor carrying the same evidence,
     * resolved against the locale's case-study base. Absent on the closing
     * step, which has no call to action (decision, 2026-07-28).
     */
    href?: string
  }
}

export interface Testimonial {
  quote: string
  author: string
  /** Company is optional — some references are given without one. */
  company?: string
  /** Square author photo (public path). Present on the carousel testimonials
   *  and the verified hover-card quotes; hover cards without one render an
   *  initials placeholder instead. */
  image?: string
  /** Company logo (public path). Rendered white on the dark ground; when
   *  absent the `company` text is shown instead. */
  logo?: string
  /** Short pull-phrase shown in display type above the full quote, with
   *  `highlight` knocked out in the contrast colour (rendered as `<mark>`).
   *  Present on the rail testimonials; absent on the lightweight client
   *  hover-card quotes. Split into plain-string segments so the content module
   *  stays free of markup — the component renders `before <mark>highlight</mark>
   *  after`. Pull-phrases must be verbatim excerpts of the quote wherever
   *  possible; a rephrased excerpt is a launch blocker until signed off. */
  pull?: {
    before?: string
    highlight: string
    after?: string
  }
}

// —— Site chrome ————————————————————————————————————————————————————————————

// Minimal bar (logo + CTA + Menu) at every breakpoint; the overlay below is
// the only navigation surface (design D9).
export const nav = {
  logoAlt: 'Social Lama',
  cta: {
    label: 'POROZMAWIAJMY O TWOIM BIZNESIE',
    labelShort: 'POROZMAWIAJMY',
    href: '/kontakt',
  },
  menuLabel: 'Menu',
  // a11y strings for the overlay menu (kept in the module so EN chrome gets
  // English screen-reader labels, not Polish ones).
  menuOpenLabel: 'Otwórz menu',
  menuCloseLabel: 'Zamknij menu',
  menuDialogLabel: 'Menu',
  navLabel: 'Główna nawigacja',
} as const

// Industries kept in the trimmed mobile overlay (design 2026-07-24); the rest
// collapse behind the "Wszystkie branże" link. Matched by PL slug — EN uses its
// own slugs, so home.en.ts declares an equivalent set.
const MOBILE_BRANZE_SLUGS = new Set([
  'automotive',
  'elektronika-i-agd',
  'beauty',
  'fashion',
  'health',
])

// Overlay menu. The BRANŻE items derive from the canonical industry module
// (design D3) — one list drives menu, footer, routes, and sitemap. On mobile the
// menu is trimmed to a few core items per column + a "more" link (mobileHidden /
// more); desktop shows the full lists.
export const menu = {
  columns: [
    {
      label: 'BRANŻE',
      items: industryNav.map((item) =>
        MOBILE_BRANZE_SLUGS.has(item.href.split('/').pop() ?? '')
          ? item
          : { ...item, mobileHidden: true }
      ),
      more: { label: 'Wszystkie branże', href: '/branze' },
    },
    {
      // Hand-maintained rather than derived from SERVICES: this column also
      // carries /szkolenia, which is not a service page.
      label: 'USŁUGI',
      items: [
        { label: 'Strategia', href: '/uslugi/strategia', mobileHidden: true },
        { label: 'Content', href: '/uslugi/content' },
        { label: 'Sprzedaż', href: '/uslugi/sprzedaz' },
        // Directly after Sprzedaż (design D4): the two split advertising by
        // channel, and adjacency at least presents the choice — labels alone
        // cannot distinguish them, so the pages cross-link.
        {
          label: 'Kampanie reklamowe',
          href: '/uslugi/kampanie-reklamowe',
          mobileHidden: true,
        },
        { label: 'Kreacje & Wideo', href: '/uslugi/kreacje-wideo' },
        {
          label: 'Audyt i konsultacje',
          href: '/uslugi/audyt-i-konsultacje',
          mobileHidden: true,
        },
        {
          label: 'Influencer marketing',
          href: '/uslugi/influencer-marketing',
          mobileHidden: true,
        },
        // { label: 'Szkolenia i kursy', href: '/szkolenia', mobileHidden: true }, // delayed launch — no page yet, keep out of nav
      ],
      more: { label: 'Wszystkie usługi', href: '/uslugi' },
    },
  ] satisfies MenuColumn[],
  utility: [
    { label: 'O NAS', href: '/o-nas' },
    { label: 'BLOG', href: '/blog' },
    { label: 'CASE STUDIES', href: '/case-studies' },
    { label: 'ZOSTAŃ LAMĄ', href: '/zostan-lama' },
    { label: 'halohalo@sociallama.pl', href: 'mailto:halohalo@sociallama.pl' },
  ] satisfies MenuItem[],
} as const

// —— Hero ——————————————————————————————————————————————————————————————————

export const hero = {
  headline: {
    /* First line rotates through the offer; the remaining lines are static
       ("THAT WORKS" renders in the accent color). */
    /* Five tokens: KREACJE + WIDEO merged into one (matches the "Kreacje &
       Wideo" service name used in the menu/services). Order mirrors the
       outfit stack (hero-outfit-swap) — the same rotator index drives both
       the word and the llama's look. */
    rotator: [
      'KREACJE & WIDEO',
      'SOCIAL MEDIA',
      'TREŚCI',
      'SPRZEDAŻ',
      'STRATEGIA',
    ],
    lines: ['THAT WORKS', 'WITH SOCIAL LAMA'],
  },
  llamaAlt: 'Lama w okularach przeciwsłonecznych — maskotka Social Lama',
} as const

// —— Clients ————————————————————————————————————————————————————————————————

export const clientsHeading = 'WYBRALI NAS'

// Hover-card CTA, rendered only for brands that have a published case study.
export const clientCardCta = {
  label: 'Case study',
} as const

// Per-locale belt copy, keyed by the roster in lib/content/clients.ts, which
// holds the locale-invariant fields (logo path, case-study slug). Which card a
// logo opens is derived from what its entry carries: a testimonial gives a quote
// card, a `numbers` sentence gives a figure card, and a brand with neither is a
// bare logo — so the 9 approved brands without a case study appear here not at
// all. No entry may carry placeholder copy.
//
// Each `numbers` sentence is an editorial pick of the most striking figure from
// that study's results, naming the platform it happened on (user decision
// 2026-07-27) — a figure with a named channel reads as reporting rather than
// rounding.
export const clients = {
  // The rest of ASUS's study reports production volume, so the sentence leads
  // on the one audience-scale figure it carries and the rows keep the volume.
  asus: {
    numbers:
      '26 000 000 polubień na Facebooku i\u00A044 materiały o\u00A0funkcjach ASUS AI w\u00A06 tygodni.',
    metrics: [
      { label: 'Filmy o AI · YouTube', value: '4' },
      { label: 'Reelsy z @technokrata', value: '5' },
      { label: 'Posty i animacje · Facebook', value: '22' },
    ],
  },
  // The study's headline figures are the monthly averages, so the sentence
  // carries both and the rows keep the reach and engagement behind them.
  belvedere: {
    numbers:
      'Średnio 75 718 wyświetleń miesięcznie i\u00A092% rekomendacji na Facebooku.',
    metrics: [
      { label: 'Zasięg / mies.', value: '28 959' },
      { label: 'Zaangażowani / mies.', value: '1 530' },
      { label: 'Opinie · Facebook', value: '612' },
    ],
  },
  engie: {
    numbers:
      '264 tys. wyświetleń publikacji na LinkedInie i\u00A01 248 nowych obserwatorów.',
    metrics: [
      { label: 'Reakcje · LinkedIn', value: '5 375' },
      { label: 'Wyświetlenia · Facebook', value: '69,1 tys.' },
      { label: 'Interakcje · Facebook', value: '917' },
    ],
  },
  'fm-logistics': {
    numbers:
      'Ponad 800 tys. wyświetleń postów na LinkedInie i\u00A02 111 nowych obserwujących organicznie.',
    metrics: [
      { label: 'Społeczność · LinkedIn', value: '6 894 → 9 005' },
      { label: 'Reakcje · LinkedIn', value: '+10,7 tys.' },
      { label: 'Odtworzenia wideo · LinkedIn', value: '317 000' },
    ],
  },
  imid: {
    numbers:
      '825 tys. wyświetleń na Facebooku i\u00A0wzrost wyświetleń na Instagramie o\u00A05845%.',
    metrics: [
      { label: 'Wzrost interakcji · Instagram', value: '+116 200%' },
      { label: 'Wzrost interakcji · Facebook', value: '+159%' },
      { label: 'Nowi członkowie grupy', value: '+273' },
    ],
  },
  // The one brand on the belt with a verified quote, so the only one that opens
  // a quote card. Verbatim opening sentence of the full testimonial carried by
  // the homepage slider below — shortened by excerpting, never by rephrasing.
  irobot: {
    testimonial: {
      quote:
        'Od blisko dwóch lat współpracujemy z\u00A0agencją Social Lama przy działaniach na TikToku oraz YouTube i\u00A0z\u00A0pełnym przekonaniem możemy ją polecić.',
      author: 'Małgorzata Radomska',
      company: 'iRobot Polska',
      image: '/assets/testimonial-radomska.jpg',
    },
  },
  'julius-meinl': {
    numbers: '433 tys. wyświetleń na Facebooku — wzrost o\u00A01380%.',
    metrics: [
      { label: 'Wyświetlenia · LinkedIn', value: '413 408' },
      { label: 'Interakcje · Facebook', value: '4 806' },
      { label: 'Zasięg · Instagram', value: '24 179' },
    ],
  },
  'jw-construction': {
    numbers: '27 tys. organicznych wyświetleń na LinkedInie i\u00A0819 reakcji.',
    metrics: [
      { label: 'Nowi obserwatorzy · LinkedIn', value: '186' },
    ],
  },
  polomarket: {
    numbers:
      '30 mln wyświetleń filmów w\u00A0kampanii i\u00A0128 tys. polubień na TikToku.',
    metrics: [
      { label: 'Fani · Facebook', value: '158 706' },
      { label: 'Reakcje · Facebook', value: '46 370' },
      { label: 'Komentarze · TikTok', value: '2 709' },
    ],
  },
  'pracuj-pl': {
    numbers: '95,4 mln wyświetleń na TikToku i\u00A052,6 tys. obserwujących.',
    metrics: [
      { label: 'Widzowie · TikTok', value: '94,8 mln' },
      { label: 'Polubienia · TikTok', value: '104,8 tys.' },
    ],
  },
  'produkty-cukiernicze-brzesc': {
    numbers:
      'Dziesięciokrotny wzrost eksportu i\u00A0o\u00A050% większy dzienny zasięg na Facebooku.',
    metrics: [
      { label: 'Zasięg organiczny · Facebook', value: '+52,8%' },
      { label: 'Zasięg postów · Facebook', value: '368 → 549' },
    ],
  },
  rabkoland: {
    numbers:
      'Prawie 3 mln wyświetleń na YouTubie odcinka nakręconego w\u00A0Rabkolandzie.',
    metrics: [
      { label: 'Wzrost zasięgu · Instagram', value: '+38%' },
    ],
  },
  riviera: {
    numbers:
      '306% rocznego KPI zasięgu na TikToku i\u00A0ponad 3 mln osób, do których dotarliśmy.',
    metrics: [
      { label: 'Zasięg · Instagram', value: '163% KPI' },
      { label: 'Nowi obserwujący · Facebook', value: '160% KPI' },
      { label: 'Koszt fana · Facebook', value: '−400%' },
    ],
  },
  skrzat: {
    numbers: '35 mln wyświetleń na TikToku dla premiery filmu.',
    metrics: [
      { label: 'Polubienia · TikTok', value: '100 tys.' },
      { label: 'Wyświetlenia · Instagram', value: '4,38 mln' },
      { label: 'Wyświetlenia · Facebook', value: '3,46 mln' },
    ],
  },
  vistula: {
    numbers:
      'Prawie 3,9 mln więcej wyświetleń profilu na Instagramie i\u00A01 615 nowych obserwujących.',
    metrics: [
      { label: 'Nowi obserwujący · Facebook', value: '+794' },
      { label: 'Wzrost wyświetleń · Facebook', value: '+142 534' },
      { label: 'Wzrost wyświetleń · Instagram', value: '+93 937' },
    ],
  },
  volvo: {
    numbers:
      'Ponad 2 000 nowych obserwatorów na Facebooku dla dwóch salonów Volvo.',
    metrics: [
      { label: 'Volvo Car Warszawa', value: '+184' },
      { label: 'Dom Volvo', value: '+97' },
    ],
  },
} satisfies ClientCopy

// —— Why that works ————————————————————————————————————————————————————————

export const whyThatWorks = {
  heading: ['WHY', 'THAT WORKS'],
  /* Display-scale statement (Azurio treatment, user decision 2026-07-13):
     `strong` renders bold ink, `muted` closes in gray — one flowing sentence
     split mid-statement, full original copy preserved across the two parts. */
  manifesto: {
    strong:
      'Ponieważ znamy się na rzeczy. Zajmujemy się kompleksową obsługą marek w\u00A0social mediach,',
    muted:
      'projektując strategie komunikacyjne dopasowane indywidualnie do potrzeb każdego biznesu.',
  },
  /* Supporting copy: one paragraph, manifesto two-tone treatment (Mock A,
     user decision 2026-07-14) — bold ink lead, muted gray closer. */
  support: {
    strong:
      'Prowadź z\u00A0nami atrakcyjną komunikację, buduj zaangażowaną społeczność i\u00A0rozwijaj swój biznes w\u00A0mediach społecznościowych. Z\u00A0naszą pomocą osiągniesz te cele szybciej, niż myślisz!',
    muted:
      'Zadbamy o\u00A0Twoją markę na każdym etapie, od pierwszego audytu, przez tworzenie contentu, aż po finalne raporty ze wspólnie osiągniętych sukcesów.',
  },
  link: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '/case-studies' },
  // Per-tile deep link into the "NASZE LAMY" slider. The tile shows only an
  // arrow, so `label` is never displayed — it exists to lead the link's
  // accessible name ("Więcej: Anna Ozga"), hence sentence case. `hrefBase` is
  // the locale's about page; the component appends `?lama=<slug>#zespol`.
  memberLink: { label: 'Więcej', hrefBase: '/o-nas' },
  teamLabel: 'Zespół Social Lama',
  // Caption under the two cert cards. The marks are not self-explanatory — one
  // sentence saying what they cover beats presenting them without comment.
  certsLabel:
    'DIMAQ Professional i\u00A0Meta Small Business Academy — potwierdzone kompetencje w\u00A0marketingu cyfrowym i\u00A0reklamie w\u00A0ekosystemie Meta.',
  certAlt: {
    dimaq: 'Certyfikat DIMAQ professional',
    meta: 'Certyfikat Meta Small Business Academy',
  },
} as const

// —— Services ————————————————————————————————————————————————————————————————

export const services = {
  eyebrow: 'CZYM SIĘ ZAJMUJE SOCIAL LAMA?',
  heading: 'Usługi',
  linkLabel: 'DOWIEDZ SIĘ WIĘCEJ',
  // Aria-label prefix for the clip rail's play buttons ("Odtwórz: <clip alt>").
  playLabel: 'Odtwórz',
  items: [
    {
      id: 'content',
      title: 'CONTENT',
      body: 'Strategia to nasz punkt wyjścia: poznajemy Waszą markę i\u00A0odbiorców, by budować skuteczną komunikację w\u00A0social mediach.',
      bodyLong:
        'Strategia to nasz punkt wyjścia: poznajemy Wasze potrzeby i\u00A0możliwości, grupę docelową oraz wartości i\u00A0charakter marki, by zbudować skuteczną komunikację w\u00A0mediach społecznościowych. Na tej bazie wyznaczamy mierzalne cele, dobieramy właściwe narzędzia, na bieżąco monitorujemy działania, konsekwentnie realizujemy plan i\u00A0regularnie raportujemy wyniki.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/content' },
      stage: {
        kind: 'panels',
        // Seven marketing creatives (2026-08 refresh), all 4:5 social-post
        // exports under /assets/content-*. Slot geometry in the CSS is tuned
        // for this uniform ratio: Burger King holds the center hero, the
        // low-res Kohersen (576×720) sits in the smallest slot. Mobile shows
        // only the first three (existing rule), so 1–3 read as a trio:
        // Burger King, DPD, Breville.
        //
        // Each slot's geometry is height-driven, so width follows the source
        // aspect ratio, and every source is a bare social export (no baked-in
        // device bezel) so the panel's own border/radius/shadow reads as the
        // only frame.
        panels: [
          {
            src: '/assets/content-burger-king.jpg',
            alt: 'Kreacja Burger King „Wyjście na medal” — frytki na tle ośnieżonych szczytów',
            width: 1081,
            height: 1351,
          },
          {
            src: '/assets/content-dpd.jpg',
            alt: 'Kreacja Social Lama × DPD — lama z paczką w andyjskiej scenerii',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-breville.jpg',
            alt: 'Kreacja Breville „Jaką kawę piłby Grinch?” — zielony kubek w czapce Grincha',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-walentynki.jpg',
            alt: 'Walentynkowa kreacja pracuj.pl, iRobot i Vobis — zakochana lama i hasło „To nie chwilowe zauroczenie”',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-laurastar.jpg',
            alt: 'Kreacja Laurastar „Asystentka, na której możesz polegać” — parownica obok czerwonej szpilki',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-easy-egg.jpg',
            alt: 'Kreacja Easy Egg — tost-rakieta odbijająca jajko i hasło „Każdy wielki dzień zaczyna się od śniadania”',
            width: 1081,
            height: 1351,
          },
          {
            src: '/assets/content-kohersen.jpg',
            alt: 'Kreacja Kohersen „Moje imię gaaa…” — garnek Black Cube na koncertowej scenie',
            width: 576,
            height: 720,
          },
        ],
      },
    },
    {
      id: 'sprzedaz',
      title: 'SPRZEDAŻ',
      body: 'Prowadzimy Twojego klienta od posta do zamówienia: kreacja, klik, sklep, koszyk. Sprzedaż jest dla nas jednym z\u00A0najważniejszych mierników skuteczności.',
      bodyLong:
        'Tworząc ofertę dla Twojej marki dbamy o\u00A0to, by komunikacja spełniała wypadkowo swoją najważniejszą rolę: sprzedaż produktów lub usług. Skuteczność naszych działań mierzymy nie tylko wskaźnikami w\u00A0social mediach, ale przede wszystkim — sukcesem Twojego biznesu.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/sprzedaz' },
      // The purchase journey the agency runs, not a wall of dashboards: five
      // drawn UI vignettes on a flow path, each captioned with our role in
      // that step (copy system "pięć czasowników"). The shop is fictional
      // ("twojamarka") so no client brand appears in the stage, and the only
      // raster is one brand-free stock photo — Pexels 20336139, free licence,
      // no attribution required — committed in two crops. The handle, domain
      // and `zł` price stay identical in EN: it is the same Polish shop, only
      // its interface speaks the reader's language.
      stage: {
        kind: 'journey',
        journey: {
          post: {
            number: '01',
            label: 'Post w social mediach',
            verb: 'TWORZYMY',
            role: 'kreację, która zatrzymuje scroll',
            handle: 'twojamarka',
            image: {
              src: '/assets/sprzedaz-journey-post.jpg',
              alt: 'Kreacja sprzedażowa — naturalne mydła na pomarańczowym tle',
            },
            pill: 'NOWOŚĆ',
            headline: 'CZYSTY SKŁAD',
            caption: 'Mydła naturalne już w sklepie —',
            captionCta: 'link w bio',
          },
          click: {
            number: '02',
            label: 'Klik w reklamę',
            verb: 'CELUJEMY',
            role: 'reklamą tam, gdzie są Twoi klienci',
            cta: 'KUP TERAZ',
            hint: 'klik w link',
          },
          shop: {
            number: '03',
            label: 'Strona produktu',
            verb: 'PROWADZIMY',
            role: 'ruch prosto do Twojego sklepu',
            image: {
              src: '/assets/sprzedaz-journey-packshot.jpg',
              alt: 'Packshot produktu — kostki naturalnego mydła',
            },
            url: 'twojamarka.pl/mydla',
            product: 'Mydła naturalne',
            price: '59 zł',
            addToCart: 'DODAJ DO KOSZYKA',
          },
          cart: {
            number: '04',
            label: 'Koszyk',
            verb: 'DOMYKAMY',
            role: 'sprzedaż remarketingiem',
            count: '1',
            title: 'W koszyku',
            line: 'Mydła · 59 zł',
          },
          order: {
            number: '05',
            label: 'Zamówienie złożone',
            verb: 'MIERZYMY',
            role: 'zamówienia, nie\u00A0tylko zasięgi',
            title: 'Zamówienie przyjęte',
            meta: '#8412 · dziś, 14:32',
            rows: [
              { label: 'Mydła naturalne', value: '59 zł' },
              { label: 'Dostawa', value: '0 zł' },
            ],
          },
        },
      },
    },
    {
      id: 'kreacje',
      title: 'KREACJE I WIDEO',
      body: 'Grafiki, wideo, rolki i\u00A0animacje — pełne spektrum kreacji dopasowanych do trendów i\u00A0preferencji odbiorców.',
      bodyLong:
        'Grafiki, wideo, karuzele, infografiki, rolki, animacje, wizualizacje — głębokie zaplecze wideograficzne oraz copywriterskie pozwala nam oferować pełne spektrum kreacji w\u00A0social mediach. W\u00A0naszych strategiach dbamy o\u00A0różnorodność przekazów oraz dopasowanie ich do trendów i\u00A0preferencji odbiorców.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/kreacje-wideo' },
      // Longer dwell so the clips get time to actually play (user request).
      dwellMs: 11000,
      stage: {
        kind: 'video',
        clips: [
          {
            src: '/clips/kreacje-bts.mp4',
            poster: '/clips/kreacje-bts-poster.jpg',
            alt: 'Backstage nagrań dla Burger King',
          },
          {
            src: '/clips/kreacje-dpd.mp4',
            poster: '/clips/kreacje-dpd-poster.jpg',
            alt: 'Relacja z eventu DPD',
          },
          {
            src: '/clips/kreacje-volvo.mp4',
            poster: '/clips/kreacje-volvo-poster.jpg',
            alt: 'Relacja z eventu Dom Volvo',
          },
          {
            src: '/clips/kreacje-pracuj.mp4',
            poster: '/clips/kreacje-pracuj-poster.jpg',
            alt: 'Spot aplikacji pracuj.pl',
          },
        ],
      },
    },
  ] satisfies Service[],
} as const

// —— How it works ——————————————————————————————————————————————————————————

export const howItWorks = {
  heading: ['HOW', 'IT WORKS'],
  subhead: 'JAK WYGLĄDA WSPÓŁPRACA Z SOCIAL LAMĄ?',
  ariaLabel: 'Jak to działa',
  railAriaLabel: 'Kroki współpracy',
  /** Precedes the client wordmark in each step's proof card — the mark itself
   *  is the brand name, so the label deliberately stops short of it. */
  proofLabel: 'Tak to wyglądało u',
  /** Shared link text on every proof card. */
  caseStudyCta: 'Zobacz case study',
  steps: [
    {
      number: '01',
      title: 'Warsztaty strategiczne z\u00A0klientem',
      // No rail description: it is the panel headline now — see `proof.title`.
      image: '/assets/step-1.png',
      proof: {
        // The step's own description, promoted out of the rail card: at rail
        // size it read as a caption under the step name, while the panel beside
        // it carried no headline at all. The full stop goes with the promotion
        // — no other panel headline carries one.
        title:
          'Wspólnie analizujemy potrzeby biznesowe, cele, wyzwania oraz możliwości',
        say: [
          'Dla iRobot zaczęliśmy od analizy dotychczasowej komunikacji i\u00A0określenia kierunku dalszych działań. Początkowa liczba obserwujących wynosiła 1\u00A0168, a\u00A0po 17 miesiącach współpracy efekty są następujące:',
        ],
        stats: [
          { figure: '+5 054', label: 'obserwujących' },
          { figure: '+57 911', label: 'polubień' },
          { figure: '17', label: 'miesięcy' },
        ],
        client: 'irobot',
        href: 'irobot#wyzwanie',
      },
    },
    {
      number: '02',
      title: 'Opracowanie strategii komunikacji oraz tworzenie treści',
      // No rail description: it is the panel headline now — see `proof.title`.
      image: '/assets/step-2.png',
      proof: {
        // The step's own description, promoted out of the rail card and cut
        // after the first clause (user call: the full sentence was too much at
        // headline scale). It replaces the client-supplied headline ("Jedna
        // współpraca, dwa profile…") rather than sitting above it.
        title:
          'Przekładamy ustalenia na plan działań w\u00A0formie strategii komunikacji',
        say: [
          'Dla każdego z\u00A0salonów samochodowych marki VOLVO opracowaliśmy osobny kierunek komunikacji, dopasowany do jego specyfiki, odbiorców oraz charakteru Facebooka, Instagrama i\u00A0LinkedIna.',
        ],
        stats: [
          { figure: '2', label: 'salony' },
          { figure: '3', label: 'platformy' },
          { figure: '6', label: 'strategii' },
        ],
        client: 'volvo',
        href: 'volvo#podejscie',
      },
    },
    {
      number: '03',
      title: 'Analiza wyników',
      // No rail description: it is the panel headline now — see `proof.title`.
      image: '/assets/step-4.png',
      proof: {
        // The step's own description, promoted out of the rail card; it
        // replaces the client-supplied headline ("Analiza wyników była
        // podstawą…").
        title: 'Analizujemy wyniki i\u00A0rekomendujemy wprowadzenie niezbędnych zmian',
        // The second sentence (the ~20× subscription comparison) was cut whole
        // (user call): the figure row already carries it.
        say: [
          'Regularny monitoring wyników pozwolił nam zidentyfikować obszary wymagające optymalizacji i\u00A0wdrożyć działania, które przełożyły się na znaczący wzrost kanału.',
        ],
        stats: [
          { figure: '~20×', label: 'więcej subskrypcji' },
          { figure: '1', label: 'rok opieki' },
        ],
        client: 'irobot',
        href: 'irobot#wyniki',
      },
    },
    {
      number: '04',
      title: 'Raportowanie',
      // No rail description: the panel's own sentence already says it.
      image: '/assets/step-5.png',
      // No link: this step addresses the reader rather than a case, so it has
      // no call to action (decision, 2026-07-28).
      proof: {
        title: 'Wszystko co widziałeś to prawdziwe liczby z\u00A0raportów',
        say: [
          'Przygotowujemy raporty miesięczne, półroczne oraz roczne, w\u00A0których analizujemy dotychczasowe działania oraz uwzględniamy wnioski i\u00A0rekomendacje.',
        ],
        stats: [
          { figure: '12', label: 'raportów w roku' },
          { figure: '1', label: 'podsumowanie roczne' },
        ],
      },
    },
    {
      number: '05',
      title: 'Proaktywność',
      // No rail description: the panel's own headline already says it.
      image: '/assets/step-3.png',
      proof: {
        title: 'Inicjatywa wykraczająca poza założenia briefu',
        say: [
          'Dla marki Pracuj.pl zaproponowaliśmy wdrożenie filtra AR jako dodatkowego narzędzia wspierającego cele komunikacyjne marki. Rozwiązanie zwiększyło potencjał organicznego zaangażowania.',
        ],
        stats: [
          { figure: '6,79 mln', label: 'wyświetleń' },
          { figure: '4 885', label: 'filmów użytkowników' },
        ],
        client: 'pracuj-pl',
        href: 'pracuj-pl#podejscie',
      },
    },
  ] satisfies Step[],
} as const

// —— Marquee (decorative) ——————————————————————————————————————————————————

export const marquee = ['THAT WORKS', 'WITH SOCIAL LAMA'] as const

// —— Testimonials ——————————————————————————————————————————————————————————

export const testimonials: Testimonial[] = [
  {
    quote:
      'Od blisko dwóch lat współpracujemy z\u00A0agencją Social Lama przy działaniach na TikToku oraz YouTube i\u00A0z\u00A0pełnym przekonaniem możemy ją polecić. Zespół wyróżnia się dużą wiedzą i\u00A0kompetencjami, a\u00A0także partnerskim podejściem do współpracy — zawsze możemy liczyć na zaangażowanie, sprawną komunikację i\u00A0realne wsparcie w\u00A0realizacji celów.',
    author: 'Małgorzata Radomska',
    company: 'iRobot Polska',
    image: '/assets/testimonial-radomska.jpg',
    logo: '/assets/clients/irobot.svg',
    pull: {
      before: 'Z pełnym przekonaniem ',
      highlight: 'możemy ją polecić',
      after: '.',
    },
  },
  {
    quote:
      'Jesteśmy zadowoleni z\u00A0działań Social Lamy w\u00A0mediach społecznościowych. Agencja stworzyła koncepcję profilu i\u00A0strategię komunikacji dla jednego z\u00A0naszych produktów od podstaw, skutecznie i\u00A0konsekwentnie pozyskując coraz szerszą grupę zaangażowanych odbiorców. Kreatywne pomysły, ciekawe projekty wizualne, interesujące rozwiązania dostosowane do grupy docelowej, przy tym sumienność i\u00A0pełen profesjonalizm. Gorąco polecam Social Lamę do realizacji projektów, które wymagają wyjścia poza szablon.',
    author: 'Marta Szwat',
    company: 'Uniphar',
    image: '/assets/testimonial-szwat.jpg',
    logo: '/assets/clients/uniphar.png',
    // TODO(sign-off): rephrased excerpt — condenses the verbatim "…do realizacji
    // projektów, które wymagają wyjścia poza szablon"; needs client sign-off
    // before launch (same category as the lorem-placeholder launch blockers).
    pull: {
      before: 'Projekty, które wymagają ',
      highlight: 'wyjścia poza szablon',
      after: '.',
    },
  },
  {
    quote:
      'Agencja Social Lama to profesjonalny zespół specjalistów, który wspierał działania marki STAG w\u00A0obrębie social media. Agencja opracowała strategię komunikacji, która odpowiadała naszym celom wizerunkowym i\u00A0prowadziła komunikację w\u00A0dwóch językach. Rekomenduję agencję Social Lama ze względu na proaktywność, kreatywność i\u00A0zaangażowanie w\u00A0powierzony projekt.',
    author: 'Marta Jemiejłańczuk',
    company: 'STAG',
    image: '/assets/testimonial-jemiejlanczuk.jpg',
    logo: '/assets/clients/stag.svg',
    pull: {
      highlight: 'Proaktywność, kreatywność',
      after: ' i zaangażowanie.',
    },
  },
  {
    quote:
      'Szczerze rekomenduję współpracę z\u00A0agencją Social Lama. Zespół doskonale zrozumiał nasze potrzeby i\u00A0przygotował adekwatną strategię komunikacji, na podstawie której na bieżąco realizuje wytyczone cele. Jesteśmy zadowoleni z\u00A0efektów działań zespołu.',
    author: 'Piotr Treszczotko',
    company: 'Funtronic',
    image: '/assets/testimonial-treszczotko.jpg',
    logo: '/assets/clients/funtronic.png',
    pull: {
      before: 'Zespół ',
      highlight: 'doskonale zrozumiał',
      after: ' nasze potrzeby.',
    },
  },
  {
    quote:
      'Social Lama jest agencją, która w\u00A0pełni odpowiada naszym oczekiwaniom. Działania zespołu okazały się dla nas na tyle satysfakcjonujące, że zdecydowaliśmy się poszerzyć zakres współpracy o\u00A0kolejne projekty. Agencja proponuje nowe rozwiązania i\u00A0pomysły, które wspólnie wcielamy w\u00A0życie.',
    author: 'Beata Nartowska',
    company: 'Aquael',
    image: '/assets/testimonial-nartowska.jpg',
    logo: '/assets/clients/aquael.png',
    pull: {
      highlight: 'W pełni odpowiada',
      after: ' naszym oczekiwaniom.',
    },
  },
  {
    quote:
      'Agencja Social Lama była odpowiedzialna za strategię komunikacji, doradztwo merytoryczne, copywriting, moderację oraz kreacje graficzne. Ze względu na cele i\u00A0grupę docelową, wspólnie zdecydowaliśmy się na komunikację w\u00A0serwisie LinkedIn. Polecamy współpracę z\u00A0zespołem Social Lama.',
    author: 'Katarzyna Gosiewska',
    company: 'Intrum',
    image: '/assets/testimonial-gosiewska.jpg',
    logo: '/assets/clients/intrum.png',
    pull: {
      highlight: 'Polecamy współpracę',
      after: ' z zespołem Social Lama.',
    },
  },
]

// sr-only labels for the testimonial slider (section heading + rail controls).
export const testimonialLabels = {
  sectionTitle: 'Opinie klientów',
  railLabel: 'Wybierz opinię',
  itemLabel: 'Opinia',
} as const

// —— FAQ ————————————————————————————————————————————————————————————————————

/**
 * Six of the twelve drafted entries (source #2, #5, #7, #9, #10, #12), ordered
 * as a funnel — price, comparison, timeline, measurement, choosing, reach —
 * not by the source document's numbering. Selection is documented in
 * openspec/changes/add-homepage-faq/proposal.md; the three rejected entries
 * duplicate copy already on the page (`services.eyebrow`, `howItWorks.subhead`).
 *
 * Answers are the source copy verbatim, hyphen dashes normalised to em dashes.
 * This same array feeds the `FAQPage` JSON-LD in app/(frontend)/(home)/page.tsx
 * — Google requires the markup to match the visible copy, so there is exactly
 * one source for both. Row numerals (01–06) are derived from the index.
 */
export const faq = {
  heading: ['ASK', 'THE LAMA'],
  eyebrow: 'NAJCZĘŚCIEJ ZADAWANE PYTANIA',
  ariaLabel: 'Najczęściej zadawane pytania',
  items: [
    {
      question: 'Ile kosztuje prowadzenie social media przez agencję?',
      answer:
        'Koszt prowadzenia social media zależy od liczby platform, częstotliwości publikacji i\u00A0zakresu działań — rynkowo mieści się w\u00A0przedziale od 3 000 do 15 000 zł miesięcznie. Cennik za profesjonalną obsługę jednego profilu w\u00A0agencji zwykle startuje od ok. 920 zł netto/mies. Co bardzo ważne w\u00A0przeciwieństwie do wielu innych agencji w\u00A0Social Lama budżet reklamowy na kampanie w\u00A0social media rozliczamy zawsze osobno, aby zachować pełną transparentność.',
    },
    {
      question:
        'Czym różni się agencja social media od freelancera lub in-\u2060house social media managera?',
      answer:
        'Freelancer to jedna osoba — agencja to zespół stratega, copywritera, grafika, specjalisty od kampanii i\u00A0moderatora, dzięki czemu jakość i\u00A0tempo pracy są nieporównywalne. In-house social media manager zapewnia bliskość marki, ale jego zatrudnienie oznacza koszt kilkunastu tysięcy złotych miesięcznie plus narzędzia i\u00A0szkolenia. Agencja daje dostęp do kompetencji całego działu marketingu w\u00A0cenie jednego etatu, a\u00A0do tego korzysta z\u00A0profesjonalnych narzędzi analitycznych.',
    },
    {
      question:
        'Kiedy pojawią się pierwsze efekty prowadzenia SoMe przez Social Lama?',
      answer:
        'Pierwsze efekty jakościowe — spójny wizerunek marki, wzrost zaangażowania i\u00A0lepsze pozycjonowanie profilu — widać zwykle po 4–8 tygodniach. Efekty sprzedażowe i\u00A0pozyskiwanie leadów zależą od budżetu reklamowego i\u00A0cyklu zakupowego — dobrze zdefiniowana strategia social media ma 466% większą szansę na sukces, a\u00A0kampanie reklamowe potrafią zwiększyć przychody nawet o\u00A01000% w\u00A03 miesiące. Aż 83% klientów, którzy zdecydują się na próbną kampanię, kontynuuje z\u00A0nami współpracę długofalowo.',
    },
    {
      question: 'Jak mierzycie skuteczność działań w\u00A0social media?',
      answer:
        'Każda strategia social media jest oparta na KPI dopasowanych do celów — zasięg, zaangażowanie, ruch na stronie www, liczba leadów lub sprzedaż w\u00A0e-commerce. Wykorzystujemy profesjonalne narzędzia analityczne oraz statystyki natywne platform, dzięki czemu na bieżąco optymalizujemy działania i\u00A0budżet reklamowy. Klient co miesiąc otrzymuje przejrzysty raport z\u00A0analizą wyników i\u00A0rekomendacjami na kolejny okres.',
    },
    {
      question: 'Jak wybrać dobrą agencję social media?',
      answer:
        'Sprawdź dotychczasowe realizacje agencji, poproś o\u00A0case study z\u00A0Twojej branży i\u00A0zwróć uwagę, czy agencja tworzy strategie dopasowane do klienta, czy pracuje na szablonach. Dobra agencja social media taka jak Social Lama zada Ci więcej pytań, niż sama obieca — musi bowiem poznać Twoje grupy docelowe, cele biznesowe oraz konkurencję. Wybieraj partnera, który komunikuje się transparentnie, pokazuje wymierne efekty i\u00A0jest na bieżąco z\u00A0najnowszymi trendami w\u00A0mediach społecznościowych.',
    },
    {
      question: 'Czy Agencja Social Lama działa tylko w\u00A0Warszawie?',
      answer:
        'Nie — mimo że nasza siedziba znajduje się w\u00A0Warszawie, obsługujemy klientów z\u00A0całej Polski, a\u00A0część projektów prowadzimy również w\u00A0komunikacji dwujęzycznej na rynki zagraniczne. Wśród marek, z\u00A0którymi współpracowaliśmy, są m.in. Aflofarm z\u00A0Pabianic (branża farmaceutyczna), STAG (AC S.A.) z\u00A0Białegostoku (branża automotive/LPG) czy Press-Service Monitoring Mediów z\u00A0Poznania, a\u00A0także wiele warszawskich firm, takich jak Pracuj.pl, Medicover, Manpower czy Aquael. Cała komunikacja, briefy, spotkania statusowe i\u00A0raportowanie odbywają się w\u00A0pełni zdalnie, w\u00A0naszym biurze lub u\u00A0klienta — lokalizacja klienta nie ma dla nas żadnego znaczenia, liczy się dopasowanie strategii do Twoich potrzeb.',
    },
  ],
} as const

// —— CTA ————————————————————————————————————————————————————————————————————

export const joinCta = {
  headingLead: 'POTRZEBUJESZ WSPARCIA',
  /* Rotating token = preposition + locative + "?" in one string — Polish
     locative case forces per-word prepositions (W FACEBOOKU / NA
     INSTAGRAMIE), and keeping the "?" inside the token means it never
     detaches from the sliding word.
     Seven platform tokens, no disciplines: every token now drives a cube and
     a services list, and `W STRATEGII?` / `W WIDEO?` had neither — a
     discipline applies to every platform, so it has no platform to show.
     `cube` repeats the paths from lib/content/uslugi.ts on purpose: the same
     seven cubes drive the platform section on /uslugi/content, and this repo
     keeps asset paths in the content file (uslugi.en.ts duplicates them the
     same way). `services` is distilled from those platforms' descriptions
     there, so this section cannot drift from the services pages — LinkedIn,
     X and YouTube carry no advertising item because we do not sell one. */
  rotator: [
    {
      token: 'NA FACEBOOKU?',
      cube: '/assets/cube-facebook-70862a.png',
      services: [
        'posty angażujące',
        'obsługa społeczności',
        'komunikacja w grupach',
        'kampanie Meta Ads',
      ],
    },
    {
      token: 'NA INSTAGRAMIE?',
      cube: '/assets/cube-instagram.png',
      services: [
        'estetyczny feed',
        'rolki i relacje',
        'spójny wizerunek',
        'kampanie Meta Ads',
      ],
    },
    {
      token: 'NA TIKTOKU?',
      cube: '/assets/cube-tiktok.png',
      services: [
        'krótkie wideo',
        'trendy i real-time',
        'język platformy',
        'kampanie TikTok Ads',
      ],
    },
    {
      token: 'NA LINKEDINIE?',
      cube: '/assets/cube-linkedin.png',
      services: [
        'personal branding ekspertów',
        'komunikacja B2B',
        'budowanie autorytetu',
      ],
    },
    {
      token: 'NA PINTEREŚCIE?',
      cube: '/assets/cube-pinterest-6e33ed.png',
      services: [
        'inspiracje i poradniki',
        'wizualne kolekcje',
        'intencje wyszukiwania',
        'ruch na stronę',
      ],
    },
    {
      // Un-inflected, matching the form `home.en.ts` already uses
      // (`ON X (TWITTER)?`). The locative "Twitterze" made this the widest
      // token by a margin and pushed the heading over the post card.
      token: 'NA X (TWITTER)?',
      cube: '/assets/cube-x-5d9863.png',
      services: [
        'szybka, reaktywna komunikacja',
        'ekspercki głos marki',
        'real-time marketing',
      ],
    },
    {
      token: 'NA YOUTUBIE?',
      cube: '/assets/cube-youtube.png',
      services: [
        'wideo długie i krótkie',
        'budowanie subskrypcji',
        'pozycjonowanie eksperckie',
      ],
    },
  ],
  /* Kicker above the platform chip list (design D5, placement C). */
  servicesLead: 'CO ROBIMY',
  /* Transparent cutout composited onto the plum well by CSS — no background
     is baked in, so the well stays a stylesheet decision (design D7). */
  llama: '/assets/join-cta-llama.webp',
  llamaAlt:
    'Lama w granatowym garniturze i bordowym fularze z uniesioną łapą — maskotka Social Lama',
  /* Sponsored-post chrome around the mascot (user pick 2026-07-17): the CTA
     literally becomes the ad we'd run for ourselves. Every gag in here ends
     at /kontakt — without that rule the card is a fidget toy competing with
     the section's own button (design D6). */
  post: {
    href: 'https://www.instagram.com/social.lama/',
    handle: 'social.lama',
    meta: 'Sponsorowane',
    metaNote: 'i tak to polubisz',
    metaNoteLiked: 'a nie mówiliśmy?',
    likes: '1 024 polubienia',
    likesLiked: '1 025 polubień',
    caption: 'Kiedy klient pyta, czy ogarniemy wszystko 🦙💪',
    onInstagram: 'na Instagramie',
    like: 'Polub post',
    /* Send is the one control with no joke — it really copies the link. One
       honest button is what makes the other five read as comedy rather than
       as a broken interface (design D6). */
    share: 'Udostępnij post',
    shareCopied: 'Link skopiowany',
    save: 'Zapisz post',
    saveToast: 'Zapisane. Tylko że zapisany post nie zrobi Ci contentu.',
    saveToastCta: 'NAPISZ DO NAS',
    comment: 'Pokaż komentarze',
    /* A real objection we hear on first calls, answered the way we answer it.
       One exchange only (user call 2026-07-29), and it ends there — the
       control simply retires, with no sign-off line. The card stays a post
       rather than turning into a transcript with a footer. */
    thread: [
      {
        author: 'agnieszka.p',
        question: 'Nasza branża jest nudna.',
        answer:
          'Nie ma nudnych branż, są nudne treści. Mamy case studies z\u00A0branż „bez potencjału”.',
      },
    ],
    /* The "⋯" dropdown. Each option opens its own answer beneath it; the first
       one answers honestly what this section is (required by the capability —
       it is the joke's punchline and the reason the mock is not a lie). */
    menu: 'Więcej opcji',
    menuItems: [
      {
        label: 'Dlaczego widzę tę reklamę?',
        answer:
          'Bo to nie reklama, tylko sekcja na naszej stronie. Ale przyznaj — przez chwilę wyglądała jak prawdziwa. Właśnie takie robimy dla klientów.',
      },
      {
        label: 'Ukryj reklamę',
        answer:
          'Jasne, możemy schować. Zostanie sam llama w\u00A0garniturze — i\u00A0szczerze, on radzi sobie lepiej niż niejedna kampania.',
      },
      {
        label: 'Zgłoś',
        answer:
          'Przyjęliśmy zgłoszenie i\u00A0przekazaliśmy je do działu, który siedzi biurko obok. Obiecali się temu przyjrzeć przy kawie.',
      },
    ],
    menuCta: { label: 'NAPISZ DO NAS', href: '/kontakt' },
  },
  button: { label: 'NAPISZ DO NAS', href: '/kontakt' },
} as const

// —— NewsLAMA (single card) ————————————————————————————————————————————————

// The post itself comes from Payload (latest published, fetched server-side
// in app/(frontend)/(home)/page.tsx) — only the static labels live here.
export const news = {
  heading: 'NewsLAMA',
  readLabel: 'PRZECZYTAJ',
} as const

// —— Footer ————————————————————————————————————————————————————————————————

export const footer = {
  // Giant outline wordmark — the sign-off treatment (echoes the /kontakt hero
  // outline marquee). CSS uppercases it.
  wordmark: 'Social Lama',
  headline: 'POROZMAWIAJMY O TWOIM BIZNESIE',
  cta: { label: 'NAPISZ DO NAS', href: '/kontakt' },
  columns: [
    {
      title: 'NAWIGACJA',
      links: [
        { label: 'O NAS', href: '/o-nas' },
        { label: 'BRANŻE', href: '/branze' },
        { label: 'USŁUGI', href: '/uslugi' },
        // { label: 'SZKOLENIA I KURSY', href: '/szkolenia' }, // delayed launch — no page yet, keep out of nav
        { label: 'BLOG', href: '/blog' },
        { label: 'CASE STUDIES', href: '/case-studies' },
        { label: 'ZOSTAŃ LAMĄ', href: '/zostan-lama' },
        { label: 'KONTAKT', href: '/kontakt' },
      ],
    },
    {
      // The service detail pages, not the `/uslugi` hub — hub pages are linked
      // from the mobile overlay menu only (design D4), since desktop chrome
      // already enumerates every child page.
      title: 'USŁUGI',
      links: [
        { label: 'Strategia', href: '/uslugi/strategia' },
        { label: 'Content', href: '/uslugi/content' },
        { label: 'Sprzedaż', href: '/uslugi/sprzedaz' },
        { label: 'Kampanie reklamowe', href: '/uslugi/kampanie-reklamowe' },
        { label: 'Kreacje & Wideo', href: '/uslugi/kreacje-wideo' },
        { label: 'Audyt i konsultacje', href: '/uslugi/audyt-i-konsultacje' },
        { label: 'Influencer marketing', href: '/uslugi/influencer-marketing' },
      ],
    },
    {
      // Same canonical industry list as the overlay menu (design D3).
      title: 'OFERTA',
      links: industryNav,
    },
  ],
  contactTitle: 'KONTAKT',
  contact: {
    phone: '+48 796 996 118',
    email: 'halohalo@sociallama.pl',
    addresses: [
      'ul. Płocka 9/11B, 01-231\u00A0Warszawa',
      'ul. Januszowicka 5/121, 53-135\u00A0Wrocław',
    ],
  },
  copyright: 'Copyright 2026 sociallama. All rights reserved.',
  legal: [{ label: 'Polityka prywatności', href: '/polityka-prywatnosci' }],
} as const

/**
 * The shape of every homepage/chrome content export. `home.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedHome['<key>']` — the
 * translation-parity gate (design D2).
 */
export type HomeContent = {
  nav: typeof nav
  menu: typeof menu
  footer: typeof footer
  hero: typeof hero
  clientsHeading: typeof clientsHeading
  clientCardCta: typeof clientCardCta
  clients: typeof clients
  whyThatWorks: typeof whyThatWorks
  services: typeof services
  howItWorks: typeof howItWorks
  marquee: typeof marquee
  testimonials: typeof testimonials
  testimonialLabels: typeof testimonialLabels
  faq: typeof faq
  joinCta: typeof joinCta
  news: typeof news
}

/** Same shape, string/number literals widened so translations compile. */
export type LocalizedHome = Localized<HomeContent>

/** Chrome subset consumed by <Header>/<Footer> through the ChromeProvider. */
export type ChromeContent = Pick<LocalizedHome, 'nav' | 'menu' | 'footer'>
