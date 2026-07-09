/**
 * Social Lama homepage content.
 *
 * Single source of truth for all homepage copy — mirrors the verified content
 * export verbatim (Polish copy unchanged, English display headlines as-authored).
 * Components MUST NOT hardcode copy; import from here instead.
 *
 * Excluded from v1 (content-starved, per proposal): FAQ (0 real entries) and the
 * multi-post blog grid (1 real post → a single card). The 8 lorem testimonials
 * are excluded; only real, attributed testimonials are kept.
 */

export interface NavLink {
  label: string
  href: string
  children?: { label: string; href: string }[]
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
}

export interface Service {
  id: string
  title: string
  body: string
  link: { label: string; href: string }
  /** Poster still shown until a generated clip is available (design D5). */
  poster: string
  /** Optional Higgsfield clip; deferred in v1 — cards fall back to the poster. */
  clip?: string
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

export const nav = {
  logoAlt: 'Social Lama',
  logo: '/assets/logo.svg',
  links: [
    { label: 'O NAS', href: '/#o-nas' },
    {
      label: 'USŁUGI',
      href: '/uslugi',
      children: [
        { label: 'Content', href: '/uslugi/content' },
        { label: 'Sprzedaż', href: '/uslugi/sprzedaz' },
        { label: 'Kreacje & Wideo', href: '/uslugi/kreacje-wideo' },
      ],
    },
    { label: 'SZKOLENIA I KURSY', href: '/szkolenia' },
    { label: 'BRANŻE', href: '/branze' },
    { label: 'KONTAKT', href: '/#kontakt' },
  ] satisfies NavLink[],
  cta: { label: 'POROZMAWIAJMY O TWOIM BIZNESIE', href: '/#kontakt' },
} as const

export const socials: SocialLink[] = [
  { label: 'Facebook', href: '#', icon: '/assets/icon-facebook.svg' },
  { label: 'TikTok', href: '#', icon: '/assets/icon-tiktok.svg' },
  { label: 'Instagram', href: '#', icon: '/assets/icon-instagram.svg' },
  { label: 'LinkedIn', href: '#', icon: '/assets/icon-linkedin.svg' },
]

// —— Hero ——————————————————————————————————————————————————————————————————

export const hero = {
  headline: ['STRATEGY', 'THAT WORKS', 'WITH SOCIAL LAMA'],
  llamaAlt: 'Lama w okularach przeciwsłonecznych — maskotka Social Lama',
  video: {
    src: '/clips/hero.mp4',
    mobileSrc: '/clips/hero-mobile.mp4',
    poster: '/clips/hero-poster.jpg',
    posterMobile: '/clips/hero-mobile-poster.jpg',
  },
} as const

// —— Clients ————————————————————————————————————————————————————————————————

export const clients: Client[] = [
  { name: 'Aflofarm', logo: '/assets/clients/aflofarm.png' },
  { name: 'Aquael', logo: '/assets/clients/aquael.png' },
  { name: 'Funtronic', logo: '/assets/clients/funtronic.png' },
  { name: 'Intrum Justitia', logo: '/assets/clients/intrum.png' },
  { name: 'Kontigo', logo: '/assets/clients/kontigo.png' },
  { name: 'Medicover Sport', logo: '/assets/clients/medicover.png' },
  { name: 'Oryginalny Sok', logo: '/assets/clients/oryginalny-sok.png' },
  { name: 'Press-Service', logo: '/assets/clients/press-service.png' },
  { name: 'Riviera', logo: '/assets/clients/riviera.png' },
  { name: 'Roche', logo: '/assets/clients/roche.png' },
  { name: 'Uniphar', logo: '/assets/clients/uniphar.png' },
  { name: 'Worldline', logo: '/assets/clients/worldline.png' },
  { name: 'pracuj.pl', logo: '/assets/clients/pracuj.png' },
]

// —— Why that works ————————————————————————————————————————————————————————

export const whyThatWorks = {
  heading: ['WHY', 'THAT WORKS'],
  lead: 'W skrócie: ponieważ znamy się na rzeczy.',
  paragraphs: [
    'Zajmujemy się kompleksową obsługą marek w social mediach, projektując strategie komunikacyjne dopasowane indywidualnie do potrzeb każdego biznesu.',
    'Prowadź atrakcyjną komunikację, buduj zaangażowaną społeczność i rozwijaj swój biznes w mediach społecznościowych. Z naszą pomocą osiągniesz te cele szybciej, niż myślisz!',
    'Zadbamy o Twoją markę na każdym etapie, od pierwszego audytu, przez tworzenie contentu, aż po finalne raporty ze wspólnie osiągniętych sukcesów.',
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
      body: 'Strategia to nasz punkt wyjścia: poznajemy Wasze potrzeby i możliwości, grupę docelową oraz wartości i charakter marki, by zbudować skuteczną komunikację w mediach społecznościowych. Na tej bazie wyznaczamy mierzalne cele, dobieramy właściwe narzędzia, na bieżąco monitorujemy działania, konsekwentnie realizujemy plan i regularnie raportujemy wyniki.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/content' },
      poster: '/assets/content-llama-3f48b5.png',
    },
    {
      id: 'sprzedaz',
      title: 'SPRZEDAŻ',
      body: 'Tworząc ofertę dla Twojej marki dbamy o to, by komunikacja spełniała wypadkowo swoją najważniejszą rolę: sprzedaż produktów lub usług. Skuteczność naszych działań mierzymy nie tylko wskaźnikami w social mediach, ale przede wszystkim — sukcesem Twojego biznesu.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/sprzedaz' },
      poster: '/assets/lama-dolacz.png',
    },
    {
      id: 'kreacje',
      title: 'KREACJE I WIDEO',
      body: 'Grafiki, wideo, karuzele, infografiki, rolki, animacje, wizualizacje — głębokie zaplecze wideograficzne oraz copywriterskie pozwala nam oferować pełne spektrum kreacji w social mediach. W naszych strategiach dbamy o różnorodność przekazów oraz dopasowanie ich do trendów i preferencji odbiorców.',
      link: { label: 'DOWIEDZ SIĘ WIĘCEJ', href: '/uslugi/kreacje-wideo' },
      poster: '/assets/lama-fotograf.png',
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
  poster: '/assets/lama-manifest.png',
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
