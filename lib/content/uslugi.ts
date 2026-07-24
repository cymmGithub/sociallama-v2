/**
 * Canonical service list + per-service page content for `/uslugi/<slug>`.
 *
 * Single source of truth (mirrors `branze.ts`): the overlay-menu USŁUGI column,
 * the footer NAWIGACJA `/uslugi` link, `generateStaticParams`, hreflang pairs,
 * and the sitemap all derive from `SERVICES` in this order, in both locales.
 * `uslugi.en.ts` supplies the English twin, each export
 * `satisfies LocalizedUslugi['<key>']` — the translation-parity gate,
 * mirroring `home.ts` / `o-nas.ts` / `branze.ts`.
 *
 * Composition over template (design D1): each service declares an ordered
 * `sections` array of discriminated-union descriptors and the page renders them
 * in order. The allowed kinds are fixed by the spec: `hero`, `platforms`,
 * `triptych`, `partner`, `showreel`, `proof`. Sprzedaż's dashboards reuse the
 * `platforms` kind with a `dashboard` panel instead of a `cube` (O1), so no new
 * kind is introduced.
 *
 * Copy status: DRAFT, pending user review (tasks 6.1–6.3). The content/sprzedaż/
 * kreacje intros are adapted from the homepage `services[].bodyLong`, which was
 * written for these very pages; strategia/audyt/influencer are fresh drafts.
 *
 * Asset status: all seven platform cubes exist and are web-optimized (the three
 * new ones — YouTube/Instagram/TikTok — were generated to match the original
 * four). Partner showcase images and the Kreacje showreel clips are still
 * user-supplied and omitted until delivered — the renderer drops the block
 * rather than showing an empty frame.
 */

import type { Localized } from '@/lib/i18n/parity'

// —— Shared chrome copy (section-level, not per-service) ———————————————————————

export const chrome = {
  /** Breadcrumb prefix shown top-left on every service page. */
  sectionLabel: 'USŁUGI',
  /** Related-posts heading on platform sections (design D5). */
  relatedKicker: 'PRZECZYTAJ RÓWNIEŻ',
  proofCta: 'ZOBACZ CASE STUDY',
  partnerKicker: 'CZĘŚĆ GRUPY GOOD ONE',
  // Closing CTA card mirrors the branze one so casing/lead match across pages.
  ctaEyebrow: 'Twój ruch',
  ctaHeadline: 'Zróbmy to razem',
  ctaText: 'Opowiedz nam o swoim wyzwaniu — pokażemy, jak możemy pomóc.',
  ctaButton: 'Bezpłatna konsultacja',
  ctaHref: '/kontakt',
  // `/uslugi` index chrome.
  index: {
    title: 'Usługi',
    intro:
      'Od strategii po sprzedaż — pełne spektrum działań w social mediach. Wybierz obszar, w którym możemy pomóc Twojej marce.',
    cardCta: 'Dowiedz się więcej',
  },
} as const

// —— Content shape ————————————————————————————————————————————————————————————
// Documented here; parity with the EN twin is enforced via `LocalizedUslugi`.

/** The seven platforms covered on the CONTENT page (design D6). */
export type PlatformKey =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'x'
  | 'linkedin'
  | 'pinterest'
  | 'youtube'

interface Panel {
  src: string
  alt: string
  width: number
  height: number
}

/**
 * A platform block. `cube` (transparent levitating render, CONTENT page) and
 * `dashboard` (an analytics panel, Sprzedaż — O1 reuse of the homepage panels)
 * are alternative media; a block with neither renders copy-only until its cube
 * is generated.
 */
interface PlatformItem {
  platform: PlatformKey
  name: string
  copy: string
  cube?: string
  dashboard?: Panel
}

/** A numbered triptych card. `icon` is a lucide icon name (repo rule: no glyphs). */
interface TriptychItem {
  icon: string
  title: string
  body: string
}

interface ShowreelClip {
  src: string
  poster: string
  alt: string
}

/** A proof card linking to an existing case study. `logo` is optional — set it
 *  only when the case study ships a logo asset; the card omits it otherwise. */
interface ProofCase {
  slug: string
  kicker: string
  title: string
  logo?: string
}

/**
 * Ordered section descriptors (design D1). `Localized` widens the `kind`
 * literal to `string`, so the renderer narrows by property presence, not by
 * `kind` — see `service-page.tsx`.
 */
export type ServiceSection =
  | { kind: 'hero'; title: string; intro: string }
  | { kind: 'platforms'; items: readonly PlatformItem[] }
  | { kind: 'triptych'; kicker: string; items: readonly TriptychItem[] }
  | {
      kind: 'partner'
      partner: 'diea' | 'folks' | 'tymkor'
      name: string
      /** Partner logo (light-on-dark). Rendered in the cover in place of the
       *  text wordmark; `name` remains the alt text. */
      logo?: string
      /** Short brand line under the wordmark (e.g. DIEA's "from idea to Design"). */
      tagline?: string
      copy: string
      href: string
      /** Showcase image — user-supplied; block renders copy-only until it lands. */
      image?: Panel
      /**
       * A showreel/video. When present the block renders as a full-bleed
       * cinematic cover (video background + partner branding) instead of the
       * copy+image layout — used for the DIEA reel on Kreacje.
       */
      video?: { src: string; mobileSrc?: string; poster: string; alt: string }
    }
  | { kind: 'showreel'; kicker: string; clips: readonly ShowreelClip[] }
  | {
      kind: 'proof'
      kicker: string
      heading: string
      cases: readonly ProofCase[]
    }

export interface Service {
  /** Stable, locale-neutral key (equals the PL slug) — pairs PL↔EN for hreflang. */
  id: string
  /** This-locale route slug. */
  slug: string
  /** Counterpart-locale slug (hreflang alternate). */
  pairSlug: string
  /** Menu/card label. */
  label: string
  meta: { title: string; description: string }
  /** One-line summary for the `/uslugi` index card. */
  summary: string
  /** Ordered page body (design D1/D2). Always opens with a `hero`. */
  sections: readonly ServiceSection[]
}

// —— Canonical list (design D2, menu order) ———————————————————————————————————

export const SERVICES = [
  // 1 — Strategia · hero · triptych(Audyt→Strategia→Wdrożenie) · proof
  {
    id: 'strategia',
    slug: 'strategia',
    pairSlug: 'strategy',
    label: 'Strategia',
    meta: {
      title: 'Strategia social media | Social Lama',
      description:
        'Budujemy strategię komunikacji w social mediach opartą na danych — od audytu i grupy docelowej po mierzalne cele i wdrożenie.',
    },
    summary:
      'Punkt wyjścia każdej współpracy — plan oparty na danych, nie na przeczuciu.',
    sections: [
      {
        kind: 'hero',
        title: 'Strategia',
        intro:
          'Strategia to nasz punkt wyjścia: poznajemy Wasze potrzeby i możliwości, grupę docelową oraz wartości i charakter marki, by zbudować skuteczną komunikację w mediach społecznościowych. Na tej bazie wyznaczamy mierzalne cele, dobieramy właściwe narzędzia i konsekwentnie realizujemy plan.',
      },
      {
        kind: 'triptych',
        kicker: 'JAK PRACUJEMY',
        items: [
          {
            icon: 'Search',
            title: 'Audyt',
            body: 'Analizujemy Waszą obecność w social mediach, konkurencję i grupę docelową. Zaczynamy od twardych danych, nie od założeń.',
          },
          {
            icon: 'Compass',
            title: 'Strategia',
            body: 'Wyznaczamy mierzalne cele, dobieramy platformy, formaty i ton komunikacji. Powstaje plan, który wiadomo jak rozliczyć.',
          },
          {
            icon: 'Rocket',
            title: 'Wdrożenie',
            body: 'Realizujemy plan, monitorujemy działania na bieżąco i regularnie raportujemy wyniki. Strategia żyje i reaguje na dane.',
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'DOWÓD',
        heading: 'Strategia, która zadziałała',
        // O2 (confirm during review): Volvo = długofalowa strategia marki.
        cases: [
          {
            slug: 'volvo',
            logo: '/case-studies/volvo/volvo-logo.png',
            kicker: 'CASE STUDY',
            title: 'Budowa marek Volvo na LinkedInie, Facebooku i Instagramie',
          },
        ],
      },
    ],
  },

  // 2 — Content · hero · platforms(7)  [DESIGNED — figma-content-*.jpeg]
  {
    id: 'content',
    slug: 'content',
    pairSlug: 'content',
    label: 'Content',
    meta: {
      title: 'Content i prowadzenie social media | Social Lama',
      description:
        'Prowadzimy social media marek na siedmiu platformach — Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, YouTube. Content dopasowany do każdego kanału.',
    },
    summary:
      'Prowadzenie profili i content dopasowany do specyfiki każdej platformy.',
    sections: [
      {
        kind: 'hero',
        title: 'Content',
        intro:
          'Każda platforma rządzi się własnymi prawami — inny format, inny język, inny odbiorca. Tworzymy content dopasowany do specyfiki każdego kanału i konsekwentnie budujemy obecność marki tam, gdzie są jej odbiorcy.',
      },
      {
        kind: 'platforms',
        items: [
          {
            platform: 'facebook',
            name: 'Facebook',
            copy: 'Budujemy społeczność i utrzymujemy stały kontakt z odbiorcami — od postów angażujących po obsługę społeczności i komunikację w grupach.',
            cube: '/assets/cube-facebook-70862a.png',
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'Estetyczny feed, rolki i relacje, które budują pożądanie wokół marki. Łączymy spójny wizerunek z formatami, które napędzają zasięg.',
            cube: '/assets/cube-instagram.png',
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'Krótkie wideo, trendy i real-time marketing. Tworzymy content, który wpisuje się w język platformy i realnie się rozprzestrzenia.',
            cube: '/assets/cube-tiktok.png',
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Szybka, reaktywna komunikacja i budowanie eksperckiego głosu marki w czasie rzeczywistym.',
            cube: '/assets/cube-x-5d9863.png',
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Personal branding ekspertów i komunikacja B2B, która buduje autorytet marki i realne relacje biznesowe.',
            cube: '/assets/cube-linkedin.png',
          },
          {
            platform: 'pinterest',
            name: 'Pinterest',
            copy: 'Content, który żyje długo i napędza ruch — inspiracje, poradniki i wizualne kolekcje wpisane w intencje wyszukiwania.',
            cube: '/assets/cube-pinterest-6e33ed.png',
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Wideo długie i krótkie, które budują subskrypcję i pozycjonują markę jako źródło wiedzy w swojej kategorii.',
            cube: '/assets/cube-youtube.png',
          },
        ],
      },
    ],
  },

  // 3 — Sprzedaż · hero · triptych · platforms-as-dashboards(6) · proof
  {
    id: 'sprzedaz',
    slug: 'sprzedaz',
    pairSlug: 'sales',
    label: 'Sprzedaż',
    meta: {
      title: 'Social media, które sprzedają | Social Lama',
      description:
        'Prowadzimy social media nastawione na sprzedaż. Skuteczność mierzymy nie lajkami, a wynikami Twojego biznesu — z twardymi danymi z kampanii.',
    },
    summary:
      'Komunikacja rozliczana z najważniejszej roli — sprzedaży produktów i usług.',
    sections: [
      {
        kind: 'hero',
        title: 'Sprzedaż',
        intro:
          'Tworząc ofertę dla Twojej marki dbamy o to, by komunikacja spełniała swoją najważniejszą rolę: sprzedaż produktów lub usług. Skuteczność naszych działań mierzymy nie tylko wskaźnikami w social mediach, ale przede wszystkim — sukcesem Twojego biznesu.',
      },
      {
        kind: 'triptych',
        kicker: 'JAK SPRZEDAJEMY',
        items: [
          {
            icon: 'Target',
            title: 'Cel',
            body: 'Zaczynamy od konkretnego celu biznesowego — sprzedaż, leady, ruch — i pod niego układamy całą komunikację.',
          },
          {
            icon: 'ShoppingCart',
            title: 'Kampania',
            body: 'Łączymy content organiczny z płatnymi kampaniami. Docieramy do właściwych odbiorców we właściwym momencie ścieżki zakupowej.',
          },
          {
            icon: 'BarChart3',
            title: 'Wynik',
            body: 'Mierzymy, optymalizujemy i raportujemy. Liczy się to, co dzieje się po kliknięciu — nie sam zasięg.',
          },
        ],
      },
      {
        kind: 'platforms',
        // O1: reuse of the homepage's six sprzedaż dashboard panels.
        items: [
          {
            platform: 'facebook',
            name: 'Meta Ads',
            copy: 'Kampanie sprzedażowe w ekosystemie Meta — precyzyjne targetowanie i rozliczenie z realnej konwersji.',
            dashboard: {
              src: '/assets/sprzedaz-meta-ads.png',
              alt: 'Menedżer reklam Meta — wyniki kampanii sprzedażowych',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Wzrost wyświetleń i zaangażowania przełożony na ruch i rozpoznawalność marki.',
            dashboard: {
              src: '/assets/sprzedaz-x.png',
              alt: 'Analityka X — wzrost wyświetleń i zaangażowania',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'Statystyki wyświetleń i obserwujących, które rosną wraz z zasięgiem sprzedażowych kampanii wideo.',
            dashboard: {
              src: '/assets/sprzedaz-tiktok.png',
              alt: 'TikTok Studio — statystyki wyświetleń i obserwujących',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Wzrost wyświetleń i subskrypcji budujący długofalową obecność marki w wideo.',
            dashboard: {
              src: '/assets/sprzedaz-youtube.png',
              alt: 'Statystyki kanału YouTube — wzrost wyświetleń',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Wzrost odwiedzin i obserwujących profilu firmowego, przekładający się na relacje B2B.',
            dashboard: {
              src: '/assets/sprzedaz-linkedin.png',
              alt: 'Analiza strony LinkedIn — wzrost odwiedzin i obserwujących',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'Wzrost zasięgu i obserwujących, który zamienia uwagę w realny ruch na stronie.',
            dashboard: {
              src: '/assets/sprzedaz-instagram.png',
              alt: 'Statystyki Instagrama — wzrost zasięgu i obserwujących',
              width: 900,
              height: 1117,
            },
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'DOWÓD',
        heading: 'Wyniki, które mówią same za siebie',
        // O2 (confirm during review): iRobot = wyniki zasięgowo-sprzedażowe.
        cases: [
          {
            slug: 'irobot',
            logo: '/case-studies/irobot/irobot-logo.png',
            kicker: 'CASE STUDY',
            title:
              'iRobot — humor i edukacja, które budują markę na YouTube i TikToku',
          },
        ],
      },
    ],
  },

  // 4 — Kreacje & Wideo · hero · triptych · partner(diea) · showreel  [DESIGNED]
  {
    id: 'kreacje-wideo',
    slug: 'kreacje-wideo',
    pairSlug: 'creative-video',
    label: 'Kreacje & Wideo',
    meta: {
      title: 'Kreacje graficzne i wideo | Social Lama',
      description:
        'Grafiki, wideo, rolki i animacje — pełne spektrum kreacji w social mediach. Głębokie zaplecze wideograficzne i copywriterskie, dopasowane do trendów.',
    },
    summary: 'Pełne spektrum kreacji — od grafiki i copy po wideo i animacje.',
    sections: [
      {
        kind: 'hero',
        title: 'Kreacje & Wideo',
        intro:
          'Grafiki, karuzele, infografiki, rolki, animacje, wizualizacje — głębokie zaplecze wideograficzne oraz copywriterskie pozwala nam oferować pełne spektrum kreacji w social mediach. Dbamy o różnorodność przekazów i dopasowanie ich do trendów oraz preferencji odbiorców.',
      },
      {
        kind: 'triptych',
        kicker: 'CO TWORZYMY',
        items: [
          {
            icon: 'PenTool',
            title: 'Obsługa graficzna',
            body: 'Posty, karuzele, infografiki i key visuale — spójny system wizualny, który wyróżnia markę w feedzie.',
          },
          {
            icon: 'Video',
            title: 'Realizacje wideo',
            body: 'Od koncepcji przez zdjęcia po montaż. Rolki, reklamy i formaty natywne nagrywane z myślą o platformie.',
          },
          {
            icon: 'Sparkles',
            title: 'Animacje',
            body: 'Motion design i animacje, które nadają markom ruch — od prostych bumperów po rozbudowane wizualizacje.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'diea',
        name: 'Diea',
        logo: '/assets/diea-logo-light.png',
        tagline: 'from idea to Design',
        copy: 'Największe realizacje wideo tworzymy z DIEA — studiem produkcyjnym z grupy Good One. Pełne zaplecze sprzętowe i produkcyjne pozwala nam realizować projekty każdej skali.',
        href: '/kontakt',
        // DIEA 2025 showreel, presented as a full-bleed cover (user-supplied).
        video: {
          src: '/clips/diea-showreel.mp4',
          mobileSrc: '/clips/diea-showreel-mobile.mp4',
          poster: '/clips/diea-showreel-poster.jpg',
          alt: 'Showreel wideo DIEA 2025 — realizacje reklamowe, eventowe i produktowe',
        },
      },
    ],
  },

  // 5 — Audyt i konsultacje · hero · triptych(co dostajesz) · proof
  {
    id: 'audyt-i-konsultacje',
    slug: 'audyt-i-konsultacje',
    pairSlug: 'audit-consulting',
    label: 'Audyt i konsultacje',
    meta: {
      title: 'Audyt i konsultacje social media | Social Lama',
      description:
        'Audyt Waszej obecności w social mediach i konsultacje strategiczne. Konkretne wnioski i rekomendacje, które możecie wdrożyć od razu.',
    },
    summary:
      'Zewnętrzne spojrzenie na Waszą komunikację — konkretne wnioski i rekomendacje.',
    sections: [
      {
        kind: 'hero',
        title: 'Audyt i konsultacje',
        intro:
          'Czasem nie potrzebujecie pełnej obsługi, tylko świeżego, eksperckiego spojrzenia. Analizujemy Waszą obecność w social mediach i dostarczamy konkretne wnioski oraz rekomendacje — gotowe do wdrożenia, niezależnie od tego, kto prowadzi Wasze kanały.',
      },
      {
        kind: 'triptych',
        kicker: 'CO DOSTAJESZ',
        items: [
          {
            icon: 'ClipboardCheck',
            title: 'Audyt',
            body: 'Pełna analiza Waszych profili, treści i wyników na tle konkurencji. Bez upiększania — pokazujemy, co działa, a co nie.',
          },
          {
            icon: 'Lightbulb',
            title: 'Rekomendacje',
            body: 'Konkretna lista rekomendacji uszeregowanych według wpływu. Wiecie dokładnie, co zmienić i dlaczego.',
          },
          {
            icon: 'MessageSquare',
            title: 'Konsultacje',
            body: 'Warsztat lub sesja konsultacyjna z zespołem — omawiamy wnioski i pomagamy zaplanować kolejne kroki.',
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'DOWÓD',
        heading: 'Wiemy, na co patrzeć',
        // O2 (confirm during review): Volvo = długofalowa, dojrzała obecność.
        cases: [
          {
            slug: 'volvo',
            logo: '/case-studies/volvo/volvo-logo.png',
            kicker: 'CASE STUDY',
            title: 'Budowa marek Volvo na LinkedInie, Facebooku i Instagramie',
          },
        ],
      },
    ],
  },

  // 6 — Influencer marketing · hero · triptych · partner(folks) · proof
  {
    id: 'influencer-marketing',
    slug: 'influencer-marketing',
    pairSlug: 'influencer-marketing',
    label: 'Influencer marketing',
    meta: {
      title: 'Influencer marketing | Social Lama',
      description:
        'Kampanie influencer marketingowe — dobór twórców, strategia współpracy i realizacja. Autentyczne treści, które budują zasięg i zaufanie.',
    },
    summary:
      'Kampanie z twórcami — od doboru influencerów po realizację i rozliczenie.',
    sections: [
      {
        kind: 'hero',
        title: 'Influencer marketing',
        intro:
          'Dobrze dobrany twórca mówi do swojej społeczności jej językiem — i buduje zaufanie, którego marka sama nie kupi. Prowadzimy kampanie influencer marketingowe od strategii i doboru twórców po realizację i rozliczenie efektów.',
      },
      {
        kind: 'triptych',
        kicker: 'JAK DZIAŁAMY',
        items: [
          {
            icon: 'Users',
            title: 'Dobór twórców',
            body: 'Dobieramy influencerów po dopasowaniu do marki i realnym zaangażowaniu społeczności — nie po samej liczbie obserwujących.',
          },
          {
            icon: 'Megaphone',
            title: 'Kampania',
            body: 'Układamy strategię współpracy, briefujemy twórców i pilnujemy, by treści były autentyczne i spójne z marką.',
          },
          {
            icon: 'HeartHandshake',
            title: 'Relacje',
            body: 'Budujemy długofalowe relacje z twórcami — powracające współprace działają lepiej niż jednorazowe akcje.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'folks',
        name: 'Folks',
        logo: '/assets/folks-logo-light.png',
        tagline: 'from creators to results',
        copy: 'W kampaniach influencerskich współpracujemy z Folks — agencją influencer marketingu z grupy Good One. Dostęp do sieci twórców i doświadczenie w kampaniach każdej skali.',
        href: '/kontakt',
        // Ambient creator footage (Pexels, free licence) — full-bleed cover.
        video: {
          src: '/clips/folks-cover.mp4',
          mobileSrc: '/clips/folks-cover-mobile.mp4',
          poster: '/clips/folks-cover-poster.jpg',
          alt: 'Twórca internetowy nagrywający materiał przy lampie pierścieniowej',
        },
        // image: user-supplied Folks showcase — omitted until delivered.
      },
      {
        kind: 'proof',
        kicker: 'DOWÓD',
        heading: 'Twórcy, którzy dowożą',
        // O2 (confirm during review): Pracuj.pl = kampania z twórcami + AR.
        cases: [
          {
            slug: 'pracuj-pl',
            logo: '/case-studies/pracuj-pl/pracuj-pl-logo.png',
            kicker: 'CASE STUDY',
            title: 'Pracuj.pl — humor, twórcy i filtr AR na TikToku',
          },
        ],
      },
    ],
  },
] as const satisfies readonly Service[]

// —— Derived navigation ————————————————————————————————————————————————————————
// The menu USŁUGI column keeps its own labels (it also carries /szkolenia, which
// is not a service page), so this list is for any surface that wants the six
// service links derived from the canonical source.
export const serviceNav = SERVICES.map((service) => ({
  label: service.label,
  href: `/uslugi/${service.slug}`,
}))

/** Lookup by this-locale slug (route params → page content). */
export function findService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug)
}

/**
 * The shape of every `/uslugi` content export. `uslugi.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedUslugi['<key>']` — the
 * translation-parity gate.
 */
export type UslugiContent = {
  chrome: typeof chrome
  services: typeof SERVICES
}

/** Same shape, literals widened so translations compile. */
export type LocalizedUslugi = Localized<UslugiContent>
