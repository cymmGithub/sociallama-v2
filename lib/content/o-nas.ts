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
  body: 'Social Lama to agencja zajmująca się kompleksową obsługą komunikacji marki w\u00A0mediach społecznościowych, działająca na rynku od 2013 roku. Zapewniamy spójną i\u00A0angażującą komunikację w\u00A0social mediach – od strategii, przez moderację, po tworzenie contentu i\u00A0działania łączące online z\u00A0offline. Wspieramy firmy w\u00A0realizacji celów wizerunkowych i\u00A0sprzedażowych poprzez koncepcje kreatywne dopasowane do grupy docelowej oraz proaktywne rekomendacje.',
  cta: { label: 'POZNAJ NASZE DOŚWIADCZENIE', href: '#zespol' },
  imageAlt:
    'Troje osób z\u00A0zespołu Social Lamy przy biurku, wspólnie patrzą na ekran komputera',
} as const

// —— Values grid ("THAT WORKS WITH SOCIAL LAMA") — orange band ——————————————————
// Central block is the static "THAT WORKS WITH SOCIAL LAMA" wordmark. Copy is
// final from the mock; bodies may carry a blank line (\n\n) between paragraphs.

export const oNasValues = {
  center: { lead: 'THAT WORKS', rest: 'WITH SOCIAL LAMA' },
  items: [
    {
      title: 'Partnerstwo strategiczne',
      body: 'Nie realizujemy działań „dla obecności w\u00A0social mediach”. Najpierw rozumiemy Twój biznes – jego cele, model działania, wyzwania i\u00A0kontekst rynkowy – a\u00A0dopiero potem projektujemy strategię. Dzięki temu możesz mieć pewność, że działania w\u00A0social mediach realnie wspierają sprzedaż, generowanie leadów, rozpoznawalność czy budowanie marki.\n\nOtrzymujesz partnera, który myśli o\u00A0Twoim wyniku, a\u00A0nie tylko o\u00A0publikacjach.',
    },
    {
      title: 'Proaktywne podejście',
      body: 'Nie czekamy na brief ani przypomnienie. Regularnie analizujemy wyniki, trendy i\u00A0zmiany w\u00A0algorytmach, aby proponować nowe kierunki i\u00A0usprawnienia. Dla Ciebie oznacza to komfort współpracy i\u00A0poczucie, że projekt jest pod stałą opieką.\n\nZyskujesz zespół, który myśli o\u00A0rozwoju Twojej marki nawet wtedy, gdy Ty skupiasz się na innych obszarach biznesu.',
    },
    {
      title: 'Skupienie na efektach',
      body: 'Estetyka jest ważna, ale nie jest celem samym w\u00A0sobie. Każde działanie ma określony cel i\u00A0mierzalne wskaźniki sukcesu. Dzięki temu możesz raportować zarządowi lub właścicielom konkretne wyniki, a\u00A0nie tylko zasięgi.\n\nNasze działania są projektowane tak, aby przekładały się na realną wartość biznesową.',
    },
    {
      title: 'Eksperckość, która daje Ci przewagę',
      body: 'Specjalizujemy się w\u00A0social mediach i\u00A0marketingu digital. Śledzimy trendy, narzędzia, zmiany technologiczne i\u00A0wykorzystujemy je w\u00A0praktyce. Współpracując z\u00A0nami, zyskujesz dostęp do aktualnej wiedzy i\u00A0sprawdzonych rozwiązań bez konieczności budowania wewnętrznego zespołu specjalistów.',
    },
    {
      title: 'Indywidualne podejście',
      body: 'Nie kopiujemy rozwiązań między klientami. Każda strategia powstaje w\u00A0oparciu o\u00A0specyfikę Twojej branży, odbiorców i\u00A0etapu rozwoju firmy. To oznacza komunikację dopasowaną do Twojej marki, a\u00A0nie „uniwersalny model działania”. Twoje cele są punktem wyjścia do wszystkich rekomendacji.',
    },
    {
      title: 'Kompleksowość',
      body: 'Jesteśmy częścią grupy marketingowo-doradczej Good One, co pozwala nam działać szerzej niż tylko w\u00A0obszarze social media.\n\nDla Ciebie oznacza to jeden spójny kierunek działań i\u00A0dostęp do szerokiego zaplecza kompetencji bez konieczności koordynowania wielu podmiotów.',
    },
    {
      title: 'Transparentność',
      body: 'Nie stosujemy drobnego druczku i\u00A0nie ukrywamy zasad współpracy. To jawność i\u00A0uczciwość działania.',
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
      name: 'Jak połączyć humor z\u00A0edukacją w\u00A0social mediach?',
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
      image: '/case-studies/pracuj-pl/pracuj-pl-cover.jpg?v=2',
      href: '/case-studies/pracuj-pl',
    },
    {
      name: 'Jak budować marki w\u00A0social mediach?',
      year: '2025',
      client: 'Volvo Car Warszawa',
      logo: '/case-studies/volvo/volvo-logo.png?v=2',
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
  body: 'Agencja Social Lama jest częścią grupy marketingowej Good One, dzięki czemu zapewnia kompleksowość usług poprzez dostęp do specjalistów z\u00A0pozostałych obszarów komunikacji, takich jak: digital, social media, design, SEO i\u00A0SEM, influencer marketing.',
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
// Slider: one featured member (cutout portrait + name/role/certs/bio), prev/next
// arrows, teammates peeking behind. `given` is the small orange label over the
// big cream `surname` — colour travels with the word, not with the slot. Slider
// photos are transparent portrait cutouts in /public/o-nas/slider (kept apart
// from the webp team grid). Order is the client-curated presentation order
// (2026-08-04); the homepage `why-that-works` grid derives from this list
// (`oNasTeamGrid` below), so a reorder here reorders both surfaces.
// Roles follow the site wording where the bio doc disagrees (design D4). Bios
// are the client doc's, trimmed to a consistent slider length.

/** Professional certificates a member may hold. Both marks ship in
 *  `/public/assets/certs`; the slider maps the key to the mark. */
export type CertKey = 'dimaq' | 'meta'

export const oNasTeam = {
  kickerLead: 'NASZE',
  kickerRest: 'LAMY',
  heading: 'ZESPÓŁ SOCIAL LAMA',
  prevLabel: 'Poprzednia osoba',
  nextLabel: 'Następna osoba',
  /** Accessible name for each certificate chip — the mark is a picture, so the
   *  chip needs words. Lives here rather than reading `home.ts`'s `certAlt`,
   *  which would couple two content modules for one string. */
  certLabels: {
    dimaq: 'Certyfikat DIMAQ Professional',
    meta: 'Certyfikat Meta',
  } satisfies Record<CertKey, string>,
  members: [
    {
      given: 'ANNA',
      surname: 'OZGA',
      role: 'Head of Social Media',
      certs: ['dimaq'],
      bio: 'Od 2017 roku związana z\u00A0Social Lamą, gdzie łączy strategiczne myślenie z\u00A0codzienną pracą z\u00A0klientami i\u00A0zespołem. Tworzy i\u00A0wdraża strategie komunikacyjne dla polskich i\u00A0międzynarodowych marek, a\u00A0największą satysfakcję daje jej rozwijanie projektów, które realnie wpływają na wyniki biznesowe.',
      photo: '/o-nas/slider/anna-ozga.png',
    },
    {
      given: 'KAMIL',
      surname: 'MAZURUK',
      role: 'Founder, Good One Group',
      bio: 'Założyciel grupy Good One, która od 2009 roku z\u00A0sukcesami wspiera polskie i\u00A0globalne marki — liderów swoich branż — w\u00A0rozwoju ich potencjału poprzez zrozumienie, doskonałe doradztwo i\u00A0efektywne działania w\u00A0obszarach marketingu, sprzedaży i\u00A0zarządzania. Zespół Social Lamy wspiera strategicznym doradztwem i\u00A0doświadczeniem biznesowym całej grupy. Poza Good One doradza startupom oraz zarządom z\u00A0sektora MŚP, a\u00A0także inwestuje w\u00A0nowe projekty biznesowe i\u00A0je rozwija. W\u00A0życiu i\u00A0biznesie ceni zaufanie, proaktywność, optymizm, zrozumienie i\u00A0partnerstwo.',
      // The group the bio just introduced — an external site, so the label is
      // the domain (same convention as Przemysław's imcurious.how below).
      link: { label: 'goodone.co', href: 'https://goodone.co' },
      photo: '/o-nas/slider/kamil-mazuruk.png',
    },
    {
      given: 'ROBERT',
      surname: 'SAWICKI',
      role: 'Art & Creative Director',
      bio: 'Art & Creative Director związany z\u00A0agencją kreatywną Diea, specjalizującą się w\u00A0brandingu, projektowaniu graficznym, produkcji wideo i\u00A0animacji. Łączy zmysł estetyczny z\u00A0myśleniem strategicznym — od identyfikacji wizualnej, przez key visuale kampanii, po materiały digitalowe. Zespół Social Lamy wspiera przy koncepcjach kreatywnych, brandingu i\u00A0designie. Dba o\u00A0to, by kreacja nie tylko dobrze wyglądała, ale przede wszystkim realnie pracowała na cele marki.',
      link: { label: 'diea.pl', href: 'https://www.diea.pl' },
      photo: '/o-nas/slider/robert-sawicki.png',
    },
    {
      given: 'EMILIA',
      surname: 'METRYKA',
      role: 'Social Media Manager',
      bio: 'Zaczynała w\u00A0Warner Bros. Discovery, tworząc komunikację dla marek takich jak player.pl, TVN czy HBO Max. Dziś w\u00A0Social Lamie prowadzi zespół, koordynuje komórkę wideo oraz odpowiada za strategie i\u00A0kampanie dla marek z\u00A0wielu branż — od FMCG i\u00A0beauty po energetykę i\u00A0nieruchomości. Łączy doświadczenie z\u00A0wywiadów, premier i\u00A0planów zdjęciowych z\u00A0biznesowym podejściem do digitalu.',
      photo: '/o-nas/slider/emilia-metryka.png',
    },
    {
      given: 'PAULINA',
      surname: 'HILDEBRAND',
      role: 'Social Media Manager',
      bio: 'Łączy humanistyczną wrażliwość na słowo z\u00A0analitycznym podejściem do danych, dzięki czemu tworzy komunikację, która naprawdę działa w\u00A0social mediach. Specjalizuje się w\u00A0kompleksowym prowadzeniu profili marek — od strategii i\u00A0koncepcji kreatywnych, przez koordynację działań, po relacje z\u00A0klientami. Obsługiwała klientów z\u00A0FMCG, logistyki, gastronomii, RTV i\u00A0AGD, motoryzacji i\u00A0HVAC. Prywatnie szczęśliwa mama i\u00A0miłośniczka kotów.',
      photo: '/o-nas/slider/paulina-hildebrand.png',
    },
    {
      given: 'MAGDA',
      surname: 'ROKICKA',
      role: 'Social Media Manager',
      certs: ['dimaq'],
      // The DIMAQ sentence that used to close this bio is now the chip above —
      // stating it twice is the redundancy the chip exists to remove.
      bio: 'Od 2014 roku pracuje w\u00A0branży marketingowej. Specjalizuje się w\u00A0strategii komunikacji, social mediach, moderacji, content marketingu oraz podcastach. Ma doświadczenie w\u00A0pracy z\u00A0markami z\u00A0branży beauty, retail, FMCG, motoryzacyjnej, nieruchomości, farmaceutycznej oraz e-commerce. Po godzinach aktywnie działa na rzecz edukacji branży — prowadzi szkolenia, tworzy eksperckie publikacje i\u00A0dzieli się wiedzą w\u00A0autorskim podcaście.',
      photo: '/o-nas/slider/magda-rokicka.png',
    },
    {
      given: 'PIOTREK',
      surname: 'ZACH',
      role: 'Project Manager',
      bio: 'W\u00A0Social Lamie od 2019 roku. Odpowiada za kompleksową obsługę klientów oraz tworzenie koncepcji kreatywnych i\u00A0treści tekstowych, wspierając w\u00A0tych obszarach cały zespół. Łączy wykształcenie marketingowe i\u00A0filologiczne z\u00A0doświadczeniem w\u00A0pracy dla marek z\u00A0branż takich jak FMCG, automotive, OZE, elektronika i\u00A0nieruchomości. Stawia na słowo, które realnie buduje komunikację. Prywatnie fan szeroko pojętego sportu i\u00A0internetowych memów.',
      photo: '/o-nas/slider/piotr-zach.png',
    },
    {
      given: 'AGNIESZKA',
      surname: 'KLAJBERT',
      role: 'Senior Social Media Specialist',
      bio: 'Od 2021 roku związana z\u00A0marketingiem i\u00A0mediami społecznościowymi. Łączy pasję do fotografii z\u00A0wykształceniem z\u00A0zakresu zarządzania i\u00A0grafiki komputerowej w\u00A0reklamie, dzięki czemu odnajduje się w\u00A0tworzeniu contentu i\u00A0nieszablonowych koncepcji. Doświadczenie zdobywała w\u00A0branży hotelarskiej, gastronomicznej, beauty i\u00A0lifestyle. Wie, że dobre social media to połączenie estetyki, psychologii, humoru i\u00A0wyważonego szaleństwa. No i\u00A0oczywiście analityki.',
      photo: '/o-nas/slider/agnieszka-klajbert.png',
    },
    {
      given: 'KATARZYNA',
      surname: 'KAPTUR',
      role: 'Social Media Expert',
      bio: 'Od 2022 roku działa w\u00A0marketingu, a\u00A0w\u00A0Social Lamie tworzy angażujące treści i\u00A0wspiera marki w\u00A0budowaniu spójnej, silnej obecności online. Łączy wykształcenie z\u00A0zakresu Communication Management z\u00A0kreatywnym podejściem do contentu, traktując każde wyzwanie jako przestrzeń do nieszablonowego działania.',
      photo: '/o-nas/slider/katarzyna-kaptur.png',
    },
    {
      given: 'OLIWIA',
      surname: 'WITEWSKA',
      role: 'Social Media Specialist',
      bio: 'Od 2016 roku odpowiada za komunikację marek w\u00A0social mediach, zdobywając doświadczenie przy projektach dla globalnych brandów z\u00A0obszaru beauty, FMCG, AGD i\u00A0lifestyle. Tworzy długofalowe strategie i\u00A0angażujący content, stawiając na autentyczność, emocje i\u00A0budowanie trwałych relacji między marką a\u00A0jej odbiorcami.',
      photo: '/o-nas/slider/oliwia-witewska.png',
    },
    {
      given: 'KAROLINA',
      surname: 'MARCINOWSKA',
      role: 'Wideo Content Creator',
      bio: 'W\u00A0Social Lamie odpowiada przede wszystkim za tworzenie wideo contentu — od koncepcji, przez nagrania, po montaż i\u00A0dopasowanie do strategii marki. Łączy doświadczenie w\u00A0prowadzeniu komunikacji w\u00A0różnych branżach z\u00A0wyczuciem trendów i\u00A0estetyki, tworząc materiały wideo, które przyciągają uwagę i\u00A0budują zaangażowanie.',
      photo: '/o-nas/slider/karolina-marcinowska.png',
    },
    {
      given: 'WOJTEK',
      surname: 'SOCHACZYŃSKI',
      role: 'Senior Videographer',
      bio: 'Wideo prowadzi od pomysłu po finalny eksport — koncepcja, plan zdjęciowy, montaż, kolor i\u00A0dźwięk. W\u00A0Social Lamie odpowiada za materiały, które mają pracować w\u00A0social mediach: zatrzymać kciuk w\u00A0pierwszych sekundach i\u00A0utrzymać uwagę do końca. Na planie stawia na dobre przygotowanie, w\u00A0montażu na rytm — tak, by historia niosła się sama, a\u00A0marka zostawała w\u00A0pamięci.',
      photo: '/o-nas/slider/wojtek-sochaczynski.png',
    },
    {
      given: 'ALEKSANDER',
      surname: 'DYMIŃSKI',
      role: 'Videographer',
      bio: 'Filmuje i\u00A0montuje treści, które napędzają komunikację marek w\u00A0social mediach — od dynamicznych, krótkich formatów po dłuższe materiały wizerunkowe. Dba o\u00A0każdy etap produkcji: światło, kadr i\u00A0dźwięk na planie, potem tempo, cięcie i\u00A0detale w\u00A0montażu. Wierzy, że dobre wideo to rzemiosło połączone z\u00A0wyczuciem tego, co naprawdę angażuje odbiorców.',
      photo: '/o-nas/slider/aleksander-dyminski.png',
    },
    {
      given: 'IZA',
      surname: 'HARMOZA-SOCHOŃ',
      role: 'HR & Administration Manager',
      bio: 'Od 2020 roku dba o\u00A0sprawną organizację pracy, wspiera zespoły projektowe oraz buduje dobre relacje, które przekładają się na komfort współpracy zarówno pracowników, jak i\u00A0klientów.',
      photo: '/o-nas/slider/iza-harmoza-sochon.png',
    },
    {
      given: 'ŁUKASZ',
      surname: 'PŁOCIŃSKI',
      // The only roster member who works for a partner company rather than for
      // Social Lama, so the agency is part of the role label — a visitor
      // reading the tile alone must not take him for staff.
      role: 'Specjalista SEO, SEOFLY',
      bio: 'Specjalista SEO w\u00A0SEOFLY, partnerskiej agencji z\u00A0naszej grupy. Od 2011 roku pozycjonuje strony i\u00A0sklepy internetowe — od audytu i\u00A0doboru słów kluczowych, przez optymalizację, po treści, które realnie dowożą ruch. Łączy analityczne podejście z\u00A0kreatywnością i\u00A0na bieżąco nadąża za zmianami w\u00A0algorytmach Google. Po godzinach kibicuje siatkówce i\u00A0sam w\u00A0nią gra, a\u00A0wolny czas oddaje rodzinie i\u00A0fantastyce — od Tolkiena po Świat Dysku.',
      // His profile at the partner agency. Same treatment as Przemysław's
      // personal site below: an external destination, so the label is the
      // domain. It makes the partner relationship a fact you can follow
      // rather than a subtlety of the role label.
      link: {
        label: 'seofly.pl',
        href: 'https://seofly.pl/zespol/lukasz-plocinski/',
      },
      photo: '/o-nas/slider/lukasz-plocinski.png',
    },
    {
      given: 'PRZEMYSŁAW',
      surname: 'ŚWIERCZ',
      role: 'Fullstack Developer',
      bio: 'Odpowiada za rozwój i\u00A0utrzymanie strony Social Lamy — od frontendu, przez backend, po wydajność i\u00A0wdrożenia. Buduje też narzędzia wewnętrzne i\u00A0automatyzacje, które skracają zespołowi drogę od pomysłu do wdrożenia. Po godzinach prowadzi blog techniczny. Prywatnie lubi być w\u00A0ruchu — rower, bieganie, kiedyś sztuki walki.',
      // The blog the bio just mentioned. An external personal site, so the
      // label is the domain — it says where the link goes before it is clicked.
      link: { label: 'imcurious.how', href: 'https://imcurious.how' },
      photo: '/o-nas/slider/przemyslaw-swiercz.png',
    },
  ],
} as const

// —— Homepage team-grid projection ————————————————————————————————————————
// The homepage `why-that-works` grid shows the same people, in the same
// client-curated order, as the slider above — so it derives from `members`
// instead of keeping a third hand-synced roster copy. `cut` is the slider
// cutout's basename (the grid and the member deep-links key on it).

export interface TeamGridMember {
  cut: string
  name: string
  role: string
}

/** "IZA HARMOZA-SOCHOŃ" → "Iza Harmoza-Sochoń": the slider stores caps, the
 *  grid captions read in title case — re-cased per word, hyphens included. */
function displayName(caps: string) {
  return caps
    .toLocaleLowerCase('pl')
    .replace(/(^|[ -])\p{L}/gu, (ch) => ch.toLocaleUpperCase('pl'))
}

export function toTeamGrid(
  members: readonly {
    given: string
    surname: string
    role: string
    photo: string
  }[]
): TeamGridMember[] {
  return members.map((member) => ({
    cut: member.photo.split('/').at(-1) ?? '',
    name: displayName(`${member.given} ${member.surname}`),
    role: member.role,
  }))
}

export const oNasTeamGrid = toTeamGrid(oNasTeam.members)

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
