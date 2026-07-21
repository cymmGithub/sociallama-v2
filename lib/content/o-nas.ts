/**
 * Copy + data for the `/o-nas` (About) page.
 *
 * Components never hardcode strings — every label reads from here (repo rule;
 * mirrors home.ts / contact.ts). The reused homepage sections (ClientLogos,
 * BigMarquee, JoinCta, NewsLama) keep their own copy from `home.ts`; only the
 * /o-nas-specific sections live in this module.
 *
 * Placeholders (2026-07-20): value bodies, team bios (lorem), and project meta
 * are placeholder pending final copy; images are empty strings until the Figma
 * assets are pulled in.
 */

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'

// —— Page metadata ————————————————————————————————————————————————————————————

export const oNasMeta = {
  title: 'O nas',
  description:
    'Poznaj Social Lamę — agencję social media, która kompleksowo prowadzi komunikację marek w mediach społecznościowych: strategia, content, społeczność i skuteczne kampanie reklamowe.',
} as const

// —— Hero ("O AGENCJI") — plum band —————————————————————————————————————————————

export const oNasHero = {
  kicker: 'SOCIAL LAMA',
  heading: 'O AGENCJI',
} as const

// —— About intro ("COŚ O LAMIE") — cream band ——————————————————————————————————

export const oNasAbout = {
  headingLead: 'COŚ',
  headingRest: 'O LAMIE',
  body: 'Social Lama to agencja social media zajmująca się kompleksową obsługą komunikacji marki w mediach społecznościowych oraz prowadzeniem efektywnej reklamy na Facebooku, Instagramie i pozostałych mediach społecznościowych. Przygotujemy skuteczną strategię, opracujemy kreatywną komunikację, zajmiemy się Twoją społecznością i stworzymy efektywną kampanię reklamową.',
  cta: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '#zespol' },
} as const

// —— Values grid ("THAT WORKS WITH SOCIAL LAMA") — orange band ——————————————————
// Central block is the static "THAT WORKS WITH SOCIAL LAMA" wordmark. Copy is
// final from the mock; bodies may carry a blank line (\n\n) between paragraphs.

export const oNasValues = {
  center: { lead: 'THAT WORKS', rest: 'WITH SOCIAL LAMA' },
  items: [
    {
      title: 'Partnerstwo strategiczne',
      body: 'Nie realizujemy działań „dla obecności w social mediach”. Najpierw rozumiemy Twój biznes – jego cele, model działania, wyzwania i kontekst rynkowy – a dopiero potem projektujemy strategię. Dzięki temu możesz mieć pewność, że działania w social mediach realnie wspierają sprzedaż, generowanie leadów, rozpoznawalność czy budowanie marki.\n\nOtrzymujesz partnera, który myśli o Twoim wyniku, a nie tylko o publikacjach.',
    },
    {
      title: 'Proaktywne podejście',
      body: 'Nie czekamy na brief ani przypomnienie. Regularnie analizujemy wyniki, trendy i zmiany w algorytmach, aby proponować nowe kierunki i usprawnienia. Dla Ciebie oznacza to komfort współpracy i poczucie, że projekt jest pod stałą opieką.\n\nZyskujesz zespół, który myśli o rozwoju Twojej marki nawet wtedy, gdy Ty skupiasz się na innych obszarach biznesu.',
    },
    {
      title: 'Skupienie na efektach',
      body: 'Estetyka jest ważna, ale nie jest celem samym w sobie. Każde działanie ma określony cel i mierzalne wskaźniki sukcesu. Dzięki temu możesz raportować zarządowi lub właścicielom konkretne wyniki, a nie tylko zasięgi.\n\nNasze działania są projektowane tak, aby przekładały się na realną wartość biznesową.',
    },
    {
      title: 'Eksperckość, która daje Ci przewagę',
      body: 'Specjalizujemy się w social mediach i marketingu digital. Śledzimy trendy, narzędzia, zmiany technologiczne i wykorzystujemy je w praktyce. Współpracując z nami, zyskujesz dostęp do aktualnej wiedzy i sprawdzonych rozwiązań bez konieczności budowania wewnętrznego zespołu specjalistów.',
    },
    {
      title: 'Indywidualne podejście',
      body: 'Nie kopiujemy rozwiązań między klientami. Każda strategia powstaje w oparciu o specyfikę Twojej branży, odbiorców i etapu rozwoju firmy. To oznacza komunikację dopasowaną do Twojej marki, a nie „uniwersalny model działania”. Twoje cele są punktem wyjścia do wszystkich rekomendacji.',
    },
    {
      title: 'Kompleksowość',
      body: 'Jesteśmy częścią grupy marketingowo-doradczej Good One, co pozwala nam działać szerzej niż tylko w obszarze social media.\n\nDla Ciebie oznacza to jeden spójny kierunek działań i dostęp do szerokiego zaplecza kompetencji bez konieczności koordynowania wielu podmiotów.',
    },
    {
      title: 'Transparentność',
      body: 'Nie stosujemy drobnego druczku i nie ukrywamy zasad współpracy. To jawność i uczciwość działania.',
    },
  ],
} as const

// —— Projects ("Zrealizowane projekty") — cream band — PLACEHOLDER ——————————————

export const oNasProjects = {
  headingLead: 'Zrealizowane',
  headingRest: 'projekty',
  items: [
    {
      name: 'NAZWA PROJEKTU',
      year: '2025',
      client: 'NAZWA MARKI KLIENTA',
      image: '',
    },
    {
      name: 'NAZWA PROJEKTU',
      year: '2025',
      client: 'NAZWA MARKI KLIENTA',
      image: '',
    },
    {
      name: 'NAZWA PROJEKTU',
      year: '2025',
      client: 'NAZWA MARKI KLIENTA',
      image: '',
    },
  ],
} as const

// —— "GOOD ONE" group wheel ("JESTEŚMY CZĘŚCIĄ GOOD ONE") — cream band —————————————
// Radial logo wheel (left) + text (right). Body copy is final from the mock.

export const oNasGoodOne = {
  heading: 'JESTEŚMY CZĘŚCIĄ',
  headingAccent: 'GOOD ONE',
  body: 'Agencja Social Lama jest częścią grupy marketingowej Good One, dzięki czemu zapewnia kompleksowość usług poprzez dostęp do specjalistów z pozostałych obszarów komunikacji, takich jak: digital, social media, design, SEO i SEM, influencer marketing.',
  center: 'GOOD ONE',
  // Ordered clockwise from 12 o'clock — index drives the spoke angle (i * 60°)
  // in the desktop orbit. `logo` crops (mark only, transparent) live under
  // /public/o-nas/good-one/; `w`/`h` are their intrinsic px (for the aspect box).
  spokes: [
    {
      label: 'Good One PR',
      kind: 'PUBLIC RELATIONS',
      logo: '/o-nas/good-one/goodone-pr.png',
      w: 305,
      h: 59,
    },
    {
      label: 'Social Lama',
      kind: 'SOCIAL MEDIA',
      logo: '/o-nas/good-one/sociallama.png',
      w: 184,
      h: 134,
    },
    {
      label: 'Diea',
      kind: 'GRAFIKA I DESIGN',
      logo: '/o-nas/good-one/diea.png',
      w: 236,
      h: 68,
    },
    // TymKor + Folks carry the two longest labels, which reach toward the spoke
    // dot when the block swings through 3/9 o'clock — scale them down a touch.
    {
      label: 'TymKor media',
      kind: 'KAMPANIE REKLAMOWE',
      logo: '/o-nas/good-one/tymkor.png',
      w: 218,
      h: 69,
      scale: 0.85,
    },
    {
      label: 'Folks',
      kind: 'INFLUENCER MARKETING',
      logo: '/o-nas/good-one/folks.png',
      w: 228,
      h: 66,
      scale: 0.85,
    },
    {
      label: 'SEOFLY',
      kind: 'SEO & SEM',
      logo: '/o-nas/good-one/seofly.png',
      w: 285,
      h: 73,
    },
  ],
} as const

// —— Team slider ("ZESPÓŁ SOCIAL LAMA" / "NASZE LAMY") — plum band ——————————————
// Slider: one featured member (cutout portrait + name/role/bio), prev/next
// arrows, teammates peeking behind. `surname` is the small label over the big
// orange `given` name (mock treatment). Slider photos are transparent portrait
// cutouts in /public/o-nas/slider (kept apart from the webp team grid). Three
// members for now; bios are lorem placeholder.

export const oNasTeam = {
  kickerLead: 'NASZE',
  kickerRest: 'LAMY',
  heading: 'ZESPÓŁ SOCIAL LAMA',
  members: [
    {
      given: 'ANIA',
      surname: 'OZGA',
      role: 'Head of Social Media',
      bio: LOREM,
      photo: '/o-nas/slider/anna-ozga.png',
    },
    {
      given: 'PIOTREK',
      surname: 'ZACH',
      role: 'Project Manager',
      bio: LOREM,
      photo: '/o-nas/slider/piotr-zach.png',
    },
    {
      given: 'KAROLINA',
      surname: 'MARCINOWSKA',
      role: 'Wideo Content Creator',
      bio: LOREM,
      photo: '/o-nas/slider/karolina-marcinowska.png',
    },
  ],
} as const
