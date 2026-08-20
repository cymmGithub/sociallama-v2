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
 * `triptych`, `partner`, `showreel`, `proof`, `checklist`, `timeline`,
 * `banner`, `logoStrip`, `posts`. Sprzedaż's dashboards reuse the `platforms`
 * kind with a `dashboard` panel instead of a `cube` (O1), so no new kind is
 * introduced there.
 *
 * Copy status: Strategia, Audyt i konsultacje, Influencer marketing, and
 * Kampanie reklamowe carry client-supplied copy (documents delivered
 * 2026-07-25), compressed to the client's own SZKIELET wireframe rather than
 * imported verbatim (design D1). Content, Sprzedaż, and Kreacje & Wideo keep
 * their shipped drafts — no source document exists for them.
 *
 * One deliberate deviation from the client copy: their Kampanie reklamowe
 * document lists Google Ads, Meta Ads, and TikTok Ads under SEOFly's ADS tile.
 * Meta and TikTok stay on Sprzedaż, which already proves them with dashboard
 * panels; shipping the document as written would put two menu-adjacent pages in
 * competition for one enquiry. Pending client sign-off.
 *
 * Asset status: all seven platform cubes exist and are web-optimized (the three
 * new ones — YouTube/Instagram/TikTok — were generated to match the original
 * four). Partner showcase images and the Kreacje showreel clips are still
 * user-supplied and omitted until delivered — the renderer drops the block
 * rather than showing an empty frame.
 */

import { STARTING_PRICE } from '@/lib/content/pricing'
import type { SocialIconName } from '@/lib/content/socials'
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
  // The button carries the header CTA's wording (`nav.cta` in home.ts) — one
  // phrasing for one action, everywhere on the site.
  ctaHeadline: 'Zróbmy to razem',
  ctaText: 'Opowiedz nam o\u00A0swoim wyzwaniu — pokażemy, jak możemy pomóc.',
  ctaButton: 'Porozmawiajmy o Twoim biznesie',
  ctaHref: '/kontakt',
  // `/uslugi` index chrome.
  index: {
    title: 'Usługi',
    intro:
      'Od strategii po sprzedaż — pełne spektrum działań w\u00A0social mediach. Wybierz obszar, w\u00A0którym możemy pomóc Twojej marce.',
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

/** A triptych card. `icon` is a lucide icon name (repo rule: no glyphs). */
interface TriptychItem {
  icon: string
  title: string
  body: string
  /** Optional trailing link. Carries the ad-campaigns → sales cross-link the
   *  `services-pages` spec requires, on the ADS tile where someone hunting for
   *  paid social actually looks — rather than as a whole band of its own. */
  link?: SectionCta
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
  /** Does NOT name the client — the logo does that. See `brand`. */
  title: string
  /** The client's name. Required: the whole card is one link, so its accessible
   *  name is built from its contents, and since the title no longer carries the
   *  brand this is what the logo's `alt` contributes. Without it the card is a
   *  link to a case study that never says whose. */
  brand: string
  logo?: string
}

/** A single button. Shared by `hero` and `banner`. */
interface SectionCta {
  label: string
  href: string
}

/** One numbered step of a `timeline`. */
interface TimelineStep {
  title: string
  body: string
}

/** A platform mark in a `logoStrip`. `icon` names an inline `SocialGlyph`,
 *  painted through `currentColor` like the footer set. */
interface StripLogo {
  name: string
  icon: SocialIconName
}

/**
 * Who does what, as two lists rather than a paragraph about two lists. The
 * client documents state the division of responsibilities in prose; rendered
 * that way it is four lines to read, rendered this way it is one glance.
 * `partner` is always listed first, matching the cover lockup's order.
 */
interface PartnerSplit {
  partner: { label: string; items: readonly string[] }
  lama: { label: string; items: readonly string[] }
}

/**
 * One question and its answer. Plain strings on both sides, because this array
 * feeds the visible ledger AND the page's `FAQPage` JSON-LD — Google requires
 * the markup to match the rendered copy, so there is exactly one source for
 * both and nothing needs stripping before serialising.
 */
export interface FaqItem {
  question: string
  answer: string
}

/** A muted ambient loop painted behind a section, under a scrim. Decorative:
 *  the section reads identically from its copy alone. */
interface BackdropVideo {
  src: string
  mobileSrc?: string
  poster: string
  alt: string
}

/**
 * Ordered section descriptors (design D1). `Localized` widens the `kind`
 * literal to `string`, so TypeScript cannot narrow this union downstream — the
 * renderer dispatches on `kind` at runtime and casts per branch (design D8).
 * Note `items` is deliberately carried by three different kinds; that is safe
 * precisely because dispatch no longer looks at property presence.
 */
export type ServiceSection =
  | { kind: 'hero'; title: string; intro: string; cta?: SectionCta }
  | { kind: 'platforms'; items: readonly PlatformItem[] }
  /** `unnumbered` drops the `01/02/…` ordinal: a numbered list asserts a
   *  sequence, which is wrong for parallel capabilities (design D2). */
  | {
      kind: 'triptych'
      kicker: string
      unnumbered?: boolean
      items: readonly TriptychItem[]
    }
  | {
      kind: 'partner'
      partner: 'diea' | 'folks' | 'seofly' | 'tymkor'
      name: string
      /** Partner logo (light-on-dark). Rendered in the cover in place of the
       *  text wordmark; `name` remains the alt text. */
      logo?: string
      /** Short brand line under the wordmark (e.g. DIEA's "from idea to Design").
       *  Only ever a line the partner actually publishes — never invented. */
      tagline?: string
      /**
       * The collaboration pitch (design D1). With an array, the first entry is
       * the hook that rides the cover footage and the rest continue in a solid
       * plum panel directly below it — a paragraph over a moving clip is a
       * caption, four are an unreadable wall. A plain string stays the single
       * paragraph it always was and grows no panel.
       */
      copy: string | readonly string[]
      /** The division of responsibilities, split off the prose (design D7). */
      split?: PartnerSplit
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
  /**
   * A ticked list of deliverables. Both visuals are optional and mutually
   * exclusive in practice: `media` puts a graphic in a second column, while
   * `backdrop` replaces the sand band with an ambient loop and inverts the copy
   * to cream. With neither, the list simply runs full-width on sand — no empty
   * frame, no placeholder.
   */
  | {
      kind: 'checklist'
      kicker: string
      heading: string
      intro?: string
      items: readonly string[]
      media?: Panel
      backdrop?: BackdropVideo
    }
  /** An ordered process. A timeline, not cards — the client asked for the
   *  sequencing specifically, "bo pokazuje next stepy". */
  | {
      kind: 'timeline'
      kicker: string
      heading: string
      steps: readonly TimelineStep[]
    }
  /** A highlighted offer band with one CTA. Used by Strategia (strategy as a
   *  standalone service) and Audyt (book a consultation) — design D3. */
  | {
      kind: 'banner'
      heading: string
      body: string
      cta: SectionCta
    }
  | {
      kind: 'logoStrip'
      heading: string
      logos: readonly StripLogo[]
    }
  /**
   * Topical blog links, matched by category slug (design D5). The posts
   * themselves are server-fetched and handed to the renderer; zero matches
   * omits the whole section, heading included. PL only — the blog has no EN.
   */
  | {
      kind: 'posts'
      kicker: string
      heading: string
      categories: readonly string[]
    }
  /**
   * A page-level FAQ, rendered as a native `<details>` ledger like the
   * homepage's — the answers reach crawlers and answer engines whether or not
   * a row is open, which is the whole reason the page carries one. The same
   * array is lifted by the route to emit `FAQPage` JSON-LD (`faqItemsOf`).
   */
  | {
      kind: 'faq'
      kicker: string
      heading: string
      items: readonly FaqItem[]
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
  // 1 — Strategia · hero · triptych(4 korzyści) · checklist · timeline(4) ·
  //     banner · posts — the client's SZKIELET, in their order.
  {
    id: 'strategia',
    slug: 'strategia',
    pairSlug: 'strategy',
    label: 'Strategia',
    meta: {
      title: 'Strategia social media',
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
          'Skuteczna komunikacja w\u00A0social mediach nie zaczyna się od publikacji posta, kampanii reklamowej czy wyboru influencera — zaczyna się od strategii. To ona określa, do kogo marka mówi, jakie cele chce osiągnąć i\u00A0czym wyróżnia się na tle konkurencji. Tworzymy strategie social media i\u00A0digital dla marek, które chcą działać świadomie, konsekwentnie i\u00A0długofalowo.',
      },
      {
        kind: 'triptych',
        kicker: 'CO ZYSKUJESZ',
        items: [
          {
            icon: 'Compass',
            title: 'Jasny kierunek',
            body: 'Strategia porządkuje komunikację i\u00A0wyznacza priorytety. Zespół wie, które działania wspierają cele marki — a\u00A0które tylko wypełniają kalendarz.',
          },
          {
            icon: 'MessageSquare',
            title: 'Spójna komunikacja',
            body: 'Odbiorcy oczekują od marek konsekwencji. Wypracowujemy jednolity sposób mówienia we wszystkich kanałach, niezależnie od formatu i\u00A0platformy.',
          },
          {
            icon: 'Wallet',
            title: 'Lepszy budżet',
            body: 'Zaplanowane działania to mniejsze ryzyko nietrafionych inwestycji. Wskazujemy kanały i\u00A0formaty, które przyniosą największą wartość biznesową.',
          },
          {
            icon: 'BarChart3',
            title: 'Mierzalne efekty',
            body: 'Każda strategia zawiera konkretne cele i\u00A0wskaźniki efektywności, dzięki którym da się ocenić rezultaty, a\u00A0nie tylko o\u00A0nich dyskutować.',
          },
        ],
      },
      {
        kind: 'checklist',
        kicker: 'ZAKRES',
        heading: 'Co zawiera strategia?',
        intro:
          'Każdą strategię przygotowujemy indywidualnie — pod specyfikę marki, jej cele biznesowe i\u00A0potrzeby komunikacyjne. W\u00A0zależności od projektu dokument obejmuje m.in.:',
        items: [
          'Analizę marki, rynku i konkurencji',
          'Charakterystykę grupy docelowej',
          'Cele komunikacyjne',
          'Klimat, styl komunikacji i\u00A0filary contentowe',
          'Rekomendowane działania komunikacyjne',
        ],
        // The client asked for a visual here. No graphic was supplied, so the
        // section runs as a backdrop band instead of a copy+image split.
        // Ambient workshop footage (Pexels, free licence).
        backdrop: {
          src: '/clips/strategia-zakres.mp4',
          mobileSrc: '/clips/strategia-zakres-mobile.mp4',
          poster: '/clips/strategia-zakres-poster.jpg',
          alt: 'Zespół pracujący nad materiałami strategicznymi przy stole',
        },
      },
      {
        kind: 'timeline',
        kicker: 'PROCES',
        heading: 'Jak wygląda proces?',
        steps: [
          {
            title: 'Warsztat',
            body: 'Każdy projekt zaczynamy od rozmowy. Poznajemy markę, jej cele, wyzwania i\u00A0oczekiwania wobec działań marketingowych.',
          },
          {
            title: 'Analiza',
            body: 'Badamy rynek, konkurencję, dotychczasową komunikację i\u00A0zachowania odbiorców. Zbieramy dane i\u00A0wyciągamy z\u00A0nich wnioski.',
          },
          {
            title: 'Rekomendacje',
            body: 'Na tej podstawie przygotowujemy rekomendacje strategiczne — komunikacja, content, kanały i\u00A0działania reklamowe.',
          },
          {
            title: 'Prezentacja',
            body: 'Gotową strategię omawiamy na spotkaniu. Wyjaśniamy rekomendacje, odpowiadamy na pytania i\u00A0ustalamy kolejne kroki.',
          },
        ],
      },
      {
        kind: 'banner',
        heading: 'Potrzebujesz samej strategii? To możliwe.',
        body: 'Najczęściej realizujemy strategię razem z\u00A0wdrożeniem, ale przygotujemy też sam dokument — dla firm z\u00A0własnym zespołem marketingowym albo marek, które chcą zweryfikować obecny kierunek działań. Wycenę dopasujemy do zakresu projektu.',
        cta: { label: 'Zapytaj o wycenę strategii', href: '/kontakt' },
      },
      {
        kind: 'posts',
        kicker: 'Z BLOGA',
        heading: 'Poczytaj o strategii i marketingu',
        // Verified against the prod DB (task 4.1): these two categories hold 63
        // of the 79 published posts, so the section always fills.
        categories: ['marketing', 'social-media'],
      },
      // No `proof` section: the client's wireframe omits case studies here, and
      // cutting it resolves O2 — Volvo was the proof case on both this page and
      // Audyt i konsultacje, verbatim. It now appears on Audyt only.
    ],
  },

  // 2 — Content · hero · platforms(7)  [DESIGNED — figma-content-*.jpeg]
  {
    id: 'content',
    slug: 'content',
    pairSlug: 'content',
    label: 'Content',
    meta: {
      title: 'Content i prowadzenie social media',
      description:
        'Prowadzimy social media marek na siedmiu platformach — Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, YouTube. Content dopasowany do każdego kanału.',
    },
    summary:
      'Prowadzenie profili i\u00A0content dopasowany do specyfiki każdej platformy.',
    sections: [
      {
        kind: 'hero',
        title: 'Content',
        intro:
          'Każda platforma rządzi się własnymi prawami — inny format, inny język, inny odbiorca. Tworzymy content dopasowany do specyfiki każdego kanału i\u00A0konsekwentnie budujemy obecność marki tam, gdzie są jej odbiorcy.',
      },
      {
        kind: 'platforms',
        items: [
          {
            platform: 'facebook',
            name: 'Facebook',
            copy: 'Budujemy społeczność i\u00A0utrzymujemy stały kontakt z\u00A0odbiorcami — od postów angażujących po obsługę społeczności i\u00A0komunikację w\u00A0grupach.',
            cube: '/assets/cube-facebook-70862a.png',
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'Estetyczny feed, rolki i\u00A0relacje, które budują pożądanie wokół marki. Łączymy spójny wizerunek z\u00A0formatami, które napędzają zasięg.',
            cube: '/assets/cube-instagram.png',
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'Krótkie wideo, trendy i\u00A0real-time marketing. Tworzymy content, który wpisuje się w\u00A0język platformy i\u00A0realnie się rozprzestrzenia.',
            cube: '/assets/cube-tiktok.png',
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Szybka, reaktywna komunikacja i\u00A0budowanie eksperckiego głosu marki w\u00A0czasie rzeczywistym.',
            cube: '/assets/cube-x-5d9863.png',
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Personal branding ekspertów i\u00A0komunikacja B2B, która buduje autorytet marki i\u00A0realne relacje biznesowe.',
            cube: '/assets/cube-linkedin.png',
          },
          {
            platform: 'pinterest',
            name: 'Pinterest',
            copy: 'Content, który żyje długo i\u00A0napędza ruch — inspiracje, poradniki i\u00A0wizualne kolekcje wpisane w\u00A0intencje wyszukiwania.',
            cube: '/assets/cube-pinterest-6e33ed.png',
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Wideo długie i\u00A0krótkie, które budują subskrypcję i\u00A0pozycjonują markę jako źródło wiedzy w\u00A0swojej kategorii.',
            cube: '/assets/cube-youtube.png',
          },
        ],
      },
    ],
  },

  // 3 — Sprzedaż · hero · triptych · platforms-as-dashboards(6) · proof ·
  //     banner(cross-link)
  {
    id: 'sprzedaz',
    slug: 'sprzedaz',
    pairSlug: 'sales',
    label: 'Sprzedaż',
    meta: {
      title: 'Social media, które sprzedają',
      description:
        'Prowadzimy social media nastawione na sprzedaż. Skuteczność mierzymy nie lajkami, a wynikami Twojego biznesu — z twardymi danymi z kampanii.',
    },
    // Names the social platforms, to contrast with Kampanie reklamowe's search
    // on the /uslugi index — the only surface where the two are seen together.
    summary:
      'Sprzedaż w\u00A0social mediach — kampanie na Facebooku, Instagramie i\u00A0TikToku, rozliczane z\u00A0wyniku.',
    sections: [
      {
        kind: 'hero',
        title: 'Sprzedaż',
        intro:
          'Tworząc ofertę dla Twojej marki dbamy o\u00A0to, by komunikacja spełniała swoją najważniejszą rolę: sprzedaż produktów lub usług. Skuteczność naszych działań mierzymy nie tylko wskaźnikami w\u00A0social mediach, ale przede wszystkim — sukcesem Twojego biznesu.',
      },
      {
        kind: 'triptych',
        kicker: 'JAK SPRZEDAJEMY',
        items: [
          {
            icon: 'Target',
            title: 'Cel',
            body: 'Zaczynamy od konkretnego celu biznesowego — sprzedaż, leady, ruch — i\u00A0pod niego układamy całą komunikację.',
          },
          {
            icon: 'ShoppingCart',
            title: 'Kampania',
            body: 'Łączymy content organiczny z\u00A0płatnymi kampaniami. Docieramy do właściwych odbiorców we właściwym momencie ścieżki zakupowej.',
          },
          {
            icon: 'BarChart3',
            title: 'Wynik',
            body: 'Mierzymy, optymalizujemy i\u00A0raportujemy. Liczy się to, co dzieje się po kliknięciu — nie sam zasięg.',
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
            copy: 'Kampanie sprzedażowe w\u00A0ekosystemie Meta — precyzyjne targetowanie i\u00A0rozliczenie z\u00A0realnej konwersji.',
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
            copy: 'Wzrost wyświetleń i\u00A0zaangażowania przełożony na ruch i\u00A0rozpoznawalność marki.',
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
            copy: 'Statystyki wyświetleń i\u00A0obserwujących, które rosną wraz z\u00A0zasięgiem sprzedażowych kampanii wideo.',
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
            copy: 'Wzrost wyświetleń i\u00A0subskrypcji budujący długofalową obecność marki w\u00A0wideo.',
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
            copy: 'Wzrost odwiedzin i\u00A0obserwujących profilu firmowego, przekładający się na relacje B2B.',
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
            copy: 'Wzrost zasięgu i\u00A0obserwujących, który zamienia uwagę w\u00A0realny ruch na stronie.',
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
            brand: 'iRobot',
            title:
              'Humor i\u00A0edukacja, które budują markę na YouTube i\u00A0TikToku',
          },
        ],
      },
      {
        // D3, reciprocal: search lives with SEOFly on /uslugi/kampanie-reklamowe.
        // Named rather than implied, so a visitor who landed here hunting for
        // Google Ads is routed instead of bouncing.
        kind: 'banner',
        heading: 'Szukasz SEO i\u00A0kampanii w\u00A0Google?',
        body: 'Wyszukiwarką zajmuje się SEOFly — siostrzana agencja z\u00A0Grupy Good One. Tutaj prowadzimy sprzedaż w\u00A0social mediach, tam — widoczność i\u00A0kampanie w\u00A0Google.',
        cta: {
          label: 'Zobacz kampanie reklamowe',
          href: '/uslugi/kampanie-reklamowe',
        },
      },
    ],
  },

  // 4 — Kampanie reklamowe · hero · triptych(6 kafli, bez numeracji) ·
  //     partner(seofly) — the client's SZKIELET, minus the SEOFly case studies
  //     (none supplied; `proof` links only into our own collection). The
  //     reciprocal Sprzedaż cross-link rides the ADS tile rather than a banner:
  //     as a band it stacked a third plum slab under the partner block.
  {
    id: 'kampanie-reklamowe',
    slug: 'kampanie-reklamowe',
    pairSlug: 'ad-campaigns',
    label: 'Kampanie reklamowe',
    meta: {
      // D5: the label carries no term anyone searches this offer with, so the
      // title leads with the demand phrase instead. It names search as a
      // co-equal subject rather than trailing it after a comma — this page
      // routes Meta and TikTok ads to /uslugi/sprzedaz and sells search, so a
      // title that reads as a social-ads page alone would promise the wrong
      // thing. SEO and Google Ads are named outright in the description.
      title: 'Kampanie reklamowe w social media i wyszukiwarce',
      description:
        'Pozycjonowanie, kampanie Google Ads, audyty SEO, strony WWW oraz analityka i raportowanie. Obszar search i performance prowadzimy z SEOFly — agencją z Grupy Good One.',
    },
    // Names search, to contrast with Sprzedaż's social platforms on the index.
    summary:
      'Widoczność w\u00A0wyszukiwarce — SEO, Google Ads i\u00A0strony WWW, razem z\u00A0SEOFly.',
    sections: [
      {
        kind: 'hero',
        title: 'Kampanie reklamowe',
        intro:
          'Widoczność w\u00A0wyszukiwarce, kampanie w\u00A0Google i\u00A0strony, które realizują cele biznesowe. Obszar SEO i\u00A0performance rozwijamy razem z\u00A0SEOFly — siostrzaną agencją z\u00A0Grupy Good One. Od pozycjonowania i\u00A0audytów, przez treści pod SEO, po analitykę i\u00A0raportowanie.',
      },
      {
        kind: 'triptych',
        kicker: 'CO ROBIMY',
        // Six parallel capabilities, not a process — hence no ordinals (D2).
        // The default three-column grid gives the client's two rows of three.
        unnumbered: true,
        items: [
          {
            icon: 'Search',
            title: 'SEO',
            body: 'Zwiększamy widoczność marek w\u00A0wyszukiwarce Google, docierając do użytkowników dokładnie wtedy, gdy szukają produktów lub usług. Stawiamy na działania, które przekładają się na realny ruch i\u00A0wyniki biznesowe.',
          },
          {
            icon: 'MousePointerClick',
            title: 'ADS',
            // D1: Google only. Meta Ads and TikTok Ads stay on /uslugi/sprzedaz,
            // which already proves them with dashboard panels.
            body: 'Prowadzimy kampanie Google Ads, które wspierają sprzedaż, generują leady i\u00A0budują świadomość marki. Dobieramy działania do celów biznesowych i\u00A0stale optymalizujemy ich efektywność.',
            link: {
              label: 'Szukasz Meta lub TikTok? Zobacz Sprzedaż',
              href: '/uslugi/sprzedaz',
            },
          },
          {
            icon: 'PenTool',
            title: 'Content marketing',
            // "pod pozycjonowanie" is the client's own qualifier — it is what
            // separates this tile from /uslugi/content. Do not drop it.
            body: 'Tworzymy wartościowe treści pod pozycjonowanie, które budują eksperckość marki i\u00A0odpowiadają na potrzeby odbiorców na każdym etapie ścieżki zakupowej.',
          },
          {
            icon: 'ClipboardCheck',
            title: 'Audyty SEO',
            // "strony internetowe" likewise separates this from
            // /uslugi/audyt-i-konsultacje, which audits social media profiles.
            body: 'Analizujemy strony internetowe, identyfikujemy obszary wymagające poprawy i\u00A0przygotowujemy konkretne rekomendacje, które zwiększają widoczność oraz skuteczność działań.',
          },
          {
            icon: 'Globe',
            title: 'Strony WWW',
            body: 'Projektujemy i\u00A0wdrażamy nowoczesne strony internetowe, które nie tylko dobrze wyglądają, ale przede wszystkim realizują cele biznesowe i\u00A0wspierają pozyskiwanie klientów.',
          },
          {
            icon: 'BarChart3',
            title: 'Analityka i raportowanie',
            body: 'Mierzymy efekty działań i\u00A0analizujemy dane, aby podejmować trafne decyzje marketingowe. Regularne raportowanie pozwala stale rozwijać i\u00A0optymalizować prowadzone działania.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'seofly',
        name: 'SEOFly',
        // Reversed lockup: SEOFly ship no light-on-dark variant, so their
        // horizontal SVG has its #333333 wordmark recoloured to cream. Brand
        // green and the mark itself are untouched.
        logo: '/assets/seofly-logo-light.png',
        // No tagline — SEOFly publish none, and inventing one is the mistake
        // the Folks block already carries.
        // The client's document argues this across four beats: why one channel
        // is not enough, who does what, what the group model saves the client,
        // then the group line. Kept as four paragraphs rather than one wall.
        copy: [
          'Skuteczny marketing nie kończy się na jednym kanale. Marka, która świetnie radzi sobie w\u00A0social mediach, wciąż może być niewidoczna dla kogoś, kto szuka jej produktu w\u00A0Google — dlatego połączyliśmy siły z\u00A0SEOFly, agencją specjalizującą się w\u00A0SEO i\u00A0performance marketingu.',
          'Dla marki oznacza to jeden zespół zamiast dwóch agencji do skoordynowania, jeden brief zamiast tłumaczenia strategii po raz drugi i\u00A0jedno miejsce, w\u00A0którym spotykają się wszystkie kompetencje Grupy Good One — od social mediów, przez SEO i\u00A0performance, po PR, influencer marketing i\u00A0employer branding.',
          'Jeden partner. Wiele kompetencji. BETTER WORKS.',
        ],
        split: {
          partner: {
            label: 'SEOFly',
            items: [
              'SEO i\u00A0widoczność w\u00A0Google',
              'Kampanie Google Ads',
              'Strony WWW',
              'Analityka i\u00A0raportowanie',
            ],
          },
          lama: {
            label: 'Social Lama',
            items: [
              'Strategia komunikacji',
              'Content i\u00A0prowadzenie profili',
              'Kampanie w\u00A0social mediach',
              'Influencer marketing',
            ],
          },
        },
        href: '/kontakt',
        // Ambient search/performance footage (Pexels, free licence).
        video: {
          src: '/clips/seofly-cover.mp4',
          mobileSrc: '/clips/seofly-cover-mobile.mp4',
          poster: '/clips/seofly-cover-poster.jpg',
          alt: 'Praca na laptopie nad wynikami w wyszukiwarce',
        },
      },
    ],
  },

  // 5 — Kreacje & Wideo · hero · triptych · partner(diea) · showreel  [DESIGNED]
  {
    id: 'kreacje-wideo',
    slug: 'kreacje-wideo',
    pairSlug: 'creative-video',
    label: 'Kreacje & Wideo',
    meta: {
      title: 'Kreacje graficzne i wideo',
      description:
        'Grafiki, wideo, rolki i animacje — pełne spektrum kreacji w social mediach. Głębokie zaplecze wideograficzne i copywriterskie, dopasowane do trendów.',
    },
    summary:
      'Pełne spektrum kreacji — od grafiki i\u00A0copy po wideo i\u00A0animacje.',
    sections: [
      {
        kind: 'hero',
        title: 'Kreacje & Wideo',
        intro:
          'Grafiki, karuzele, infografiki, rolki, animacje, wizualizacje — głębokie zaplecze wideograficzne oraz copywriterskie pozwala nam oferować pełne spektrum kreacji w\u00A0social mediach. Dbamy o\u00A0różnorodność przekazów i\u00A0dopasowanie ich do trendów oraz preferencji odbiorców.',
      },
      {
        kind: 'triptych',
        kicker: 'CO TWORZYMY',
        items: [
          {
            icon: 'PenTool',
            title: 'Obsługa graficzna',
            body: 'Posty, karuzele, infografiki i\u00A0key visuale — spójny system wizualny, który wyróżnia markę w\u00A0feedzie.',
          },
          {
            icon: 'Video',
            title: 'Realizacje wideo',
            body: 'Od koncepcji przez zdjęcia po montaż. Rolki, reklamy i\u00A0formaty natywne nagrywane z\u00A0myślą o\u00A0platformie.',
          },
          {
            icon: 'Sparkles',
            title: 'Animacje',
            body: 'Motion design i\u00A0animacje, które nadają markom ruch — od prostych bumperów po rozbudowane wizualizacje.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'diea',
        name: 'Diea',
        logo: '/assets/diea-logo-light.png',
        tagline: 'from idea to Design',
        copy: 'Największe realizacje wideo tworzymy z\u00A0DIEA — studiem produkcyjnym z\u00A0grupy Good One. Pełne zaplecze sprzętowe i\u00A0produkcyjne pozwala nam realizować projekty każdej skali.',
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

  // 6 — Audyt i konsultacje · hero(+CTA) · checklist · logoStrip · banner ·
  //     proof · partner(seofly) — reshaped from the client doc as a productized
  //     service.
  {
    id: 'audyt-i-konsultacje',
    slug: 'audyt-i-konsultacje',
    pairSlug: 'audit-consulting',
    label: 'Audyt i konsultacje',
    meta: {
      // Leads with the demand phrase, not the nav label: "audyt social media"
      // is what people search; "Audyt i konsultacje" is what we call it.
      title: 'Audyt social media — analiza profili i konsultacje',
      description:
        'Audyt social media Twojej marki: analiza profili, komunikacji, contentu i działań reklamowych. Konkretne wnioski, rekomendacje do wdrożenia i konsultacja ze specjalistą.',
    },
    summary:
      'Zewnętrzne spojrzenie na Waszą komunikację — konkretne wnioski i\u00A0rekomendacje.',
    sections: [
      {
        kind: 'hero',
        title: 'Audyt i konsultacje',
        // D5: the client's "świeże spojrzenie" framing opens the page; the
        // title stays the service name, as every hero's does.
        intro:
          'Nie zawsze potrzeba nowej strategii — czasem wystarczy świeże spojrzenie z\u00A0zewnątrz. Potrzebujesz zweryfikować skuteczność swoich działań w\u00A0social mediach albo skonsultować pomysł z\u00A0ekspertem? Przeanalizujemy Twój profil, wskażemy mocne strony i\u00A0obszary do poprawy, a\u00A0podczas indywidualnej konsultacji omówimy konkretne rekomendacje oraz kolejne kroki.',
        cta: { label: 'Umów konsultację', href: '/kontakt' },
      },
      // The invented Audyt/Rekomendacje/Konsultacje triptych is gone (D7): the
      // client's six-item checklist below covers the same ground concretely, and
      // keeping both would state the offer twice on one page.
      {
        kind: 'checklist',
        kicker: 'ZAKRES',
        // D5: the client's own heading. The generic "Co obejmuje usługa?" it
        // replaces is not lost — it folds into the intro as the list's lead-in.
        heading: 'Zobacz swoją markę z\u00A0nowej perspektywy',
        intro:
          'Analizujemy profile marki w\u00A0social mediach, sprawdzamy komunikację, content, wyniki i\u00A0działania reklamowe, a\u00A0wnioski omawiamy podczas indywidualnej konsultacji. Co obejmuje usługa:',
        items: [
          'Analiza profili w social mediach',
          'Ocena strategii komunikacji i contentu',
          'Analiza działań reklamowych',
          'Wskazanie mocnych stron i\u00A0obszarów do poprawy',
          'Praktyczne rekomendacje do wdrożenia',
          '45-minutowa konsultacja online ze specjalistą Social Lamy',
        ],
      },
      {
        kind: 'logoStrip',
        heading: 'Przeprowadzamy audyty profili na:',
        // Existing monochrome marks only — no new artwork, and no separator
        // dots between them (explicit client direction). Same set and order as
        // the canonical `socials` row (home hero, o-nas hero, footer).
        logos: [
          { name: 'Facebook', icon: 'facebook' },
          { name: 'Instagram', icon: 'instagram' },
          { name: 'LinkedIn', icon: 'linkedin' },
          { name: 'TikTok', icon: 'tiktok' },
          { name: 'X', icon: 'x' },
          { name: 'YouTube', icon: 'youtube' },
          { name: 'Pinterest', icon: 'pinterest' },
        ],
      },
      {
        kind: 'banner',
        heading: 'Umów konsultację online',
        body: 'Masz pytanie, potrzebujesz drugiej opinii albo chcesz omówić wyzwania swojej marki? Umów 45-minutową konsultację online ze specjalistą Social Lamy — wspólnie przeanalizujemy Twoją sytuację, odpowiemy na pytania i\u00A0wskażemy najlepsze kierunki działań.',
        // The client wrote "Wybierz termin w kalendarzu", but this routes to the
        // contact form, not a scheduler (D4) — so it asks about a slot rather
        // than promising a calendar we don't show.
        cta: { label: 'Zapytaj o termin', href: '/kontakt' },
      },
      {
        kind: 'proof',
        kicker: 'DOWÓD',
        heading: 'Wiemy, na co patrzeć',
        // O2 resolved: Volvo is now the proof case here only — Strategia's
        // duplicate copy of this exact card was cut (see that service).
        cases: [
          {
            slug: 'volvo',
            logo: '/case-studies/volvo/volvo-logo.png?v=2',
            kicker: 'CASE STUDY',
            brand: 'Volvo',
            // Not a prefix strip: the brand was embedded in the sentence, so it
            // is rewritten rather than deleted. "marek" (plural) still points at
            // the two Volvo marks the study covers, which the logo names.
            title: 'Budowa marek na LinkedInie, Facebooku i\u00A0Instagramie',
          },
        ],
      },
      {
        // D3: last on the page, so it reads as a cross-sell addendum instead of
        // interrupting the analiza -> konsultacja thread above it.
        // D4: complementary to the kampanie-reklamowe block, never a duplicate —
        // social profiles are audited here, websites and search by SEOFly.
        kind: 'partner',
        partner: 'seofly',
        name: 'SEOFly',
        logo: '/assets/seofly-logo-light.png',
        copy: [
          'Nasz audyt kończy się tam, gdzie kończą się social media. Dalej zaczyna się SEOFly — siostrzana agencja z\u00A0Grupy Good One, która audytuje strony i\u00A0ich widoczność w\u00A0Google.',
          'Możesz zamówić jeden audyt albo oba. Przy obu wnioski z\u00A0social mediów i\u00A0wyszukiwarki spinamy w\u00A0jeden kierunek działań, zamiast w\u00A0dwa osobne dokumenty, które trzeba potem ze sobą pogodzić.',
          'Jeden partner. Wiele kompetencji. BETTER WORKS.',
        ],
        // The boundary this page guards, stated as a split rather than argued
        // in prose: social profiles here, websites and search at SEOFly.
        split: {
          partner: {
            label: 'SEOFly audytuje',
            items: [
              'Techniczny stan strony',
              'Widoczność w\u00A0Google',
              'Treści pod wyszukiwarkę',
              'Profil linków',
            ],
          },
          lama: {
            label: 'My audytujemy',
            items: [
              'Profile w\u00A0social mediach',
              'Komunikację i\u00A0content',
              'Wyniki i\u00A0zaangażowanie',
              'Działania reklamowe',
            ],
          },
        },
        href: '/kontakt',
        // The kampanie-reklamowe cover's footage, reused as-is — no new asset.
        video: {
          src: '/clips/seofly-cover.mp4',
          mobileSrc: '/clips/seofly-cover-mobile.mp4',
          poster: '/clips/seofly-cover-poster.jpg',
          alt: 'Praca na laptopie nad wynikami w wyszukiwarce',
        },
      },
    ],
  },

  // 7 — Influencer marketing · hero · triptych · partner(folks) · proof
  {
    id: 'influencer-marketing',
    slug: 'influencer-marketing',
    pairSlug: 'influencer-marketing',
    label: 'Influencer marketing',
    meta: {
      // "Agencja influencer marketingu" is the phrase with the demand; the bare
      // discipline name is not something anyone types when they are hiring.
      title: 'Agencja influencer marketingu — kampanie z twórcami',
      description:
        'Kampanie influencer marketingowe — dobór twórców, strategia współpracy i realizacja. Autentyczne treści, które budują zasięg i zaufanie.',
    },
    summary:
      'Kampanie z\u00A0twórcami — od doboru influencerów po realizację i\u00A0rozliczenie.',
    sections: [
      {
        kind: 'hero',
        title: 'Influencer marketing',
        intro:
          'Influencer marketing pozwala markom budować wiarygodność, angażować odbiorców i\u00A0skutecznie docierać do nowych grup docelowych. Tworzymy kampanie dopasowane do celów biznesowych marki — od budowania świadomości, przez edukację, aż po wsparcie sprzedaży. Kompleksowo realizujemy działania z\u00A0twórcami internetowymi: od strategii i\u00A0doboru influencerów po koordynację kampanii i\u00A0analizę efektów.',
      },
      {
        kind: 'triptych',
        kicker: 'JAK DZIAŁAMY',
        items: [
          {
            icon: 'Users',
            title: 'Dobór twórców',
            body: 'Dobieramy influencerów po dopasowaniu do marki i\u00A0realnym zaangażowaniu społeczności — nie po samej liczbie obserwujących.',
          },
          {
            icon: 'Megaphone',
            title: 'Kampania',
            body: 'Układamy strategię współpracy, briefujemy twórców i\u00A0pilnujemy, by treści były autentyczne i\u00A0spójne z\u00A0marką.',
          },
          {
            icon: 'HeartHandshake',
            title: 'Relacje',
            body: 'Budujemy długofalowe relacje z\u00A0twórcami — powracające współprace działają lepiej niż jednorazowe akcje.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'folks',
        name: 'Folks',
        logo: '/assets/folks-logo-light.png',
        // No tagline: "from creators to results" was ours, not Folks' — they
        // publish none, and the renderer omits the line when it is absent.
        copy: [
          'Skuteczny influencer marketing to znacznie więcej niż jednorazowa współpraca z\u00A0twórcą. Liczy się dobór osób, które naprawdę pasują do marki, i\u00A0relacja, która przetrwa dłużej niż jedna kampania — dlatego połączyliśmy siły z\u00A0Folks, agencją wyspecjalizowaną w\u00A0budowaniu autentycznych relacji między markami a\u00A0odbiorcami.',
          'Dla marki oznacza to jedną kampanię prowadzoną od początku do końca w\u00A0jednym miejscu, spójną z\u00A0resztą komunikacji, i\u00A0dostęp do wszystkich kompetencji Grupy Good One — od social mediów i\u00A0contentu, przez SEO i\u00A0performance, po PR i\u00A0employer branding.',
          'Jeden partner. Wiele kompetencji. BETTER WORKS.',
        ],
        split: {
          partner: {
            label: 'Folks',
            items: [
              'Sieć twórców',
              'Brief i\u00A0negocjacje',
              'Produkcja treści',
              'Rozliczenie i\u00A0raport',
            ],
          },
          lama: {
            label: 'Social Lama',
            items: [
              'Strategia kampanii',
              'Content i\u00A0social media marki',
              'Spójność z\u00A0resztą komunikacji',
              'Analiza efektów',
            ],
          },
        },
        href: '/kontakt',
        // Ambient creator footage (Pexels, free licence) — full-bleed cover.
        // The `-2` is a cache-busting revision, not a variant: /clips/* ships
        // `max-age=86400` with no build hash, and the Video primitive fetches
        // lazily on scroll — so a replaced clip escapes even a hard reload and
        // returning visitors keep the old one for a day. Bump the number when
        // the footage changes; never overwrite one of these files in place.
        video: {
          src: '/clips/folks-cover-2.mp4',
          mobileSrc: '/clips/folks-cover-2-mobile.mp4',
          poster: '/clips/folks-cover-2-poster.jpg',
          alt: 'Twórczyni prezentuje produkt do kamery telefonu, druga osoba nagrywa materiał',
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
            brand: 'Pracuj.pl',
            title: 'Humor, twórcy i\u00A0filtr AR na TikToku',
          },
        ],
      },
    ],
  },
] as const satisfies readonly Service[]

// —— SEO landings (outside the roster, by design) ——————————————————————————————

/**
 * Pages that live under `/uslugi/<slug>` but are NOT services in the brand
 * architecture: search-demand landings that target a phrase the seven-entry
 * roster has no page for.
 *
 * A separate export rather than an eighth entry with an `inNav: false` flag
 * (design decision): every roster consumer — the mega-menu, the homepage
 * services tabs, the hero rotator, the morph transition, the footer — reads
 * `SERVICES`, and a flag would need each of them to remember to filter. One
 * missed filter leaks a landing into the site's navigation. This way the nav
 * surfaces cannot regress, and only the three places that should see landings
 * opt in by reading `USLUGI_PAGES`: the `[slug]` route, the `/uslugi` index,
 * and the sitemap.
 *
 * COPY STATUS: approved by the content team 2026-08-14. Written to the
 * "prowadzenie/obsługa social media" + "cennik" cluster (Senuto 2026-08, see
 * the change proposal) rather than to brand voice — the head phrase leads the
 * title, the H1 and the first sentence on purpose, so an edit that reaches for
 * brand voice here costs the page the thing it was built for.
 */
export const seoLandings = [
  {
    id: 'prowadzenie-social-media',
    slug: 'prowadzenie-social-media',
    pairSlug: 'social-media-management',
    label: 'Prowadzenie social media',
    meta: {
      title: 'Prowadzenie social media — cennik i zakres obsługi',
      description: `Prowadzenie social media dla firm: strategia, content, publikacja, moderacja i raporty. Sprawdź, co obejmuje obsługa profili i ile kosztuje — od ${STARTING_PRICE} zł netto.`,
    },
    summary:
      'Kompleksowa obsługa profili — strategia, content, publikacja, moderacja i raporty. Zobacz pełny zakres i widełki cenowe.',
    sections: [
      {
        kind: 'hero',
        // The H1 leads with the head phrase; the renderer appends the brand dot.
        title: 'Prowadzenie social media',
        intro:
          'Prowadzenie social media to nie sam kalendarz publikacji — to strategia, treści, rozmowa z odbiorcami i stała optymalizacja pod cele biznesowe marki. Przejmujemy profile na Facebooku, Instagramie, TikToku, LinkedInie, YouTubie, X i Pintereście: planujemy komunikację, produkujemy content, publikujemy, moderujemy i co miesiąc raportujemy wyniki.',
        cta: { label: 'Zapytaj o wycenę', href: '/kontakt' },
      },
      {
        kind: 'checklist',
        kicker: 'ZAKRES',
        heading: 'Co obejmuje prowadzenie social media?',
        intro:
          'Zakres ustalamy indywidualnie — pod liczbę platform, tempo publikacji i cele marki. Kompleksowa obsługa profilu obejmuje zwykle:',
        items: [
          'Strategię komunikacji i plan contentu',
          'Copywriting i projekty graficzne postów',
          'Produkcję wideo, rolek i animacji',
          'Publikację i prowadzenie kalendarza',
          'Moderację komentarzy i wiadomości',
          'Kampanie reklamowe i bieżącą optymalizację',
          'Miesięczny raport z wynikami i rekomendacjami',
        ],
      },
      {
        // The pricing band. The figure is interpolated from `pricing.ts`, which
        // the homepage FAQ answer also reads — the spec requires the two to
        // agree, so they are one value rather than two copies.
        kind: 'banner',
        heading: 'Ile kosztuje prowadzenie social media?',
        body: `Profesjonalna obsługa jednego profilu startuje od ok. ${STARTING_PRICE} zł netto miesięcznie. Pełna obsługa marki na kilku platformach, razem z produkcją grafik i wideo, mieści się rynkowo w przedziale od 3 000 do 15 000 zł miesięcznie — ostateczna wycena zależy od liczby kanałów, liczby publikacji i tego, ile materiału powstaje od zera. Budżet reklamowy rozliczamy zawsze osobno od wynagrodzenia za pracę, żeby oferty dało się uczciwie porównać.`,
        cta: { label: 'Zapytaj o wycenę', href: '/kontakt' },
      },
      {
        kind: 'proof',
        kicker: 'DOWÓD',
        heading: 'Tak wygląda to w praktyce',
        // Dolina Charlotty rather than one of the four studies the service
        // pages already feature — a landing that repeats another page's proof
        // card adds nothing to either.
        cases: [
          {
            slug: 'dolina-charlotty',
            logo: '/case-studies/dolina-charlotty/dolina-charlotty-logo.png',
            kicker: 'CASE STUDY',
            brand: 'Dolina Charlotty',
            title: 'Całoroczna komunikacja resortu na Facebooku i Instagramie',
          },
        ],
      },
      {
        kind: 'faq',
        kicker: 'FAQ',
        heading: 'Pytania o prowadzenie social media',
        // The first two questions are the cluster's own phrasings (spec:
        // "ile kosztuje…" and "co obejmuje…"); the rest are the cost variants
        // that follow them in the SERP.
        items: [
          {
            question: 'Ile kosztuje prowadzenie social media?',
            answer: `Obsługa jednego profilu startuje od ok. ${STARTING_PRICE} zł netto miesięcznie. Prowadzenie marki na kilku platformach, razem z produkcją grafik i wideo, mieści się rynkowo w przedziale od 3 000 do 15 000 zł miesięcznie. Cena zależy od liczby kanałów, liczby publikacji w miesiącu i tego, ile materiału powstaje od zera. Budżet reklamowy rozliczamy osobno.`,
          },
          {
            question: 'Co obejmuje prowadzenie social media?',
            answer:
              'Strategię komunikacji, plan i produkcję contentu — copy, grafiki, wideo — publikację, moderację komentarzy i wiadomości, prowadzenie kampanii reklamowych oraz miesięczny raport z wynikami i rekomendacjami na kolejny okres. Zakres spisujemy przed startem, więc wiadomo dokładnie, co wchodzi w cenę.',
          },
          {
            question: 'Czy budżet reklamowy jest wliczony w cenę?',
            answer:
              'Nie. Wynagrodzenie za prowadzenie profili i budżet mediowy na kampanie rozliczamy zawsze osobno. Dzięki temu widać, ile kosztuje praca zespołu, a ile trafia do platform reklamowych — i da się uczciwie porównać oferty agencji, które liczą to inaczej.',
          },
          {
            question: 'Na jakich platformach prowadzicie profile?',
            answer:
              'Facebook, Instagram, TikTok, LinkedIn, YouTube, X i Pinterest. Nie prowadzimy wszystkich naraz — kanały dobieramy pod grupę docelową i cele marki, bo profil bez odbiorców kosztuje tyle samo, co profil, który sprzedaje.',
          },
          {
            question: 'Jak szybko widać efekty prowadzenia social media?',
            answer:
              'Pierwsze efekty jakościowe — spójny wizerunek, wzrost zaangażowania, lepiej opisany profil — widać zwykle po 4–8 tygodniach. Efekty sprzedażowe zależą od budżetu reklamowego i cyklu zakupowego, dlatego współpracę zaczynamy zwykle od trzech miesięcy.',
          },
        ],
      },
      {
        kind: 'posts',
        kicker: 'Z BLOGA',
        heading: 'Poczytaj o prowadzeniu social media',
        categories: ['social-media', 'marketing'],
      },
    ],
  },
] as const satisfies readonly Service[]

/**
 * Everything that resolves under `/uslugi/<slug>` — the roster plus the SEO
 * landings. Read by the `[slug]` route, the `/uslugi` index and the sitemap,
 * and by nothing that renders navigation.
 */
export const USLUGI_PAGES = [...SERVICES, ...seoLandings]

/**
 * Lift a page's FAQ items, if it declares an `faq` section. The route feeds
 * these to `FaqJsonLd`, so the structured data is generated from the very array
 * the page renders instead of a hand-maintained duplicate.
 *
 * Takes the widened section type so both locales' modules can call it —
 * `Localized` erases the `kind` literal, hence the cast (design D8).
 */
export function faqItemsOf(
  sections: readonly Localized<ServiceSection>[]
): readonly FaqItem[] {
  const section = sections.find((candidate) => candidate.kind === 'faq')
  return section ? (section as { items: readonly FaqItem[] }).items : []
}

// —— Derived navigation ————————————————————————————————————————————————————————
// The menu USŁUGI column keeps its own labels (it also carries /szkolenia, which
// is not a service page), so this list is for any surface that wants the six
// service links derived from the canonical source.
export const serviceNav = SERVICES.map((service) => ({
  label: service.label,
  href: `/uslugi/${service.slug}`,
}))

/**
 * Lookup by this-locale slug (route params → page content). Resolves the roster
 * AND the SEO landings: they share the `/uslugi/<slug>` route and the same page
 * template, and only differ in whether the navigation surfaces list them.
 */
export function findService(slug: string): Service | undefined {
  return USLUGI_PAGES.find((page) => page.slug === slug)
}

/**
 * The shape of every `/uslugi` content export. `uslugi.en.ts` supplies the
 * English equivalent, each block `satisfies LocalizedUslugi['<key>']` — the
 * translation-parity gate.
 */
export type UslugiContent = {
  chrome: typeof chrome
  services: typeof SERVICES
  seoLandings: typeof seoLandings
}

/** Same shape, literals widened so translations compile. */
export type LocalizedUslugi = Localized<UslugiContent>
