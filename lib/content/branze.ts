/**
 * Canonical industry list + per-industry page content for `/branze/<slug>`.
 *
 * Single source of truth (design D1/D3): the overlay-menu BRANŻE column, the
 * footer OFERTA column, `generateStaticParams`, hreflang pairs, and the sitemap
 * all derive from `INDUSTRIES` in this order, in both locales. `branze.en.ts`
 * supplies the English twin, each export `satisfies LocalizedBranze['<key>']`
 * — the translation-parity gate (design D2), mirroring `home.ts` / `o-nas.ts`.
 *
 * Variant is data-driven (D2), per the reviewed mocks:
 *   - `caseStudy` present  → proof layout (mock C): plum hero → creatives wall →
 *     numbers band (`chips`) → pull-quote + case-study card → CTA.
 *   - `caseStudy` absent    → editorial layout (mock B): cream hero + `collage` →
 *     `marquee` → `manifesto` + `chips` → `logos` strip → CTA.
 * Today Automotive (Volvo) and Elektronika i AGD (iRobot) are the proof pages.
 *
 * Copy status (2026-07-23): batch 1 (Automotive, Elektronika i AGD, Beauty,
 * Health) drafted for user review (task 3.1); batches 2–3 (Finanse … Rozrywka)
 * carry draft copy pending review (tasks 3.2/3.3). Proof `chips` are verbatim
 * from the published Volvo/iRobot case studies (seed-case-studies.ts). Editorial
 * `collage` imagery is O1 (resolved 2026-07-23: free-license stock + duotone;
 * awaiting per-industry picks) and `logos` is O2 (attribution pending). Proof
 * `quote` is a brand-attributed paraphrase (O3 resolved: keep paraphrase).
 */

import type { Localized } from '@/lib/i18n/parity'

// —— Shared chrome copy (variant-level, not per-industry) ——————————————————————

export const chrome = {
  /** Breadcrumb prefix shown top-left and top-right on every industry page. */
  sectionLabel: 'BRANŻE',
  proof: {
    portfolioKicker: 'PORTFOLIO',
    portfolioHeading: 'TAK TO WYGLĄDA W FEEDZIE',
    realBadge: '100% REALNE KREACJE',
    caseStudyCta: 'ZOBACZ CASE STUDY',
    ctaHeadline: 'CHCESZ TAKICH WYNIKÓW W SWOJEJ BRANŻY?',
  },
  editorial: {
    manifestoKicker: 'DLACZEGO TO DZIAŁA',
    logosKicker: 'ZAUFALI NAM',
    ctaHeadline: 'POROZMAWIAJMY O TWOJEJ MARCE.',
  },
  ctaButton: 'BEZPŁATNA KONSULTACJA',
  ctaHref: '/kontakt',
} as const

// —— Content shape ————————————————————————————————————————————————————————————
// Documented here; parity with the EN twin is enforced via `LocalizedBranze`.

interface IndustryStat {
  value: string
  label: string
}

interface IndustryImage {
  src: string
  alt: string
}

/** Presence of this block on an industry selects the proof layout (D2). */
interface IndustryCaseStudy {
  /** Detail-page slug — links to `/case-studies/<slug>` (locale-prefixed). */
  slug: string
  cardKicker: string
  cardTitle: string
  /** Real feed creatives for the proof wall (existing case-study assets). */
  creatives: readonly IndustryImage[]
  /** O3: paraphrase pending verbatim/testimonial confirmation. */
  quote: { text: string; attribution: string }
}

export interface Industry {
  /** Stable, locale-neutral key (equals the PL slug) — pairs PL↔EN for hreflang. */
  id: string
  /** This-locale route slug. */
  slug: string
  /** Counterpart-locale slug (hreflang alternate). */
  pairSlug: string
  /** Bare-noun label (no "Branża" prefix) — also the hero wordmark. */
  label: string
  meta: { title: string; description: string }
  /** Hero lead paragraph (both variants). */
  tagline: string
  /** Three stat/value chips — numbers band (proof) or chips row (editorial). */
  chips: readonly IndustryStat[]
  // —— editorial-only ——
  /** Keyword marquee band. */
  marquee?: readonly string[]
  /** Two-tone "DLACZEGO TO DZIAŁA" statement (`lead` inked, `rest` muted). */
  manifesto?: { lead: string; rest: string }
  /** Duotone hero collage — omitted until O1 sourcing resolves. */
  collage?: readonly IndustryImage[]
  /** Client-logo strip — omitted until O2 attribution is confirmed. */
  logos?: readonly IndustryImage[]
  // —— proof-only ——
  caseStudy?: IndustryCaseStudy
}

// —— Canonical list (design D1, proof-first order) —————————————————————————————

export const INDUSTRIES = [
  // 1 — proof (Volvo)
  {
    id: 'automotive',
    slug: 'automotive',
    pairSlug: 'automotive',
    label: 'Automotive',
    meta: {
      title: 'Social media dla branży automotive | Social Lama',
      description:
        'Prowadzimy social media marek motoryzacyjnych — od salonów premium po elektromobilność. Zobacz, jak zbudowaliśmy społeczność Volvo Car Warszawa i Domu Volvo.',
    },
    tagline:
      'Nie opowiadamy, jak robimy social media dla motoryzacji. Pokazujemy — wszystko poniżej to realne materiały z naszych profili.',
    chips: [
      { value: '3+', label: 'lata ciągłej współpracy z marką Volvo' },
      { value: '2', label: 'marki prowadzone równolegle — VCW & Dom Volvo' },
      { value: '3', label: 'platformy: LinkedIn, Facebook, Instagram' },
    ],
    caseStudy: {
      slug: 'volvo',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Budowa marek Volvo na LinkedInie, Facebooku i Instagramie',
      creatives: [
        {
          src: '/case-studies/volvo/volvo-vcw-post.jpg',
          alt: 'Post Volvo Car Warszawa na Instagramie prezentujący samochód Volvo',
        },
        {
          src: '/case-studies/volvo/volvo-vcw-goracy.jpg',
          alt: 'Kreacja Volvo „Gorący okres?” o przygotowaniu auta na lato',
        },
        {
          src: '/case-studies/volvo/volvo-event-ex30.jpg',
          alt: 'Elektryczne Volvo EX30 prezentowane na wydarzeniu plenerowym',
        },
        {
          src: '/case-studies/volvo/volvo-event-noc.jpg',
          alt: 'Relacja z Nocy Muzeów w salonie Volvo — koncert w nastrojowym oświetleniu',
        },
        {
          src: '/case-studies/volvo/volvo-dom-savedate.jpg',
          alt: 'Kreacja „Save the date” — dni otwarte w Domu Volvo',
        },
      ],
      quote: {
        text: 'Personal branding doradców i treści eksperckie zbudowały pozycję obu marek na LinkedInie — bez kupowania zasięgów.',
        attribution: 'Volvo Car Warszawa & Dom Volvo',
      },
    },
  },

  // 2 — proof (iRobot)
  {
    id: 'elektronika-i-agd',
    slug: 'elektronika-i-agd',
    pairSlug: 'electronics',
    label: 'Elektronika i AGD',
    meta: {
      title: 'Social media dla branży elektronika i AGD | Social Lama',
      description:
        'Prowadzimy social media marek elektroniki i AGD — od edukacji produktowej po viralowy content. Zobacz, jak iRobot podbił TikToka i YouTube.',
    },
    tagline:
      'Nie opowiadamy, jak robimy social media dla elektroniki i AGD. Pokazujemy — wszystko poniżej to realne kreacje z naszych kampanii.',
    chips: [
      { value: '11 mln', label: 'wyświetleń na TikToku' },
      { value: '742 tys.', label: 'wyświetleń na YouTube' },
      { value: '+7,9 tys.', label: 'nowych subskrypcji na YouTube' },
    ],
    caseStudy: {
      slug: 'irobot',
      cardKicker: 'CASE STUDY',
      cardTitle:
        'iRobot — humor i edukacja, które budują markę na YouTube i TikToku',
      creatives: [
        {
          src: '/case-studies/irobot/irobot-gallery-1.jpg',
          alt: 'Kreacja iRobot z kampanii w social mediach',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-2.jpg',
          alt: 'Kreacja iRobot z kampanii w social mediach',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-3.jpg',
          alt: 'Kreacja iRobot z kampanii w social mediach',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-4.jpg',
          alt: 'Kreacja iRobot z kampanii w social mediach',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-5.jpg',
          alt: 'Kreacja iRobot z kampanii w social mediach',
        },
      ],
      quote: {
        text: 'Odważny, edukacyjny content sprawił, że marka iRobot zaczęła realnie żyć w social mediach — bez sztucznego podbijania zasięgów.',
        attribution: 'iRobot',
      },
    },
  },

  // 3 — editorial
  {
    id: 'beauty',
    slug: 'beauty',
    pairSlug: 'beauty',
    label: 'Beauty',
    meta: {
      title: 'Social media dla branży beauty | Social Lama',
      description:
        'Prowadzimy social media marek beauty — skincare, makijaż, pielęgnacja. Estetyczny content, siła UGC i kampanie, które realnie sprzedają.',
    },
    tagline:
      'Beauty to branża pierwszego wrażenia. Budujemy je tam, gdzie klientka je wyrabia — w feedzie. Estetyczny content i kampanie dla marek kosmetycznych.',
    chips: [
      { value: 'Estetyka', label: 'spójny feed, który buduje pożądanie' },
      { value: 'UGC', label: 'realne twarze, realne zaufanie' },
      {
        value: 'Rytuały',
        label: 'content, który wchodzi w codzienność klientek',
      },
    ],
    marquee: [
      'Skincare',
      'Makijaż',
      'Pielęgnacja',
      'UGC',
      'Influencer marketing',
      'Rytuały',
      'Nowości',
    ],
    manifesto: {
      lead: 'Piękno sprzedaje się w feedzie.',
      rest: 'Ale to spójny, estetyczny content i realne twarze społeczności decydują, po którą markę klientka sięgnie przy półce.',
    },
    // Imagery: Pexels (free license, no attribution required) — photo IDs
    // 16008945, 7670737, 16233812. Duotone applied in CSS (design D4).
    collage: [
      {
        src: '/branze/beauty/beauty-1.jpg',
        alt: 'Kosmetyki pielęgnacyjne w minimalistycznej aranżacji',
      },
      {
        src: '/branze/beauty/beauty-2.jpg',
        alt: 'Serum i krem do twarzy na neutralnym tle',
      },
      {
        src: '/branze/beauty/beauty-3.jpg',
        alt: 'Serum do twarzy w szklanych buteleczkach',
      },
    ],
  },

  // 4 — editorial
  {
    id: 'health',
    slug: 'health',
    pairSlug: 'health',
    label: 'Health',
    meta: {
      title: 'Social media dla branży health | Social Lama',
      description:
        'Prowadzimy social media marek z branży zdrowia i wellbeingu. Rzetelna edukacja, autorytet ekspertów i komunikacja, która buduje zaufanie.',
    },
    tagline:
      'Zdrowie to branża zaufania. Budujemy je tam, gdzie odbiorca szuka odpowiedzi — w feedzie. Edukacyjny content i kampanie dla marek health.',
    chips: [
      { value: 'Ekspert', label: 'content konsultowany merytorycznie' },
      { value: 'Edukacja', label: 'trudne tematy prostym językiem' },
      { value: 'Profilaktyka', label: 'komunikacja, która realnie pomaga' },
    ],
    marquee: [
      'Wellbeing',
      'Suplementy',
      'Edukacja zdrowotna',
      'Ekspert',
      'Profilaktyka',
      'Zaufanie',
      'Wsparcie',
    ],
    manifesto: {
      lead: 'Zdrowia nie sprzedaje się obietnicą.',
      rest: 'Sprzedaje się je rzetelną edukacją, autorytetem ekspertów i komunikacją, której odbiorca ufa w najważniejszych decyzjach.',
    },
    // Imagery: Pexels (free license) — photo IDs 7526027, 7615467, 7615558.
    collage: [
      {
        src: '/branze/health/health-1.jpg',
        alt: 'Kapsułki suplementów i naturalne składniki',
      },
      {
        src: '/branze/health/health-2.jpg',
        alt: 'Cytryna, imbir i suplementy na marmurze',
      },
      {
        src: '/branze/health/health-3.jpg',
        alt: 'Suplementy w ceramicznych miseczkach',
      },
    ],
  },

  // 5 — editorial · draft copy pending review (batch 2)
  {
    id: 'finanse',
    slug: 'finanse',
    pairSlug: 'finance',
    label: 'Finanse',
    meta: {
      title: 'Social media dla branży finanse | Social Lama',
      description:
        'Prowadzimy social media marek finansowych i fintech. Edukacja bez żargonu, autorytet i komunikacja, której odbiorca powierza swoje pieniądze.',
    },
    tagline:
      'Finanse to branża zaufania w czystej postaci. Budujemy je codzienną, zrozumiałą komunikacją dla marek finansowych i fintech.',
    chips: [
      { value: 'B2B & B2C', label: 'komunikacja dopasowana do odbiorcy' },
      { value: 'Edukacja', label: 'finanse bez żargonu' },
      { value: 'Zaufanie', label: 'fundament każdej decyzji' },
    ],
    marquee: [
      'Fintech',
      'Płatności',
      'Edukacja finansowa',
      'B2B',
      'Bezpieczeństwo',
      'Inwestycje',
      'Zaufanie',
    ],
    manifesto: {
      lead: 'Finansów nie powierza się przypadkowi.',
      rest: 'Powierza się je marce, która tłumaczy trudne tematy prostym językiem i buduje zaufanie każdego dnia.',
    },
    // Imagery: Pexels (free license) — photo IDs 6214369, 2988232, 4691474.
    collage: [
      {
        src: '/branze/finanse/finanse-1.jpg',
        alt: 'Płatność mobilna na smartfonie',
      },
      {
        src: '/branze/finanse/finanse-2.jpg',
        alt: 'Płatność zbliżeniowa kartą w terminalu',
      },
      {
        src: '/branze/finanse/finanse-3.jpg',
        alt: 'Wachlarz kart płatniczych w dłoni',
      },
    ],
  },

  // 6 — editorial · draft copy pending review (batch 2)
  {
    id: 'petcare',
    slug: 'petcare',
    pairSlug: 'pet',
    label: 'Petcare',
    meta: {
      title: 'Social media dla branży petcare | Social Lama',
      description:
        'Prowadzimy social media marek zoologicznych i petcare. Lojalne społeczności właścicieli, poradnikowy content i realna sprzedaż.',
    },
    tagline:
      'Petcare to branża emocji i lojalności. Budujemy społeczności właścicieli, dla których zwierzę to członek rodziny — i tak samo traktujemy marki.',
    chips: [
      {
        value: 'Community',
        label: 'najbardziej lojalni odbiorcy w social mediach',
      },
      { value: 'Poradniki', label: 'content, po który wracają' },
      { value: 'Emocje', label: 'zwierzę = członek rodziny' },
    ],
    marquee: [
      'Zoologia',
      'Karma',
      'Akcesoria',
      'Community',
      'Poradniki',
      'Adopcje',
      'Miłość do zwierząt',
    ],
    manifesto: {
      lead: 'Dla właściciela to nie „zwierzę”. To rodzina.',
      rest: 'Marki, które to rozumieją, budują najbardziej lojalne społeczności w całym social mediach.',
    },
    // Imagery: Pexels (free license) — photo IDs 7527370, 10160237, 46024.
    collage: [
      {
        src: '/branze/petcare/petcare-1.jpg',
        alt: 'Pies i kotek poznają się w domu',
      },
      {
        src: '/branze/petcare/petcare-2.jpg',
        alt: 'Właścicielka przytula szczeniaka',
      },
      {
        src: '/branze/petcare/petcare-3.jpg',
        alt: 'Kot i pies przytulają się w trawie',
      },
    ],
  },

  // 7 — editorial · draft copy pending review (batch 2)
  {
    id: 'alkohole',
    slug: 'alkohole',
    pairSlug: 'alcohol',
    label: 'Alkohole',
    meta: {
      title: 'Social media dla branży alkoholowej | Social Lama',
      description:
        'Prowadzimy social media marek alkoholowych — wino, piwo craft, spirytualia. Aspiracyjny wizerunek zgodny z regulacjami i odpowiedzialną konsumpcją.',
    },
    tagline:
      'Alkohole to branża rytuału i okazji. Budujemy aspiracyjny wizerunek marek — z wyczuciem regulacji i odpowiedzialnej konsumpcji.',
    chips: [
      { value: 'Regulacje', label: 'komunikacja zgodna z prawem' },
      { value: 'Rytuał', label: 'marka wpisana w moment' },
      { value: 'Aspiracja', label: 'wizerunek premium' },
    ],
    marquee: [
      'Wino',
      'Piwo craft',
      'Spirytualia',
      'Rytuał',
      'Okazje',
      'Degustacje',
      'Odpowiedzialna konsumpcja',
    ],
    manifesto: {
      lead: 'Alkohole rządzą się własnymi prawami.',
      rest: 'Regulacje, moment i rytuał — trzeba je wszystkie wyczuć, żeby zbudować aspiracyjną markę.',
    },
    // Imagery: Pexels (free license) — photo IDs 17541188, 4485353, 3937673.
    collage: [
      {
        src: '/branze/alkohole/alkohole-1.jpg',
        alt: 'Butelki alkoholi na barowych półkach',
      },
      { src: '/branze/alkohole/alkohole-2.jpg', alt: 'Barman nalewa wino' },
      {
        src: '/branze/alkohole/alkohole-3.jpg',
        alt: 'Kieliszek czerwonego wina przy nakryciu stołu',
      },
    ],
  },

  // 8 — editorial · draft copy pending review (batch 2)
  {
    id: 'fashion',
    slug: 'fashion',
    pairSlug: 'fashion',
    label: 'Fashion',
    meta: {
      title: 'Social media dla branży fashion | Social Lama',
      description:
        'Prowadzimy social media marek modowych. Budujemy pożądanie wokół dropów i kolekcji, łączymy lookbooki z UGC i zamieniamy obserwujących w klientów.',
    },
    tagline:
      'Fashion to branża tempa. Nadajemy markom rytm feedu — budujemy pożądanie wokół dropów i kolekcji, sezon po sezonie.',
    chips: [
      { value: 'Trendy', label: 'marka zawsze na czasie' },
      { value: 'Drop', label: 'napięcie, które sprzedaje' },
      { value: 'UGC', label: 'styl w wykonaniu społeczności' },
    ],
    marquee: ['Moda', 'Trendy', 'Lookbook', 'Drop', 'UGC', 'Kolekcje', 'Styl'],
    manifesto: {
      lead: 'Moda żyje szybciej niż feed.',
      rest: 'Wygrywają marki, które nadają tempo — budują pożądanie wokół dropów i zamieniają obserwujących w klientów.',
    },
    // Imagery: Pexels (free license) — photo IDs 17016524, 30892135, 36845202.
    collage: [
      {
        src: '/branze/fashion/fashion-1.jpg',
        alt: 'Modelka w białej stylizacji na wybiegu',
      },
      {
        src: '/branze/fashion/fashion-2.jpg',
        alt: 'Modelka w zielonym topie w miejskiej scenerii',
      },
      {
        src: '/branze/fashion/fashion-3.jpg',
        alt: 'Modelka w bordowym płaszczu w nowoczesnym wnętrzu',
      },
    ],
  },

  // 9 — editorial · draft copy pending review (batch 3)
  {
    id: 'horeca',
    slug: 'horeca',
    pairSlug: 'horeca',
    label: 'Horeca',
    meta: {
      title: 'Social media dla branży HoReCa | Social Lama',
      description:
        'Prowadzimy social media restauracji, kawiarni i barów. Apetyczny food content, budowanie atmosfery miejsca i komunikacja, która zapełnia stoliki.',
    },
    tagline:
      'HoReCa to branża apetytu. Budzimy go tam, gdzie zaczyna się głód — w feedzie. Food content i komunikacja, która zapełnia stoliki.',
    chips: [
      { value: 'Food content', label: 'zdjęcia, po których słychać głód' },
      { value: 'Atmosfera', label: 'miejsce, do którego chce się wrócić' },
      { value: 'Rezerwacje', label: 'feed, który zapełnia stoliki' },
    ],
    marquee: [
      'Restauracje',
      'Kawiarnie',
      'Menu',
      'Food content',
      'Rezerwacje',
      'Atmosfera',
      'Okazje',
    ],
    manifesto: {
      lead: 'Głód zaczyna się w feedzie.',
      rest: 'Zanim gość przekroczy próg, apetyczny content i atmosfera miejsca już zapełniają stoliki.',
    },
    // Imagery: Pexels (free license) — photo IDs 6327536, 1327393, 36430157.
    collage: [
      {
        src: '/branze/horeca/horeca-1.jpg',
        alt: 'Deser podany na marmurowym stole w restauracji',
      },
      {
        src: '/branze/horeca/horeca-2.jpg',
        alt: 'Danie główne z warzywami na eleganckim talerzu',
      },
      {
        src: '/branze/horeca/horeca-3.jpg',
        alt: 'Szef kuchni komponuje danie na talerzu',
      },
    ],
  },

  // 10 — editorial · draft copy pending review (batch 3)
  {
    id: 'hotele-i-miejsca-wypoczynkowe',
    slug: 'hotele-i-miejsca-wypoczynkowe',
    pairSlug: 'hospitality',
    label: 'Hotele i Miejsca Wypoczynkowe',
    meta: {
      title: 'Social media dla hoteli i miejsc wypoczynkowych | Social Lama',
      description:
        'Prowadzimy social media hoteli, resortów i SPA. Aspiracyjny travel content i komunikacja, która zamienia scroll w rezerwację.',
    },
    tagline:
      'Wypoczynek to branża marzeń. Sprzedajemy je, zanim gość spakuje walizkę — aspiracyjny travel content dla hoteli i miejsc wypoczynkowych.',
    chips: [
      { value: 'Aspiracja', label: 'miejsce, o którym się marzy' },
      { value: 'Booking', label: 'content, który napędza rezerwacje' },
      { value: 'Sezony', label: 'komunikacja przez cały rok' },
    ],
    marquee: [
      'Hotele',
      'Resorty',
      'SPA',
      'Wypoczynek',
      'Travel content',
      'Rezerwacje',
      'Doświadczenie',
    ],
    manifesto: {
      lead: 'Wakacje kupuje się marzeniem.',
      rest: 'Aspiracyjny travel content sprzedaje miejsce, zanim gość w ogóle spakuje walizkę.',
    },
    // Imagery: Pexels (free license) — photo IDs 15490065, 2259226, 38406370.
    collage: [
      {
        src: '/branze/hotele-i-miejsca-wypoczynkowe/hotele-i-miejsca-wypoczynkowe-1.jpg',
        alt: 'Elegancki basen hotelowy z rotundą',
      },
      {
        src: '/branze/hotele-i-miejsca-wypoczynkowe/hotele-i-miejsca-wypoczynkowe-2.jpg',
        alt: 'Tropikalny basen resortu wśród palm',
      },
      {
        src: '/branze/hotele-i-miejsca-wypoczynkowe/hotele-i-miejsca-wypoczynkowe-3.jpg',
        alt: 'Resort z basenem o zmierzchu',
      },
    ],
  },

  // 11 — editorial · draft copy pending review (batch 3)
  {
    id: 'nieruchomosci-i-deweloperzy',
    slug: 'nieruchomosci-i-deweloperzy',
    pairSlug: 'real-estate',
    label: 'Nieruchomości i Deweloperzy',
    meta: {
      title: 'Social media dla branży nieruchomości | Social Lama',
      description:
        'Prowadzimy social media deweloperów i marek nieruchomości. Prezentacja inwestycji, budowanie zaufania i komunikacja, która generuje leady.',
    },
    tagline:
      'Nieruchomości to branża największej decyzji zakupowej. Budujemy zaufanie, które ją poprzedza — i komunikację, która generuje leady.',
    chips: [
      { value: 'Leady', label: 'komunikacja nastawiona na kontakt' },
      { value: 'Wizualizacje', label: 'inwestycja, którą widać' },
      { value: 'Zaufanie', label: 'fundament decyzji życia' },
    ],
    marquee: [
      'Deweloperzy',
      'Inwestycje',
      'Mieszkania',
      'Wizualizacje',
      'Lokalizacja',
      'Leady',
      'Zaufanie',
    ],
    manifesto: {
      lead: 'Zakup nieruchomości to decyzja życia.',
      rest: 'Poprzedza ją zaufanie — budujemy je prezentacją inwestycji i komunikacją, która generuje realne leady.',
    },
    // Imagery: Pexels (free license) — photo IDs 8089172, 7614605, 16916525.
    collage: [
      {
        src: '/branze/nieruchomosci-i-deweloperzy/nieruchomosci-i-deweloperzy-1.jpg',
        alt: 'Nowoczesny salon z otwartą kuchnią',
      },
      {
        src: '/branze/nieruchomosci-i-deweloperzy/nieruchomosci-i-deweloperzy-2.jpg',
        alt: 'Jasny korytarz w nowym mieszkaniu',
      },
      {
        src: '/branze/nieruchomosci-i-deweloperzy/nieruchomosci-i-deweloperzy-3.jpg',
        alt: 'Mieszkanie z widokiem z balkonu',
      },
    ],
  },

  // 12 — editorial · draft copy pending review (batch 3)
  {
    id: 'rozrywka',
    slug: 'rozrywka',
    pairSlug: 'entertainment',
    label: 'Rozrywka',
    meta: {
      title: 'Social media dla branży rozrywkowej | Social Lama',
      description:
        'Prowadzimy social media marek rozrywkowych — eventy, kultura, premiery. Budujemy hype, aktywujemy społeczność i tworzymy content, który żyje w komentarzach.',
    },
    tagline:
      'Rozrywka to branża walki o uwagę. Wygrywamy ją treścią — budujemy hype wokół premier i wydarzeń, i aktywujemy społeczność.',
    chips: [
      { value: 'Hype', label: 'napięcie przed premierą' },
      { value: 'Community', label: 'społeczność, która współtworzy' },
      { value: 'Zaangażowanie', label: 'treść, którą się udostępnia' },
    ],
    marquee: [
      'Eventy',
      'Kultura',
      'Premiery',
      'Community',
      'Zaangażowanie',
      'Emocje',
      'Live',
    ],
    manifesto: {
      lead: 'Uwaga to waluta rozrywki.',
      rest: 'Budujemy hype wokół premier, aktywujemy społeczność i tworzymy treści, które żyją w komentarzach.',
    },
    // Imagery: Pexels (free license) — photo IDs 13230484, 167605, 6398745.
    collage: [
      {
        src: '/branze/rozrywka/rozrywka-1.jpg',
        alt: 'Scena koncertowa w niebieskich światłach',
      },
      {
        src: '/branze/rozrywka/rozrywka-2.jpg',
        alt: 'Tłum publiczności na koncercie',
      },
      {
        src: '/branze/rozrywka/rozrywka-3.jpg',
        alt: 'Publiczność przed rozświetloną sceną',
      },
    ],
  },
] as const satisfies readonly Industry[]

// —— Derived navigation (design D3: one list, three surfaces) ——————————————————
// Menu BRANŻE column + footer OFERTA column read their items from here — no
// duplicated labels/hrefs in `home.ts`.
export const industryNav = INDUSTRIES.map((industry) => ({
  label: industry.label,
  href: `/branze/${industry.slug}`,
}))

/** Lookup by this-locale slug (route params → page content). */
export function findIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((industry) => industry.slug === slug)
}

/**
 * The shape of every `/branze` content export. `branze.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedBranze['<key>']` — the
 * translation-parity gate (design D2).
 */
export type BranzeContent = {
  chrome: typeof chrome
  industries: typeof INDUSTRIES
}

/** Same shape, literals widened so translations compile. */
export type LocalizedBranze = Localized<BranzeContent>
