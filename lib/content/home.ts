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
}

export interface StagePanel {
  /** Screenshot path under /assets. */
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

/**
 * Per-service stage media for the autoplay-tabs services section.
 * `panels` float real screenshots over the grain-gradient, `video` renders
 * phone-framed clips playing only while their tab is active, `placeholder`
 * shows the styled gradient alone until real assets exist.
 */
export type ServiceStage =
  | { kind: 'panels'; panels: StagePanel[] }
  | { kind: 'video'; clips: StageClip[] }
  | { kind: 'placeholder' }

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
  company: string
}

export interface NewsPost {
  title: string
  excerpt: string
  category: string
  date: string
  href: string
  cover: string
  readLabel: string
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
    href: '/#kontakt',
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
        {
          label: 'Nieruchomości & Budownictwo',
          href: '/branze/nieruchomosci-budownictwo',
        },
        { label: 'Moda', href: '/branze/moda' },
        { label: 'Zdrowie', href: '/branze/zdrowie' },
        { label: 'Edukacja', href: '/branze/edukacja' },
        { label: 'Usługi biznesowe', href: '/branze/uslugi-biznesowe' },
        { label: 'Retail & E-commerce', href: '/branze/retail-e-commerce' },
      ],
    },
    {
      label: 'USŁUGI',
      items: [
        { label: 'Content', href: '/uslugi/content' },
        { label: 'Sprzedaż', href: '/uslugi/sprzedaz' },
        { label: 'Kreacje & Wideo', href: '/uslugi/kreacje-wideo' },
        { label: 'Szkolenia i kursy', href: '/szkolenia' },
      ],
    },
  ] satisfies MenuColumn[],
  utility: [
    { label: 'O NAS', href: '/#o-nas' },
    { label: 'halohalo@sociallama.pl', href: 'mailto:halohalo@sociallama.pl' },
  ] satisfies MenuItem[],
} as const

export const socials: SocialLink[] = [
  { label: 'Facebook', href: '#', icon: '/assets/icon-facebook.svg' },
  { label: 'TikTok', href: '#', icon: '/assets/icon-tiktok.svg' },
  { label: 'Instagram', href: '#', icon: '/assets/icon-instagram.svg' },
  { label: 'LinkedIn', href: '#', icon: '/assets/icon-linkedin.svg' },
]

// —— Hero ——————————————————————————————————————————————————————————————————

export const hero = {
  headline: {
    /* First line rotates through the offer; the remaining lines are static
       ("THAT WORKS" renders in the accent color). */
    /* Short single words so the longest rotator token doesn't cap the headline
       size; the full "Kreacje & Wideo" name lives in the menu and services. */
    rotator: ['STRATEGY', 'CONTENT', 'SPRZEDAŻ', 'KREACJE', 'WIDEO'],
    lines: ['THAT WORKS', 'WITH SOCIAL LAMA'],
  },
  llamaAlt: 'Lama w okularach przeciwsłonecznych — maskotka Social Lama',
  video: {
    src: '/clips/hero.mp4',
    mobileSrc: '/clips/hero-mobile.mp4',
    poster: '/clips/hero-poster.jpg',
    posterMobile: '/clips/hero-mobile-poster.jpg',
  },
} as const

// —— Clients ————————————————————————————————————————————————————————————————

export const clientsHeading = 'ZAUFALI NAM'

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
    name: 'Roche',
    logo: '/assets/clients/roche.png',
    // TODO: placeholder — replace before launch
    testimonial: {
      quote: placeholderQuote,
      author: 'Imię Nazwisko',
      company: 'Roche',
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
  /* Supporting paragraphs share the manifesto's two-tone treatment (user
     decision 2026-07-13): bold ink opening, muted gray closer. */
  paragraphs: [
    {
      strong:
        'Prowadź atrakcyjną komunikację, buduj zaangażowaną społeczność i rozwijaj swój biznes w mediach społecznościowych.',
      muted: 'Z naszą pomocą osiągniesz te cele szybciej, niż myślisz!',
    },
    {
      strong:
        'Zadbamy o Twoją markę na każdym etapie, od pierwszego audytu, przez tworzenie contentu,',
      muted: 'aż po finalne raporty ze wspólnie osiągniętych sukcesów.',
    },
  ],
  link: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '/#o-nas' },
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

// —— Featured testimonial ——————————————————————————————————————————————————

export const featuredTestimonial: Testimonial = {
  quote:
    'Od blisko dwóch lat współpracujemy z agencją Social Lama przy działaniach na TikToku oraz YouTube i z pełnym przekonaniem możemy ją polecić. Zespół wyróżnia się dużą wiedzą i kompetencjami, a także partnerskim podejściem do współpracy — zawsze możemy liczyć na zaangażowanie, sprawną komunikację i realne wsparcie w realizacji celów.',
  author: 'Małgorzata Radomska',
  company: 'iRobot Polska',
}

// —— CTA ————————————————————————————————————————————————————————————————————

export const joinCta = {
  headingLead: 'POTRZEBUJESZ WSPARCIA W',
  headingEmphasis: 'FACEBOOKU?',
  button: { label: 'NAPISZ DO NAS', href: '/#kontakt' },
  /* Clip + its own frame-0 poster (composites onto plum-deep #722341). */
  clip: '/clips/cta-llama.mp4',
  poster: '/clips/cta-llama-poster.jpg',
} as const

// —— NewsLAMA (single card) ————————————————————————————————————————————————

export const news = {
  heading: 'NewsLAMA',
  readLabel: 'PRZECZYTAJ',
  post: {
    title: 'LinkedIn Premium — czy warto?',
    excerpt:
      'Czy LinkedIn Premium jest wart swojej ceny? Sprawdzamy plany Career, Business, Sales Navigator i Recruiter Lite — komu się opłaca, a kto poradzi sobie bez.',
    category: 'Marketing, Reklama, Seo, Social media',
    date: '2025-12-30',
    href: '/blog/linkedin-premium-czy-warto',
    cover: '/assets/blog.png',
    readLabel: 'PRZECZYTAJ',
  } satisfies NewsPost,
} as const

// —— Footer ————————————————————————————————————————————————————————————————

export const footer = {
  logoAlt: 'Social Lama',
  logo: '/assets/footer-logo.svg',
  headline: 'POROZMAWIAJMY O TWOJEJ MARCE',
  columns: [
    {
      title: 'NAWIGACJA',
      links: [
        { label: 'O NAS', href: '/#o-nas' },
        { label: 'USŁUGI', href: '/uslugi' },
        { label: 'SZKOLENIA I KURS', href: '/szkolenia' },
        { label: 'BLOG', href: '/blog' },
        { label: 'KONTAKT', href: '/#kontakt' },
      ],
    },
    {
      title: 'OFERTA',
      links: [
        { label: 'O NAS', href: '/#o-nas' },
        { label: 'USŁUGI', href: '/uslugi' },
        { label: 'SZKOLENIA I KURS', href: '/szkolenia' },
        { label: 'BLOG', href: '/blog' },
        { label: 'KONTAKT', href: '/#kontakt' },
      ],
    },
  ],
  contact: {
    phone: '+48 796 996 118',
    email: 'halohalo@sociallama.pl',
    address: 'ul. Płocka 9/11B, 01-231 Warszawa',
  },
  copyright: 'Copyright 2025 sociallama. All rights reserved.',
  legal: [
    { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
    { label: 'Regulamin', href: '/regulamin' },
    { label: 'Cookies', href: '/cookies' },
  ],
} as const
