/**
 * Social Lama homepage content.
 *
 * Single source of truth for all homepage copy — mirrors the verified content
 * export verbatim (Polish copy unchanged, English display headlines as-authored).
 * Components MUST NOT hardcode copy; import from here instead.
 *
 * Excluded from v1 (content-starved, per proposal): FAQ (0 real entries) and the
 * multi-post blog grid (1 real post → a single card). The featured testimonial
 * is real and attributed; the client-marquee hover cards mix 4 verified quotes
 * with 9 lorem placeholders (each flagged with a TODO — launch blocker).
 */

export interface MenuItem {
  label: string
  href: string
}

export interface MenuColumn {
  label: string
  items: MenuItem[]
}

export interface SocialLink {
  label: string
  href: string
  /** Path to the brand icon svg under /assets. */
  icon: string
}

export interface Client {
  name: string
  logo: string
  /** Quote shown in the hover card above the logo in the client marquee. */
  testimonial?: Testimonial
  /** Slug of this client's published case study, if one exists. When set, the
   *  hover-card CTA links to `/case-studies/<slug>` instead of the tooltip. */
  caseStudySlug?: string
}

export interface StagePanel {
  /** Screenshot path under /assets. */
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
} as const

// Overlay menu. Industry routes are provisional `/branze/<slug>` (D9) —
// subpages arrive in a near-future change; until then links resolve to the
// themed not-found page (accepted interim state).
export const menu = {
  columns: [
    {
      label: 'BRANŻE',
      items: [
        { label: 'Alkohole', href: '/branze/alkohole' },
        { label: 'Beauty', href: '/branze/beauty' },
        { label: 'Horeca', href: '/branze/horeca' },
        { label: 'Automotiv', href: '/branze/automotiv' },
        { label: 'Branża Zoologiczna', href: '/branze/branza-zoologiczna' },
        { label: 'Health', href: '/branze/health' },
        {
          label: 'Nieruchomości i Developerzy',
          href: '/branze/nieruchomosci-i-developerzy',
        },
        {
          label: 'Hotele i Miejsca Wypoczynkowe',
          href: '/branze/hotele-i-miejsca-wypoczynkowe',
        },
        { label: 'Branża Rozrywkowa', href: '/branze/branza-rozrywkowa' },
        { label: 'Fashion', href: '/branze/fashion' },
        { label: 'Elektronika i AGD', href: '/branze/elektronika-i-agd' },
        { label: 'Finanse', href: '/branze/finanse' },
      ],
    },
    {
      // Strategia, Audyt i konsultacje, Influencer marketing route to
      // /uslugi/<slug> pages that don't exist yet — accepted interim 404s;
      // the slugs are final so the pages drop in without a menu change.
      label: 'USŁUGI',
      items: [
        { label: 'Strategia', href: '/uslugi/strategia' },
        { label: 'Content', href: '/uslugi/content' },
        { label: 'Sprzedaż', href: '/uslugi/sprzedaz' },
        { label: 'Kreacje & Wideo', href: '/uslugi/kreacje-wideo' },
        { label: 'Audyt i konsultacje', href: '/uslugi/audyt-i-konsultacje' },
        {
          label: 'Influencer marketing',
          href: '/uslugi/influencer-marketing',
        },
        { label: 'Szkolenia i kursy', href: '/szkolenia' },
      ],
    },
  ] satisfies MenuColumn[],
  utility: [
    { label: 'O NAS', href: '/o-nas' },
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
    /* Four tokens: KREACJE + WIDEO merged into one (matches the "Kreacje &
       Wideo" service name used in the menu/services). The rotator runs on its
       own timer, independent of the llama montage (unlink-hero-from-scroll) —
       words no longer need to match the clip's outfit order. All-Polish. */
    rotator: ['KREACJE & WIDEO', 'TREŚCI', 'SPRZEDAŻ', 'STRATEGIA'],
    lines: ['THAT WORKS', 'WITH SOCIAL LAMA'],
  },
  llamaAlt: 'Lama w okularach przeciwsłonecznych — maskotka Social Lama',
  video: {
    src: '/clips/hero.mp4',
    poster: '/clips/hero-poster.jpg',
    /* Mobile shows a static poster — no mobile clip (user decision 2026-07-14).
       Same llama as desktop, just a centered crop of hero-poster.jpg (the wide
       desktop frame reads off-center on a narrow screen); user decision
       2026-07-19. The hero-mobile.mp4 asset stays for the Video stories. */
    posterMobile: '/clips/hero-mobile-poster.jpg',
  },
} as const

// —— Clients ————————————————————————————————————————————————————————————————

export const clientsHeading = 'ZAUFALI NAM'

// Hover-card CTA. The button deliberately navigates nowhere — case-study pages
// don't exist yet, so a click answers with a playful tooltip instead of a dead
// link (user decision 2026-07-16; tip copy verbatim, English on purpose).
export const clientCardCta = {
  label: 'Case study',
  tip: 'waiting for case study :)',
} as const

// Shared body for the 9 unverified hover-card quotes (mirrors the reference
// DB). Every entry using it is a launch blocker — see the TODOs below.
const placeholderQuote =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

export const clients: Client[] = [
  {
    name: 'Aflofarm',
    logo: '/assets/clients/aflofarm.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Aflofarm',
    },
  },
  {
    name: 'Aquael',
    logo: '/assets/clients/aquael.png',
    testimonial: {
      quote:
        'Social Lama jest agencją, która w pełni odpowiada naszym oczekiwaniom. Działania zespołu okazały się dla nas na tyle satysfakcjonujące, że zdecydowaliśmy się poszerzyć zakres współpracy o kolejne projekty.',
      author: 'Beata Nartowska',
      company: 'Aquael',
      image: '/assets/testimonial-nartowska.jpg',
    },
  },
  {
    name: 'Funtronic',
    logo: '/assets/clients/funtronic.png',
    testimonial: {
      quote:
        'Szczerze rekomenduję współpracę z agencją Social Lama. Zespół doskonale zrozumiał nasze potrzeby i przygotował adekwatną strategię komunikacji, na podstawie której na bieżąco realizuje wytyczone cele.',
      author: 'Piotr Treszczotko',
      company: 'Funtronic',
      image: '/assets/testimonial-treszczotko.jpg',
    },
  },
  {
    name: 'Intrum Justitia',
    logo: '/assets/clients/intrum.png',
    testimonial: {
      quote:
        'Agencja Social Lama była odpowiedzialna za strategię komunikacji, doradztwo merytoryczne, copywriting, moderację oraz kreacje graficzne. Polecamy współpracę z zespołem Social Lama.',
      author: 'Katarzyna Gosiewska',
      company: 'Intrum Justitia',
      image: '/assets/testimonial-gosiewska.jpg',
    },
  },
  {
    name: 'Kontigo',
    logo: '/assets/clients/kontigo.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Kontigo',
    },
  },
  {
    name: 'Medicover Sport',
    logo: '/assets/clients/medicover.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Medicover Sport',
    },
  },
  {
    name: 'Oryginalny Sok',
    logo: '/assets/clients/oryginalny-sok.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Oryginalny Sok',
    },
  },
  {
    name: 'Press-Service',
    logo: '/assets/clients/press-service.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Press-Service',
    },
  },
  {
    name: 'Riviera',
    logo: '/assets/clients/riviera.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Riviera',
    },
  },
  {
    name: 'Uniphar',
    logo: '/assets/clients/uniphar.png',
    testimonial: {
      quote:
        'Kreatywne pomysły, ciekawe projekty wizualne, interesujące rozwiązania dostosowane do grupy docelowej, przy tym sumienność i pełen profesjonalizm. Gorąco polecam Social Lamę do realizacji projektów, które wymagają wyjścia poza szablon.',
      author: 'Marta Szwat',
      company: 'Uniphar',
      image: '/assets/testimonial-szwat.jpg',
    },
  },
  {
    name: 'Worldline',
    logo: '/assets/clients/worldline.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Worldline',
    },
  },
  {
    name: 'pracuj.pl',
    logo: '/assets/clients/pracuj.png',
    caseStudySlug: 'pracuj-pl',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'pracuj.pl',
    },
  },
]

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
  link: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '/o-nas' },
} as const

// —— Services ————————————————————————————————————————————————————————————————

export const services = {
  eyebrow: 'CZYM SIĘ ZAJMUJE SOCIAL LAMA?',
  heading: 'Usługi',
  linkLabel: 'DOWIEDZ SIĘ WIĘCEJ',
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
        panels: [
          {
            src: '/assets/services-instagram.png',
            alt: 'Profil Social Lama na Instagramie — siatka postów',
            width: 801,
            height: 915,
          },
          {
            src: '/assets/services-tiktok.png',
            alt: 'Profil Social Lama na TikToku — 55,4 tys. polubień',
            width: 1149,
            height: 944,
          },
          {
            src: '/assets/services-linkedin.png',
            alt: 'Strona Social Lama na LinkedIn',
            width: 827,
            height: 918,
          },
          {
            src: '/assets/services-x.png',
            alt: 'Profil Social Lama na X',
            width: 887,
            height: 847,
          },
          {
            src: '/assets/services-pinterest.png',
            alt: 'Profil Social Lama na Pintereście',
            width: 900,
            height: 1117,
          },
          {
            src: '/assets/services-youtube.png',
            alt: 'Kanał Social Lama na YouTube',
            width: 900,
            height: 1117,
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
      stage: {
        kind: 'panels',
        panels: [
          {
            src: '/assets/services-ads.png',
            alt: 'Menedżer reklam Meta — wyniki kampanii sprzedażowych',
            width: 1100,
            height: 821,
          },
          {
            src: '/assets/services-insights.png',
            alt: 'Statystyki Instagrama — wzrost zasięgu i obserwujących',
            width: 900,
            height: 1117,
          },
          {
            src: '/assets/services-ytstudio.png',
            alt: 'Statystyki kanału YouTube — wzrost wyświetleń',
            width: 1100,
            height: 821,
          },
          {
            src: '/assets/services-xanalytics.png',
            alt: 'Analityka X — wzrost wyświetleń i zaangażowania',
            width: 1100,
            height: 821,
          },
          {
            src: '/assets/services-tiktokstudio.png',
            alt: 'TikTok Studio — statystyki wyświetleń i obserwujących',
            width: 1100,
            height: 821,
          },
          {
            src: '/assets/services-linkedin-analiza.png',
            alt: 'Analiza strony LinkedIn — wzrost odwiedzin i obserwujących',
            width: 1100,
            height: 821,
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
        { label: 'SZKOLENIA I KURSY', href: '/szkolenia' },
        { label: 'BLOG', href: '/blog' },
        { label: 'KONTAKT', href: '/kontakt' },
      ],
    },
    {
      // Industry pages don't exist yet — links point home for now. Swap to the
      // provisional /branze/<slug> routes (see menu.columns BRANŻE) once they
      // ship.
      title: 'OFERTA',
      links: [
        { label: 'Alkohole', href: '/' },
        { label: 'Beauty', href: '/' },
        { label: 'Horeca', href: '/' },
        { label: 'Automotiv', href: '/' },
        { label: 'Branża Zoologiczna', href: '/' },
        { label: 'Health', href: '/' },
        { label: 'Nieruchomości i Developerzy', href: '/' },
        { label: 'Hotele i Miejsca Wypoczynkowe', href: '/' },
        { label: 'Branża Rozrywkowa', href: '/' },
        { label: 'Fashion', href: '/' },
        { label: 'Elektronika i AGD', href: '/' },
        { label: 'Finanse', href: '/' },
      ],
    },
  ],
  contact: {
    phone: '+48 796 996 118',
    email: 'halohalo@sociallama.pl',
    addresses: [
      'ul. Płocka 9/11B, 01-231 Warszawa',
      'ul. Januszowicka 5/121, 53-135 Wrocław',
    ],
  },
  copyright: 'Copyright 2025 sociallama. All rights reserved.',
  legal: [
    { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
    { label: 'Regulamin', href: '/regulamin' },
    { label: 'Cookies', href: '/cookies' },
  ],
} as const
