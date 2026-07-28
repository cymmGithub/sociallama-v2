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
 *     brief → `marquee` → `manifesto` + `chips` → CTA.
 * Today Automotive (Volvo) and Elektronika i AGD (iRobot) are the proof pages.
 *
 * The `brief` (3 strategic pillars + market-report-backed paragraphs) is
 * verbatim from "BRANŻE - TEKSTY NA STRONĘ SOCIAL LAMA" and sits directly under
 * the hero on every page (see 2026-07-23 design). It sits ALONGSIDE our own
 * `manifesto` + value `chips` on editorial pages — both are wanted, they are not
 * alternatives. On proof pages `chips` are the case-study numbers band instead.
 *
 * Imagery status: proof `chips` are verbatim from the Volvo/iRobot case studies;
 * editorial `collage` is O1 (free-license Pexels, IDs recorded inline). The
 * proof `quote` is a brand-attributed paraphrase (O3): iRobot's is now the
 * client's verbatim testimonial; Volvo's paraphrase still stands.
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
    ctaHeadline: 'Chcesz takich wyników w swojej branży?',
  },
  editorial: {
    manifestoKicker: 'NASZE PODEJŚCIE',
    ctaHeadline: 'Porozmawiajmy o Twojej marce',
  },
  /** Related-studies row — rendered in BOTH variants (see `relatedCaseStudies`). */
  related: {
    kicker: 'WIĘCEJ DOWODÓW',
    /** Rendered in brand orange, ahead of `heading` — see `s.headingAccent`. */
    headingAccent: 'INNE',
    heading: 'CASE STUDIES Z TEJ BRANŻY',
    cta: 'ZOBACZ CASE STUDY',
  },
  // CTA card mirrors the case-study one (minus its secondary action), so the
  // eyebrow/lead copy and sentence casing match `case-studies.ts` chrome.
  ctaEyebrow: 'Twój ruch',
  ctaText: 'Opowiedz nam o swoim wyzwaniu — pokażemy, jak możemy pomóc.',
  ctaButton: 'Bezpłatna konsultacja',
  ctaHref: '/kontakt',
  // `/branze` index chrome. Cards reuse each industry's `tagline`, so this is
  // the only copy the index page adds.
  index: {
    title: 'Branże',
    intro:
      'Każda branża ma swój język, swoje tempo i swoich odbiorców. Znajdź swoją i zobacz, jak prowadzimy w niej social media.',
    cardCta: 'Zobacz branżę',
  },
} as const

// —— Content shape ————————————————————————————————————————————————————————————
// Documented here; parity with the EN twin is enforced via `LocalizedBranze`.

interface IndustryStat {
  value: string
  label: string
  /**
   * Growth figure shown as a small accent beneath `value`. Kept separate so the
   * headline number stays on one line — several studies report "2,6 mln (+180%)"
   * as a single string, which wrapped badly at display size.
   */
  delta?: string
}

interface IndustryImage {
  src: string
  alt: string
}

/**
 * A feed creative for the proof wall. Unlike the collage (which crops to fill),
 * these are device mockups, so they render at their intrinsic aspect — the same
 * treatment the case study gives them. Hence the required pixel dimensions.
 */
interface IndustryCreative extends IndustryImage {
  width: number
  height: number
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
  creatives: readonly IndustryCreative[]
  /**
   * Client testimonial, rendered as an attributed blockquote — so it must be
   * something the client actually said. OPTIONAL: most imported studies have no
   * collected testimonial yet, and a proof page is honest without one (it still
   * carries creatives, numbers and the case card) — better than inventing a
   * quote. iRobot's is verbatim; Volvo's is an unconfirmed paraphrase (O3).
   */
  quote?: { text: string; attribution: string }
}

/**
 * A case study linked from an industry page's related-studies row. Deliberately
 * lighter than `IndustryCaseStudy`: no creatives, no stats and no quote, because
 * this is a navigational card rather than a second proof block.
 */
export interface IndustryRelatedStudy {
  /** Case-study slug — not localized, so it is shared by both locales. */
  slug: string
  /** Short locale-authored card title. */
  title: string
  /**
   * Set `false` when the study has no `public/case-studies/<slug>/<slug>-logo.png`
   * asset (its deck shipped no usable logo) — the card then renders title-only
   * instead of a broken image. Defaults to true.
   */
  logo?: boolean
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
  /**
   * Numbers band — verbatim metrics from the featured case study. Distinct from
   * `chips` (the manifesto's value words); a page carrying both renders the
   * numbers band AND the manifesto, so they must not share one field.
   */
  numbers?: readonly IndustryStat[]
  /** Manifesto value chips (editorial voice, not metrics). */
  chips?: readonly IndustryStat[]
  caseStudy?: IndustryCaseStudy
  /**
   * Case studies linked from a compact card row. ADDITIVE and rendered in BOTH
   * variants — unlike `caseStudy`, this does NOT select the layout, so an
   * editorial industry keeps its collage/marquee/manifesto while gaining links.
   * On proof industries it carries only the studies *beyond* the featured one.
   */
  relatedCaseStudies?: readonly IndustryRelatedStudy[]
  /** Keyword marquee band. */
  marquee?: readonly string[]
  /** Punchy two-tone statement (`lead` inked, `rest` muted) + value chips. */
  manifesto?: { lead: string; rest: string }
  /** Duotone hero collage — omitted until O1 sourcing resolves. */
  collage?: readonly IndustryImage[]
}

// —— Canonical list (design D1, proof-first order) —————————————————————————————

export const INDUSTRIES = [
  // 1 — proof (Volvo)
  {
    id: 'automotive',
    slug: 'automotive',
    pairSlug: 'automotive',
    label: 'Automotive',
    // Imagery: Pexels (free license, no attribution required) — photo IDs
    // 5864155, 10800215, 8349487. Brand-neutral by design: no competitor
    // marques visible on a Volvo page.
    collage: [
      {
        src: '/branze/automotive/automotive-1.jpg',
        alt: 'Rozświetlony salon samochodowy nocą',
      },
    ],
    relatedCaseStudies: [
      {
        slug: 'motointegrator',
        title: 'Ekspansja e-commerce motoryzacyjnego na nowe rynki',
      },
      {
        slug: 'ozgasl',
        title: 'Rodzinny biznes motoryzacyjny na TikToku',
      },
      {
        slug: 'a1-karting',
        title: 'Karting i motorsport w social mediach',
      },
    ],
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
    numbers: [
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
          width: 351,
          height: 760,
        },
        {
          src: '/case-studies/volvo/volvo-vcw-goracy.jpg',
          alt: 'Kreacja Volvo „Gorący okres?” o przygotowaniu auta na lato',
          width: 351,
          height: 760,
        },
        {
          src: '/case-studies/volvo/volvo-event-ex30.jpg',
          alt: 'Elektryczne Volvo EX30 prezentowane na wydarzeniu plenerowym',
          width: 406,
          height: 720,
        },
        {
          src: '/case-studies/volvo/volvo-event-noc.jpg',
          alt: 'Relacja z Nocy Muzeów w salonie Volvo — koncert w nastrojowym oświetleniu',
          width: 406,
          height: 720,
        },
        {
          src: '/case-studies/volvo/volvo-dom-savedate.jpg',
          alt: 'Kreacja „Save the date” — dni otwarte w Domu Volvo',
          width: 585,
          height: 1266,
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
    // Imagery: Pexels (free license, no attribution required) — photo IDs
    // 844874, 7533923, 29292011.
    collage: [
      {
        src: '/branze/elektronika-i-agd/elektronika-i-agd-1.jpg',
        alt: 'Robot sprzątający na drewnianej podłodze',
      },
    ],
    relatedCaseStudies: [
      {
        slug: 'vobis',
        title: 'Real-time marketing marki RTV/AGD',
      },
      {
        slug: 'asus',
        title: 'Kampania edukacyjna o sztucznej inteligencji ASUS',
      },
      {
        slug: 'breville',
        title: 'Content marketing małego AGD',
      },
      {
        slug: 'kohersen',
        title: 'Garnki i patelnie w codziennym gotowaniu',
      },
      {
        slug: 'stadler-form',
        title: 'Czyste powietrze w wydaniu TikToka',
      },
      {
        slug: 'laurastar',
        title: 'AGD premium i content edukacyjny',
      },
      {
        slug: 'foodsaver',
        title: 'Zero waste ze zgrzewarkami próżniowymi',
      },
    ],
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
    numbers: [
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
        // Phone mockups only — galleries 4 and 5 are laptop/YouTube frames whose
        // landscape shape doesn't belong on a feed wall. Alts match the case study.
        {
          src: '/case-studies/irobot/irobot-gallery-1.jpg',
          alt: 'Post TikTok iRobot z hasłem „Chcesz wracać do czystego domu?”',
          width: 437,
          height: 900,
        },
        {
          src: '/case-studies/irobot/irobot-gallery-2.jpg',
          alt: 'Post TikTok iRobot pokazujący robota Roomba w akcji na podłodze',
          width: 350,
          height: 720,
        },
        {
          src: '/case-studies/irobot/irobot-gallery-3.jpg',
          alt: 'Humorystyczny film twórczyni z robotem Roomba w kampanii iRobot na TikToku',
          width: 524,
          height: 1080,
        },
        {
          src: '/case-studies/irobot/irobot-gallery-6.jpg',
          alt: 'Film twórczyni w kampanii TikTok iRobot z robotem Roomba',
          width: 437,
          height: 900,
        },
      ],
      // Verbatim client testimonial (supplied by the user 2026-07-24).
      quote: {
        text: 'Od blisko dwóch lat współpracujemy z agencją Social Lama przy działaniach na TikToku oraz YouTube i z pełnym przekonaniem możemy ją polecić. Zespół wyróżnia się dużą wiedzą i kompetencjami, a także partnerskim podejściem do współpracy — zawsze możemy liczyć na zaangażowanie, sprawną komunikację i realne wsparcie w realizacji celów.',
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
    // Numbers verbatim from the Kontigo case study.
    numbers: [
      { value: '1 100', label: 'Zgromadzone ambasadorki' },
      { value: '79', label: 'Średnia miesięczna liczba postów od ambasadorek' },
      {
        value: '1 500',
        label: 'Średnia miesięczna liczba polubień postów w grupie',
      },
    ],
    caseStudy: {
      slug: 'kontigo',
      cardKicker: 'CASE STUDY',
      cardTitle: '#KontigoCLUB — społeczność ambasadorek marki',
      creatives: [
        {
          src: '/case-studies/kontigo/kontigo-gallery-1.jpg',
          alt: 'Kreacja #KontigoCLUB z hasłem „Uzyskaj kod na -20% na wszystkie marki!”',
          width: 1080,
          height: 1080,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-2.jpg',
          alt: 'Zrzut ekranu wiadomości powitalnej grupy #KontigoCLUB z zasadami dodawania hashtagów i regulaminem konkursu Top 3 Ambasadorek',
          width: 345,
          height: 713,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-3.jpg',
          alt: 'Grafika #KontigoCLUB z napisem „Zasady grupy”, w otoczeniu tropikalnych liści i kwiatów hibiskusa',
          width: 1080,
          height: 1080,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-4.jpg',
          alt: 'Lista minionych wydarzeń grupy KontigoCLUB na Facebooku — transmisje Live z Harrym o makijażu na lato i Live o zdrowej opaleniźnie',
          width: 670,
          height: 532,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-5.jpg',
          alt: 'Grafika „Odkryj Ulubieńca Maja KontigoCLUB!” z prezentacją szamponu enzymatycznego Anwen Wake It Up',
          width: 597,
          height: 1400,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'luisse',
        title: 'Personal branding w branży fryzjerskiej',
      },
    ],
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
    chips: [
      { value: 'Estetyka', label: 'spójny feed, który buduje pożądanie' },
      { value: 'UGC', label: 'realne twarze, realne zaufanie' },
      {
        value: 'Rytuały',
        label: 'content, który wchodzi w codzienność klientek',
      },
    ],
    manifesto: {
      lead: 'Piękno sprzedaje się w feedzie.',
      rest: 'Ale to spójny, estetyczny content i realne twarze społeczności decydują, po którą markę klientka sięgnie przy półce.',
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
    ],
  },

  // 4 — editorial
  {
    id: 'health',
    slug: 'health',
    pairSlug: 'health',
    label: 'Health',
    // Numbers verbatim from the Adamed case study.
    numbers: [
      { value: '+242%', label: 'Wzrost obserwujących' },
      { value: '+269%', label: 'Interakcje z zawartością' },
      { value: '+719%', label: 'Kliknięcia w link' },
      { value: '+100%', label: 'Wzrost wyświetleń' },
    ],
    caseStudy: {
      slug: 'adamed',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Głęboki Oddech Adamed — edukacja zdrowotna w social mediach',
      creatives: [
        {
          src: '/case-studies/adamed/adamed-gallery-1.jpg',
          alt: 'Kadr z rolki na profilu Głęboki Oddech Adamed — dr n. med. Kamil Janeczek w niebieskim uniformie medycznym mówi do kamery, napis „Leczenie astmy opiera się na dwóch filarach”',
          width: 648,
          height: 1152,
        },
        {
          src: '/case-studies/adamed/adamed-gallery-2.jpg',
          alt: 'Kadr z rolki ze specjalistą na profilu Głęboki Oddech Adamed — lekarz w ciemnym uniformie tłumaczy, jak palenie wpływa na organizm',
          width: 540,
          height: 960,
        },
        {
          src: '/case-studies/adamed/adamed-gallery-3.jpg',
          alt: 'Post edukacyjny Głęboki Oddech Adamed z pytaniem „Czy chciałbyś poznać różnice między astmą alergiczną a niealergiczną?” i dłonią trzymającą inhalator',
          width: 648,
          height: 1152,
        },
        {
          src: '/case-studies/adamed/adamed-gallery-4.jpg',
          alt: 'Post Głęboki Oddech Adamed z pytaniem „Jak radzicie sobie z atakami astmy?” — mężczyzna trzymający się za klatkę piersiową',
          width: 540,
          height: 960,
        },
        {
          src: '/case-studies/adamed/adamed-gallery-5.jpg',
          alt: 'Kreacja Głęboki Oddech Adamed z hasłem „Przestań błądzić w dymie, znajdź zdrową ścieżkę na czas” — tłum ludzi we mgle dymu',
          width: 648,
          height: 1152,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'imid-cmv',
        title: 'Edukacja o badaniu klinicznym CMV',
      },
      {
        slug: 'fundacja-saventic',
        title: 'Choroby rzadkie i edukacja zdrowotna',
      },
      {
        slug: 'mercator',
        title: 'Wyroby medyczne w komunikacji B2B',
      },
      {
        slug: 'power-elements',
        title: 'Premiera marki suplementów diety',
      },
      {
        slug: 'mmhygienic',
        title: 'Nowa marka w kategorii dezynfekcji',
      },
    ],
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
    chips: [
      { value: 'Ekspert', label: 'content konsultowany merytorycznie' },
      { value: 'Edukacja', label: 'trudne tematy prostym językiem' },
      { value: 'Profilaktyka', label: 'komunikacja, która realnie pomaga' },
    ],
    manifesto: {
      lead: 'Zdrowia nie sprzedaje się obietnicą.',
      rest: 'Sprzedaje się je rzetelną edukacją, autorytetem ekspertów i komunikacją, której odbiorca ufa w najważniejszych decyzjach.',
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
    chips: [
      { value: 'B2B & B2C', label: 'komunikacja dopasowana do odbiorcy' },
      { value: 'Edukacja', label: 'finanse bez żargonu' },
      { value: 'Zaufanie', label: 'fundament każdej decyzji' },
    ],
    manifesto: {
      lead: 'Finansów nie powierza się przypadkowi.',
      rest: 'Powierza się je marce, która tłumaczy trudne tematy prostym językiem i buduje zaufanie każdego dnia.',
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
    ],
  },

  // 6 — editorial
  {
    id: 'petcare',
    slug: 'petcare',
    pairSlug: 'pet',
    label: 'Petcare',
    // Numbers verbatim from the Aquael case study.
    numbers: [
      { value: '388 717', label: 'Wyświetlenia (średnia miesięczna)' },
      { value: '184 799', label: 'Zasięg (średnia miesięczna)' },
      { value: '9 033', label: 'Zaangażowanie (średnia miesięczna)' },
      { value: '+660', label: 'Przyrost fanów (średnia miesięczna)' },
    ],
    caseStudy: {
      slug: 'aquael',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Ekspercka komunikacja marki akwarystycznej',
      creatives: [
        {
          src: '/case-studies/aquael/aquael-gallery-1.jpg',
          alt: 'Post Aquael z cyklu #ZostańEkspertemAquael o krabie brzegowym — ekspert Mirosław Karpiński i zdjęcie kraba trzymanego w dłoni',
          width: 464,
          height: 701,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-2.jpg',
          alt: 'Wykres wyników postów Aquael według typu treści — film osiąga najwyższy średni zasięg i zaangażowanie na tle linków, zdjęć i filmów udostępnionych',
          width: 925,
          height: 470,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-3.jpg',
          alt: 'Post Aquael „Akwarium jako nawilżacz powietrza” — podświetlone akwarium z roślinami w domowym wnętrzu',
          width: 463,
          height: 720,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-4.jpg',
          alt: 'Post Aquael o zestawie startowym LEDDY SEED — wyprawka dla początkującego akwarysty z kompletem sprzętu',
          width: 465,
          height: 680,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-5.jpg',
          alt: 'Aranżacja akwarium Aquael w szafce z drewnianym frontem, w przytulnym salonie z roślinami',
          width: 1080,
          height: 1080,
        },
      ],
      quote: {
        text: 'Social Lama jest agencją, która w pełni odpowiada naszym oczekiwaniom. Działania zespołu okazały się dla nas na tyle satysfakcjonujące, że zdecydowaliśmy się poszerzyć zakres współpracy o kolejne projekty.',
        attribution: 'Beata Nartowska, Aquael',
      },
    },
    relatedCaseStudies: [],
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
    chips: [
      {
        value: 'Community',
        label: 'najbardziej lojalni odbiorcy w social mediach',
      },
      { value: 'Poradniki', label: 'content, po który wracają' },
      { value: 'Emocje', label: 'zwierzę = członek rodziny' },
    ],
    manifesto: {
      lead: 'Dla właściciela to nie „zwierzę”. To rodzina.',
      rest: 'Marki, które to rozumieją, budują najbardziej lojalne społeczności w całym social mediach.',
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
    ],
  },

  // 7 — editorial
  {
    id: 'alkohole',
    slug: 'alkohole',
    pairSlug: 'alcohol',
    label: 'Alkohole',
    // Numbers verbatim from the Faktoria Win case study.
    numbers: [
      { value: '417 tys.', label: 'Zasięg (średnia miesięczna)' },
      { value: '827 tys.', label: 'Wyświetlenia (średnia miesięczna)' },
      { value: '17 tys.', label: 'Odwiedziny profilu (średnia miesięczna)' },
      { value: '25 tys.', label: 'Kliknięcia linku (średnia miesięczna)' },
    ],
    caseStudy: {
      slug: 'faktoria-win',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Komunikacja marki winiarskiej',
      creatives: [
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-1.jpg',
          alt: 'Ania i Tomek — para doradców Faktorii Win w dżinsowych koszulach na białym tle',
          width: 1400,
          height: 934,
        },
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-2.jpg',
          alt: 'Grupa znajomych wznosząca toast kieliszkami wina na świeżym powietrzu przy beczce',
          width: 934,
          height: 1400,
        },
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-3.jpg',
          alt: 'Kolaż przykładowych kreacji Faktorii Win — grafiki cykli Zgrana Para, przepisów i lifestyle’owe',
          width: 1400,
          height: 1400,
        },
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-4.jpg',
          alt: 'Widok siatki profilu Faktorii Win na Instagramie ze spójnymi kreacjami graficznymi',
          width: 493,
          height: 726,
        },
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-5.jpg',
          alt: 'Kreacja Faktorii Win „Jakie wino na weekend?” z parą w sklepie i rekomendacjami butelek win',
          width: 601,
          height: 511,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'mazurska-manufaktura-alkoholi',
        title: 'Crowdfunding z ambasadorką marki',
      },
    ],
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
    chips: [
      { value: 'Regulacje', label: 'komunikacja zgodna z prawem' },
      { value: 'Rytuał', label: 'marka wpisana w moment' },
      { value: 'Aspiracja', label: 'wizerunek premium' },
    ],
    manifesto: {
      lead: 'Alkohole rządzą się własnymi prawami.',
      rest: 'Regulacje, moment i rytuał — trzeba je wszystkie wyczuć, żeby zbudować aspiracyjną markę.',
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
    chips: [
      { value: 'Trendy', label: 'marka zawsze na czasie' },
      { value: 'Drop', label: 'napięcie, które sprzedaje' },
      { value: 'UGC', label: 'styl w wykonaniu społeczności' },
    ],
    manifesto: {
      lead: 'Moda żyje szybciej niż feed.',
      rest: 'Wygrywają marki, które nadają tempo — budują pożądanie wokół dropów i zamieniają obserwujących w klientów.',
    },
    marquee: ['Moda', 'Trendy', 'Lookbook', 'Drop', 'UGC', 'Kolekcje', 'Styl'],
    // Imagery: Pexels (free license) — photo IDs 17016524, 30892135, 36845202.
    collage: [
      {
        src: '/branze/fashion/fashion-1.jpg',
        alt: 'Modelka w białej stylizacji na wybiegu',
      },
    ],
  },

  // 9 — editorial
  {
    id: 'horeca',
    slug: 'horeca',
    pairSlug: 'horeca',
    label: 'Horeca',
    // Numbers verbatim from the Julius Meinl case study.
    numbers: [
      { value: '4 806', label: 'Interakcje', delta: '+956,3%' },
      { value: '432 616', label: 'Wyświetlenia', delta: '+1 380%' },
      { value: '147 040', label: 'Widzowie' },
      { value: '4 430', label: 'Kliknięcia', delta: '+24 511%' },
    ],
    caseStudy: {
      slug: 'julius-meinl',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Kawa premium i eventy branżowe',
      creatives: [
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-1.jpg',
          alt: 'Grafika szkoleniowa „ABC social mediów” z Olgą Rydzewską, Social Media Expert Social Lamy',
          width: 404,
          height: 504,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-2.jpg',
          alt: 'Grafika szkoleniowa „Wykorzystanie programu Canva” z Kornelią Orlik, Social Media Expert Social Lamy',
          width: 404,
          height: 504,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-3.jpg',
          alt: 'Kreacja Instagram „3 błędy w latte art” z czerwoną filiżanką kawy Julius Meinl',
          width: 320,
          height: 524,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-4.jpg',
          alt: 'Kreacja Instagram „Fakt czy mit” z filiżanką kawy Julius Meinl',
          width: 419,
          height: 581,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-5.jpg',
          alt: 'Dwoje pracowników przy czerwonym ekspresie kawowym Julius Meinl podczas eventu branżowego',
          width: 428,
          height: 524,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'belvedere',
        title: 'Restauracja premium w Łazienkach Królewskich',
      },
    ],
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
    chips: [
      { value: 'Food content', label: 'zdjęcia, po których słychać głód' },
      { value: 'Atmosfera', label: 'miejsce, do którego chce się wrócić' },
      { value: 'Rezerwacje', label: 'feed, który zapełnia stoliki' },
    ],
    manifesto: {
      lead: 'Głód zaczyna się w feedzie.',
      rest: 'Zanim gość przekroczy próg, apetyczny content i atmosfera miejsca już zapełniają stoliki.',
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
    ],
  },

  // 10 — editorial
  {
    id: 'hotele-i-miejsca-wypoczynkowe',
    slug: 'hotele-i-miejsca-wypoczynkowe',
    pairSlug: 'hospitality',
    label: 'Hotele i Miejsca Wypoczynkowe',
    // Numbers verbatim from the Dolina Charlotty case study.
    numbers: [
      { value: '15,5 mln', label: 'Wyświetlenia', delta: '+44,7%' },
      { value: '285 593', label: 'Zasięg', delta: '+87,7%' },
      { value: '51 278', label: 'Interakcje z zawartością', delta: '+168,8%' },
      { value: '99 509', label: 'Kliknięcia linku', delta: '+67,4%' },
    ],
    caseStudy: {
      slug: 'dolina-charlotty',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Resort & SPA jako całoroczny kierunek',
      creatives: [
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-1.jpg',
          alt: 'Profil Dolina Charlotty Resort & Spa na Instagramie w telefonie — zdjęcie profilowe z logo i wyróżnione relacje z atrakcjami obiektu',
          width: 457,
          height: 936,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-2.jpg',
          alt: 'Post Dolina Charlotty na Instagramie w telefonie — grupa dzieci bawiąca się kolorową chustą animacyjną podczas zajęć w obiekcie',
          width: 457,
          height: 936,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-3.jpg',
          alt: 'Relacja na Instagramie Doliny Charlotty w telefonie — lama z Zoo Charlotta i ankieta „Będziecie?” z wynikiem 71% głosów na „Tak!”',
          width: 457,
          height: 938,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-4.jpg',
          alt: 'Reklamowy post Dolina Charlotty na Facebooku w telefonie — kreacja „Bilety do ZOO za pół ceny!” z dwoma lemurami',
          width: 457,
          height: 936,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-5.jpg',
          alt: 'Reels Dolina Charlotty na Instagramie w telefonie — kadr nad wodą z hasłem „Odwiedź Dolinę Charlotty”',
          width: 437,
          height: 900,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'skibooking',
        title: 'Rezerwacje narciarskie online',
        // Its deck shipped no usable logo — render title-only, not a 404 image.
        logo: false,
      },
      {
        slug: 'getaway',
        title: 'Kreator podróży w social mediach',
      },
    ],
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
    chips: [
      { value: 'Aspiracja', label: 'miejsce, o którym się marzy' },
      { value: 'Booking', label: 'content, który napędza rezerwacje' },
      { value: 'Sezony', label: 'komunikacja przez cały rok' },
    ],
    manifesto: {
      lead: 'Wakacje kupuje się marzeniem.',
      rest: 'Aspiracyjny travel content sprzedaje miejsce, zanim gość w ogóle spakuje walizkę.',
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
    ],
  },

  // 11 — editorial
  {
    id: 'nieruchomosci-i-deweloperzy',
    slug: 'nieruchomosci-i-deweloperzy',
    pairSlug: 'real-estate',
    label: 'Nieruchomości i Deweloperzy',
    // Numbers verbatim from the ED Invest case study.
    numbers: [
      { value: '2,6 mln', label: 'Wyświetlenia', delta: '+180%' },
      {
        value: '1,9 tys.',
        label: 'Interakcje z zawartością',
        delta: '+181,5%',
      },
      { value: '270', label: 'Nowi obserwujący', delta: '+260%' },
      { value: '7 tys.', label: 'Odwiedziny profilu', delta: '+3,4%' },
    ],
    caseStudy: {
      slug: 'ed-invest',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Deweloper na Facebooku, Instagramie i LinkedInie',
      creatives: [
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-1.jpg',
          alt: 'Kadr z nagrania wideo ED Invest — widok z lotu ptaka na realizowaną inwestycję mieszkaniową na tle panoramy miasta',
          width: 788,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-2.jpg',
          alt: 'Kadr z nagrania wideo ED Invest — pracownica biura sprzedaży przy biurku podczas rozmowy z klientem',
          width: 788,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-3.jpg',
          alt: 'Relacja wideo z eventu branżowego Orange Ball — scena z logo ED Invest podczas wydarzenia',
          width: 788,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-4.jpg',
          alt: 'Zdjęcie grupowe przedstawicieli ED Invest z wyróżnieniem podczas branżowej gali',
          width: 788,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-5.jpg',
          alt: 'Dedykowana kreacja graficzna inwestycji Gocławia ED Invest — wizualizacja kameralnego budynku z hasłem o najwyższych standardach',
          width: 1080,
          height: 1350,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'jw-construction',
        title: 'Budownictwo prefabrykowane i inwestycje',
      },
      {
        slug: 'dynamic-development',
        title: 'Komunikacja dewelopera w social mediach',
      },
    ],
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
    chips: [
      { value: 'Leady', label: 'komunikacja nastawiona na kontakt' },
      { value: 'Wizualizacje', label: 'inwestycja, którą widać' },
      { value: 'Zaufanie', label: 'fundament decyzji życia' },
    ],
    manifesto: {
      lead: 'Zakup nieruchomości to decyzja życia.',
      rest: 'Poprzedza ją zaufanie — budujemy je prezentacją inwestycji i komunikacją, która generuje realne leady.',
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
    ],
  },

  // 12 — editorial
  {
    id: 'rozrywka',
    slug: 'rozrywka',
    pairSlug: 'entertainment',
    label: 'Rozrywka',
    // Numbers verbatim from the Skrzat. Nowy początek case study.
    numbers: [
      { value: '35 mln', label: 'Wyświetlenia (TikTok)' },
      { value: '100 tys.', label: 'Polubienia (TikTok)' },
      { value: '4,38 mln', label: 'Wyświetlenia (Instagram)' },
      { value: '1,14 mln', label: 'Zasięg (Instagram)' },
    ],
    caseStudy: {
      slug: 'skrzat',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Premiera filmu i 35 mln wyświetleń',
      creatives: [
        {
          src: '/case-studies/skrzat/skrzat-gallery-1.jpg',
          alt: 'Grafika promocyjna „Ile skrzatów kryje się w lesie?” — sylwetki skrzatów ukryte w słonecznym lesie',
          width: 540,
          height: 675,
        },
        {
          src: '/case-studies/skrzat/skrzat-gallery-2.jpg',
          alt: 'Kreatywna grafika „Jak powiedzieć »skrzat« w różnych językach?” z bohaterami filmu na fioletowym tle',
          width: 540,
          height: 675,
        },
        {
          src: '/case-studies/skrzat/skrzat-gallery-3.jpg',
          alt: 'Grafika „3 oznaki bycia skrzaciarą” z kadrem zza kulis i dopiskiem WOW',
          width: 540,
          height: 675,
        },
        {
          src: '/case-studies/skrzat/skrzat-gallery-4.jpg',
          alt: 'Post konkursowy #Kamyczki „Wygraj bilet na film” z plakatem „Skrzat. Nowy początek” w grupie na Facebooku',
          width: 437,
          height: 900,
        },
        {
          src: '/case-studies/skrzat/skrzat-gallery-5.jpg',
          alt: 'Ekipa i twórcy machają do kamery na planie zdjęciowym filmu „Skrzat. Nowy początek” w lesie',
          width: 644,
          height: 1400,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'rabkoland',
        title: 'Park rozrywki dla całej rodziny',
      },
    ],
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
    chips: [
      { value: 'Hype', label: 'napięcie przed premierą' },
      { value: 'Community', label: 'społeczność, która współtworzy' },
      { value: 'Zaangażowanie', label: 'treść, którą się udostępnia' },
    ],
    manifesto: {
      lead: 'Uwaga to waluta rozrywki.',
      rest: 'Budujemy hype wokół premier, aktywujemy społeczność i tworzymy treści, które żyją w komentarzach.',
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
