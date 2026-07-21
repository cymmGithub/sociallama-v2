/**
 * Case-study seed — run with `bun run payload:seed:case-studies` (dev DB) or
 * `bun run payload:seed:case-studies --prod` (uses DATABASE_URL_PROD).
 *
 * Idempotent: creates the three published case studies (iRobot, Pracuj.pl,
 * Volvo) and their media, skipping anything that already exists. Copy is
 * transcribed from the source decks (case-study-source/, git-excluded);
 * images are the optimized slides under public/case-studies/<slug>/.
 *
 * NOTE: writes bypass the deployed app, so revalidation hooks can't reach the
 * live cache — after seeding prod, redeploy (or revalidate) to surface them.
 */

import path from 'node:path'

// The env decision must happen before the config loads — payload.config.ts
// validates DATABASE_URL at import time, so the config import below is dynamic.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:seed:case-studies --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  // CRITICAL: dev mode push-syncs schema on init, which would stamp the prod
  // DB as dev-managed and hang `payload migrate` on deploy.
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`Seeding case studies into: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

// —— Lexical helpers (same shape as seed.ts) ————————————————————————————————

function text(value: string) {
  return {
    type: 'text',
    text: value,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function block(type: string, children: unknown[], extra = {}) {
  return {
    type,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    ...extra,
  }
}

const para = (value: string) => block('paragraph', [text(value)])

const orderedList = (items: string[]) =>
  block(
    'list',
    items.map((value, i) => block('listitem', [text(value)], { value: i + 1 })),
    { listType: 'number', tag: 'ol', start: 1 }
  )

const bulletList = (items: string[]) =>
  block(
    'list',
    items.map((value, i) => block('listitem', [text(value)], { value: i + 1 })),
    { listType: 'bullet', tag: 'ul', start: 1 }
  )

const richText = (...blocks: unknown[]) => ({ root: block('root', blocks) })

// —— Content ————————————————————————————————————————————————————————————————

interface GalleryImage {
  file: string
  alt: string
}

/** One content pillar: deck hashtag + heading + copy + campaign creatives. */
interface PillarSeed {
  tag?: string
  heading: string
  body: ReturnType<typeof richText>
  media: GalleryImage[]
}

interface StudySeed {
  slug: string
  title: string
  clientName: string
  clientAbout: ReturnType<typeof richText>
  logoPath?: string
  logoAlt?: string
  tags: string[]
  period: string
  excerpt: string
  coverAlt: string
  challenge: ReturnType<typeof richText>
  pillars: PillarSeed[]
  results: { platform: string; metric: string; value: string }[]
  gallery: GalleryImage[]
  publishedAt: string
}

const STUDIES: StudySeed[] = [
  {
    slug: 'irobot',
    title: 'iRobot — humor i edukacja, które budują markę na YouTube i TikToku',
    clientName: 'iRobot',
    // Rasterized from /assets/clients/irobot.svg — Payload's media collection
    // rejects SVG (restricted MIME type), so the case-study logo is a PNG.
    logoPath: 'public/case-studies/irobot/irobot-logo.png',
    logoAlt: 'Logo marki iRobot',
    tags: ['Roboty sprzątające', 'Smart home', 'Czysty dom'],
    period: 'Marzec 2024 – obecnie',
    excerpt:
      'Edukacyjno-humorystyczna komunikacja wideo dla iRobot na YouTube i TikToku — 11 mln wyświetleń i +7,9 tys. subskrypcji w kanale marki.',
    coverAlt:
      'Para w kuchni korzystająca z robota sprzątającego Roomba marki iRobot',
    clientAbout: richText(
      para(
        'iRobot to światowy lider w dziedzinie domowej robotyki, który łączy zaawansowaną technologię z codzienną funkcjonalnością. Dzięki innowacyjnym rozwiązaniom, takim jak roboty odkurzająco-mopujące Roomba®, firma iRobot od ponad 30 lat pomaga użytkownikom oszczędzać czas na sprzątaniu.'
      ),
      para(
        'iRobot pomaga oszczędzać czas i energię na sprzątaniu, dając możliwość skupienia się na tym, co naprawdę ważne — rodzinie, pasjach i relaksie.'
      )
    ),
    challenge: richText(
      para(
        'Głównym zadaniem było edukowanie odbiorców na temat korzyści płynących z użytkowania robotów sprzątających — w sposób lekki, przystępny i angażujący.'
      ),
      orderedList([
        'Podkreślenie korzyści czasowych i wygody, jakie dają produkty iRobot w porównaniu do tradycyjnego sprzątania.',
        'Edukacja na temat zaawansowanej technologii, takiej jak inteligentne mapowanie.',
        'Inspirowanie klientów do zmiany codziennych nawyków na bardziej innowacyjne.',
      ])
    ),
    pillars: [
      {
        tag: '#HUMOR',
        heading: 'Podkreślenie korzyści i wygody',
        body: richText(
          para(
            'W krótkich, zabawnych filmikach przedstawiamy codzienne sytuacje, które każdy zna — jak walka z upartymi okruchami po śniadaniu czy piętrzącymi się obowiązkami domowymi — i pokazujemy, jak Roomba radzi sobie z nimi w mgnieniu oka. Treści trafiają zarówno do młodszej, jak i starszej grupy odbiorców, a przyciągające uwagę hasła budują rozpoznawalność marki i zwiększają zaangażowanie.'
          ),
          para(
            'Dzięki tej serii edukujemy, bawimy i inspirujemy do zmiany nawyków sprzątania — pokazując, że z iRobot życie staje się prostsze (i bardziej zabawne!).'
          )
        ),
        media: [
          {
            file: 'irobot-gallery-3.jpg',
            alt: 'Humorystyczny film twórczyni z robotem Roomba w kampanii iRobot na TikToku',
          },
          {
            file: 'irobot-gallery-6.jpg',
            alt: 'Film twórczyni w kampanii TikTok iRobot z robotem Roomba',
          },
        ],
      },
      {
        tag: '#EDUKACJA',
        heading: 'Edukacja i technologia',
        body: richText(
          para(
            'W krótkich, dynamicznych materiałach wideo pokazujemy, jak robot dzięki swojej technologii radzi sobie z codziennymi wyzwaniami. Materiały są tworzone w lekkim, wizualnie atrakcyjnym stylu, z subtelną nutą humoru, aby edukować i zainteresować widzów nowoczesnymi rozwiązaniami, które oferuje iRobot.'
          )
        ),
        media: [
          {
            file: 'irobot-gallery-1.jpg',
            alt: 'Post TikTok iRobot z hasłem „Chcesz wracać do czystego domu?”',
          },
          {
            file: 'irobot-gallery-2.jpg',
            alt: 'Post TikTok iRobot pokazujący robota Roomba w akcji na podłodze',
          },
        ],
      },
      {
        tag: '#INNOWACJA',
        heading: 'Innowacyjne rozwiązania',
        body: richText(
          para(
            'Dzięki angażującym materiałom wideo na YouTubie prezentujemy innowacyjne rozwiązania iRobot w kontekście codziennego życia. Pokazujemy, jak roboty wspierają właścicieli domów ze zwierzętami, skutecznie radząc sobie z sierścią i brudem.'
          ),
          para(
            'Treści podkreślają, że czas zaoszczędzony dzięki robotom iRobot można wykorzystać na rzeczy naprawdę ważne — pasje, relaks czy bliskość z rodziną — tworząc pozytywne skojarzenia z marką i zachęcając do zmiany.'
          )
        ),
        media: [
          {
            file: 'irobot-gallery-4.jpg',
            alt: 'Materiał wideo iRobot na YouTube — Roomba wspiera właścicieli zwierząt',
          },
        ],
      },
      {
        tag: '#DLAKAŻDEGO',
        heading: 'Akcje specjalne',
        body: richText(
          para(
            'Pokazujemy, jak iRobot łączy pokolenia i dopasowuje się do różnych stylów życia — od pomagania starszym osobom w codziennych obowiązkach, po wspieranie rodzin w utrzymaniu porządku. Udowadniamy, że z iRobotem życie staje się prostsze i wygodniejsze, a technologia działa na korzyść każdego użytkownika.'
          )
        ),
        media: [
          {
            file: 'irobot-gallery-5.jpg',
            alt: 'Materiał wideo iRobot na YouTube — robot ułatwia codzienne obowiązki seniorom',
          },
        ],
      },
    ],
    results: [
      { platform: 'TikTok', metric: 'Wyświetlenia', value: '11 mln' },
      { platform: 'TikTok', metric: 'Widzowie', value: '149 tys.' },
      { platform: 'TikTok', metric: 'Polubienia', value: '27 tys.' },
      { platform: 'TikTok', metric: 'Udostępnienia', value: '1 616' },
      { platform: 'TikTok', metric: 'Komentarze', value: '1 843' },
      { platform: 'YouTube', metric: 'Wyświetlenia', value: '742 tys.' },
      { platform: 'YouTube', metric: 'Nowe subskrypcje', value: '+7,9 tys.' },
    ],
    // Creatives live in the pillars — no detached gallery for iRobot.
    gallery: [],
    publishedAt: '2025-01-15T10:00:00.000Z',
  },
  {
    slug: 'pracuj-pl',
    title:
      'Pracuj.pl — budowa społeczności na TikToku od zera i autorski filtr AR',
    clientName: 'Pracuj.pl',
    logoPath: 'public/assets/clients/pracuj.png',
    logoAlt: 'Logo serwisu Pracuj.pl',
    tags: ['Rekrutacja', 'Rynek pracy', 'Filtr AR'],
    period: 'Kwiecień 2022 – maj 2026',
    excerpt:
      'Budowa społeczności Pracuj.pl na TikToku od zera: autorski filtr AR, content trendowy i współprace z influencerami — 95,4 mln wyświetleń i 52,6 tys. obserwujących.',
    coverAlt: 'Aplikacja Pracuj.pl otwarta na smartfonie trzymanym w dłoniach',
    challenge: richText(
      para(
        'Celem była budowa świadomości, rozpoznawalności i zaufania do marki wśród młodego pokolenia (17–26 lat).'
      ),
      orderedList([
        'Dostosowanie języka komunikacji do grupy docelowej z zachowaniem naturalności i autentyczności.',
        'Tworzenie materiałów wideo w dwóch nurtach — humorystycznym (trendy) i edukacyjnym — budujących wizerunek eksperta i doradcy.',
        'Nawiązanie współprac z influencerami młodego pokolenia w celu promowania Targów Pracy JOBICON.',
        'Zbudowanie bazy obserwatorów profilu praktycznie od zera.',
      ])
    ),
    clientAbout: richText(
      para(
        'Pracuj.pl to wiodący serwis rekrutacyjny w Polsce, łączący pracodawców z kandydatami na różnych etapach kariery zawodowej. Oprócz dostarczania aktualnych ofert pracy platforma aktywnie wspiera rozwój zawodowy użytkowników poprzez wartościowe treści na blogu oraz autorski podcast „Dobra robota”. Co roku organizuje również bezpłatne targi pracy Jobicon.'
      ),
      para(
        'Podstawową misją marki jest pomaganie ludziom w znalezieniu pracy dopasowanej do ich potrzeb, umiejętności i osobowości, a także budowanie etycznej kultury pracy w Polsce.'
      )
    ),
    pillars: [
      {
        heading: 'Społeczność zbudowana od zera',
        body: richText(
          para(
            'Profil Pracuj.pl powstał w całości od zera. Zbudowanie bazy obserwatorów było jednym z kluczowych założeń na początku współpracy. Podeszliśmy do tego dwutorowo: stworzyliśmy skuteczną strategię komunikacji z regularnym rytmem publikacji oraz wdrożyliśmy i optymalizowaliśmy strategię reklamową, która pozwoliła szybciej osiągnąć założony cel.'
          )
        ),
        media: [],
      },
      {
        tag: 'FILTR AR',
        heading: 'Autorski filtr „Wymarzona praca”',
        body: richText(
          para(
            'Stworzyliśmy dedykowany filtr AR, który użytkownicy mogli wykorzystywać we własnych nagraniach. Filtr cieszył się bardzo dużą popularnością — sięgali po niego również influencerzy, mimo braku formalnej współpracy. Po ponad sześciu miesiącach od wdrożenia narzędzie wciąż generowało zainteresowanie użytkowników.'
          )
        ),
        media: [
          {
            file: 'pracuj-pl-ar-grid.jpg',
            alt: 'Strona filtra AR „Wymarzona praca – Pracuj.pl” na TikToku z siatką filmów użytkowników',
          },
          {
            file: 'pracuj-pl-ar-creator.jpg',
            alt: 'Twórczyni nagrywająca film z filtrem AR „Wymarzona praca” Pracuj.pl',
          },
        ],
      },
      {
        tag: '#CONTENT',
        heading: 'Content edukacyjny',
        body: richText(
          para(
            'Dzielimy się praktycznymi poradami na temat rekrutacji, tworzenia CV, kwestii prawnych i ogólnego rozwoju zawodowego. Tworzymy treści, które łączą merytoryczną wartość z nowoczesną formą przekazu, dzięki czemu wiedza jest prezentowana w sposób przystępny, angażujący i łatwo przyswajalny.'
          )
        ),
        media: [
          {
            file: 'pracuj-pl-edu.jpg',
            alt: 'Edukacyjny film Pracuj.pl na TikToku — „Jak napisać list motywacyjny?”',
          },
        ],
      },
      {
        tag: '#CONTENT',
        heading: 'Content humorystyczny',
        body: richText(
          para(
            'Korzystamy z najnowszych trendów, popularnych filtrów i zabawnych insightów, aby dostarczyć lekkiej, rozrywkowej treści wpisującej się w charakter platformy. Humorystyczny content bazuje na publikacjach RTM oraz aktualnych trendach, które adaptujemy do tematyki profilu.'
          )
        ),
        media: [
          {
            file: 'pracuj-pl-humor-cat.jpg',
            alt: 'Humorystyczny film Pracuj.pl na TikToku z memem — „Memy wcielone w życie”',
          },
          {
            file: 'pracuj-pl-humor-pov.jpg',
            alt: 'Humorystyczny film Pracuj.pl na TikToku w formacie POV o szukaniu pracy',
          },
        ],
      },
      {
        heading: 'Aktywna moderacja',
        body: richText(
          para(
            'Aktywizujące treści zachęcały użytkowników do dyskusji i interakcji. W ramach moderacji wchodzimy również w interakcje z treściami innych twórców, co wzmacnia relacje, buduje społeczność i zwiększa zasięg działań.'
          )
        ),
        media: [],
      },
      {
        tag: '#INFLUENCER MARKETING',
        heading: 'Współpraca z influencerami',
        body: richText(
          para(
            'W ramach promocji Festiwalu Pracy JOBICON zapraszamy do jednorazowych współprac popularnych twórców TikToka (m.in. @zetkacper — 1,1 mln obserwujących, @stastrojanowski — 51 tys.). Autentyczny styl twórców i ich zaangażowane społeczności przekładają się na wzrost zainteresowania festiwalem i uczestnictwo w evencie.'
          )
        ),
        media: [
          {
            file: 'pracuj-pl-influencer.jpg',
            alt: 'Portret twórcy TikToka współpracującego z Pracuj.pl przy promocji Targów Pracy JOBICON',
          },
        ],
      },
    ],
    results: [
      { platform: 'TikTok', metric: 'Wyświetlenia filmów', value: '95,4 mln' },
      {
        platform: 'TikTok',
        metric: 'Całkowita liczba widzów',
        value: '94,8 mln',
      },
      { platform: 'TikTok', metric: 'Obserwujący', value: '52,6 tys.' },
      {
        platform: 'TikTok',
        metric: 'Polubienia materiałów',
        value: '104,8 tys.',
      },
    ],
    // Creatives live in the pillars — no detached gallery for pracuj-pl.
    gallery: [],
    publishedAt: '2025-01-20T10:00:00.000Z',
  },
  {
    slug: 'volvo',
    title:
      'Volvo Car Warszawa i Dom Volvo — budowa marek na LinkedIn, Facebooku i Instagramie',
    clientName: 'Volvo Car Warszawa & Dom Volvo',
    logoPath: 'public/case-studies/volvo/volvo-logo.png',
    logoAlt: 'Logo marki Volvo',
    tags: ['Motoryzacja premium', 'Elektromobilność', 'Bezpieczeństwo'],
    period: 'Maj – czerwiec 2025',
    excerpt:
      'Prowadzenie i pozycjonowanie profili Volvo Car Warszawa i Dom Volvo na Facebooku, Instagramie i LinkedInie — personal branding, relacje eventowe i treści eksperckie.',
    coverAlt: 'Wnętrze samochodu Volvo — kierownica i nowoczesny kokpit',
    challenge: richText(
      para(
        'Zadaniem była budowa pozycji obu marek na LinkedIn, Facebooku oraz Instagramie.'
      ),
      orderedList([
        'Odpowiednie pozycjonowanie profili jako lidera nowoczesnej motoryzacji premium w Warszawie.',
        'Personal branding ekspertów i doradców Volvo jako ambasadorów bezpieczeństwa i elektromobilności.',
        'Stworzenie strategii treści łączącej edukację, eksperckość, storytelling i komunikację wizualną zgodną z DNA marki Volvo.',
      ])
    ),
    clientAbout: richText(
      para(
        'Volvo Car Warszawa i Dom Volvo to autoryzowani dealerzy specjalizujący się w nowoczesnych rozwiązaniach motoryzacyjnych marki Volvo. Dzięki szerokiej ofercie samochodów, w tym innowacyjnych modeli elektrycznych i hybrydowych, salony umożliwiają klientom wybór aut łączących zaawansowaną technologię z najwyższym poziomem bezpieczeństwa i komfortu.'
      ),
      para(
        'Oba salony wyróżniają się indywidualnym podejściem do klienta, wsparciem na każdym etapie współpracy oraz konsekwentnym wdrażaniem rozwiązań z zakresu elektromobilności i zrównoważonej mobilności.'
      )
    ),
    pillars: [
      {
        tag: '#STRUKTURA TREŚCI',
        heading: 'Volvo Car Warszawa — lider branży moto i ekspert',
        body: richText(
          para('Dla każdej platformy wdrożyliśmy odrębną strategię treści:'),
          bulletList([
            'Facebook — relacje z wydarzeń i inicjatyw społecznych (Women in Tech, Bezpieczna Przestrzeń), premiery modeli (XC60, EX30) oraz praktyczne porady serwisowe.',
            'Instagram — eventy, kulisy i społeczność Volvo w formie reels i stories, estetyka i inspiracje z codziennego życia salonu.',
            'LinkedIn — networking biznesowy, posty eksperckie o bezpieczeństwie i technologiach, oferty dla flot i firm.',
          ])
        ),
        media: [
          {
            file: 'volvo-vcw-post.jpg',
            alt: 'Post Volvo Car Warszawa na Instagramie prezentujący samochód Volvo',
          },
        ],
      },
      {
        tag: '#STRUKTURA TREŚCI',
        heading: 'Dom Volvo — centrum lokalnej społeczności',
        body: richText(
          para(
            'Komunikację Dom Volvo oparliśmy na rodzinnym, lokalnym charakterze salonu:'
          ),
          bulletList([
            'Facebook — wydarzenia lokalne i rodzinne (Piknik z EduMoto, Dni Otwarte, konkursy), nowości modelowe i oferty aut używanych.',
            'Instagram — rodzinna atmosfera, kulisy życia salonu, design i detale samochodów, quizy i oferty specjalne.',
            'LinkedIn — współpraca lokalna, akcje CSR oraz treści eksperckie dla kierowców i fleet managerów.',
          ])
        ),
        media: [
          {
            file: 'volvo-vcw-goracy.jpg',
            alt: 'Kreacja Volvo „Gorący okres?” o przygotowaniu auta na lato',
          },
          {
            file: 'volvo-dom-savedate.jpg',
            alt: 'Zapowiedź premiery Volvo XC60 w Dom Volvo — „Save the date”',
          },
        ],
      },
      {
        heading: 'Współpraca eventowa',
        body: richText(
          para(
            'Prowadziliśmy komunikację wydarzeń w czasie rzeczywistym — relacje live na stories, dynamiczny content wideo i współprace z agencjami influencer-marketingowymi:'
          ),
          bulletList([
            'Noc Muzeów — relacje live i content wideo we współpracy z agencją Folks.',
            'Volvo for Safety — dedykowane stories i reelsy o filozofii bezpieczeństwa marki.',
            'Piknik Modelarski — relacja z atmosfery wydarzenia i aktywności dla rodzin.',
            'Midsommar w Domu Volvo — 3-dniowa obecność na evencie i treści inspirowane szwedzkimi tradycjami.',
          ])
        ),
        media: [
          {
            file: 'volvo-event-safety.jpg',
            alt: 'Symulator dachowania Volvo for Safety na wydarzeniu plenerowym',
          },
          {
            file: 'volvo-event-noc.jpg',
            alt: 'Relacja z Nocy Muzeów w salonie Volvo — koncert w nastrojowym oświetleniu',
          },
          {
            file: 'volvo-event-ex30.jpg',
            alt: 'Elektryczne Volvo EX30 prezentowane na wydarzeniu plenerowym',
          },
        ],
      },
      {
        tag: 'KONKURS',
        heading: '„Volvo oczami dzieci”',
        body: richText(
          para(
            'Zorganizowaliśmy konkurs rysunkowy dla dzieci pt. „Jakie auto powinno wyprodukować Volvo i dlaczego?”. Finałem była wystawa prac połączona z animacjami AI, w których dziecięce rysunki zamieniały się w „żywe auta” na ekranach. Całość podsumowaliśmy relacjami wideo i fotorelacją w mediach społecznościowych obu marek.'
          )
        ),
        media: [
          {
            file: 'volvo-konkurs-podium.jpg',
            alt: 'Podium zwycięzców dziecięcego konkursu rysunkowego Volvo na evencie plenerowym',
          },
        ],
      },
    ],
    results: [
      {
        platform: 'Volvo Car Warszawa',
        metric: 'Nowi obserwatorzy — Facebook',
        value: '+1000',
      },
      {
        platform: 'Volvo Car Warszawa',
        metric: 'Nowi obserwatorzy — Instagram',
        value: '+184',
      },
      {
        platform: 'Dom Volvo',
        metric: 'Nowi obserwatorzy — Facebook',
        value: '+1000',
      },
      {
        platform: 'Dom Volvo',
        metric: 'Nowi obserwatorzy — Instagram',
        value: '+97',
      },
    ],
    // Creatives live in the pillars — no detached gallery for volvo.
    gallery: [],
    publishedAt: '2025-01-25T10:00:00.000Z',
  },
]

// —— Seed ———————————————————————————————————————————————————————————————————

const payload = await getPayload({ config })

async function findOrCreateMedia(filePath: string, alt: string) {
  const filename = path.basename(filePath)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs[0]) {
    return existing.docs[0]
  }
  return payload.create({ collection: 'media', data: { alt }, filePath })
}

/**
 * `--reset <slug>` (repeatable) deletes a study + its media (filename prefixed
 * `<slug>-`) so the loop below recreates it with fresh content/images. Without
 * it the seed is skip-if-exists. Dev only — never pass with `--prod`.
 */
const resetSlugs = process.argv
  .filter((_, i) => process.argv[i - 1] === '--reset')
  .filter((slug) => !slug.startsWith('--'))

for (const slug of resetSlugs) {
  await payload.delete({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
  })
  const media = await payload.delete({
    collection: 'media',
    where: { filename: { like: `${slug}-` } },
  })
  console.log(`~ reset ${slug}: study + ${media.docs.length} media deleted`)
}

for (const study of STUDIES) {
  const existing = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: study.slug } },
    limit: 1,
    draft: true,
  })
  if (existing.totalDocs > 0) {
    console.log(`= case study exists: ${study.slug}`)
    continue
  }

  const cover = await findOrCreateMedia(
    `public/case-studies/${study.slug}/${study.slug}-cover.jpg`,
    study.coverAlt
  )

  const gallery: number[] = []
  for (const image of study.gallery) {
    const media = await findOrCreateMedia(
      `public/case-studies/${study.slug}/${image.file}`,
      image.alt
    )
    gallery.push(media.id)
  }

  let logoId: number | undefined
  if (study.logoPath) {
    const logo = await findOrCreateMedia(
      study.logoPath,
      study.logoAlt ?? `Logo ${study.clientName}`
    )
    logoId = logo.id
  }

  // Pillars: upload each pillar's creatives, then assemble the array rows.
  const approach = []
  for (const pillar of study.pillars) {
    const media: number[] = []
    for (const image of pillar.media) {
      const doc = await findOrCreateMedia(
        `public/case-studies/${study.slug}/${image.file}`,
        image.alt
      )
      media.push(doc.id)
    }
    approach.push({
      ...(pillar.tag ? { tag: pillar.tag } : {}),
      heading: pillar.heading,
      // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical JSON; validated by Payload on create
      body: pillar.body as any,
      media,
    })
  }

  await payload.create({
    collection: 'case-studies',
    data: {
      title: study.title,
      slug: study.slug,
      client: {
        name: study.clientName,
        ...(logoId ? { logo: logoId } : {}),
        // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical JSON; validated by Payload on create
        about: study.clientAbout as any,
      },
      tags: study.tags,
      period: study.period,
      excerpt: study.excerpt,
      cover: cover.id,
      // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical JSON; validated by Payload on create
      challenge: study.challenge as any,
      approach,
      results: study.results,
      gallery,
      publishedAt: study.publishedAt,
      _status: 'published',
    },
  })
  console.log(`+ case study created: ${study.slug}`)
}

console.log('Case-study seed complete.')
process.exit(0)
