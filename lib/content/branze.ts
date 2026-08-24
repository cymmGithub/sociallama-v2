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
 * Today Motoryzacja (Volvo) and Elektronika i AGD (iRobot) are the proof pages.
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
    ctaHeadline: 'Chcesz takich wyników w\u00A0swojej branży?',
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
  // CTA card mirrors the case-study one, so the lead copy and sentence casing
  // match `case-studies.ts` chrome — including the button, which carries the
  // header CTA's wording (`nav.cta` in home.ts).
  ctaText: 'Opowiedz nam o\u00A0swoim wyzwaniu — pokażemy, jak możemy pomóc.',
  ctaButton: 'Porozmawiajmy o Twoim biznesie',
  ctaHref: '/kontakt',
  // `/branze` index chrome. Cards reuse each industry's hero poster and
  // `label`, so this is the only copy the index page adds.
  index: {
    title: 'Branże',
    intro:
      'Każda branża ma swój język, swoje tempo i\u00A0swoich odbiorców. Znajdź swoją i\u00A0zobacz, jak prowadzimy w\u00A0niej social media.',
    cardCta: 'Więcej',
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
export interface IndustryCreative extends IndustryImage {
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
   * Standalone feed wall for an EDITORIAL industry (design D1). A proof
   * industry draws its wall from `caseStudy.creatives`; this field lets an
   * industry with no featured study still show real creatives, drawn from the
   * studies in `relatedCaseStudies`. Never set alongside `caseStudy` — the
   * proof layout ignores it.
   */
  creatives?: readonly IndustryCreative[]
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
    label: 'Motoryzacja',
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
        title: 'Karting i\u00A0motorsport w\u00A0social mediach',
      },
    ],
    meta: {
      title: 'Social media dla branży motoryzacyjnej',
      description:
        'Prowadzimy social media marek motoryzacyjnych — od salonów premium po elektromobilność. Zobacz, jak zbudowaliśmy społeczność Volvo Car Warszawa i Domu Volvo.',
    },
    tagline:
      'Nie opowiadamy, jak robimy social media dla motoryzacji. Pokazujemy — wszystko poniżej to realne materiały z\u00A0naszych profili.',
    brief: {
      pillars: [
        'Ekspercka komunikacja',
        'Technologie i innowacje',
        'Personal branding ekspertów',
      ],
      paragraphs: [
        {
          text: 'Branża motoryzacyjna to kategoria, w\u00A0której decyzje zakupowe są poprzedzone długim procesem poszukiwania informacji i\u00A0porównywania dostępnych rozwiązań. W\u00A0social mediach kluczową rolę odgrywają eksperckość, wiarygodność oraz umiejętność tłumaczenia zaawansowanych technologii w\u00A0przystępny sposób.',
          strong:
            'W\u00A0social mediach kluczową rolę odgrywają eksperckość, wiarygodność oraz umiejętność tłumaczenia zaawansowanych technologii w\u00A0przystępny sposób.',
        },
        {
          text: 'Jak wynika z\u00A0raportu Deloitte „2025 Global Automotive Consumer Study”, aż 69% polskich konsumentów planujących zakup samochodu deklaruje, że przed podjęciem decyzji aktywnie poszukuje informacji online. Dlatego tworzymy komunikację, która łączy ekspercką wiedzę, angażujący storytelling i\u00A0atrakcyjne formaty wideo, wspierając marki w\u00A0budowaniu zaufania oraz długofalowych relacji z\u00A0odbiorcami.',
        },
      ],
    },
    numbers: [
      { value: '3+', label: 'lata ciągłej współpracy z\u00A0marką Volvo' },
      { value: '2', label: 'marki prowadzone równolegle — VCW & Dom Volvo' },
      { value: '3', label: 'platformy: LinkedIn, Facebook, Instagram' },
    ],
    caseStudy: {
      slug: 'volvo',
      cardKicker: 'CASE STUDY',
      cardTitle:
        'Budowa marek Volvo na LinkedInie, Facebooku i\u00A0Instagramie',
      creatives: [
        {
          src: '/case-studies/volvo/volvo-gallery-3.jpg',
          alt: 'Kreacja Volvo z kobietą z rozwianymi włosami nad morzem, hasło „Gorący okres? Weź to na chłodno!”',
          width: 1068,
          height: 1350,
        },
        {
          src: '/case-studies/volvo/volvo-gallery-1.jpg',
          alt: 'Kreacja Volvo Car Warszawa z przeszklonym Domem Volvo, hasło „Midsommar w Domu Volvo: dni otwarte 25–27.06” i zapowiedź premiery Volvo XC60',
          width: 1080,
          height: 1350,
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
          src: '/case-studies/volvo/volvo-gallery-4.jpg',
          alt: 'Kreacja konkursowa Volvo z dziećmi rysującymi przy stole, hasło „Volvo oczami dziecka” i zaproszenie na wystawę prac w Domu Volvo 25–27.06',
          width: 1079,
          height: 1350,
        },
      ],
      quote: {
        text: 'Personal branding doradców i\u00A0treści eksperckie zbudowały pozycję obu marek na LinkedInie — bez kupowania zasięgów.',
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
        title: 'Kampania edukacyjna o\u00A0sztucznej inteligencji ASUS',
      },
      {
        slug: 'breville',
        title: 'Content marketing małego AGD',
      },
      {
        slug: 'kohersen',
        title: 'Garnki i\u00A0patelnie w\u00A0codziennym gotowaniu',
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
      title: 'Social media dla branży elektronika i AGD',
      description:
        'Prowadzimy social media marek elektroniki i AGD — od edukacji produktowej po viralowy content. Zobacz, jak iRobot podbił TikToka i YouTube.',
    },
    tagline:
      'Nie opowiadamy, jak robimy social media dla elektroniki i\u00A0AGD. Pokazujemy — wszystko poniżej to realne kreacje z\u00A0naszych kampanii.',
    brief: {
      pillars: [
        'Edukacja produktowa',
        'Content wideo',
        'Przekładanie technologii na język korzyści',
      ],
      paragraphs: [
        {
          text: 'Branża elektroniki i\u00A0AGD to kategoria, w\u00A0której konsumenci oczekują nie tylko inspiracji, ale przede wszystkim konkretnych informacji ułatwiających podjęcie decyzji zakupowej. W\u00A0social mediach kluczową rolę odgrywają edukacja, prezentacja funkcjonalności oraz pokazywanie realnych zastosowań produktów w\u00A0codziennym życiu.',
          strong:
            'W\u00A0social mediach kluczową rolę odgrywają edukacja, prezentacja funkcjonalności oraz pokazywanie realnych zastosowań produktów w\u00A0codziennym życiu.',
        },
        {
          text: 'Jak wynika z\u00A0raportu Gemius „E-commerce w\u00A0Polsce 2025”, aż 75% polskich internautów kupuje online, a\u00A0do najczęściej kupowanych kategorii należą m.in. elektronika i\u00A0AGD. To sprawia, że marki z\u00A0tej branży powinny stawiać na przystępną komunikację, atrakcyjne formaty wideo oraz content, który pomaga użytkownikom lepiej zrozumieć technologię i\u00A0świadomie wybrać odpowiedni produkt.',
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
        'iRobot — humor i\u00A0edukacja, które budują markę na YouTube i\u00A0TikToku',
      creatives: [
        {
          src: '/case-studies/irobot/irobot-humor-parrot.jpg',
          alt: 'Kadr z humorystycznego filmu iRobot — zielona papuga w mieszkaniu, na środku zielone logo iRobot',
          width: 713,
          height: 640,
        },
        {
          src: '/case-studies/irobot/irobot-edukacja-1.png',
          alt: 'Kreacja iRobot z pytaniem „Czy pies może się stresować… sprzątaniem?”',
          width: 820,
          height: 1320,
        },
        {
          src: '/case-studies/irobot/irobot-edukacja-2-cut.webp?v=2',
          alt: 'Zrzut posta iRobot Polska prezentującego Roombę MAX 775 Combo',
          width: 814,
          height: 1316,
        },
        {
          src: '/case-studies/irobot/irobot-innowacja-1.png',
          alt: 'Kadr z filmu YouTube „Find Your Roomba” — widzowie oglądają spot o robocie dla właścicieli psów',
          width: 2056,
          height: 1164,
        },
      ],
      // Verbatim client testimonial (supplied by the user 2026-07-24).
      quote: {
        text: 'Od blisko dwóch lat współpracujemy z\u00A0agencją Social Lama przy działaniach na TikToku oraz YouTube i\u00A0z\u00A0pełnym przekonaniem możemy ją polecić. Zespół wyróżnia się dużą wiedzą i\u00A0kompetencjami, a\u00A0także partnerskim podejściem do współpracy — zawsze możemy liczyć na zaangażowanie, sprawną komunikację i\u00A0realne wsparcie w\u00A0realizacji celów.',
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
        label: 'Średnia miesięczna liczba polubień postów w\u00A0grupie',
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
          src: '/case-studies/kontigo/kontigo-gallery-7.jpg',
          alt: 'Grafika „Top 3 Ambasadorki maj 2023” z listą zwyciężczyń: Adrianna Anna, Kinga Jaromin, Nikola Lopata',
          width: 1080,
          height: 1080,
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
      title: 'Social media dla branży beauty',
      description:
        'Prowadzimy social media marek beauty — skincare, makijaż, pielęgnacja. Estetyczny content, siła UGC i kampanie, które realnie sprzedają.',
    },
    tagline:
      'Beauty to branża pierwszego wrażenia. Budujemy je tam, gdzie klientka je wyrabia — na feedzie. Estetyczny content i\u00A0kampanie dla marek kosmetycznych.',
    brief: {
      pillars: [
        'Edukacja i eksperckość',
        'UGC i influencer marketing',
        'Zaangażowane społeczności',
      ],
      paragraphs: [
        {
          text: 'Branża beauty to jedna z\u00A0najbardziej konkurencyjnych kategorii w\u00A0social mediach. Estetyczny content to dziś za mało — konsumenci oczekują autentyczności, eksperckiej wiedzy i\u00A0rekomendacji, którym mogą zaufać.',
        },
        {
          text: 'Według raportu Mintel z\u00A02025 roku konsumenci coraz częściej podejmują decyzje zakupowe w\u00A0oparciu o\u00A0transparentność składu oraz potwierdzoną skuteczność produktu. Dla marek beauty oznacza to rosnącą rolę komunikacji edukacyjnej i\u00A0eksperckiej. Dlatego tworzymy strategie, które łączą edukację, inspirację i\u00A0angażujący storytelling, wspierając marki w\u00A0budowaniu zaufania oraz długofalowych relacji z\u00A0odbiorcami.',
          strong:
            'tworzymy strategie, które łączą edukację, inspirację i\u00A0angażujący storytelling, wspierając marki w\u00A0budowaniu zaufania oraz długofalowych relacji z\u00A0odbiorcami.',
        },
      ],
    },
    chips: [
      { value: 'Estetyka', label: 'spójny feed, który buduje pożądanie' },
      { value: 'UGC', label: 'realne twarze, realne zaufanie' },
      {
        value: 'Rytuały',
        label: 'content, który wchodzi w\u00A0codzienność klientek',
      },
    ],
    manifesto: {
      lead: 'Piękno sprzedaje się na feedzie.',
      rest: 'Ale to spójny, estetyczny content i\u00A0realne twarze społeczności decydują, po którą markę klientka sięgnie przy półce.',
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
    label: 'Zdrowie',
    /*
     * Health has no featured study, so this wall is drawn from two of the five
     * studies in `relatedCaseStudies` rather than from one client's feed
     * (design D1/D2). Alt text names the brand for that reason — on a mixed
     * wall the tile itself is the only thing that says whose creative it is.
     * Selection confirmed 2026-08-23.
     */
    creatives: [
      {
        src: '/case-studies/fundacja-saventic/fundacja-saventic-gallery-3.jpg',
        alt: 'Post edukacyjny Fundacji Saventic „Kardiomiopatie — przyczyny, objawy, leczenie” z ilustracją lekarki i serca',
        width: 1400,
        height: 1400,
      },
      {
        src: '/case-studies/imid-cmv/imid-cmv-edu-1.jpg',
        alt: 'Kreacja kampanii LeczenieCMV.pl — „Czy CMV jest wirusem dziedzicznym?”',
        width: 1080,
        height: 1080,
      },
      {
        src: '/case-studies/fundacja-saventic/fundacja-saventic-gallery-2.jpg',
        alt: 'Post edukacyjny Fundacji Saventic „Jakim chorobom towarzyszy żółtaczka?” z komentarzem dr. hab. n. med. Patryka Lipińskiego',
        width: 1201,
        height: 1200,
      },
      {
        src: '/case-studies/imid-cmv/imid-cmv-walacyklowir-1.jpg',
        alt: 'Kreacja kampanii LeczenieCMV.pl — „Immunoglobuliny czy walacyklowir — jaką terapię wybrać przy leczeniu cytomegalii w ciąży?”',
        width: 720,
        height: 720,
      },
      {
        src: '/case-studies/imid-cmv/imid-cmv-edu-2.jpg',
        alt: 'Kreacja kampanii LeczenieCMV.pl — „90% kobiet w wieku rozrodczym jest zarażona wirusem cytomegalii”',
        width: 720,
        height: 720,
      },
    ],
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
      title: 'Social media dla branży zdrowotnej',
      description:
        'Prowadzimy social media marek z branży zdrowia i wellbeingu. Rzetelna edukacja, autorytet ekspertów i komunikacja, która buduje zaufanie.',
    },
    tagline:
      'Zdrowie to branża zaufania. Budujemy je tam, gdzie odbiorca szuka odpowiedzi — na feedzie. Edukacyjny content i\u00A0kampanie dla marek zdrowotnych.',
    brief: {
      pillars: [
        'Edukacja oparta na wiedzy',
        'Budowanie zaufania',
        'Zarządzanie reputacją marki',
      ],
      paragraphs: [
        {
          text: 'Branża zdrowotna wymaga szczególnego podejścia do komunikacji. Odbiorcy oczekują rzetelnych informacji, eksperckiej wiedzy oraz treści opartych na faktach. W\u00A0świecie pełnym dezinformacji zaufanie staje się jednym z\u00A0najcenniejszych zasobów marki.',
          strong:
            'Odbiorcy oczekują rzetelnych informacji, eksperckiej wiedzy oraz treści opartych na faktach.',
        },
        {
          text: 'Jak wynika z\u00A0raportu Edelman Trust Barometer 2025, aż 72% respondentów obawia się fałszywych informacji i\u00A0dezinformacji. Dlatego skuteczna komunikacja marek z\u00A0obszaru zdrowia i\u00A0wellbeingu powinna opierać się na wiarygodnych źródłach, transparentności i\u00A0budowaniu długofalowych relacji z\u00A0odbiorcami.',
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
      rest: 'Sprzedaje się je rzetelną edukacją, autorytetem ekspertów i\u00A0komunikacją, której odbiorca ufa w\u00A0najważniejszych decyzjach.',
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
      title: 'Social media dla branży finanse',
      description:
        'Prowadzimy social media marek finansowych i fintech. Edukacja bez żargonu, autorytet i komunikacja, której odbiorca powierza swoje pieniądze.',
    },
    tagline:
      'Finanse to branża zaufania w\u00A0czystej postaci. Budujemy je codzienną, zrozumiałą komunikacją dla marek finansowych i\u00A0fintech.',
    brief: {
      pillars: [
        'Budowanie wiarygodności',
        'Ekspercka komunikacja',
        'Budowanie pozycji eksperta',
      ],
      paragraphs: [
        {
          text: 'Branża finansowa opiera się przede wszystkim na zaufaniu. Odbiorcy oczekują transparentnej komunikacji, eksperckiej wiedzy oraz prostego wyjaśniania nawet najbardziej złożonych zagadnień. W\u00A0social mediach kluczowe staje się budowanie wiarygodności i\u00A0długofalowych relacji z\u00A0klientami.',
          strong:
            'W\u00A0social mediach kluczowe staje się budowanie wiarygodności i\u00A0długofalowych relacji z\u00A0klientami.',
        },
        {
          text: 'Jak wynika z\u00A0raportu Edelman Trust Barometer 2025, aż 64% respondentów deklaruje, że zaufanie do marki ma kluczowy wpływ na ich decyzje zakupowe. W\u00A0przypadku branży finansowej oznacza to, że komunikacja powinna nie tylko informować o\u00A0ofercie, ale również konsekwentnie budować pozycję eksperta i\u00A0wzmacniać reputację marki.',
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
      rest: 'Powierza się je marce, która tłumaczy trudne tematy prostym językiem i\u00A0buduje zaufanie każdego dnia.',
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
    label: 'Zoologiczna',
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
          src: '/case-studies/aquael/aquael-gallery-6.jpg',
          alt: 'Profil Aquael na Facebooku — 45 tys. obserwujących i grafika w tle z kampanii Glossy Marine z akwarium morskim',
          width: 739,
          height: 1400,
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
        text: 'Social Lama jest agencją, która w\u00A0pełni odpowiada naszym oczekiwaniom. Działania zespołu okazały się dla nas na tyle satysfakcjonujące, że zdecydowaliśmy się poszerzyć zakres współpracy o\u00A0kolejne projekty.',
        attribution: 'Beata Nartowska, Aquael',
      },
    },
    relatedCaseStudies: [],
    meta: {
      title: 'Social media dla branży zoologicznej',
      description:
        'Prowadzimy social media marek zoologicznych i petcare. Lojalne społeczności właścicieli, poradnikowy content i realna sprzedaż.',
    },
    tagline:
      'Branża zoologiczna to kategoria emocji i\u00A0lojalności. Budujemy społeczności właścicieli, dla których zwierzę to członek rodziny — i\u00A0tak samo traktujemy marki.',
    brief: {
      pillars: [
        'Edukacja i eksperckość',
        'Zaangażowane społeczności',
        'Content oparty na pasji',
      ],
      paragraphs: [
        {
          text: 'Branża zoologiczna to kategoria, w\u00A0której kluczową rolę odgrywają emocje, zaufanie i\u00A0ekspercka wiedza. Opiekunowie zwierząt coraz częściej traktują swoich pupili jak pełnoprawnych członków rodziny, dlatego oczekują od marek nie tylko wysokiej jakości produktów, ale również wartościowych treści i\u00A0rzetelnych porad.',
          strong:
            'Opiekunowie zwierząt coraz częściej traktują swoich pupili jak pełnoprawnych członków rodziny, dlatego oczekują od marek nie tylko wysokiej jakości produktów, ale również wartościowych treści i\u00A0rzetelnych porad.',
        },
        {
          text: 'Według raportu PMR „Rynek zoologiczny w\u00A0Polsce 2025” właściciele zwierząt coraz chętniej inwestują w\u00A0specjalistyczne produkty i\u00A0aktywnie poszukują informacji dotyczących zdrowia, żywienia i\u00A0pielęgnacji swoich pupili. Dlatego skuteczna komunikacja w\u00A0social mediach powinna łączyć edukację, inspirację i\u00A0budowanie zaangażowanej społeczności skupionej wokół wspólnej pasji.',
        },
      ],
    },
    chips: [
      {
        value: 'Społeczność',
        label: 'najbardziej lojalni odbiorcy w\u00A0social mediach',
      },
      { value: 'Poradniki', label: 'content, po który wracają' },
      { value: 'Emocje', label: 'zwierzę = członek rodziny' },
    ],
    manifesto: {
      lead: 'Dla właściciela to nie „zwierzę”. To rodzina.',
      rest: 'Marki, które to rozumieją, budują najbardziej lojalne społeczności w\u00A0całym social mediach.',
    },
    marquee: [
      'Zoologia',
      'Karma',
      'Akcesoria',
      'Społeczność',
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
          src: '/case-studies/faktoria-win/faktoria-win-gallery-6.jpg',
          alt: 'Konkursowa kreacja Faktorii Win z winami Kumala i nagrodami — dwa iPhone’y 14',
          width: 1200,
          height: 1200,
        },
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-3.jpg',
          alt: 'Kolaż przykładowych kreacji Faktorii Win — grafiki cykli Zgrana Para, przepisów i lifestyle’owe',
          width: 1400,
          height: 1400,
        },
        {
          src: '/case-studies/mazurska-manufaktura-alkoholi/mazurska-manufaktura-alkoholi-gallery-2.jpg',
          alt: 'Kreacja Mazurskiej Manufaktury Alkoholi — linia rozlewnicza butelek Bielik Vodka i grafika „Zebraliśmy już 2 000 000 zł!”',
          width: 900,
          height: 900,
        },
        {
          src: '/case-studies/mazurska-manufaktura-alkoholi/mazurska-manufaktura-alkoholi-gallery-1.jpg',
          alt: 'Kreacja Mazurskiej Manufaktury Alkoholi „Zostań naszym akcjonariuszem! Masz czas do godziny 23.59” z logo marki',
          width: 960,
          height: 960,
        },
        {
          src: '/case-studies/mazurska-manufaktura-alkoholi/mazurska-manufaktura-alkoholi-gallery-3.jpg',
          alt: 'Kreacja Mazurskiej Manufaktury Alkoholi „Magda Gessler już zainwestowała… A Ty?” z portretem ambasadorki marki',
          width: 1200,
          height: 900,
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
      title: 'Social media dla branży alkoholowej',
      description:
        'Prowadzimy social media marek alkoholowych — wino, piwo craft, spirytualia. Aspiracyjny wizerunek zgodny z regulacjami i odpowiedzialną konsumpcją.',
    },
    tagline:
      'Alkohole to branża rytuału i\u00A0okazji. Budujemy aspiracyjny wizerunek marek — z\u00A0wyczuciem regulacji i\u00A0odpowiedzialnej konsumpcji.',
    brief: {
      pillars: [
        'Storytelling marki',
        'Okazje konsumpcyjne',
        'Zaangażowana społeczność',
      ],
      paragraphs: [
        {
          text: 'Branża alkoholowa to jedna z\u00A0najbardziej wymagających kategorii w\u00A0social mediach. Ograniczenia prawne sprawiają, że marki nie mogą opierać swojej komunikacji wyłącznie na produkcie czy sprzedaży. Kluczową rolę odgrywają emocje, storytelling oraz budowanie silnego świata wartości wokół marki.',
          strong:
            'Kluczową rolę odgrywają emocje, storytelling oraz budowanie silnego świata wartości wokół marki.',
        },
        {
          text: 'Wiemy, że konsumenci wybierają konkretne marki nie tylko ze względu na smak, ale również historię, tradycję, wartości czy wyjątkowe okazje, którym towarzyszą. Dlatego tworzymy komunikację opartą na angażujących historiach, budowaniu pozytywnych skojarzeń i\u00A0kreowaniu naturalnych momentów kontaktu z\u00A0marką, które wzmacniają jej rozpoznawalność i\u00A0budują długofalowe relacje z\u00A0odbiorcami.',
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
      rest: 'Regulacje, moment i\u00A0rytuał — trzeba je wszystkie wyczuć, żeby zbudować aspiracyjną markę.',
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
    label: 'Moda',
    meta: {
      title: 'Social media dla branży modowej',
      description:
        'Prowadzimy social media marek modowych. Budujemy pożądanie wokół dropów i kolekcji, łączymy lookbooki z UGC i zamieniamy obserwujących w klientów.',
    },
    tagline:
      'Moda to branża tempa. Nadajemy markom rytm feedu — budujemy pożądanie wokół dropów i\u00A0kolekcji, sezon po sezonie.',
    brief: {
      pillars: [
        'Content oparty na trendach',
        'Influencer marketing',
        'Social commerce',
      ],
      paragraphs: [
        {
          text: 'Branża modowa to jedna z\u00A0najbardziej dynamicznych kategorii w\u00A0social mediach. Konsumenci oczekują od marek nie tylko prezentacji produktów, ale również inspiracji, autentyczności i\u00A0spójnego świata wartości.',
        },
        {
          text: 'Według raportu Euromonitor „Top Global Consumer Trends 2025” konsumenci coraz częściej wybierają marki, które odzwierciedlają ich styl życia i\u00A0pozwalają wyrażać własną tożsamość. To sprawia, że social media stają się dla marek modowych przestrzenią do budowania pożądania, inspirowania odbiorców i\u00A0tworzenia zaangażowanych społeczności.',
          strong:
            'social media stają się dla marek modowych przestrzenią do budowania pożądania, inspirowania odbiorców i\u00A0tworzenia zaangażowanych społeczności.',
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
      rest: 'Wygrywają marki, które nadają tempo — budują pożądanie wokół dropów i\u00A0zamieniają obserwujących w\u00A0klientów.',
    },
    marquee: [
      'Sezony',
      'Trendy',
      'Lookbook',
      'Drop',
      'UGC',
      'Kolekcje',
      'Styl',
    ],
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
    label: 'HoReCa',
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
          src: '/case-studies/julius-meinl/julius-meinl-szkolenia-1.png',
          alt: 'Czerwona filiżanka Julius Meinl ze spodkiem na słonecznym tarasie',
          width: 440,
          height: 440,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-lifestyle-2.png',
          alt: 'Dwie filiżanki Julius Meinl na stoliku — kreacja „ona mówi, ona słucha”',
          width: 1266,
          height: 1566,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-3-cut.webp?v=2',
          alt: 'Kreacja Instagram „3 błędy w latte art” z czerwoną filiżanką kawy Julius Meinl',
          width: 320,
          height: 523,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-4.jpg',
          alt: 'Kreacja Instagram „Fakt czy mit” z filiżanką kawy Julius Meinl',
          width: 419,
          height: 581,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-eventy-1.png',
          alt: 'Grafika zapowiadająca polski finał Julius Meinl Barista Cup 2026 — plaża, piłka siatkowa i filiżanka espresso',
          width: 1574,
          height: 1572,
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
      title: 'Social media dla branży HoReCa',
      description:
        'Prowadzimy social media restauracji, kawiarni i barów. Apetyczny food content, budowanie atmosfery miejsca i komunikacja, która zapełnia stoliki.',
    },
    tagline:
      'HoReCa to branża apetytu. Budzimy go tam, gdzie zaczyna się głód — na feedzie. Food content i\u00A0komunikacja, która zapełnia stoliki.',
    brief: {
      pillars: [
        'Apetyczny content',
        'Sezonowość i trendy',
        'Zaangażowana społeczność',
      ],
      paragraphs: [
        {
          text: 'Branża HoReCa to kategoria, w\u00A0której konsumenci kupują nie tylko produkt, ale przede wszystkim doświadczenie. W\u00A0social mediach liczą się emocje, estetyka i\u00A0umiejętność opowiadania historii, które zachęcają odbiorców do odwiedzenia lokalu lub sięgnięcia po produkt.',
          strong:
            'W\u00A0social mediach liczą się emocje, estetyka i\u00A0umiejętność opowiadania historii, które zachęcają odbiorców do odwiedzenia lokalu lub sięgnięcia po produkt.',
        },
        {
          text: 'Według raportu PMR „Rynek HoReCa w\u00A0Polsce 2025” aż 58% przedstawicieli pokolenia Z\u00A0sprawdza opinie dostępne w\u00A0internecie przed pierwszą wizytą w\u00A0lokalu gastronomicznym. To pokazuje, jak dużą rolę odgrywają dziś media społecznościowe, rekomendacje i\u00A0autentyczne doświadczenia klientów. Dlatego tworzymy komunikację, która łączy atrakcyjny content wizualny, sezonowe trendy i\u00A0angażujące formaty, wspierając marki w\u00A0budowaniu rozpoznawalności i\u00A0lojalnej społeczności.',
        },
      ],
    },
    chips: [
      { value: 'Food content', label: 'zdjęcia, po których słychać głód' },
      { value: 'Atmosfera', label: 'miejsce, do którego chce się wrócić' },
      { value: 'Rezerwacje', label: 'feed, który zapełnia stoliki' },
    ],
    manifesto: {
      lead: 'Głód zaczyna się na feedzie.',
      rest: 'Zanim gość przekroczy próg, apetyczny content i\u00A0atmosfera miejsca już zapełniają stoliki.',
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
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-6.jpg',
          alt: 'Zdjęcie z autorskiej sesji w Dolinie Charlotty — ceglany budynek hotelowy z balkonami udekorowanymi czerwonymi kwiatami latem',
          width: 555,
          height: 832,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-3-cut.webp?v=2',
          alt: 'Relacja na Instagramie Doliny Charlotty — lama z Zoo Charlotta i ankieta „Będziecie?” z wynikiem 71% głosów na „Tak!”',
          width: 412,
          height: 735,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-4-cut.webp?v=2',
          alt: 'Reklamowa kreacja Dolina Charlotty „Bilety do ZOO za pół ceny!” z dwoma lemurami',
          width: 412,
          height: 501,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-5-cut.webp?v=2',
          alt: 'Kadr z reelsa Doliny Charlotty — ujęcie nad wodą z hasłem „Odwiedź Dolinę Charlotty”',
          width: 398,
          height: 485,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'skibooking',
        title: 'Rezerwacje narciarskie online',
      },
      {
        slug: 'getaway',
        title: 'Kreator podróży w social mediach',
      },
    ],
    meta: {
      // Leads with the demand phrase ("marketing hotelu"); the old title's
      // wording is not lost — "social media dla hoteli" moves into the
      // description, which is where the spec allows it to live.
      title: 'Marketing hotelu i miejsc wypoczynkowych',
      description:
        'Prowadzimy social media dla hoteli, resortów i SPA. Aspiracyjny travel content i komunikacja, która zamienia scroll w rezerwację.',
    },
    // Rewritten to the title's search intent: someone looking for hotel
    // marketing should meet those words in the first sentence they read, not a
    // brand aphorism. COPY STATUS: approved by the content team 2026-08-14.
    tagline:
      'Marketing hotelu zaczyna się na długo przed rezerwacją — w\u00A0scrollu. Prowadzimy social media hoteli, resortów i\u00A0SPA: aspiracyjny travel content, który sprzedaje pobyt, zanim gość spakuje walizkę.',
    brief: {
      pillars: [
        'Storytelling doświadczeń',
        'Inspirujący content wizualny',
        'Budowanie lojalności gości',
      ],
      paragraphs: [
        {
          text: 'W\u00A0branży hotelarskiej i\u00A0turystycznej klienci nie kupują noclegu czy pobytu — kupują emocje, wspomnienia i\u00A0wyjątkowe doświadczenia. To właśnie dlatego social media odgrywają tak ważną rolę w\u00A0inspirowaniu do podróży i\u00A0budowaniu wizerunku miejsca.',
        },
        {
          text: 'Jak wynika z\u00A0badania Polskiej Organizacji Turystycznej „Turystyka w\u00A0czasach zmian 2025”, aż 77% Polaków przed wyjazdem poszukuje inspiracji i\u00A0informacji w\u00A0internecie. Oznacza to, że atrakcyjny content wizualny, autentyczne historie i\u00A0konsekwentnie budowany wizerunek marki mają realny wpływ na wybór miejsca wypoczynku.',
          strong:
            'aż 77% Polaków przed wyjazdem poszukuje inspiracji i\u00A0informacji w\u00A0internecie.',
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
      rest: 'Aspiracyjny travel content sprzedaje miejsce, zanim gość w\u00A0ogóle spakuje walizkę.',
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
      cardTitle: 'Deweloper na Facebooku, Instagramie i\u00A0LinkedInie',
      creatives: [
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-1-cut.webp?v=2',
          alt: 'Kadr z nagrania wideo ED Invest — widok z lotu ptaka na realizowaną inwestycję mieszkaniową na tle panoramy miasta',
          width: 694,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-3-cut.webp?v=2',
          alt: 'Relacja wideo z eventu branżowego Orange Ball — scena z logo ED Invest podczas wydarzenia',
          width: 694,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-4-cut.webp?v=2',
          alt: 'Zdjęcie grupowe przedstawicieli ED Invest z wyróżnieniem podczas branżowej gali',
          width: 694,
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
      // Leads with the demand phrase, as on the hotels page; the old title's
      // wording carries on in the description.
      title: 'Marketing nieruchomości i deweloperów',
      description:
        'Prowadzimy social media dla deweloperów i marek nieruchomości. Prezentacja inwestycji, budowanie zaufania i komunikacja, która generuje leady.',
    },
    // Rewritten to the title's search intent. COPY STATUS: approved by the
    // content team 2026-08-14.
    tagline:
      'Marketing nieruchomości to praca na najdłuższej ścieżce zakupowej, jaka istnieje. Prowadzimy social media deweloperów i\u00A0biur: prezentujemy inwestycje, budujemy zaufanie, które poprzedza decyzję, i\u00A0generujemy leady.',
    brief: {
      pillars: [
        'Storytelling inwestycji',
        'Personal branding ekspertów',
        'Budowanie zaufania',
      ],
      paragraphs: [
        {
          text: 'Zakup nieruchomości to jedna z\u00A0najważniejszych decyzji finansowych w\u00A0życiu konsumentów. W\u00A0branży deweloperskiej social media pełnią znacznie większą rolę niż tylko kanał sprzedażowy — pomagają budować wiarygodność marki, edukować klientów i\u00A0prezentować styl życia związany z\u00A0inwestycją.',
        },
        {
          text: 'Według raportu Otodom „Szczęśliwy Dom. Mieszkaniowe oczekiwania Polaków 2025” aż 80% Polaków deklaruje, że poszukując nieruchomości korzysta z\u00A0internetu. Oznacza to, że obecność marki w\u00A0digitalu często stanowi pierwszy punkt kontaktu z\u00A0potencjalnym klientem, a\u00A0transparentna i\u00A0ekspercka komunikacja może realnie wpływać na decyzje zakupowe.',
          strong:
            'obecność marki w\u00A0digitalu często stanowi pierwszy punkt kontaktu z\u00A0potencjalnym klientem, a\u00A0transparentna i\u00A0ekspercka komunikacja może realnie wpływać na decyzje zakupowe.',
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
      rest: 'Poprzedza ją zaufanie — budujemy je prezentacją inwestycji i\u00A0komunikacją, która generuje realne leady.',
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
      cardTitle: 'Premiera filmu i\u00A035 mln wyświetleń',
      creatives: [
        {
          src: '/case-studies/skrzat/skrzat-gallery-1.jpg',
          alt: 'Grafika promocyjna „Ile skrzatów kryje się w lesie?” — sylwetki skrzatów ukryte w słonecznym lesie',
          width: 540,
          height: 675,
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
      title: 'Social media dla branży rozrywkowej',
      description:
        'Prowadzimy social media marek rozrywkowych — eventy, kultura, premiery. Budujemy hype, aktywujemy społeczność i tworzymy content, który żyje w komentarzach.',
    },
    tagline:
      'Rozrywka to branża walki o\u00A0uwagę. Wygrywamy ją treścią — budujemy hype wokół premier i\u00A0wydarzeń, i\u00A0aktywujemy społeczność.',
    brief: {
      pillars: [
        'Marketing społeczności',
        'Sezonowe kampanie',
        'Real-time marketing',
      ],
      paragraphs: [
        {
          text: 'Branża rozrywkowa opiera się na emocjach, doświadczeniach i\u00A0wspólnie spędzanym czasie. W\u00A0świecie social mediów kluczowe znaczenie ma tworzenie angażujących treści, które nie tylko informują o\u00A0ofercie, ale przede wszystkim zachęcają odbiorców do aktywnego uczestnictwa i\u00A0dzielenia się swoimi doświadczeniami.',
        },
        {
          text: 'Jak wynika z\u00A0raportu Deloitte „Digital Consumer Trends 2025”, konsumenci coraz częściej poszukują rozrywki, która pozwala im budować relacje i\u00A0tworzyć wspólne wspomnienia. Dlatego marki z\u00A0tej kategorii powinny być obecne tam, gdzie toczą się rozmowy odbiorców, reagować na bieżące trendy i\u00A0konsekwentnie budować społeczność wokół swoich działań.',
          strong:
            'marki z\u00A0tej kategorii powinny być obecne tam, gdzie toczą się rozmowy odbiorców, reagować na bieżące trendy i\u00A0konsekwentnie budować społeczność wokół swoich działań.',
        },
      ],
    },
    chips: [
      { value: 'Hype', label: 'napięcie przed premierą' },
      { value: 'Społeczność', label: 'odbiorcy, którzy współtworzą' },
      { value: 'Zaangażowanie', label: 'treść, którą się udostępnia' },
    ],
    manifesto: {
      lead: 'Uwaga to waluta rozrywki.',
      rest: 'Budujemy hype wokół premier, aktywujemy społeczność i\u00A0tworzymy treści, które żyją w\u00A0komentarzach.',
    },
    marquee: [
      'Eventy',
      'Kultura',
      'Premiery',
      'Społeczność',
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
