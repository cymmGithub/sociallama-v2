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

/** A triptych card. `icon` is a lucide icon name (repo rule: no glyphs). */
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

/** A platform mark in a `logoStrip`. `icon` is an existing monochrome SVG under
 *  `public/assets/icon-*.svg`, painted via `mask-image` like the footer set. */
interface StripLogo {
  name: string
  icon: string
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
          'Skuteczna komunikacja w social mediach nie zaczyna się od publikacji posta, kampanii reklamowej czy wyboru influencera — zaczyna się od strategii. To ona określa, do kogo marka mówi, jakie cele chce osiągnąć i czym wyróżnia się na tle konkurencji. Tworzymy strategie social media i digital dla marek, które chcą działać świadomie, konsekwentnie i długofalowo.',
      },
      {
        kind: 'triptych',
        kicker: 'CO ZYSKUJESZ',
        items: [
          {
            icon: 'Compass',
            title: 'Jasny kierunek',
            body: 'Strategia porządkuje komunikację i wyznacza priorytety. Zespół wie, które działania wspierają cele marki — a które tylko wypełniają kalendarz.',
          },
          {
            icon: 'MessageSquare',
            title: 'Spójna komunikacja',
            body: 'Odbiorcy oczekują od marek konsekwencji. Wypracowujemy jednolity sposób mówienia we wszystkich kanałach, niezależnie od formatu i platformy.',
          },
          {
            icon: 'Wallet',
            title: 'Lepszy budżet',
            body: 'Zaplanowane działania to mniejsze ryzyko nietrafionych inwestycji. Wskazujemy kanały i formaty, które przyniosą największą wartość biznesową.',
          },
          {
            icon: 'BarChart3',
            title: 'Mierzalne efekty',
            body: 'Każda strategia zawiera konkretne cele i wskaźniki efektywności, dzięki którym da się ocenić rezultaty, a nie tylko o nich dyskutować.',
          },
        ],
      },
      {
        kind: 'checklist',
        kicker: 'ZAKRES',
        heading: 'Co zawiera strategia?',
        intro:
          'Każdą strategię przygotowujemy indywidualnie — pod specyfikę marki, jej cele biznesowe i potrzeby komunikacyjne. W zależności od projektu dokument obejmuje m.in.:',
        items: [
          'Analizę marki, rynku i konkurencji',
          'Charakterystykę grupy docelowej',
          'Cele komunikacyjne',
          'Klimat, styl komunikacji i filary contentowe',
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
            body: 'Każdy projekt zaczynamy od rozmowy. Poznajemy markę, jej cele, wyzwania i oczekiwania wobec działań marketingowych.',
          },
          {
            title: 'Analiza',
            body: 'Badamy rynek, konkurencję, dotychczasową komunikację i zachowania odbiorców. Zbieramy dane i wyciągamy z nich wnioski.',
          },
          {
            title: 'Rekomendacje',
            body: 'Na tej podstawie przygotowujemy rekomendacje strategiczne — komunikacja, content, kanały i działania reklamowe.',
          },
          {
            title: 'Prezentacja',
            body: 'Gotową strategię omawiamy na spotkaniu. Wyjaśniamy rekomendacje, odpowiadamy na pytania i ustalamy kolejne kroki.',
          },
        ],
      },
      {
        kind: 'banner',
        heading: 'Potrzebujesz samej strategii? To możliwe.',
        body: 'Najczęściej realizujemy strategię razem z wdrożeniem, ale przygotujemy też sam dokument — dla firm z własnym zespołem marketingowym albo marek, które chcą zweryfikować obecny kierunek działań. Wycenę dopasujemy do zakresu projektu.',
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

  // 3 — Sprzedaż · hero · triptych · platforms-as-dashboards(6) · proof ·
  //     banner(cross-link)
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
    // Names the social platforms, to contrast with Kampanie reklamowe's search
    // on the /uslugi index — the only surface where the two are seen together.
    summary:
      'Sprzedaż w social mediach — kampanie na Facebooku, Instagramie i TikToku, rozliczane z wyniku.',
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
      {
        // D3, reciprocal: search lives with SEOFly on /uslugi/kampanie-reklamowe.
        // Named rather than implied, so a visitor who landed here hunting for
        // Google Ads is routed instead of bouncing.
        kind: 'banner',
        heading: 'Szukasz SEO i kampanii w Google?',
        body: 'Wyszukiwarką zajmuje się SEOFly — siostrzana agencja z Grupy Good One. Tutaj prowadzimy sprzedaż w social mediach, tam — widoczność i kampanie w Google.',
        cta: {
          label: 'Zobacz kampanie reklamowe',
          href: '/uslugi/kampanie-reklamowe',
        },
      },
    ],
  },

  // 4 — Kampanie reklamowe · hero · triptych(6 kafli, bez numeracji) ·
  //     partner(seofly) · banner(cross-link) — the client's SZKIELET, minus the
  //     SEOFly case studies (none supplied; `proof` links only into our own
  //     collection).
  {
    id: 'kampanie-reklamowe',
    slug: 'kampanie-reklamowe',
    pairSlug: 'ad-campaigns',
    label: 'Kampanie reklamowe',
    meta: {
      // D5: the label carries no term anyone searches this offer with, so the
      // title names SEO and Google Ads instead.
      title: 'SEO i Google Ads — kampanie reklamowe | Social Lama',
      description:
        'Pozycjonowanie, kampanie Google Ads, audyty SEO, strony WWW oraz analityka i raportowanie. Obszar search i performance prowadzimy z SEOFly — agencją z Grupy Good One.',
    },
    // Names search, to contrast with Sprzedaż's social platforms on the index.
    summary:
      'Widoczność w wyszukiwarce — SEO, Google Ads i strony WWW, razem z SEOFly.',
    sections: [
      {
        kind: 'hero',
        title: 'Kampanie reklamowe',
        intro:
          'Widoczność w wyszukiwarce, kampanie w Google i strony, które realizują cele biznesowe. Obszar SEO i performance rozwijamy razem z SEOFly — siostrzaną agencją z Grupy Good One. Od pozycjonowania i audytów, przez treści pod SEO, po analitykę i raportowanie.',
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
            body: 'Zwiększamy widoczność marek w wyszukiwarce Google, docierając do użytkowników dokładnie wtedy, gdy szukają produktów lub usług. Stawiamy na działania, które przekładają się na realny ruch i wyniki biznesowe.',
          },
          {
            icon: 'MousePointerClick',
            title: 'ADS',
            // D1: Google only. Meta Ads and TikTok Ads stay on /uslugi/sprzedaz,
            // which already proves them with dashboard panels.
            body: 'Prowadzimy kampanie Google Ads, które wspierają sprzedaż, generują leady i budują świadomość marki. Dobieramy działania do celów biznesowych i stale optymalizujemy ich efektywność.',
          },
          {
            icon: 'PenTool',
            title: 'Content marketing',
            // "pod pozycjonowanie" is the client's own qualifier — it is what
            // separates this tile from /uslugi/content. Do not drop it.
            body: 'Tworzymy wartościowe treści pod pozycjonowanie, które budują eksperckość marki i odpowiadają na potrzeby odbiorców na każdym etapie ścieżki zakupowej.',
          },
          {
            icon: 'ClipboardCheck',
            title: 'Audyty SEO',
            // "strony internetowe" likewise separates this from
            // /uslugi/audyt-i-konsultacje, which audits social media profiles.
            body: 'Analizujemy strony internetowe, identyfikujemy obszary wymagające poprawy i przygotowujemy konkretne rekomendacje, które zwiększają widoczność oraz skuteczność działań.',
          },
          {
            icon: 'Globe',
            title: 'Strony WWW',
            body: 'Projektujemy i wdrażamy nowoczesne strony internetowe, które nie tylko dobrze wyglądają, ale przede wszystkim realizują cele biznesowe i wspierają pozyskiwanie klientów.',
          },
          {
            icon: 'BarChart3',
            title: 'Analityka i raportowanie',
            body: 'Mierzymy efekty działań i analizujemy dane, aby podejmować trafne decyzje marketingowe. Regularne raportowanie pozwala stale rozwijać i optymalizować prowadzone działania.',
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
        copy: 'Skuteczny marketing nie kończy się na jednym kanale — dlatego połączyliśmy siły z SEOFly, agencją specjalizującą się w SEO i performance marketingu. Social Lama odpowiada za strategię, content i social media, a SEOFly rozwija widoczność marek w wyszukiwarce i realizuje kampanie performance. Obie należą do Grupy Good One, więc kompetencje — od social mediów, przez SEO i performance, po PR, influencer marketing i employer branding — spotykają się w jednym miejscu. Jeden partner. Wiele kompetencji. BETTER WORKS.',
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

  // 6 — Audyt i konsultacje · hero(+CTA) · checklist · logoStrip · banner ·
  //     proof — reshaped from the client doc as a productized service.
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
          'Potrzebujesz zweryfikować skuteczność swoich działań w social mediach albo skonsultować pomysł z ekspertem? Przeanalizujemy Twój profil, wskażemy mocne strony i obszary do poprawy, a podczas indywidualnej konsultacji omówimy konkretne rekomendacje oraz kolejne kroki.',
        cta: { label: 'Umów konsultację', href: '/kontakt' },
      },
      // The invented Audyt/Rekomendacje/Konsultacje triptych is gone (D7): the
      // client's six-item checklist below covers the same ground concretely, and
      // keeping both would state the offer twice on one page.
      {
        kind: 'checklist',
        kicker: 'ZAKRES',
        heading: 'Co obejmuje usługa?',
        intro:
          'Nie zawsze potrzeba nowej strategii — czasem wystarczy świeże spojrzenie eksperta. Analizujemy profile marki w social mediach, sprawdzamy komunikację, content, wyniki i działania reklamowe, a wnioski omawiamy podczas indywidualnej konsultacji.',
        items: [
          'Analiza profili w social mediach',
          'Ocena strategii komunikacji i contentu',
          'Analiza działań reklamowych',
          'Wskazanie mocnych stron i obszarów do poprawy',
          'Praktyczne rekomendacje do wdrożenia',
          '45-minutowa konsultacja online ze specjalistą Social Lamy',
        ],
      },
      {
        kind: 'logoStrip',
        heading: 'Przeprowadzamy audyty profili na:',
        // Existing monochrome marks only — no new artwork, and no separator
        // dots between them (explicit client direction).
        logos: [
          { name: 'Facebook', icon: '/assets/icon-facebook.svg' },
          { name: 'Instagram', icon: '/assets/icon-instagram.svg' },
          { name: 'LinkedIn', icon: '/assets/icon-linkedin.svg' },
          { name: 'TikTok', icon: '/assets/icon-tiktok.svg' },
          { name: 'Pinterest', icon: '/assets/icon-pinterest.svg' },
          { name: 'YouTube', icon: '/assets/icon-youtube.svg' },
        ],
      },
      {
        kind: 'banner',
        heading: 'Umów konsultację online',
        body: 'Masz pytanie, potrzebujesz drugiej opinii albo chcesz omówić wyzwania swojej marki? Umów 45-minutową konsultację online ze specjalistą Social Lamy — wspólnie przeanalizujemy Twoją sytuację, odpowiemy na pytania i wskażemy najlepsze kierunki działań.',
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
            logo: '/case-studies/volvo/volvo-logo.png',
            kicker: 'CASE STUDY',
            title: 'Budowa marek Volvo na LinkedInie, Facebooku i Instagramie',
          },
        ],
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
          'Influencer marketing pozwala markom budować wiarygodność, angażować odbiorców i skutecznie docierać do nowych grup docelowych. Tworzymy kampanie dopasowane do celów biznesowych marki — od budowania świadomości, przez edukację, aż po wsparcie sprzedaży. Kompleksowo realizujemy działania z twórcami internetowymi: od strategii i doboru influencerów po koordynację kampanii i analizę efektów.',
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
        copy: 'Skuteczny influencer marketing to znacznie więcej niż jednorazowa współpraca z twórcą — dlatego połączyliśmy siły z Folks, agencją specjalizującą się w budowaniu autentycznych relacji między markami a odbiorcami. Obie należymy do Grupy Good One, więc kompetencje z obszaru social mediów, strategii, contentu i influencer marketingu spotykają się w jednym miejscu: szeroka sieć twórców, doświadczeni eksperci i kompleksowa obsługa kampanii — od pomysłu po raportowanie efektów. Jeden partner. Wiele kompetencji. BETTER WORKS.',
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
