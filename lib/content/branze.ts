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
 *   - `caseStudy` present  → proof layout (mock C): plum hero → brief → creatives
 *     wall → numbers band (`chips`) → pull-quote + case-study card → CTA.
 *   - `caseStudy` absent    → editorial layout (mock B): cream hero + `collage` →
 *     brief → `marquee` → CTA.
 * Today Automotive (Volvo) and Elektronika i AGD (iRobot) are the proof pages.
 *
 * The `brief` (3 strategic pillars + market-report-backed paragraphs) is
 * verbatim from "BRANŻE - TEKSTY NA STRONĘ SOCIAL LAMA" and sits directly under
 * the hero on every page (see 2026-07-23 design). `chips` are proof-only now
 * (the numbers band) — editorial pages carry their strategy in the `brief`.
 *
 * Imagery status: proof `chips` are verbatim from the Volvo/iRobot case studies;
 * editorial `collage` is O1 (free-license Pexels + duotone, IDs recorded inline);
 * `logos` is O2 (attribution pending); proof `quote` is a brand-attributed
 * paraphrase (O3: keep).
 */

import type { Localized } from '@/lib/i18n/parity'

// —— Shared chrome copy (variant-level, not per-industry) ——————————————————————

export const chrome = {
  /** Breadcrumb prefix shown top-left and top-right on every industry page. */
  sectionLabel: 'BRANŻE',
  /** Kicker above the brief section (both variants). */
  briefKicker: 'DLACZEGO TO DZIAŁA',
  proof: {
    portfolioKicker: 'PORTFOLIO',
    portfolioHeading: 'TAK TO WYGLĄDA W FEEDZIE',
    realBadge: '100% REALNE KREACJE',
    caseStudyCta: 'ZOBACZ CASE STUDY',
    ctaHeadline: 'CHCESZ TAKICH WYNIKÓW W SWOJEJ BRANŻY?',
  },
  editorial: {
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

/** A brief paragraph; `strong` (if set) is an exact substring rendered bold. */
interface IndustryParagraph {
  text: string
  strong?: string
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
  /** The under-hero brief (both variants): 3 pillars + body paragraphs. */
  brief: {
    pillars: readonly string[]
    paragraphs: readonly IndustryParagraph[]
  }
  // —— proof-only ——
  /** Numbers-band stats — verbatim from the case study. */
  chips?: readonly IndustryStat[]
  caseStudy?: IndustryCaseStudy
  // —— editorial-only ——
  /** Keyword marquee band. */
  marquee?: readonly string[]
  /** Duotone hero collage — omitted until O1 sourcing resolves. */
  collage?: readonly IndustryImage[]
  /** Client-logo strip — omitted until O2 attribution is confirmed. */
  logos?: readonly IndustryImage[]
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
    brief: {
      pillars: [
        'Ekspercka komunikacja',
        'Technologie i innowacje',
        'Personal branding ekspertów',
      ],
      paragraphs: [
        {
          text: 'Branża automotive to kategoria, w której decyzje zakupowe są poprzedzone długim procesem poszukiwania informacji i porównywania dostępnych rozwiązań. W social mediach kluczową rolę odgrywają eksperckość, wiarygodność oraz umiejętność tłumaczenia zaawansowanych technologii w przystępny sposób.',
          strong:
            'W social mediach kluczową rolę odgrywają eksperckość, wiarygodność oraz umiejętność tłumaczenia zaawansowanych technologii w przystępny sposób.',
        },
        {
          text: 'Jak wynika z raportu Deloitte „2025 Global Automotive Consumer Study”, aż 69% polskich konsumentów planujących zakup samochodu deklaruje, że przed podjęciem decyzji aktywnie poszukuje informacji online. Dlatego tworzymy komunikację, która łączy ekspercką wiedzę, angażujący storytelling i atrakcyjne formaty wideo, wspierając marki w budowaniu zaufania oraz długofalowych relacji z odbiorcami.',
        },
      ],
    },
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
    brief: {
      pillars: [
        'Edukacja produktowa',
        'Content wideo',
        'Przekładanie technologii na język korzyści',
      ],
      paragraphs: [
        {
          text: 'Branża elektroniki i AGD to kategoria, w której konsumenci oczekują nie tylko inspiracji, ale przede wszystkim konkretnych informacji ułatwiających podjęcie decyzji zakupowej. W social mediach kluczową rolę odgrywają edukacja, prezentacja funkcjonalności oraz pokazywanie realnych zastosowań produktów w codziennym życiu.',
          strong:
            'W social mediach kluczową rolę odgrywają edukacja, prezentacja funkcjonalności oraz pokazywanie realnych zastosowań produktów w codziennym życiu.',
        },
        {
          text: 'Jak wynika z raportu Gemius „E-commerce w Polsce 2025”, aż 75% polskich internautów kupuje online, a do najczęściej kupowanych kategorii należą m.in. elektronika i AGD. To sprawia, że marki z tej branży powinny stawiać na przystępną komunikację, atrakcyjne formaty wideo oraz content, który pomaga użytkownikom lepiej zrozumieć technologię i świadomie wybrać odpowiedni produkt.',
        },
      ],
    },
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
    brief: {
      pillars: [
        'Edukacja i eksperckość',
        'UGC i influencer marketing',
        'Zaangażowane społeczności',
      ],
      paragraphs: [
        {
          text: 'Branża beauty to jedna z najbardziej konkurencyjnych kategorii w social mediach. Estetyczny content to dziś za mało — konsumenci oczekują autentyczności, eksperckiej wiedzy i rekomendacji, którym mogą zaufać.',
        },
        {
          text: 'Według raportu Mintel z 2025 roku konsumenci coraz częściej podejmują decyzje zakupowe w oparciu o transparentność składu oraz potwierdzoną skuteczność produktu. Dla marek beauty oznacza to rosnącą rolę komunikacji edukacyjnej i eksperckiej. Dlatego tworzymy strategie, które łączą edukację, inspirację i angażujący storytelling, wspierając marki w budowaniu zaufania oraz długofalowych relacji z odbiorcami.',
          strong:
            'tworzymy strategie, które łączą edukację, inspirację i angażujący storytelling, wspierając marki w budowaniu zaufania oraz długofalowych relacji z odbiorcami.',
        },
      ],
    },
    marquee: [
      'Skincare',
      'Makijaż',
      'Pielęgnacja',
      'UGC',
      'Influencer marketing',
      'Rytuały',
      'Nowości',
    ],
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
    brief: {
      pillars: [
        'Edukacja oparta na wiedzy',
        'Budowanie zaufania',
        'Zarządzanie reputacją marki',
      ],
      paragraphs: [
        {
          text: 'Branża health wymaga szczególnego podejścia do komunikacji. Odbiorcy oczekują rzetelnych informacji, eksperckiej wiedzy oraz treści opartych na faktach. W świecie pełnym dezinformacji zaufanie staje się jednym z najcenniejszych zasobów marki.',
          strong:
            'Odbiorcy oczekują rzetelnych informacji, eksperckiej wiedzy oraz treści opartych na faktach.',
        },
        {
          text: 'Jak wynika z raportu Edelman Trust Barometer 2025, aż 72% respondentów obawia się fałszywych informacji i dezinformacji. Dlatego skuteczna komunikacja marek z obszaru zdrowia i wellbeingu powinna opierać się na wiarygodnych źródłach, transparentności i budowaniu długofalowych relacji z odbiorcami.',
        },
      ],
    },
    marquee: [
      'Wellbeing',
      'Suplementy',
      'Edukacja zdrowotna',
      'Ekspert',
      'Profilaktyka',
      'Zaufanie',
      'Wsparcie',
    ],
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

  // 5 — editorial
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
    brief: {
      pillars: [
        'Budowanie wiarygodności',
        'Ekspercka komunikacja',
        'Thought leadership',
      ],
      paragraphs: [
        {
          text: 'Branża finansowa opiera się przede wszystkim na zaufaniu. Odbiorcy oczekują transparentnej komunikacji, eksperckiej wiedzy oraz prostego wyjaśniania nawet najbardziej złożonych zagadnień. W social mediach kluczowe staje się budowanie wiarygodności i długofalowych relacji z klientami.',
          strong:
            'W social mediach kluczowe staje się budowanie wiarygodności i długofalowych relacji z klientami.',
        },
        {
          text: 'Jak wynika z raportu Edelman Trust Barometer 2025, aż 64% respondentów deklaruje, że zaufanie do marki ma kluczowy wpływ na ich decyzje zakupowe. W przypadku branży finansowej oznacza to, że komunikacja powinna nie tylko informować o ofercie, ale również konsekwentnie budować pozycję eksperta i wzmacniać reputację marki.',
        },
      ],
    },
    marquee: [
      'Fintech',
      'Płatności',
      'Edukacja finansowa',
      'B2B',
      'Bezpieczeństwo',
      'Inwestycje',
      'Zaufanie',
    ],
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

  // 6 — editorial
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
    brief: {
      pillars: [
        'Edukacja i eksperckość',
        'Zaangażowane społeczności',
        'Content oparty na pasji',
      ],
      paragraphs: [
        {
          text: 'Branża zoologiczna to kategoria, w której kluczową rolę odgrywają emocje, zaufanie i ekspercka wiedza. Opiekunowie zwierząt coraz częściej traktują swoich pupili jak pełnoprawnych członków rodziny, dlatego oczekują od marek nie tylko wysokiej jakości produktów, ale również wartościowych treści i rzetelnych porad.',
          strong:
            'Opiekunowie zwierząt coraz częściej traktują swoich pupili jak pełnoprawnych członków rodziny, dlatego oczekują od marek nie tylko wysokiej jakości produktów, ale również wartościowych treści i rzetelnych porad.',
        },
        {
          text: 'Według raportu PMR „Rynek zoologiczny w Polsce 2025” właściciele zwierząt coraz chętniej inwestują w specjalistyczne produkty i aktywnie poszukują informacji dotyczących zdrowia, żywienia i pielęgnacji swoich pupili. Dlatego skuteczna komunikacja w social mediach powinna łączyć edukację, inspirację i budowanie zaangażowanej społeczności skupionej wokół wspólnej pasji.',
        },
      ],
    },
    marquee: [
      'Zoologia',
      'Karma',
      'Akcesoria',
      'Community',
      'Poradniki',
      'Adopcje',
      'Miłość do zwierząt',
    ],
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

  // 7 — editorial
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
    brief: {
      pillars: [
        'Storytelling marki',
        'Okazje konsumpcyjne',
        'Zaangażowana społeczność',
      ],
      paragraphs: [
        {
          text: 'Branża alkoholowa to jedna z najbardziej wymagających kategorii w social mediach. Ograniczenia prawne sprawiają, że marki nie mogą opierać swojej komunikacji wyłącznie na produkcie czy sprzedaży. Kluczową rolę odgrywają emocje, storytelling oraz budowanie silnego świata wartości wokół marki.',
          strong:
            'Kluczową rolę odgrywają emocje, storytelling oraz budowanie silnego świata wartości wokół marki.',
        },
        {
          text: 'Wiemy, że konsumenci wybierają konkretne marki nie tylko ze względu na smak, ale również historię, tradycję, wartości czy wyjątkowe okazje, którym towarzyszą. Dlatego tworzymy komunikację opartą na angażujących historiach, budowaniu pozytywnych skojarzeń i kreowaniu naturalnych momentów kontaktu z marką, które wzmacniają jej rozpoznawalność i budują długofalowe relacje z odbiorcami.',
        },
      ],
    },
    marquee: [
      'Wino',
      'Piwo craft',
      'Spirytualia',
      'Rytuał',
      'Okazje',
      'Degustacje',
      'Odpowiedzialna konsumpcja',
    ],
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

  // 8 — editorial
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
    brief: {
      pillars: [
        'Trend-driven content',
        'Influencer marketing',
        'Social commerce',
      ],
      paragraphs: [
        {
          text: 'Branża fashion to jedna z najbardziej dynamicznych kategorii w social mediach. Konsumenci oczekują od marek nie tylko prezentacji produktów, ale również inspiracji, autentyczności i spójnego świata wartości.',
        },
        {
          text: 'Według raportu Euromonitor „Top Global Consumer Trends 2025” konsumenci coraz częściej wybierają marki, które odzwierciedlają ich styl życia i pozwalają wyrażać własną tożsamość. To sprawia, że social media stają się dla marek modowych przestrzenią do budowania pożądania, inspirowania odbiorców i tworzenia zaangażowanych społeczności.',
          strong:
            'social media stają się dla marek modowych przestrzenią do budowania pożądania, inspirowania odbiorców i tworzenia zaangażowanych społeczności.',
        },
      ],
    },
    marquee: ['Moda', 'Trendy', 'Lookbook', 'Drop', 'UGC', 'Kolekcje', 'Styl'],
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

  // 9 — editorial
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
    brief: {
      pillars: [
        'Apetyczny content',
        'Sezonowość i trendy',
        'Zaangażowana społeczność',
      ],
      paragraphs: [
        {
          text: 'Branża HoReCa to kategoria, w której konsumenci kupują nie tylko produkt, ale przede wszystkim doświadczenie. W social mediach liczą się emocje, estetyka i umiejętność opowiadania historii, które zachęcają odbiorców do odwiedzenia lokalu lub sięgnięcia po produkt.',
          strong:
            'W social mediach liczą się emocje, estetyka i umiejętność opowiadania historii, które zachęcają odbiorców do odwiedzenia lokalu lub sięgnięcia po produkt.',
        },
        {
          text: 'Według raportu PMR „Rynek HoReCa w Polsce 2025” aż 58% przedstawicieli pokolenia Z sprawdza opinie dostępne w internecie przed pierwszą wizytą w lokalu gastronomicznym. To pokazuje, jak dużą rolę odgrywają dziś media społecznościowe, rekomendacje i autentyczne doświadczenia klientów. Dlatego tworzymy komunikację, która łączy atrakcyjny content wizualny, sezonowe trendy i angażujące formaty, wspierając marki w budowaniu rozpoznawalności i lojalnej społeczności.',
        },
      ],
    },
    marquee: [
      'Restauracje',
      'Kawiarnie',
      'Menu',
      'Food content',
      'Rezerwacje',
      'Atmosfera',
      'Okazje',
    ],
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

  // 10 — editorial
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
    brief: {
      pillars: [
        'Storytelling doświadczeń',
        'Inspirujący content wizualny',
        'Budowanie lojalności gości',
      ],
      paragraphs: [
        {
          text: 'W branży hotelarskiej i turystycznej klienci nie kupują noclegu czy pobytu — kupują emocje, wspomnienia i wyjątkowe doświadczenia. To właśnie dlatego social media odgrywają tak ważną rolę w inspirowaniu do podróży i budowaniu wizerunku miejsca.',
        },
        {
          text: 'Jak wynika z badania Polskiej Organizacji Turystycznej „Turystyka w czasach zmian 2025”, aż 77% Polaków przed wyjazdem poszukuje inspiracji i informacji w internecie. Oznacza to, że atrakcyjny content wizualny, autentyczne historie i konsekwentnie budowany wizerunek marki mają realny wpływ na wybór miejsca wypoczynku.',
          strong:
            'aż 77% Polaków przed wyjazdem poszukuje inspiracji i informacji w internecie.',
        },
      ],
    },
    marquee: [
      'Hotele',
      'Resorty',
      'SPA',
      'Wypoczynek',
      'Travel content',
      'Rezerwacje',
      'Doświadczenie',
    ],
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

  // 11 — editorial
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
    brief: {
      pillars: [
        'Storytelling inwestycji',
        'Personal branding ekspertów',
        'Budowanie zaufania',
      ],
      paragraphs: [
        {
          text: 'Zakup nieruchomości to jedna z najważniejszych decyzji finansowych w życiu konsumentów. W branży deweloperskiej social media pełnią znacznie większą rolę niż tylko kanał sprzedażowy — pomagają budować wiarygodność marki, edukować klientów i prezentować styl życia związany z inwestycją.',
        },
        {
          text: 'Według raportu Otodom „Szczęśliwy Dom. Mieszkaniowe oczekiwania Polaków 2025” aż 80% Polaków deklaruje, że poszukując nieruchomości korzysta z internetu. Oznacza to, że obecność marki w digitalu często stanowi pierwszy punkt kontaktu z potencjalnym klientem, a transparentna i ekspercka komunikacja może realnie wpływać na decyzje zakupowe.',
          strong:
            'obecność marki w digitalu często stanowi pierwszy punkt kontaktu z potencjalnym klientem, a transparentna i ekspercka komunikacja może realnie wpływać na decyzje zakupowe.',
        },
      ],
    },
    marquee: [
      'Deweloperzy',
      'Inwestycje',
      'Mieszkania',
      'Wizualizacje',
      'Lokalizacja',
      'Leady',
      'Zaufanie',
    ],
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

  // 12 — editorial
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
    brief: {
      pillars: [
        'Community marketing',
        'Sezonowe kampanie',
        'Real-time marketing',
      ],
      paragraphs: [
        {
          text: 'Branża rozrywkowa opiera się na emocjach, doświadczeniach i wspólnie spędzanym czasie. W świecie social mediów kluczowe znaczenie ma tworzenie angażujących treści, które nie tylko informują o ofercie, ale przede wszystkim zachęcają odbiorców do aktywnego uczestnictwa i dzielenia się swoimi doświadczeniami.',
        },
        {
          text: 'Jak wynika z raportu Deloitte „Digital Consumer Trends 2025”, konsumenci coraz częściej poszukują rozrywki, która pozwala im budować relacje i tworzyć wspólne wspomnienia. Dlatego marki z tej kategorii powinny być obecne tam, gdzie toczą się rozmowy odbiorców, reagować na bieżące trendy i konsekwentnie budować społeczność wokół swoich działań.',
          strong:
            'marki z tej kategorii powinny być obecne tam, gdzie toczą się rozmowy odbiorców, reagować na bieżące trendy i konsekwentnie budować społeczność wokół swoich działań.',
        },
      ],
    },
    marquee: [
      'Eventy',
      'Kultura',
      'Premiery',
      'Community',
      'Zaangażowanie',
      'Emocje',
      'Live',
    ],
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
