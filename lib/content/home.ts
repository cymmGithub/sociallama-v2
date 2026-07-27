/**
 * Social Lama homepage content.
 *
 * Single source of truth for all homepage copy — mirrors the verified content
 * export verbatim (Polish copy unchanged, English display headlines as-authored).
 * Components MUST NOT hardcode copy; import from here instead.
 *
 * Excluded from v1 (content-starved, per proposal): FAQ (0 real entries) and the
 * multi-post blog grid (1 real post → a single card). Every quote on the page is
 * real and attributed.
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

export interface SocialLink {
  label: string
  href: string
  /** Path to the brand icon svg under /assets. */
  icon: string
}

export interface StagePanel {
  /** Screenshot path (under /assets or /case-studies). */
  src: string
  alt: string
  /** Natural pixel dimensions of the screenshot. */
  width: number
  height: number
}

export type StageClip =
  | {
      /** Clip path under /clips. */
      src: string
      /** Poster still path under /clips. */
      poster: string
      alt: string
    }
  /** Placeholder card shown in the phone rail until its clip exists — the
   *  string is the label rendered inside the empty frame. */
  | { placeholder: string }

/**
 * Per-service stage media for the autoplay-tabs services section.
 * `panels` float real screenshots over the grain-gradient, `video` renders
 * phone-framed clips playing only while their tab is active.
 */
export type ServiceStage =
  | { kind: 'panels'; panels: StagePanel[] }
  | { kind: 'video'; clips: StageClip[] }

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

export interface Step {
  number: string
  text: string
  image: string
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
  logo: '/assets/logo.svg',
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
    { label: 'halohalo@sociallama.pl', href: 'mailto:halohalo@sociallama.pl' },
  ] satisfies MenuItem[],
} as const

// Canonical, ordered social set — rendered identically everywhere social icons
// appear (header overlay, footer, hero, o-nas hero). Order is Meta-first:
// IG, FB, TikTok, X, LinkedIn, YouTube, Pinterest. Real profile destinations —
// no `#` placeholders. External http(s) hrefs make <Link> open a new tab with
// rel="noopener noreferrer" automatically (see components/ui/link).
export const socials: SocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/social.lama/',
    icon: '/assets/icon-instagram.svg',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/agencjasociallama/',
    icon: '/assets/icon-facebook.svg',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@social_lama',
    icon: '/assets/icon-tiktok.svg',
  },
  {
    label: 'X',
    href: 'https://x.com/SocialLamaPL',
    icon: '/assets/icon-x.svg',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/sociallama/',
    icon: '/assets/icon-linkedin.svg',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@GOODONEGROUP',
    icon: '/assets/icon-youtube.svg',
  },
  {
    label: 'Pinterest',
    href: 'https://pl.pinterest.com/social__lama/',
    icon: '/assets/icon-pinterest.svg',
  },
]

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

export const clientsHeading = 'ZAUFALI NAM'

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
  'a1-karting': {
    numbers:
      '3,7 mln wyświetleń na Facebooku i o 397% więcej interakcji z zawartością.',
    metrics: [
      { label: 'Wyświetlenia · TikTok', value: '767 tys.' },
      { label: 'Wyświetlenia · Instagram', value: '552,1 tys.' },
      { label: 'Kliknięcia linku · Facebook', value: '34 373' },
    ],
  },
  // The rest of ASUS's study reports production volume, so the sentence leads
  // on the one audience-scale figure it carries and the rows keep the volume.
  asus: {
    numbers:
      '26 mln polubień na Facebooku i 44 materiały o funkcjach ASUS AI w 6 tygodni.',
    metrics: [
      { label: 'Filmy o AI · YouTube', value: '4' },
      { label: 'Reelsy z @technokrata', value: '5' },
      { label: 'Posty i animacje · Facebook', value: '22' },
    ],
  },
  'dolina-charlotty': {
    numbers:
      '15,5 mln wyświetleń na Facebooku i wzrost wyświetleń na Instagramie o 1706%.',
    metrics: [
      { label: 'Kliknięcia linku · Facebook', value: '99 509' },
      { label: 'Interakcje · Facebook', value: '51 278' },
      { label: 'Nowi obserwujący · Facebook', value: '4 869' },
    ],
  },
  'dynamic-development': {
    numbers: '3,4 mln zasięgu na Facebooku i 1,2 mln na Instagramie.',
    metrics: [
      { label: 'Kliknięcia linku · Facebook', value: '45 tys.' },
      { label: 'Odwiedziny profilu · Facebook', value: '27 tys.' },
      { label: 'Nowi obserwujący · Facebook', value: '6 050' },
    ],
  },
  'ed-invest': {
    numbers: '2,6 mln wyświetleń na Facebooku — o 180% więcej niż wcześniej.',
    metrics: [
      { label: 'Kliknięcia linku · Instagram', value: '+1073%' },
      { label: 'Zasięg · Instagram', value: '94 tys.' },
      { label: 'Odwiedziny profilu · Instagram', value: '1 466' },
    ],
  },
  engie: {
    numbers:
      '264 tys. wyświetleń publikacji na LinkedInie i 1 248 nowych obserwatorów.',
    metrics: [
      { label: 'Reakcje · LinkedIn', value: '5 375' },
      { label: 'Wyświetlenia · Facebook', value: '69,1 tys.' },
      { label: 'Interakcje · Facebook', value: '917' },
    ],
  },
  'fm-logistics': {
    numbers:
      'Ponad 800 tys. wyświetleń postów na LinkedInie i 2 111 nowych obserwujących organicznie.',
    metrics: [
      { label: 'Społeczność · LinkedIn', value: '6 894 → 9 005' },
      { label: 'Reakcje · LinkedIn', value: '+10,7 tys.' },
      { label: 'Odtworzenia wideo · LinkedIn', value: '317 000' },
    ],
  },
  'galeria-rondo-wiatraczna': {
    numbers:
      'Po 2,5 mln wyświetleń na Facebooku i Instagramie oraz 2,14 mln w wyszukiwarce Google.',
    metrics: [
      { label: 'Widzów · Facebook', value: '750 tys.' },
      { label: 'Widzów · Instagram', value: '280 tys.' },
      { label: 'Kliknięcia · strona WWW', value: '26 559' },
    ],
  },
  imid: {
    numbers:
      '825 tys. wyświetleń na Facebooku i wzrost wyświetleń na Instagramie o 5845%.',
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
        'Od blisko dwóch lat współpracujemy z agencją Social Lama przy działaniach na TikToku oraz YouTube i z pełnym przekonaniem możemy ją polecić.',
      author: 'Małgorzata Radomska',
      company: 'iRobot Polska',
      image: '/assets/testimonial-radomska.jpg',
    },
  },
  'julius-meinl': {
    numbers: '433 tys. wyświetleń na Facebooku — wzrost o 1380%.',
    metrics: [
      { label: 'Wyświetlenia · LinkedIn', value: '413 408' },
      { label: 'Interakcje · Facebook', value: '4 806' },
      { label: 'Zasięg · Instagram', value: '24 179' },
    ],
  },
  'jw-construction': {
    numbers: '27 tys. organicznych wyświetleń na LinkedInie i 819 reakcji.',
    metrics: [
      { label: 'Nowi obserwatorzy · LinkedIn', value: '186' },
    ],
  },
  mercator: {
    numbers:
      '4 mln wyświetleń publikacji na Facebooku i 542 tys. na Instagramie.',
    metrics: [
      { label: 'Reakcje · Facebook', value: '2 968' },
      { label: 'Reakcje · Instagram', value: '2 820' },
      { label: 'Nowi obserwatorzy · Facebook', value: '113' },
    ],
  },
  motointegrator: {
    numbers:
      '620% ROAS kampanii remarketingowej w Niemczech, przy 0,08 € za kliknięcie.',
    metrics: [
      { label: 'Zasięg / mies. · Facebook', value: '554 320' },
      { label: 'Komentarze / mies. · Facebook', value: '1 305' },
      { label: 'Wizyty / mies. · Instagram', value: '1 431' },
    ],
  },
  polomarket: {
    numbers:
      '30 mln wyświetleń filmów w kampanii i 128 tys. polubień na TikToku.',
    metrics: [
      { label: 'Fani · Facebook', value: '158 706' },
      { label: 'Reakcje · Facebook', value: '46 370' },
      { label: 'Komentarze · TikTok', value: '2 709' },
    ],
  },
  'pracuj-pl': {
    numbers: '95,4 mln wyświetleń na TikToku i 52,6 tys. obserwujących.',
    metrics: [
      { label: 'Widzowie · TikTok', value: '94,8 mln' },
      { label: 'Polubienia · TikTok', value: '104,8 tys.' },
    ],
  },
  'produkty-cukiernicze-brzesc': {
    numbers:
      'Dziesięciokrotny wzrost eksportu i o 50% większy dzienny zasięg na Facebooku.',
    metrics: [
      { label: 'Zasięg organiczny · Facebook', value: '+52,8%' },
      { label: 'Zasięg postów · Facebook', value: '368 → 549' },
    ],
  },
  rabkoland: {
    numbers:
      'Prawie 3 mln wyświetleń na YouTubie odcinka nakręconego w Rabkolandzie.',
    metrics: [
      { label: 'Wzrost zasięgu · Instagram', value: '+38%' },
    ],
  },
  riviera: {
    numbers:
      '306% rocznego KPI zasięgu na TikToku i ponad 3 mln osób, do których dotarliśmy.',
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
      'Prawie 3,9 mln więcej wyświetleń profilu na Instagramie i 1 615 nowych obserwujących.',
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
      'Ponieważ znamy się na rzeczy. Zajmujemy się kompleksową obsługą marek w social mediach,',
    muted:
      'projektując strategie komunikacyjne dopasowane indywidualnie do potrzeb każdego biznesu.',
  },
  /* Supporting copy: one paragraph, manifesto two-tone treatment (Mock A,
     user decision 2026-07-14) — bold ink lead, muted gray closer. */
  support: {
    strong:
      'Prowadź z nami atrakcyjną komunikację, buduj zaangażowaną społeczność i rozwijaj swój biznes w mediach społecznościowych. Z naszą pomocą osiągniesz te cele szybciej, niż myślisz!',
    muted:
      'Zadbamy o Twoją markę na każdym etapie, od pierwszego audytu, przez tworzenie contentu, aż po finalne raporty ze wspólnie osiągniętych sukcesów.',
  },
  link: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '/case-studies' },
  // CTA card filling the last grid slot — jumps to the "NASZE LAMY" team slider.
  teamCta: { label: 'Dowiedz się więcej', href: '/o-nas#zespol' },
  teamLabel: 'Zespół Social Lama',
  certsLabel: 'Certyfikaty',
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
  // Tag shown inside a service's placeholder frame until its clip is delivered.
  soonLabel: 'Wkrótce',
  items: [
    {
      id: 'content',
      title: 'CONTENT',
      body: 'Strategia to nasz punkt wyjścia: poznajemy Waszą markę i odbiorców, by budować skuteczną komunikację w social mediach.',
      bodyLong:
        'Strategia to nasz punkt wyjścia: poznajemy Wasze potrzeby i możliwości, grupę docelową oraz wartości i charakter marki, by zbudować skuteczną komunikację w mediach społecznościowych. Na tej bazie wyznaczamy mierzalne cele, dobieramy właściwe narzędzia, na bieżąco monitorujemy działania, konsekwentnie realizujemy plan i regularnie raportujemy wyniki.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/content' },
      stage: {
        kind: 'panels',
        // Twelve case-study creatives drawn from eight brands. The stage renders
        // the first seven on desktop; 8–12 are wide-screen-only extras (≥1440px)
        // — see the `panel:nth-child(n + 8)` rules in the CSS. Mobile shows only
        // the first three (existing rule), so 1–3 read as a trio and keep the
        // two flagship brands (Volvo, Pracuj.pl) there.
        //
        // Each slot's geometry is height-driven, so width follows the source
        // aspect ratio: swaps stay near the ratio the slot was tuned for, and
        // every source is a bare screenshot (no baked-in device bezel) so the
        // panel's own border/radius/shadow reads as the only frame.
        panels: [
          {
            src: '/case-studies/volvo/volvo-vcw-post.jpg',
            alt: 'Post Volvo Car Warszawa na Instagramie prezentujący samochód Volvo',
            width: 351,
            height: 760,
          },
          {
            src: '/case-studies/mercator/mercator-gallery-2.jpg',
            alt: 'Rolka Mercator Medical z neonowymi rękawicami ogrodniczymi „gogrip green”',
            width: 471,
            height: 1023,
          },
          {
            src: '/case-studies/volvo/volvo-vcw-goracy.jpg',
            alt: 'Kreacja Volvo „Gorący okres?” o przygotowaniu auta na lato',
            width: 351,
            height: 760,
          },
          {
            src: '/case-studies/skibooking/skibooking-gallery-2.jpg',
            alt: 'Post SkiBooking.pl „O czym pamiętać przed wyjazdem na narty?” z narciarskim ekwipunkiem',
            width: 468,
            height: 1013,
          },
          {
            src: '/case-studies/kohersen/kohersen-gallery-4.jpg',
            alt: 'Kadr z filmu Kohersen — burger przełamany na pół nad talerzem',
            width: 788,
            height: 1400,
          },
          {
            src: '/case-studies/stadler-form/stadler-form-gallery-2.jpg',
            alt: 'Kadr Stadler Form — nawilżacz powietrza wnoszony do mieszkania',
            width: 677,
            height: 1400,
          },
          {
            src: '/case-studies/ozgasl/ozgasl-gallery-2.jpg',
            alt: 'Humorystyczna rolka O, ZGASŁ? — mechanik z filtrem AR i podpisem „Kiedy Klient mówi, że jednak sam naprawi auto”',
            width: 760,
            height: 1400,
          },
          {
            src: '/case-studies/julius-meinl/julius-meinl-gallery-3.jpg',
            alt: 'Kreacja Julius Meinl „3 błędy w latte art” — czerwona filiżanka z latte',
            width: 320,
            height: 524,
          },
          {
            src: '/case-studies/ariadna/ariadna-gallery-4.jpg',
            alt: 'Kadr z filmu dla panelu Ariadna — dziewczyna z telefonem i podpisem „Ja: rozwiązuję ankiety”',
            width: 774,
            height: 1400,
          },
          {
            src: '/case-studies/riviera/riviera-gallery-3.jpg',
            alt: 'Rolka Galerii Riviera o dwumetrowej pisance w centrum handlowym',
            width: 824,
            height: 1400,
          },
          {
            src: '/case-studies/stadler-form/stadler-form-gallery-7.jpg',
            alt: 'Kadr Stadler Form — dyfuzor z efektem płomienia obok notatnika',
            width: 788,
            height: 1400,
          },
          {
            src: '/case-studies/julius-meinl/julius-meinl-gallery-7.jpg',
            alt: 'Czerwona filiżanka Julius Meinl trzymana na tle drewnianych lameli',
            width: 325,
            height: 525,
          },
        ],
      },
    },
    {
      id: 'sprzedaz',
      title: 'SPRZEDAŻ',
      body: 'Komunikacja ma spełniać swoją najważniejszą rolę: sprzedaż — skuteczność mierzymy sukcesem Twojego biznesu.',
      bodyLong:
        'Tworząc ofertę dla Twojej marki dbamy o to, by komunikacja spełniała wypadkowo swoją najważniejszą rolę: sprzedaż produktów lub usług. Skuteczność naszych działań mierzymy nie tylko wskaźnikami w social mediach, ale przede wszystkim — sukcesem Twojego biznesu.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/sprzedaz' },
      // Device-mockup creatives (iPad / MacBook) exported with their frames and
      // shadows baked in on transparency, so they render as bare floating panels
      // (no card chrome — see the frameless rule in the CSS). Mobile shows the
      // first three (existing rule).
      stage: {
        kind: 'panels',
        panels: [
          {
            src: '/assets/sprzedaz-meta-ads.png',
            alt: 'Menedżer reklam Meta — wyniki kampanii sprzedażowych na iPadzie',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-x.png',
            alt: 'Analityka X — wzrost wyświetleń i zaangażowania na MacBooku',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-tiktok.png',
            alt: 'TikTok Studio — statystyki wyświetleń i obserwujących na MacBooku',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-youtube.png',
            alt: 'Statystyki kanału YouTube — wzrost wyświetleń na iPadzie',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-linkedin.png',
            alt: 'Analiza strony LinkedIn — wzrost odwiedzin i obserwujących na MacBooku',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-instagram.png',
            alt: 'Statystyki Instagrama — wzrost zasięgu i obserwujących na iPhonie',
            width: 900,
            height: 1117,
          },
        ],
      },
    },
    {
      id: 'kreacje',
      title: 'KREACJE I WIDEO',
      body: 'Grafiki, wideo, rolki i animacje — pełne spektrum kreacji dopasowanych do trendów i preferencji odbiorców.',
      bodyLong:
        'Grafiki, wideo, karuzele, infografiki, rolki, animacje, wizualizacje — głębokie zaplecze wideograficzne oraz copywriterskie pozwala nam oferować pełne spektrum kreacji w social mediach. W naszych strategiach dbamy o różnorodność przekazów oraz dopasowanie ich do trendów i preferencji odbiorców.',
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
          { placeholder: 'waiting for iRobot video' },
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
  steps: [
    {
      number: '01',
      text: 'Określamy Twoje cele, potrzeby i możliwości podczas warsztatów strategicznych.',
      image: '/assets/step-1.png',
    },
    {
      number: '02',
      text: 'Przygotowujemy indywidualną strategię i rozpoczynamy komunikację.',
      image: '/assets/step-2.png',
    },
    {
      number: '03',
      text: 'Proaktywnie rekomendujemy nowe rozwiązania i możliwości.',
      image: '/assets/step-3.png',
    },
    {
      number: '04',
      text: 'Analizujemy wyniki i wprowadzamy niezbędne zmiany.',
      image: '/assets/step-4.png',
    },
    {
      number: '05',
      text: 'Raportujemy nasze działania.',
      image: '/assets/step-5.png',
    },
  ] satisfies Step[],
} as const

// —— Marquee (decorative) ——————————————————————————————————————————————————

export const marquee = ['THAT WORKS', 'WITH SOCIAL LAMA'] as const

// —— Testimonials ——————————————————————————————————————————————————————————

export const testimonials: Testimonial[] = [
  {
    quote:
      'Od blisko dwóch lat współpracujemy z agencją Social Lama przy działaniach na TikToku oraz YouTube i z pełnym przekonaniem możemy ją polecić. Zespół wyróżnia się dużą wiedzą i kompetencjami, a także partnerskim podejściem do współpracy — zawsze możemy liczyć na zaangażowanie, sprawną komunikację i realne wsparcie w realizacji celów.',
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
      'Jesteśmy zadowoleni z działań Social Lamy w mediach społecznościowych. Agencja stworzyła koncepcję profilu i strategię komunikacji dla jednego z naszych produktów od podstaw, skutecznie i konsekwentnie pozyskując coraz szerszą grupę zaangażowanych odbiorców. Kreatywne pomysły, ciekawe projekty wizualne, interesujące rozwiązania dostosowane do grupy docelowej, przy tym sumienność i pełen profesjonalizm. Gorąco polecam Social Lamę do realizacji projektów, które wymagają wyjścia poza szablon.',
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
      'Agencja Social Lama to profesjonalny zespół specjalistów, który wspierał działania marki STAG w obrębie social media. Agencja opracowała strategię komunikacji, która odpowiadała naszym celom wizerunkowym i prowadziła komunikację w dwóch językach. Rekomenduję agencję Social Lama ze względu na proaktywność, kreatywność i zaangażowanie w powierzony projekt.',
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
      'Szczerze rekomenduję współpracę z agencją Social Lama. Zespół doskonale zrozumiał nasze potrzeby i przygotował adekwatną strategię komunikacji, na podstawie której na bieżąco realizuje wytyczone cele. Jesteśmy zadowoleni z efektów działań zespołu.',
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
      'Social Lama jest agencją, która w pełni odpowiada naszym oczekiwaniom. Działania zespołu okazały się dla nas na tyle satysfakcjonujące, że zdecydowaliśmy się poszerzyć zakres współpracy o kolejne projekty. Agencja proponuje nowe rozwiązania i pomysły, które wspólnie wcielamy w życie.',
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
      'Agencja Social Lama była odpowiedzialna za strategię komunikacji, doradztwo merytoryczne, copywriting, moderację oraz kreacje graficzne. Ze względu na cele i grupę docelową, wspólnie zdecydowaliśmy się na komunikację w serwisie LinkedIn. Polecamy współpracę z zespołem Social Lama.',
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

// —— CTA ————————————————————————————————————————————————————————————————————

export const joinCta = {
  headingLead: 'POTRZEBUJESZ WSPARCIA',
  /* Rotating token = preposition + locative + "?" in one string — Polish
     locative case forces per-word prepositions (W FACEBOOKU / NA
     INSTAGRAMIE), and keeping the "?" inside the token means it never
     detaches from the sliding word. */
  rotator: [
    { token: 'NA FACEBOOKU?' },
    { token: 'NA INSTAGRAMIE?' },
    { token: 'NA TIKTOKU?' },
    { token: 'NA LINKEDINIE?' },
    { token: 'NA PINTEREŚCIE?' },
    { token: 'NA X (TWITTERZE)?' },
    { token: 'NA YOUTUBIE?' },
    { token: 'W STRATEGII?' },
    { token: 'W WIDEO?' },
  ],
  /* Looping multi-arm llama clip, graded + edge-feathered to flat #722341
     (plum-deep, seamless composite — gated by verify-clip-bg.ts). */
  clip: '/clips/cta-llama-work.mp4',
  poster: '/clips/cta-llama-work-poster.jpg',
  /* Sponsored-post chrome around the clip (user pick 2026-07-17): the CTA
     literally becomes the ad we'd run for ourselves. */
  post: {
    href: 'https://www.instagram.com/social.lama/',
    handle: 'social.lama',
    meta: 'Sponsorowane',
    metaNote: 'i tak to polubisz',
    likes: '1 024 polubienia',
    caption: 'Kiedy klient pyta, czy ogarniemy wszystko 🦙💪',
    onInstagram: 'na Instagramie',
  },
  llamaAlt:
    'Wieloręka lama w tweedowej kamizelce trzyma laptop, telefon, pędzel, klaps filmowy, kubek i paczkę — maskotka Social Lama',
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
        { label: 'USŁUGI', href: '/uslugi' },
        // { label: 'SZKOLENIA I KURSY', href: '/szkolenia' }, // delayed launch — no page yet, keep out of nav
        { label: 'BLOG', href: '/blog' },
        { label: 'CASE STUDIES', href: '/case-studies' },
        { label: 'KONTAKT', href: '/kontakt' },
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
      'ul. Płocka 9/11B, 01-231 Warszawa',
      'ul. Januszowicka 5/121, 53-135 Wrocław',
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
  joinCta: typeof joinCta
}

/** Same shape, string/number literals widened so translations compile. */
export type LocalizedHome = Localized<HomeContent>

/** Chrome subset consumed by <Header>/<Footer> through the ChromeProvider. */
export type ChromeContent = Pick<LocalizedHome, 'nav' | 'menu' | 'footer'>
