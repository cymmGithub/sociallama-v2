/**
 * Copy + data for the `/o-nas` (About) page.
 *
 * Components never hardcode strings — every label reads from here (repo rule;
 * mirrors home.ts / contact.ts). The reused homepage sections (ClientLogos,
 * BigMarquee, JoinCta, NewsLama) keep their own copy from `home.ts`; only the
 * /o-nas-specific sections live in this module.
 *
 * Team bios/roles and the featured projects carry real content (client bio doc
 * + live case studies); the team-slider order mirrors the homepage grid.
 */

import type { Localized } from '@/lib/i18n/parity'

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
  llamaAlt: 'Lama Social Lamy w beżowym płaszczu, machająca do kamery',
} as const

// —— About intro ("COŚ O LAMIE") — cream band ——————————————————————————————————

export const oNasAbout = {
  headingLead: 'COŚ',
  headingRest: 'O LAMIE',
  body: 'Social Lama to agencja social media zajmująca się kompleksową obsługą komunikacji marki w mediach społecznościowych oraz prowadzeniem efektywnej reklamy na Facebooku, Instagramie i pozostałych mediach społecznościowych. Przygotujemy skuteczną strategię, opracujemy kreatywną komunikację, zajmiemy się Twoją społecznością i stworzymy efektywną kampanię reklamową.',
  cta: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '#zespol' },
  imageAlt: 'Ilustracja stadka lam Social Lamy w drewnianej ramce',
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

// —— Projects ("Zrealizowane projekty") — image-led tiles on the sand band ————
// Three featured case studies (curated, static — not a Payload query; design D1).
// Each card is a full-bleed cover with a plum scrim carrying the client `logo`
// (on a white chip) and an SEO-friendly question `name`, linking to the
// `/case-studies/<slug>` detail page. `logoW`/`logoH` are the logo's intrinsic
// px so the whitened <img> keeps its real aspect on the fixed-height chip.

export const oNasProjects = {
  headingLead: 'Ostatnio zrealizowane',
  headingRest: 'projekty',
  cta: 'Zobacz',
  items: [
    {
      name: 'Jak połączyć humor z edukacją w social mediach?',
      year: '2024',
      client: 'iRobot',
      logo: '/case-studies/irobot/irobot-logo.png',
      logoW: 808,
      logoH: 160,
      image: '/case-studies/irobot/irobot-cover.jpg',
      href: '/case-studies/irobot',
    },
    {
      name: 'Jak stworzyć społeczność na TikToku?',
      year: '2022',
      client: 'Pracuj.pl',
      logo: '/assets/clients/pracuj.png',
      logoW: 176,
      logoH: 45,
      image: '/case-studies/pracuj-pl/pracuj-pl-cover.jpg',
      href: '/case-studies/pracuj-pl',
    },
    {
      name: 'Jak budować marki w social mediach?',
      year: '2025',
      client: 'Volvo Car Warszawa',
      logo: '/case-studies/volvo/volvo-logo.png',
      logoW: 509,
      logoH: 69,
      image: '/case-studies/volvo/volvo-cover.jpg',
      href: '/case-studies/volvo',
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
  wheelAlt:
    'Grupa Good One: Good One PR, SEOFLY, Folks, TymKor media, Diea i Social Lama',
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
// cutouts in /public/o-nas/slider (kept apart from the webp team grid). Order
// mirrors the homepage `why-that-works` TEAM grid (leadership first); roles
// follow the site wording where the bio doc disagrees (design D4). Bios are the
// client doc's, trimmed to a consistent slider length.

export const oNasTeam = {
  kickerLead: 'NASZE',
  kickerRest: 'LAMY',
  heading: 'ZESPÓŁ SOCIAL LAMA',
  prevLabel: 'Poprzednia osoba',
  nextLabel: 'Następna osoba',
  members: [
    {
      given: 'ANIA',
      surname: 'OZGA',
      role: 'Head of Social Media',
      bio: 'Od 2017 roku związana z Social Lamą, gdzie łączy strategiczne myślenie z codzienną pracą z klientami i zespołem. Tworzy strategie komunikacyjne dla polskich i międzynarodowych marek, które realnie wpływają na wyniki biznesowe.',
      photo: '/o-nas/slider/anna-ozga.png',
    },
    {
      given: 'AGNIESZKA',
      surname: 'KLAJBERT',
      role: 'Senior Social Media Specialist',
      bio: 'Od 5 lat związana z marketingiem i mediami społecznościowymi. Łączy pasję do fotografii z wykształceniem z zakresu zarządzania i grafiki komputerowej, wiedząc, że dobre social media to estetyka, psychologia, humor i odrobina szaleństwa.',
      photo: '/o-nas/slider/agnieszka-klajbert.png',
    },
    {
      given: 'PIOTREK',
      surname: 'ZACH',
      role: 'Project Manager',
      bio: 'W Social Lamie od 2019 roku odpowiada za kompleksową obsługę klientów oraz tworzenie koncepcji kreatywnych i treści tekstowych. Łączy wykształcenie marketingowe i filologiczne, stawiając na słowo, które realnie buduje komunikację.',
      photo: '/o-nas/slider/piotr-zach.png',
    },
    {
      given: 'EMILIA',
      surname: 'METRYKA',
      role: 'Social Media Manager',
      bio: 'Zaczynała w Warner Bros. Discovery, tworząc komunikację dla marek takich jak player.pl, TVN czy HBO Max. Dziś w Social Lamie prowadzi zespół, koordynuje komórkę wideo i odpowiada za strategie oraz kampanie dla marek z wielu branż.',
      photo: '/o-nas/slider/emilia-metryka.png',
    },
    {
      given: 'PAULINA',
      surname: 'HILDEBRAND',
      role: 'Social Media Manager',
      bio: 'Łączy humanistyczną wrażliwość na słowo z analitycznym podejściem do danych, tworząc komunikację, która naprawdę działa w social mediach. Specjalizuje się w kompleksowym prowadzeniu profili marek — od strategii po relacje z klientami.',
      photo: '/o-nas/slider/paulina-hildebrand.png',
    },
    {
      given: 'MAGDA',
      surname: 'ROKICKA',
      role: 'Social Media Manager',
      bio: 'Od ponad 12 lat w branży marketingowej — specjalizuje się w strategii komunikacji, social mediach, content marketingu i podcastach. Po godzinach edukuje branżę: prowadzi szkolenia i autorski podcast. Posiadaczka certyfikatu DIMAQ Professional.',
      photo: '/o-nas/slider/magda-rokicka.png',
    },
    {
      given: 'KORNELIA',
      surname: 'ORLIK',
      role: 'Social Media Expert',
      bio: 'Specjalizuje się w komunikacji marek z obszaru B2B oraz branży medycznej, łącząc podejście strategiczne z kompetencjami z zakresu zarządzania. Tworzy również materiały wizualne — grafiki, wideo i treści UGC.',
      photo: '/o-nas/slider/kornelia-orlik.png',
    },
    {
      given: 'KATARZYNA',
      surname: 'KAPTUR',
      role: 'Social Media Expert',
      bio: 'Od ponad 4 lat działa w marketingu — w Social Lamie tworzy angażujące treści i wspiera marki w budowaniu spójnej, silnej obecności online. Łączy wykształcenie z zakresu Communication Management z kreatywnym podejściem do contentu.',
      photo: '/o-nas/slider/katarzyna-kaptur.png',
    },
    {
      given: 'OLIWIA',
      surname: 'WITEWSKA',
      role: 'Social Media Specialist',
      bio: 'Od ponad 10 lat odpowiada za komunikację marek w social mediach, zdobywając doświadczenie przy projektach dla globalnych brandów z beauty, FMCG, AGD i lifestyle. Stawia na autentyczność, emocje i trwałe relacje między marką a odbiorcami.',
      photo: '/o-nas/slider/oliwia-witewska.png',
    },
    {
      given: 'KAROLINA',
      surname: 'MARCINOWSKA',
      role: 'Wideo Content Creator',
      bio: 'W Social Lamie odpowiada za tworzenie wideo contentu — od koncepcji, przez nagrania, po montaż i dopasowanie do strategii marki. Łączy wyczucie trendów i estetyki, tworząc materiały, które przyciągają uwagę i budują zaangażowanie.',
      photo: '/o-nas/slider/karolina-marcinowska.png',
    },
    {
      given: 'MARTYNA',
      surname: 'BOROWIK',
      role: 'Senior Social Media Specialist',
      bio: 'Łączy strategiczne spojrzenie z intuicją komunikacyjną, pomagając markom odnaleźć własny, spójny kierunek. Od ponad 10 lat działa w marketingu i digitalu — od strategii, przez angażujący content, po analizę wyników.',
      photo: '/o-nas/slider/martyna-borowik.png',
    },
    {
      given: 'PRZEMYSŁAW',
      surname: 'ŚWIERCZ',
      role: 'Fullstack Developer',
      bio: 'Odpowiada za rozwój i utrzymanie strony Social Lamy — od frontendu, przez backend, po wydajność i wdrożenia. Dba, żeby całość działała szybko i niezawodnie.',
      photo: '/o-nas/slider/przemyslaw-swiercz.png',
    },
  ],
} as const

/**
 * The shape of every `/o-nas` content export. `o-nas.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedONas['<key>']` (design D2).
 */
export type ONasContent = {
  oNasMeta: typeof oNasMeta
  oNasHero: typeof oNasHero
  oNasAbout: typeof oNasAbout
  oNasValues: typeof oNasValues
  oNasProjects: typeof oNasProjects
  oNasGoodOne: typeof oNasGoodOne
  oNasTeam: typeof oNasTeam
}

/** Same shape, literals widened so translations compile. */
export type LocalizedONas = Localized<ONasContent>
