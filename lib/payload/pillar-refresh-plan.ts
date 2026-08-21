/**
 * The reviewed plan, as data. GENERATED — edit plan.md and re-run
 * `openspec/changes/refresh-case-study-pillar-creatives/gen-plan.py`.
 *
 * `from`/`to` are filenames rather than ids because ids are per-database: id 1
 * is `tiktok.png` on dev and `blog-1.png` on production. `from` is what the
 * pillar is expected to hold at write time, so a study edited since the review
 * reports stale instead of being overwritten.
 */

export type PillarOp = {
  slug: string
  /** Index into `approach`; the tags are asserted, the index is not trusted. */
  pillar: number
  tagPl: string
  tagEn: string
  /** Filenames expected now (the ones kept plus the ones detached). */
  from: string[]
  /** Filenames afterwards, in render order. */
  to: string[]
}

export type NewMedia = {
  file: string
  /** Folder under `public/case-studies/` holding the encoded bytes. */
  slug: string
  altPl: string
  altEn: string
  /** Drive path or licensed-photo URL. A row without one is never uploaded. */
  source: string
}

export type CoverSwap = {
  slug: string
  file: string
  altPl: string
  altEn: string
  source: string
}

export type ByteReplace = {
  file: string
  slug: string
  altPl?: string
  altEn?: string
  note: string
}

export const PILLAR_OPS: PillarOp[] = [
  {
    slug: 'a1-karting',
    pillar: 0,
    tagPl: '#TWÓJTORDO',
    tagEn: '#YOURTRACKTO',
    from: ['a1-karting-gallery-1-cut.webp'],
    to: ['a1-karting-gallery-8.jpg'],
  },
  {
    slug: 'a1-karting',
    pillar: 1,
    tagPl: '#HUMOR',
    tagEn: '#HUMOR',
    from: ['a1-karting-gallery-2-cut.webp'],
    to: ['a1-karting-gallery-9.jpg'],
  },
  {
    slug: 'a1-karting',
    pillar: 2,
    tagPl: '#EDUKACJA',
    tagEn: '#EDUCATION',
    from: ['a1-karting-gallery-3-cut.webp', 'a1-karting-gallery-4-cut.webp'],
    to: ['a1-karting-gallery-10.jpg', 'a1-karting-gallery-11.jpg'],
  },
  {
    slug: 'a1-karting',
    pillar: 3,
    tagPl: '#DOŚWIADCZENIA',
    tagEn: '#EXPERIENCES',
    from: ['a1-karting-gallery-5-cut.webp', 'a1-karting-gallery-6-cut.webp'],
    to: ['a1-karting-gallery-12.jpg', 'a1-karting-gallery-13.jpg'],
  },
  {
    slug: 'a1-karting',
    pillar: 4,
    tagPl: '#VIDEO',
    tagEn: '#VIDEO',
    from: ['a1-karting-gallery-7-cut.webp'],
    to: [],
  },
  {
    slug: 'ariadna',
    pillar: 0,
    tagPl: '#WIDEO_REKLAMOWE',
    tagEn: '#AD_VIDEO',
    from: [
      'ariadna-gallery-1-cut.webp',
      'ariadna-gallery-2.jpg',
      'ariadna-gallery-3.jpg',
    ],
    to: ['ariadna-gallery-11.jpg', 'ariadna-gallery-12.jpg'],
  },
  {
    slug: 'ariadna',
    pillar: 1,
    tagPl: '#KAMPANIA',
    tagEn: '#CAMPAIGN',
    from: ['ariadna-gallery-4-cut.webp'],
    to: ['ariadna-gallery-13.jpg'],
  },
  {
    slug: 'ariadna',
    pillar: 3,
    tagPl: '#OBSERWUJACY',
    tagEn: '#FOLLOWERS',
    from: ['ariadna-gallery-6-cut.webp', 'ariadna-gallery-9-cut.webp'],
    to: ['ariadna-gallery-6-cut.webp'],
  },
  {
    slug: 'ariadna',
    pillar: 4,
    tagPl: '#WYNIKI',
    tagEn: '#RESULTS',
    from: ['ariadna-gallery-10.jpg'],
    to: ['ariadna-gallery-14.jpg'],
  },
  {
    slug: 'asus',
    pillar: 0,
    tagPl: '#YOUTUBE',
    tagEn: '#YOUTUBE',
    from: ['asus-gallery-1-cut.webp'],
    to: [],
  },
  {
    slug: 'asus',
    pillar: 2,
    tagPl: '#ANIMACJE',
    tagEn: '#ANIMATION',
    from: ['asus-gallery-5-cut.webp'],
    to: [],
  },
  {
    slug: 'asus',
    pillar: 4,
    tagPl: '#KARUZELE',
    tagEn: '#CAROUSELS',
    from: ['asus-gallery-7.jpg', 'asus-gallery-8.jpg'],
    to: [],
  },
  {
    slug: 'breville',
    pillar: 0,
    tagPl: '#SPRZEDAŻ',
    tagEn: '#SALES',
    from: ['breville-gallery-1.jpg'],
    to: ['breville-gallery-7.jpg', 'breville-gallery-8.jpg'],
  },
  {
    slug: 'breville',
    pillar: 1,
    tagPl: '#EKSPERCKOŚĆ',
    tagEn: '#EXPERTISE',
    from: ['breville-gallery-2.jpg'],
    to: ['breville-gallery-9.jpg'],
  },
  {
    slug: 'breville',
    pillar: 3,
    tagPl: '#ZAANGAŻOWANIE',
    tagEn: '#ENGAGEMENT',
    from: ['breville-gallery-6.jpg'],
    to: [
      'breville-gallery-10.jpg',
      'breville-gallery-11.jpg',
      'breville-gallery-12.jpg',
    ],
  },
  {
    slug: 'dolina-charlotty',
    pillar: 1,
    tagPl: '#AUTENTYCZNOŚĆ',
    tagEn: '#AUTHENTICITY',
    from: ['dolina-charlotty-gallery-2-cut.webp'],
    to: [],
  },
  {
    slug: 'dynamic-development',
    pillar: 0,
    tagPl: '#TIKTOK',
    tagEn: '#TIKTOK',
    from: ['dynamic-development-gallery-1-cut.webp'],
    to: [
      'dynamic-development-gallery-1-cut.webp',
      'dynamic-development-gallery-7.jpg',
    ],
  },
  {
    slug: 'dynamic-development',
    pillar: 2,
    tagPl: '#NAGRANIA_WIDEO',
    tagEn: '#VIDEO_SHOOTS',
    from: [
      'dynamic-development-gallery-4-cut.webp',
      'dynamic-development-gallery-5-cut.webp',
    ],
    to: [
      'dynamic-development-gallery-8.jpg',
      'dynamic-development-gallery-9.jpg',
    ],
  },
  {
    slug: 'dynamic-development',
    pillar: 3,
    tagPl: '#SPRZEDAŻ',
    tagEn: '#SALES',
    from: ['dynamic-development-gallery-6-cut.webp'],
    to: ['dynamic-development-gallery-10.jpg'],
  },
  {
    slug: 'ed-invest',
    pillar: 1,
    tagPl: '#WIDEO',
    tagEn: '#VIDEO',
    from: ['ed-invest-gallery-1-cut.webp', 'ed-invest-gallery-2-cut.webp'],
    to: ['ed-invest-gallery-1-cut.webp'],
  },
  {
    slug: 'engie',
    pillar: 0,
    tagPl: '#STRUKTURA_TREŚCI',
    tagEn: '#CONTENT_STRUCTURE',
    from: ['engie-gallery-1-anon-cut.webp'],
    to: ['engie-gallery-7.jpg', 'engie-gallery-8.jpg'],
  },
  {
    slug: 'engie',
    pillar: 1,
    tagPl: '#STRUKTURA_TREŚCI',
    tagEn: '#CONTENT_STRUCTURE',
    from: ['engie-gallery-2-anon-cut.webp'],
    to: ['engie-gallery-9.jpg', 'engie-gallery-10.jpg'],
  },
  {
    slug: 'engie',
    pillar: 2,
    tagPl: '#PERSONALBRANDING',
    tagEn: '#PERSONALBRANDING',
    from: ['engie-gallery-3-anon-cut.webp'],
    to: [],
  },
  {
    slug: 'engie',
    pillar: 4,
    tagPl: '#SPRZEDAŻ',
    tagEn: '#SALES',
    from: ['engie-gallery-5-anon-cut.webp', 'engie-gallery-6-anon-cut.webp'],
    to: ['engie-gallery-11.jpg', 'engie-gallery-12.jpg'],
  },
  {
    slug: 'entelo',
    pillar: 2,
    tagPl: '#NACZASIE',
    tagEn: '#TIMELY',
    from: [
      'entelo-gallery-4-cut.webp',
      'entelo-gallery-5-cut.webp',
      'entelo-gallery-6-cut.webp',
    ],
    to: [
      'entelo-gallery-5-cut.webp',
      'entelo-gallery-10.jpg',
      'entelo-gallery-11.jpg',
    ],
  },
  {
    slug: 'entelo',
    pillar: 3,
    tagPl: '#CONTENT_EDUKACYJNY',
    tagEn: '#EDUCATIONAL_CONTENT',
    from: ['entelo-gallery-7-cut.webp', 'entelo-gallery-8-cut.webp'],
    to: ['entelo-gallery-12.jpg', 'entelo-gallery-13.jpg'],
  },
  {
    slug: 'fm-logistics',
    pillar: 3,
    tagPl: '#EMPLOYERBRANDING',
    tagEn: '#EMPLOYERBRANDING',
    from: ['fm-logistics-employerbranding-1.jpg'],
    to: ['fm-logistics-employerbranding-2.jpg'],
  },
  {
    slug: 'foodsaver',
    pillar: 0,
    tagPl: '#EKSPERCKOŚĆ',
    tagEn: '#EXPERTISE',
    from: ['foodsaver-gallery-1.jpg'],
    to: [
      'foodsaver-gallery-4.jpg',
      'foodsaver-gallery-5.jpg',
      'foodsaver-gallery-6.jpg',
    ],
  },
  {
    slug: 'foodsaver',
    pillar: 1,
    tagPl: '#LIDERNARYNKU',
    tagEn: '#MARKET_LEADER',
    from: ['foodsaver-gallery-2.jpg'],
    to: ['foodsaver-gallery-7.jpg'],
  },
  {
    slug: 'foodsaver',
    pillar: 2,
    tagPl: '#ZAANGAŻOWANIE',
    tagEn: '#ENGAGEMENT',
    from: ['foodsaver-gallery-3.jpg'],
    to: ['foodsaver-gallery-8.jpg', 'foodsaver-gallery-9.jpg'],
  },
  {
    slug: 'kbp',
    pillar: 0,
    tagPl: '#PROMOCJAWYDARZENIA',
    tagEn: '#EVENTPROMOTION',
    from: ['kbp-gallery-1.jpg', 'kbp-gallery-2.jpg'],
    to: [],
  },
  {
    slug: 'kohersen',
    pillar: 0,
    tagPl: '#EKSPERCKOŚĆ',
    tagEn: '#EXPERTISE',
    from: ['kohersen-gallery-1.jpg', 'kohersen-gallery-2.jpg'],
    to: ['kohersen-gallery-9.jpg', 'kohersen-gallery-10.jpg'],
  },
  {
    slug: 'kohersen',
    pillar: 1,
    tagPl: '#ZAANGAŻOWANIE',
    tagEn: '#ENGAGEMENT',
    from: ['kohersen-gallery-3.jpg'],
    to: ['kohersen-gallery-11.jpg', 'kohersen-gallery-12.jpg'],
  },
  {
    slug: 'kohersen',
    pillar: 2,
    tagPl: '#SPRZEDAŻ',
    tagEn: '#SALES',
    from: ['kohersen-gallery-4.jpg'],
    to: ['kohersen-gallery-13.jpg', 'kohersen-gallery-14.jpg'],
  },
  {
    slug: 'kontigo',
    pillar: 2,
    tagPl: '#LIVE',
    tagEn: '#LIVE',
    from: ['kontigo-gallery-4.jpg'],
    to: [],
  },
  {
    slug: 'las-vegans',
    pillar: 0,
    tagPl: '#WEBINARY',
    tagEn: '#WEBINARS',
    from: ['las-vegans-gallery-1.jpg', 'las-vegans-gallery-2.jpg'],
    to: [],
  },
  {
    slug: 'las-vegans',
    pillar: 1,
    tagPl: '#INFLUENCERZY',
    tagEn: '#INFLUENCERS',
    from: ['las-vegans-gallery-3-cut.webp', 'las-vegans-gallery-4.jpg'],
    to: ['las-vegans-gallery-3-cut.webp'],
  },
  {
    slug: 'las-vegans',
    pillar: 2,
    tagPl: '#SPOLECZNOSC_WEGE',
    tagEn: '#VEGAN_COMMUNITY',
    from: ['las-vegans-gallery-5.jpg', 'las-vegans-gallery-6.jpg'],
    to: ['las-vegans-gallery-5.jpg'],
  },
  {
    slug: 'las-vegans',
    pillar: 4,
    tagPl: '#WYNIKI_I_SUKCES',
    tagEn: '#RESULTS_AND_SUCCESS',
    from: ['las-vegans-gallery-9.jpg', 'las-vegans-gallery-10.jpg'],
    to: [],
  },
  {
    slug: 'laurastar',
    pillar: 0,
    tagPl: '#EKSPERCKOŚĆ',
    tagEn: '#EXPERTISE',
    from: ['laurastar-gallery-1-cut.webp'],
    to: [
      'laurastar-gallery-5.jpg',
      'laurastar-gallery-6.jpg',
      'laurastar-gallery-7.jpg',
    ],
  },
  {
    slug: 'laurastar',
    pillar: 1,
    tagPl: '#SPRZEDAŻ',
    tagEn: '#SALES',
    from: ['laurastar-gallery-2.jpg'],
    to: [
      'laurastar-gallery-8.jpg',
      'laurastar-gallery-9.jpg',
      'laurastar-gallery-10.jpg',
    ],
  },
  {
    slug: 'laurastar',
    pillar: 2,
    tagPl: '#ZAANGAŻOWANIE',
    tagEn: '#ENGAGEMENT',
    from: ['laurastar-gallery-4-cut.webp'],
    to: ['laurastar-gallery-11.jpg'],
  },
  {
    slug: 'mazurska-manufaktura-alkoholi',
    pillar: 2,
    tagPl: '#ZASIEG_MEDIALNY',
    tagEn: '#MEDIA_REACH',
    from: [
      'mazurska-manufaktura-alkoholi-gallery-5.jpg',
      'mazurska-manufaktura-alkoholi-gallery-6.jpg',
    ],
    to: ['mazurska-manufaktura-alkoholi-gallery-6.jpg'],
  },
  {
    slug: 'mercator',
    pillar: 0,
    tagPl: '#WIDEOPRODUKTOWE',
    tagEn: '#PRODUCT_VIDEO',
    from: ['mercator-gallery-1.jpg', 'mercator-gallery-2.jpg'],
    to: ['mercator-gallery-9.jpg', 'mercator-gallery-10.jpg'],
  },
  {
    slug: 'mercator',
    pillar: 1,
    tagPl: '#GRAFIKI',
    tagEn: '#GRAPHICS',
    from: ['mercator-gallery-3-cut.webp'],
    to: ['mercator-gallery-11.jpg', 'mercator-gallery-12.jpg'],
  },
  {
    slug: 'mercator',
    pillar: 2,
    tagPl: '#BRANŻEIZASTOSOWANIA',
    tagEn: '#INDUSTRIES_AND_USES',
    from: ['mercator-gallery-4-cut.webp', 'mercator-gallery-5-cut.webp'],
    to: [
      'mercator-gallery-13.jpg',
      'mercator-gallery-14.jpg',
      'mercator-gallery-15.jpg',
    ],
  },
  {
    slug: 'mercator',
    pillar: 3,
    tagPl: '#EVENTYIŻYCIEFIRMY',
    tagEn: '#EVENTS_AND_COMPANY_LIFE',
    from: ['mercator-gallery-6-cut.webp', 'mercator-gallery-7-cut.webp'],
    to: ['mercator-gallery-16.jpg'],
  },
  {
    slug: 'mercator',
    pillar: 4,
    tagPl: '#MODERACJA',
    tagEn: '#MODERATION',
    from: ['mercator-gallery-8.jpg'],
    to: [],
  },
  {
    slug: 'personal-effect',
    pillar: 0,
    tagPl: '#PERSONALEFFECT',
    tagEn: '#PERSONALEFFECT',
    from: [
      'personal-effect-gallery-1-cut.webp',
      'personal-effect-gallery-2-cut.webp',
    ],
    to: ['personal-effect-gallery-11.jpg', 'personal-effect-gallery-12.jpg'],
  },
  {
    slug: 'personal-effect',
    pillar: 1,
    tagPl: '#EKSPERCKOŚĆ',
    tagEn: '#EXPERTISE',
    from: ['personal-effect-gallery-3.jpg', 'personal-effect-gallery-4.jpg'],
    to: ['personal-effect-gallery-13.jpg', 'personal-effect-gallery-14.jpg'],
  },
  {
    slug: 'personal-effect',
    pillar: 3,
    tagPl: '#SESJA',
    tagEn: '#PHOTOSHOOT',
    from: ['personal-effect-gallery-7.jpg', 'personal-effect-gallery-8.jpg'],
    to: ['personal-effect-gallery-15.jpg', 'personal-effect-gallery-16.jpg'],
  },
  {
    slug: 'personal-effect',
    pillar: 4,
    tagPl: '#ROZWÓJ',
    tagEn: '#GROWTH',
    from: [
      'personal-effect-gallery-9-cut.webp',
      'personal-effect-gallery-10-cut.webp',
    ],
    to: [
      'personal-effect-gallery-9-cut.webp',
      'personal-effect-gallery-10-cut.webp',
      'personal-effect-gallery-17.jpg',
    ],
  },
  {
    slug: 'power-elements',
    pillar: 0,
    tagPl: '#PREMIERA_MARKI',
    tagEn: '#BRAND_LAUNCH',
    from: [
      'power-elements-gallery-1-cut.webp',
      'power-elements-gallery-2-cut.webp',
    ],
    to: [
      'power-elements-gallery-10.jpg',
      'power-elements-gallery-11.jpg',
      'power-elements-gallery-12.jpg',
    ],
  },
  {
    slug: 'power-elements',
    pillar: 1,
    tagPl: '#LIFESTYLE',
    tagEn: '#LIFESTYLE',
    from: ['power-elements-gallery-3.jpg', 'power-elements-gallery-4-cut.webp'],
    to: ['power-elements-gallery-13.jpg'],
  },
  {
    slug: 'power-elements',
    pillar: 2,
    tagPl: '#EDUKACJA',
    tagEn: '#EDUCATION',
    from: [
      'power-elements-gallery-5-cut.webp',
      'power-elements-gallery-6-cut.webp',
    ],
    to: ['power-elements-gallery-14.jpg', 'power-elements-gallery-15.jpg'],
  },
  {
    slug: 'power-elements',
    pillar: 3,
    tagPl: '#COMMUNITY',
    tagEn: '#COMMUNITY',
    from: ['power-elements-gallery-7-cut.webp'],
    to: [],
  },
  {
    slug: 'pracuj-pl',
    pillar: 0,
    tagPl: '',
    tagEn: '',
    from: [],
    to: ['pracuj-pl-gallery-1.jpg'],
  },
  {
    slug: 'pracuj-pl',
    pillar: 2,
    tagPl: '#CONTENT',
    tagEn: '#CONTENT',
    from: [],
    to: ['pracuj-pl-gallery-2.jpg', 'pracuj-pl-gallery-3.jpg'],
  },
  {
    slug: 'pracuj-pl',
    pillar: 3,
    tagPl: '#CONTENT',
    tagEn: '#CONTENT',
    from: [],
    to: ['pracuj-pl-gallery-4.jpg', 'pracuj-pl-gallery-5.jpg'],
  },
  {
    slug: 'stadler-form',
    pillar: 0,
    tagPl: '#ROZPOZNAWALNOŚĆ',
    tagEn: '#RECOGNITION',
    from: ['stadler-form-gallery-1.jpg', 'stadler-form-gallery-2.jpg'],
    to: ['stadler-form-gallery-11.jpg', 'stadler-form-gallery-12.jpg'],
  },
  {
    slug: 'stadler-form',
    pillar: 1,
    tagPl: '#MODERACJA',
    tagEn: '#MODERATION',
    from: ['stadler-form-gallery-3.jpg', 'stadler-form-gallery-4.jpg'],
    to: [],
  },
  {
    slug: 'stadler-form',
    pillar: 2,
    tagPl: '#EKSPERCKOŚĆ',
    tagEn: '#EXPERTISE',
    from: ['stadler-form-gallery-5.jpg', 'stadler-form-gallery-6.jpg'],
    to: ['stadler-form-gallery-13.jpg'],
  },
  {
    slug: 'stadler-form',
    pillar: 3,
    tagPl: '#WIDEO',
    tagEn: '#VIDEO',
    from: ['stadler-form-gallery-7.jpg', 'stadler-form-gallery-8.jpg'],
    to: ['stadler-form-gallery-14.jpg', 'stadler-form-gallery-15.jpg'],
  },
  {
    slug: 'vobis',
    pillar: 0,
    tagPl: '#RTM',
    tagEn: '#RTM',
    from: ['vobis-gallery-1.jpg', 'vobis-gallery-2.jpg'],
    to: ['vobis-gallery-5.jpg', 'vobis-gallery-6.jpg', 'vobis-gallery-7.jpg'],
  },
  {
    slug: 'vobis',
    pillar: 1,
    tagPl: '#NOWE_FORMATY_POSTÓW',
    tagEn: '#NEW_POST_FORMATS',
    from: ['vobis-gallery-3.jpg'],
    to: ['vobis-gallery-8.jpg', 'vobis-gallery-9.jpg', 'vobis-gallery-10.jpg'],
  },
  {
    slug: 'vobis',
    pillar: 2,
    tagPl: '#MODERACJA',
    tagEn: '#MODERATION',
    from: ['vobis-gallery-4-cut.webp'],
    to: [],
  },
  {
    slug: 'volvo',
    pillar: 0,
    tagPl: '#STRUKTURA TREŚCI',
    tagEn: '#CONTENT STRUCTURE',
    from: ['volvo-vcw-post-anon-cut.webp'],
    to: ['volvo-gallery-1.jpg', 'volvo-gallery-2.jpg'],
  },
  {
    slug: 'volvo',
    pillar: 1,
    tagPl: '#STRUKTURA TREŚCI',
    tagEn: '#CONTENT STRUCTURE',
    from: ['volvo-vcw-goracy-anon-cut.webp'],
    to: ['volvo-gallery-3.jpg'],
  },
  {
    slug: 'volvo',
    pillar: 3,
    tagPl: 'KONKURS',
    tagEn: 'CONTEST',
    from: ['volvo-konkurs-warsztat.jpg'],
    to: ['volvo-gallery-4.jpg', 'volvo-gallery-5.jpg', 'volvo-gallery-6.jpg'],
  },
]

export const NEW_MEDIA: NewMedia[] = [
  {
    file: 'a1-karting-gallery-8.jpg',
    slug: 'a1-karting',
    altPl:
      'Kreacja A1Karting z kierowcą w kasku za kierownicą gokarta i hasłem „Twój TOR do niezapomnianych wakacji dla dziecka!”',
    altEn:
      'A1Karting creative showing a helmeted driver at the wheel of a go-kart, headlined "Twój TOR do niezapomnianych wakacji dla dziecka!" ("Your TRACK to an unforgettable holiday for your child").',
    source: 'A1Karting/493327521_1082966043858780_8113436834600735712_n.jpg',
  },
  {
    file: 'a1-karting-gallery-9.jpg',
    slug: 'a1-karting',
    altPl:
      'Konkursowa kreacja A1Karting z hasłem „KONKURS NA FACEBOOKU” i voucherem o wartości 200 zł do wygrania',
    altEn:
      'A1Karting contest creative headlined "KONKURS NA FACEBOOKU" ("Facebook contest"), with a 200 zł voucher as the prize.',
    source: 'A1Karting/754015532_1461547042667343_888926444298767976_n.jpg',
  },
  {
    file: 'a1-karting-gallery-10.jpg',
    slug: 'a1-karting',
    altPl:
      'Kadr z rolki A1Karting — osoba w kombinezonie i kasku trzyma cztery flagi wyścigowe, napis „Szybkie przypomnienie, co która flaga oznacza!”',
    altEn:
      'Frame from an A1Karting reel: a person in racing overalls and helmet holding four racing flags, captioned "Szybkie przypomnienie, co która flaga oznacza!" ("A quick reminder of what each flag means").',
    source: 'A1Karting/Zrzut ekranu 2026-08-20 o 16.33.30.png',
  },
  {
    file: 'a1-karting-gallery-11.jpg',
    slug: 'a1-karting',
    altPl:
      'Kadr z rolki A1Karting z gokartem na torze i napisami „Jeździsz 10 okrążeń i czas stoi w miejscu?” oraz „Poznaj 3 najczęstsze błędy!”',
    altEn:
      'Frame from an A1Karting reel showing a go-kart on the track, captioned "Jeździsz 10 okrążeń i czas stoi w miejscu?" ("Ten laps in and time stands still?") and "Poznaj 3 najczęstsze błędy!" ("Learn the 3 most common mistakes").',
    source: 'A1Karting/Zrzut ekranu 2026-08-20 o 16.34.33.png',
  },
  {
    file: 'a1-karting-gallery-12.jpg',
    slug: 'a1-karting',
    altPl:
      'Kreacja A1Karting z pustym torem gokartowym i hasłem „Wakacyjna szkoła gokartowa dla Twojego dziecka”',
    altEn:
      'A1Karting creative showing an empty go-kart track, headlined "Wakacyjna szkoła gokartowa dla Twojego dziecka" ("Holiday go-kart school for your child").',
    source: 'A1Karting/712269032_1407337288088319_946689192639002079_n.jpg',
  },
  {
    file: 'a1-karting-gallery-13.jpg',
    slug: 'a1-karting',
    altPl:
      'Kreacja A1Karting z kierowcą świętującym w gokarcie i hasłem „Event na pełnym gazie”',
    altEn:
      'A1Karting creative showing a driver celebrating in a go-kart, headlined "Event na pełnym gazie" ("An event at full throttle").',
    source: 'A1Karting/772178535_1473141981507849_1507529529558535917_n.jpg',
  },
  {
    file: 'ariadna-gallery-11.jpg',
    slug: 'ariadna',
    altPl:
      'Kadr z filmu Panelu Badawczego Ariadna — kobieta przy stole w mieszkaniu, napis „Tylko jedna ankieta i już do ciebie idę”',
    altEn:
      'Frame from an Ariadna Research Panel video: a woman at a dining table, captioned "Tylko jedna ankieta i już do ciebie idę" ("Just one survey and I\'m on my way").',
    source: 'Ariadna/Zrzut ekranu 2026-08-20 o 15.54.09.png',
  },
  {
    file: 'ariadna-gallery-12.jpg',
    slug: 'ariadna',
    altPl:
      'Kadr z filmu Ariadny — kobieta w słuchawkach nad laptopem, napis „POV: otwieram stronę Panelu Badawczego Ariadna i mam nowe ankiety do wypełnienia”',
    altEn:
      'Frame from an Ariadna video: a woman in headphones over a laptop, captioned "POV: otwieram stronę Panelu Badawczego Ariadna i mam nowe ankiety do wypełnienia" ("POV: I open the Ariadna Research Panel and there are new surveys to fill in").',
    source: 'Ariadna/Zrzut ekranu 2026-08-20 o 15.54.30.png',
  },
  {
    file: 'ariadna-gallery-13.jpg',
    slug: 'ariadna',
    altPl:
      'Kadr z filmu Ariadny — twórczyni mówi do kamery, napis „czym tak naprawdę jest Panel Badawczy Ariadna”',
    altEn:
      'Frame from an Ariadna video: a creator talking to camera, captioned "czym tak naprawdę jest Panel Badawczy Ariadna" ("what the Ariadna Research Panel really is").',
    source: 'Ariadna/Zrzut ekranu 2026-08-20 o 15.55.14.png',
  },
  {
    file: 'ariadna-gallery-14.jpg',
    slug: 'ariadna',
    altPl:
      'Kadr z filmu Ariadny — twórczyni do kamery, podpis „Otwieram oczy na rzeczy, które są prawdą o Panelu Badawczym Ariadna”',
    altEn:
      'Frame from an Ariadna video: a creator talking to camera, captioned "Otwieram oczy na rzeczy, które są prawdą o Panelu Badawczym Ariadna" ("I\'m opening eyes to the truth about the Ariadna Research Panel").',
    source: 'Ariadna/Zrzut ekranu 2026-08-20 o 15.55.53.png',
  },
  {
    file: 'breville-gallery-7.jpg',
    slug: 'breville',
    altPl:
      'Kreacja Breville z frytkownicą beztłuszczową i czerwoną peleryną, hasło „Nie każdy superbohater nosi pelerynę”, podpis „niektórzy mają dwie komory i 10 programów”',
    altEn:
      'Breville creative showing an air fryer with a red cape, headlined "Nie każdy superbohater nosi pelerynę" ("Not every superhero wears a cape") and captioned "niektórzy mają dwie komory i 10 programów" ("some have two baskets and 10 programmes").',
    source: 'breville/594451694_868924128840347_3914302290942699982_n.jpg',
  },
  {
    file: 'breville-gallery-8.jpg',
    slug: 'breville',
    altPl:
      'Kreacja Breville z frytkownicą na tle rozmytej imprezy z konfetti, hasło „Nie robi hałasu, a robi robotę”',
    altEn:
      'Breville creative showing an air fryer against a blurred party with confetti, headlined "Nie robi hałasu, a robi robotę" ("It makes no noise, it does the work").',
    source: 'breville/614379847_895334206199339_3030327512633791789_n.jpg',
  },
  {
    file: 'breville-gallery-9.jpg',
    slug: 'breville',
    altPl:
      'Kreacja Breville z czerwoną piramidą potrzeb, w każdym poziomie napis „TOSTY”, nagłówek „Moje potrzeby w życiu”',
    altEn:
      'Breville creative showing a red pyramid of needs with "TOSTY" ("toasties") on every tier, headlined "Moje potrzeby w życiu" ("My needs in life").',
    source: 'breville/684163416_979154617817297_4249043625140901793_n.jpg',
  },
  {
    file: 'breville-gallery-10.jpg',
    slug: 'breville',
    altPl:
      'Kreacja Breville z grupą kibiców przed telewizorem i hasłem „Ja bym zrobił to lepiej”, podpis „Czyli co można powiedzieć gotując obiad i oglądając Igrzyska?”',
    altEn:
      'Breville creative showing a group of armchair fans, headlined "Ja bym zrobił to lepiej" ("I\'d have done it better") over "Czyli co można powiedzieć gotując obiad i oglądając Igrzyska?" ("Things you say while cooking dinner and watching the Games").',
    source: 'breville/629603811_913456344387125_123559123812105571_n.jpg',
  },
  {
    file: 'breville-gallery-11.jpg',
    slug: 'breville',
    altPl:
      'Kreacja Breville z kobietą pijącą kawę i hasłem „Picie kawy wydłuża życie”, podpis „Ja: W takim razie planuję żyć wiecznie”',
    altEn:
      'Breville creative showing a woman drinking coffee, headlined "Picie kawy wydłuża życie" ("Coffee makes you live longer") over "Ja: W takim razie planuję żyć wiecznie" ("Me: then I plan to live forever").',
    source: 'breville/658242185_956784276720998_1459880214767815199_n.jpg',
  },
  {
    file: 'breville-gallery-12.jpg',
    slug: 'breville',
    altPl:
      'Kreacja Breville z filiżanką odwróconą nad spodkiem i fusami po kawie, hasło „ANDRZEJKI? Nie wróż z fusów… zrób espresso!”',
    altEn:
      'Breville creative showing a cup tipped over its saucer with coffee grounds, headlined "ANDRZEJKI? Nie wróż z fusów… zrób espresso!" ("St Andrew\'s Eve? Don\'t read the grounds — pull an espresso").',
    source: 'breville/Zrzut ekranu 2026-08-20 o 15.13.56.png',
  },
  {
    file: 'dynamic-development-gallery-7.jpg',
    slug: 'dynamic-development',
    altPl:
      'Kadr z filmu Dynamic Development — kobieta w czapce Mikołaja z prezentową torbą, napis „Ja w wigilię, kiedy żaden prezent nie wygląda jak własne mieszkanie”',
    altEn:
      'Frame from a Dynamic Development video: a woman in a Santa hat holding a gift bag, captioned "Ja w wigilię, kiedy żaden prezent nie wygląda jak własne mieszkanie" ("Me on Christmas Eve, when no present looks like a flat of my own").',
    source: 'dynamic development/Zrzut ekranu 2026-08-20 o 16.45.56.png',
  },
  {
    file: 'dynamic-development-gallery-8.jpg',
    slug: 'dynamic-development',
    altPl:
      'Ujęcie z drona na osiedle domów w Nowej Woli, napis „Dlaczego warto zamieszkać w Nowej Woli pod Warszawą?”',
    altEn:
      'Drone shot of a housing estate in Nowa Wola, captioned "Dlaczego warto zamieszkać w Nowej Woli pod Warszawą?" ("Why live in Nowa Wola near Warsaw?").',
    source: 'dynamic development/Zrzut ekranu 2026-08-20 o 16.45.43.png',
  },
  {
    file: 'dynamic-development-gallery-9.jpg',
    slug: 'dynamic-development',
    altPl:
      'Kadr z filmu Dynamic Development — mężczyzna z kubkiem przy oknie w jasnej kuchni, napis „Poznaj Dynamic Development i zacznij spełniać marzenia JUŻ DZIŚ!”',
    altEn:
      'Frame from a Dynamic Development video: a man with a mug by a kitchen window, captioned "Poznaj Dynamic Development i zacznij spełniać marzenia JUŻ DZIŚ!" ("Meet Dynamic Development and start making your dreams happen TODAY").',
    source: 'dynamic development/Zrzut ekranu 2026-08-20 o 16.46.07.png',
  },
  {
    file: 'dynamic-development-gallery-10.jpg',
    slug: 'dynamic-development',
    altPl:
      'Ujęcie z drona na apartamentowiec Dynamic Development, napis „Najlepsze miejsce do życia to…”',
    altEn:
      'Drone shot of a Dynamic Development apartment building, captioned "Najlepsze miejsce do życia to…" ("The best place to live is…").',
    source: 'dynamic development/Zrzut ekranu 2026-08-20 o 16.46.26.png',
  },
  {
    file: 'engie-gallery-7.jpg',
    slug: 'engie',
    altPl:
      'Kreacja ENGIE z lotu ptaka na rynek Słupska i broszurą „Transformacja energetyczna Słupska”, hasło „Transformacja energetyczna zaczyna się LOKALNIE!”',
    altEn:
      'ENGIE creative with an aerial view of Słupsk and a "Transformacja energetyczna Słupska" brochure, headlined "Transformacja energetyczna zaczyna się LOKALNIE!" ("The energy transition starts LOCALLY").',
    source: 'ENGIE/644335809_1240339684743849_1469008170995568934_n.jpg',
  },
  {
    file: 'engie-gallery-8.jpg',
    slug: 'engie',
    altPl:
      'Kreacja ENGIE z tenisistą na korcie ziemnym, hasło „Energia odnawialna na… KORCIE?” i informacja „ENGIE oficjalnym partnerem Roland-Garros”',
    altEn:
      'ENGIE creative showing a tennis player on clay, headlined "Energia odnawialna na… KORCIE?" ("Renewable energy on… the COURT?") over "ENGIE oficjalnym partnerem Roland-Garros" ("ENGIE is an official Roland-Garros partner").',
    source: 'ENGIE/684817931_1291753976269086_5464050851041201007_n.jpg',
  },
  {
    file: 'engie-gallery-9.jpg',
    slug: 'engie',
    altPl:
      'Kreacja ENGIE na Światowy Dzień Facility Management — pracownik w kamizelce odblaskowej ze świetlnym mieczem, hasło „Niech MOC będzie z Wami!”',
    altEn:
      'ENGIE creative for World Facility Management Day: a worker in a hi-vis vest holding a lightsaber, headlined "Niech MOC będzie z Wami!" ("May the FORCE be with you").',
    source: 'ENGIE/1778669032195.jpeg',
  },
  {
    file: 'engie-gallery-10.jpg',
    slug: 'engie',
    altPl:
      'Kreacja ENGIE z ramieniem po pobraniu krwi i odznaczeniami honorowego dawcy, hasło „Ludzie ENGIE po godzinach — honorowi dawcy krwi wśród pracowników ENGIE”',
    altEn:
      'ENGIE creative showing an arm after a blood donation beside donor medals, headlined "Ludzie ENGIE po godzinach" ("ENGIE people after hours") over "honorowi dawcy krwi wśród pracowników ENGIE" ("blood donors among ENGIE staff").',
    source: 'ENGIE/723675201_1324318073012676_8683771351082000389_n.jpg',
  },
  {
    file: 'engie-gallery-11.jpg',
    slug: 'engie',
    altPl:
      'Kreacja ENGIE z magazynem energii o zmierzchu, hasło „Jeden z największych magazynów energii w Polsce” i podpis „ENGIE finalizuje umowę z R.Power”',
    altEn:
      'ENGIE creative showing a battery storage site at dusk, headlined "Jeden z największych magazynów energii w Polsce" ("One of the largest energy storage sites in Poland") over "ENGIE finalizuje umowę z R.Power" ("ENGIE closes a deal with R.Power").',
    source: 'ENGIE/sprzedaż 1',
  },
  {
    file: 'engie-gallery-12.jpg',
    slug: 'engie',
    altPl:
      'Kreacja ENGIE na tle farmy fotowoltaicznej z informacją o współpracy z BAT i Volta przy dostawach zielonej energii w ramach kontraktu cPPA',
    altEn:
      'ENGIE creative over a solar farm announcing green-energy supply with BAT and Volta under a "kontrakt cPPA" ("cPPA contract").',
    source: 'ENGIE/sprzedaż 2',
  },
  {
    file: 'entelo-gallery-10.jpg',
    slug: 'entelo',
    altPl:
      'Kreacja Entelo z czerwonym krzesłem obrotowym i hasłem „Euro wizja naszych krzeseł”',
    altEn:
      'Entelo creative showing a red swivel chair, headlined "Euro wizja naszych krzeseł" ("The Euro vision of our chairs").',
    source: 'Entelo/497845600_1294255309371486_6911605043553350752_n.jpg',
  },
  {
    file: 'entelo-gallery-11.jpg',
    slug: 'entelo',
    altPl:
      'Kreacja Entelo z krzesłem w piłki nożne i hasłem „Gorące krzesło w polskiej piłce”',
    altEn:
      'Entelo creative showing a chair upholstered in footballs, headlined "Gorące krzesło w polskiej piłce" ("The hot seat in Polish football").',
    source: 'Entelo/505303906_1314879410642409_918236179533522748_n.jpg',
  },
  {
    file: 'entelo-gallery-12.jpg',
    slug: 'entelo',
    altPl:
      'Zadanie „Znajdź różnicę” Entelo — siatka ponumerowanych zielonych krzeseł szkolnych',
    altEn:
      'Entelo spot-the-difference puzzle headlined "Znajdź różnicę" ("Find the difference"), a grid of numbered green school chairs.',
    source: 'Entelo/495154339_1286092116854472_3180218082671986073_n.jpg',
  },
  {
    file: 'entelo-gallery-13.jpg',
    slug: 'entelo',
    altPl:
      'Kreacja Entelo z krzesłem dziecięcym w pudełku jak zabawka, hasło „Dobre krzesło — wspieramy zdrowie dzieci”',
    altEn:
      'Entelo creative showing a child\'s chair boxed like a toy, headlined "Dobre krzesło" ("A good chair") with "wspieramy zdrowie dzieci" ("we support children\'s health").',
    source: 'Entelo/496811563_1292373459559671_1857210440861797481_n.jpg',
  },
  {
    file: 'fm-logistics-employerbranding-2.jpg',
    slug: 'fm-logistics',
    altPl:
      'Mężczyzna w ciemnym garniturze przy oknie biurowca, poprawia mankiet koszuli',
    altEn:
      'A man in a dark suit standing by an office window, adjusting his shirt cuff.',
    source:
      'Pexels 10541203 — https://www.pexels.com/photo/a-man-in-a-suit-standing-by-the-windows-10541203/',
  },
  {
    file: 'foodsaver-gallery-4.jpg',
    slug: 'foodsaver',
    altPl:
      'Kreacja FoodSaver z kolbą ekspresu pełną fusów, hasło „Sposób na fusy po kawie” i podpis „Zrób naturalny peeling”',
    altEn:
      'FoodSaver creative showing a portafilter full of coffee grounds, headlined "Sposób na fusy po kawie" ("What to do with used coffee grounds") over "Zrób naturalny peeling" ("Make a natural scrub").',
    source: 'Foodsaver/651894644_1766928704717851_4141036283063212305_n.jpg',
  },
  {
    file: 'foodsaver-gallery-5.jpg',
    slug: 'foodsaver',
    altPl:
      'Kreacja FoodSaver z pęczkiem pietruszki, hasło „Nie wyrzucaj, zrób… GLOW UP PIETRUSZKI”',
    altEn:
      'FoodSaver creative showing a bunch of parsley, headlined "Nie wyrzucaj, zrób…" ("Don\'t throw it out, make…") over "GLOW UP PIETRUSZKI" ("a parsley glow-up").',
    source: 'Foodsaver/683098284_1810169040393817_5270922757677103277_n.jpg',
  },
  {
    file: 'foodsaver-gallery-6.jpg',
    slug: 'foodsaver',
    altPl:
      'Kreacja FoodSaver z placuszkami z łodyg brokuła, hasło „Łodygi brokuła? Zrób z nich placki”',
    altEn:
      'FoodSaver creative showing broccoli-stalk fritters, headlined "Łodygi brokuła?" ("Broccoli stalks?") over "Zrób z nich placki" ("Turn them into fritters").',
    source: 'Foodsaver/684551676_1810166860394035_7788305411739426616_n.jpg',
  },
  {
    file: 'foodsaver-gallery-7.jpg',
    slug: 'foodsaver',
    altPl:
      'Kreacja FoodSaver z zapakowanymi próżniowo owocami w zamrażarce, hasło „Przedłużamy termin ważności sezonu na letnie smaki”',
    altEn:
      'FoodSaver creative showing vacuum-sealed fruit in a freezer, headlined "Przedłużamy termin ważności sezonu na letnie smaki" ("Extending the shelf life of summer flavours").',
    source: 'Foodsaver/763894969_1905176504226403_3248176006712551741_n.jpg',
  },
  {
    file: 'foodsaver-gallery-8.jpg',
    slug: 'foodsaver',
    altPl:
      'Kreacja FoodSaver „Eurowizyjne bingo” — plansza bingo z eurowizyjnymi hasłami',
    altEn:
      'FoodSaver "Eurowizyjne bingo" ("Eurovision bingo") card filled with Eurovision clichés.',
    source: 'Foodsaver/494541972_1490690212341703_3586641406543239619_n.jpg',
  },
  {
    file: 'foodsaver-gallery-9.jpg',
    slug: 'foodsaver',
    altPl:
      'Kreacja FoodSaver z mięsem zapakowanym próżniowo i po przyprawieniu, hasło „Stranger Foods”',
    altEn:
      'FoodSaver creative showing meat vacuum-sealed and then seasoned, headlined "Stranger Foods".',
    source: 'Foodsaver/606030222_1702707397806649_236837690219173832_n.jpg',
  },
  {
    file: 'kohersen-gallery-9.jpg',
    slug: 'kohersen',
    altPl:
      'Kreacja Kohersen z garnkiem na scenie koncertowej, hasło „Moje imię gaaa…” i opis garnka DIAMOND Black Cube 28 cm z funkcją gotowania na parze',
    altEn:
      'Kohersen creative showing a pot on a concert stage, headlined "Moje imię gaaa…" ("My name is gaaa…"), describing the DIAMOND Black Cube 28 cm pot with a steaming function.',
    source: 'Kohersen/494760074_960008592990816_9035161479361039769_n (1).jpg',
  },
  {
    file: 'kohersen-gallery-10.jpg',
    slug: 'kohersen',
    altPl:
      'Kreacja Kohersen z telefonem, na ekranie profil w stylu aplikacji randkowej „Matt, 26 lat” prezentujący płytę indukcyjną marki',
    altEn:
      'Kohersen creative showing a phone with a dating-app style profile, "Matt, 26 lat" ("Matt, 26"), presenting the brand\'s induction hob.',
    source: 'Kohersen/633150794_1174909284834078_6053914903375607648_n.jpg',
  },
  {
    file: 'kohersen-gallery-11.jpg',
    slug: 'kohersen',
    altPl:
      'Kreacja Kohersen z mężczyzną trzymającym paragon i drożdżówkę, napis „POV: Kupujesz drożdżówkę z poziomkami w 2026 roku”',
    altEn:
      'Kohersen creative showing a man with a receipt and a pastry, captioned "POV: Kupujesz drożdżówkę z poziomkami w 2026 roku" ("POV: buying a wild-strawberry bun in 2026").',
    source: 'Kohersen/Zrzut ekranu 2026-08-20 o 16.28.26.png',
  },
  {
    file: 'kohersen-gallery-12.jpg',
    slug: 'kohersen',
    altPl:
      'Kreacja Kohersen z rozczarowaną kobietą, napis „Kiedy miały być wspólne walentynki, ale on zamówił pizzę hawajską”',
    altEn:
      'Kohersen creative showing a dismayed woman, captioned "Kiedy miały być wspólne walentynki, ale on zamówił pizzę hawajską" ("When it was meant to be Valentine\'s together and he ordered Hawaiian pizza").',
    source: 'Kohersen/Zrzut ekranu 2026-08-20 o 16.29.20.png',
  },
  {
    file: 'kohersen-gallery-13.jpg',
    slug: 'kohersen',
    altPl:
      'Kreacja sprzedażowa Kohersen z jajecznicą na patelni i hasłem „Twoja kuchnia woła o nową gwiazdę!”, w rogu rabat -30%',
    altEn:
      'Kohersen sales creative showing fried eggs in a pan, headlined "Twoja kuchnia woła o nową gwiazdę!" ("Your kitchen is calling for a new star") with a -30% flash.',
    source: 'Kohersen/560419038_1085650400426634_903074528035576042_n.jpg',
  },
  {
    file: 'kohersen-gallery-14.jpg',
    slug: 'kohersen',
    altPl:
      'Kreacja konkursowa Kohersen z grillem elektrycznym i hasłem „Wygraj grill elektryczny — konkurs nadal trwa”',
    altEn:
      'Kohersen contest creative showing an electric grill, headlined "Wygraj grill elektryczny" ("Win an electric grill") with "konkurs nadal trwa" ("the contest is still running").',
    source: 'Kohersen/694463165_1247275750930764_3297689314223062661_n.jpg',
  },
  {
    file: 'laurastar-gallery-5.jpg',
    slug: 'laurastar',
    altPl:
      'Kreacja Laurastar z prasowaniem fioletowej koszuli w kłębach pary, hasło „As w rękawie”',
    altEn:
      'Laurastar creative showing a violet shirt being steamed, headlined "As w rękawie" ("An ace up the sleeve").',
    source: 'Laurastar/492810376_1191602819642455_1767217643963503705_n.jpg',
  },
  {
    file: 'laurastar-gallery-6.jpg',
    slug: 'laurastar',
    altPl:
      'Kreacja Laurastar z żelazkiem parowym nad tkaniną, hasło „Promocyjna odwilż”',
    altEn:
      'Laurastar creative showing a steam iron over fabric, headlined "Promocyjna odwilż" ("A promotional thaw").',
    source: 'Laurastar/653708465_1478107137658687_8107918694848651288_n.jpg',
  },
  {
    file: 'laurastar-gallery-7.jpg',
    slug: 'laurastar',
    altPl:
      'Kadr z filmu Laurastar — mężczyzna przy generatorze pary odpowiada na komentarz o ciśnieniu 3,5 bara',
    altEn:
      'Frame from a Laurastar video: a man beside a steam generator answering a comment about 3.5 bar pressure.',
    source: 'Laurastar/Zrzut ekranu 2026-08-20 o 15.24.01.png',
  },
  {
    file: 'laurastar-gallery-8.jpg',
    slug: 'laurastar',
    altPl:
      'Kreacja Laurastar ze złotym generatorem pary na tle ceglanej ściany, hasło „Prasuje jak złoto”',
    altEn:
      'Laurastar creative showing a gold steam generator against a brick wall, headlined "Prasuje jak złoto" ("Irons like gold").',
    source: 'Laurastar/547098270_1313686134100789_7283056964596199204_n.jpg',
  },
  {
    file: 'laurastar-gallery-9.jpg',
    slug: 'laurastar',
    altPl:
      'Kreacja Laurastar z czerwonym generatorem pary obok czerwonych szpilek, hasło „Asystentka, na której możesz polegać”',
    altEn:
      'Laurastar creative showing a red steam generator beside red heels, headlined "Asystentka, na której możesz polegać" ("An assistant you can rely on").',
    source:
      'Laurastar/686135776_1517794080356659_5905651035736405081_n (1).jpg',
  },
  {
    file: 'laurastar-gallery-10.jpg',
    slug: 'laurastar',
    altPl:
      'Kreacja Laurastar z generatorem pary pod rozgwieżdżonym niebem, hasło „Nie czekaj na spadającą gwiazdę”',
    altEn:
      'Laurastar creative showing a steam generator under a starry sky, headlined "Nie czekaj na spadającą gwiazdę" ("Don\'t wait for a shooting star").',
    source: 'Laurastar/773450217_1614346400701426_2927462322582943599_n.jpg',
  },
  {
    file: 'laurastar-gallery-11.jpg',
    slug: 'laurastar',
    altPl:
      'Kreacja Laurastar z dwiema koszulkami piłkarskimi na desce do prasowania, hasło „Którą koszulkę byś wyprasował?”',
    altEn:
      'Laurastar creative showing two football shirts on an ironing board, headlined "Którą koszulkę byś wyprasował?" ("Which shirt would you iron?").',
    source:
      'Laurastar/748096758_1590458776423522_4761183726666844050_n (1).jpg',
  },
  {
    file: 'mercator-gallery-9.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z kosmetolożką w różowych rękawicach nitrylex pink, hasło „Jakie zabiegi kosmetyczne wykonywać latem?”, poniżej wymagany disclaimer o wyrobie medycznym',
    altEn:
      'Mercator creative showing a beautician in pink nitrylex gloves, headlined "Jakie zabiegi kosmetyczne wykonywać latem?" ("Which beauty treatments to have in summer?"), above the required medical-device disclaimer.',
    source: 'Mercator/735150241_1561436302658911_842602233470016960_n.jpg',
  },
  {
    file: 'mercator-gallery-10.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator porównująca emoji rękawicy z kolorowymi rękawicami marki, hasło „Emoji rękawic? Fajne… ale przydałby się mały update”, poniżej wymagany disclaimer o wyrobie medycznym',
    altEn:
      'Mercator creative comparing the glove emoji with the brand\'s coloured gloves, headlined "Emoji rękawic? Fajne… ale przydałby się mały update" ("Glove emoji? Nice… but they could use an update"), above the required medical-device disclaimer.',
    source: 'Mercator/735734788_1564337499035458_1770879368995867526_n.jpg',
  },
  {
    file: 'mercator-gallery-11.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z truskawkami i lodami nakładanymi w niebieskich rękawicach nitrylex classic, hasło „Smak lata w dobrych rękach”, poniżej wymagany disclaimer o wyrobie medycznym',
    altEn:
      'Mercator creative showing strawberries and ice cream scooped in blue nitrylex classic gloves, headlined "Smak lata w dobrych rękach" ("The taste of summer in good hands"), above the required medical-device disclaimer.',
    source: 'Mercator/741606684_1568852315250643_7218793640481486217_n.jpg',
  },
  {
    file: 'mercator-gallery-12.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z dwiema rękawicami układającymi serce, hasło „My od zawsze wiedzieliśmy, że ten zestaw idealnie do siebie pasuje”',
    altEn:
      'Mercator creative showing two gloved hands forming a heart, headlined "My od zawsze wiedzieliśmy, że ten zestaw idealnie do siebie pasuje" ("We always knew this pair was a perfect match").',
    source: 'Mercator/747903077_1576164457852762_1820636940554379488_n.jpg',
  },
  {
    file: 'mercator-gallery-13.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z kucharzem w czarnych rękawicach nitrylex black w foodtrucku, hasło „Gdybyś miał własnego foodtrucka, to jak byś go nazwał?”, poniżej wymagany disclaimer o wyrobie medycznym',
    altEn:
      'Mercator creative showing a cook in black nitrylex gloves at a food truck, headlined "Gdybyś miał własnego foodtrucka, to jak byś go nazwał?" ("If you had your own food truck, what would you call it?"), above the required medical-device disclaimer.',
    source: 'Mercator/752648878_1581089394026935_7335826461306289271_n.jpg',
  },
  {
    file: 'mercator-gallery-14.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z mechanikiem w pomarańczowych rękawicach przy rowerze, hasło „Warsztatowe triki, które oszczędzają czas”',
    altEn:
      'Mercator creative showing a mechanic in orange gloves working on a bicycle, headlined "Warsztatowe triki, które oszczędzają czas" ("Workshop tricks that save time").',
    source: 'Mercator/768347799_1602716195197588_6259082466092656869_n.jpg',
  },
  {
    file: 'mercator-gallery-15.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z dłońmi w niebieskich rękawicach pakującymi kanapkę, hasło „Profesjonalizm od kuchni”, poniżej wymagany disclaimer o wyrobie medycznym',
    altEn:
      'Mercator creative showing blue-gloved hands boxing a sandwich, headlined "Profesjonalizm od kuchni" ("Professionalism from the kitchen side"), above the required medical-device disclaimer.',
    source: 'Mercator/780501887_1608805504588657_3605529103065340802_n.jpg',
  },
  {
    file: 'mercator-gallery-16.jpg',
    slug: 'mercator',
    altPl:
      'Kreacja Mercator z przesadzaniem rośliny w zielonej rękawicy i naprawą w niebieskiej, ankieta „Najczęściej używam rękawiczek w: domu / pracy”',
    altEn:
      'Mercator creative pairing repotting a plant in a green glove with a repair in a blue one, over the poll "Najczęściej używam rękawiczek w: domu / pracy" ("I use gloves most often at: home / work").',
    source: 'Mercator/768258396_1595076079294933_8209174210178631438_n.jpg',
  },
  {
    file: 'personal-effect-gallery-11.jpg',
    slug: 'personal-effect',
    altPl:
      'Ilustracja Personal Effect — sylwetka dorosłej osoby, w niej dziewczynka z pluszakiem, hasło „Jak dbasz o swoje wewnętrzne dziecko?”',
    altEn:
      'Personal Effect illustration: an adult silhouette holding a little girl with a soft toy inside it, headlined "Jak dbasz o swoje wewnętrzne dziecko?" ("How do you look after your inner child?").',
    source:
      'personal effect]/709056679_1603540981772602_4053752207792590234_n.jpg',
  },
  {
    file: 'personal-effect-gallery-12.jpg',
    slug: 'personal-effect',
    altPl:
      'Ilustracja Personal Effect — matka i dziecko chowające się za drzwiami, hasło „Dzieci często pokazują emocje zachowaniem”',
    altEn:
      'Personal Effect illustration: a mother and a child hiding behind a door, headlined "Dzieci często pokazują emocje zachowaniem" ("Children often show emotion through behaviour").',
    source:
      'personal effect]/711289389_1607594708033896_6270974361413616138_n.jpg',
  },
  {
    file: 'personal-effect-gallery-13.jpg',
    slug: 'personal-effect',
    altPl:
      'Ilustracja Personal Effect — kobieta z kubkiem i książką, hasło „Nie wszystko musi być produktywne”',
    altEn:
      'Personal Effect illustration: a woman with a mug and a book, headlined "Nie wszystko musi być produktywne" ("Not everything has to be productive").',
    source:
      'personal effect]/740462137_1643218331138200_6266412414301942084_n.jpg',
  },
  {
    file: 'personal-effect-gallery-14.jpg',
    slug: 'personal-effect',
    altPl:
      'Ilustracja Personal Effect — postać wspinająca się po linie, hasło „Odpuszczenie nie wiąże się z porażką”',
    altEn:
      'Personal Effect illustration: a figure climbing a rope, headlined "Odpuszczenie nie wiąże się z porażką" ("Letting go is not the same as failing").',
    source:
      'personal effect]/744184621_1654066250053408_1188409071286615365_n.jpg',
  },
  {
    file: 'personal-effect-gallery-15.jpg',
    slug: 'personal-effect',
    altPl:
      'Ilustracja Personal Effect — kobieta ze łzą patrząca w telefon, hasło „Nie porównuj swojego życia do czyjegoś kadru”',
    altEn:
      'Personal Effect illustration: a tearful woman looking at her phone, headlined "Nie porównuj swojego życia do czyjegoś kadru" ("Don\'t compare your life to someone else\'s frame").',
    source:
      'personal effect]/749419664_1654069306719769_6039330936708922673_n.jpg',
  },
  {
    file: 'personal-effect-gallery-16.jpg',
    slug: 'personal-effect',
    altPl:
      'Ilustracja Personal Effect — rodzic z dzieckiem na fotelu, hasło „Szczęśliwy rodzic nie zapomina o swoich potrzebach”',
    altEn:
      'Personal Effect illustration: a parent and child in an armchair, headlined "Szczęśliwy rodzic nie zapomina o swoich potrzebach" ("A happy parent doesn\'t forget their own needs").',
    source:
      'personal effect]/752488686_1654066960053337_53691220816297657_n.jpg',
  },
  {
    file: 'personal-effect-gallery-17.jpg',
    slug: 'personal-effect',
    altPl:
      'Kreacja Personal Effect z pływakiem w jeziorze o zachodzie słońca, hasło „Największą siłą jest odwaga, żeby spróbować znowu”',
    altEn:
      'Personal Effect creative showing a swimmer in a lake at sunset, headlined "Największą siłą jest odwaga, żeby spróbować znowu" ("The greatest strength is the courage to try again").',
    source:
      'personal effect]/771013274_1673940588065974_7212049234922991292_n.jpg',
  },
  {
    file: 'power-elements-gallery-10.jpg',
    slug: 'power-elements',
    altPl:
      'Zapowiedź marki Power Elements — czarna puszka suplementu w ciemności, napis „POWER IS COMING”',
    altEn:
      'Power Elements teaser: the black supplement tub in the dark, captioned "POWER IS COMING".',
    source: 'Power elements/Zrzut ekranu 2026-08-20 o 16.19.44.png',
  },
  {
    file: 'power-elements-gallery-11.jpg',
    slug: 'power-elements',
    altPl:
      'Kreacja Power Elements ze wspinaczem na skalnej grani, hasło „Chcesz wspiąć się na wyższy poziom? Wkrótce dowiesz się jak”',
    altEn:
      'Power Elements creative showing a climber on a rocky ridge, headlined "Chcesz wspiąć się na wyższy poziom?" ("Want to climb to the next level?") over "Wkrótce dowiesz się jak" ("You\'ll find out how soon").',
    source: 'Power elements/Zrzut ekranu 2026-08-20 o 16.20.17.png',
  },
  {
    file: 'power-elements-gallery-12.jpg',
    slug: 'power-elements',
    altPl:
      'Kreacja Power Elements z puszką suplementu i shakerem w zielonym proszku, hasło „Power Elements już w sprzedaży — zamów i poczuj różnicę na własnej skórze”',
    altEn:
      'Power Elements creative showing the supplement tub and a shaker in green powder, headlined "Power Elements już w sprzedaży" ("Power Elements is on sale") over "zamów i poczuj różnicę na własnej skórze" ("order and feel the difference yourself").',
    source:
      'Power elements/687847548_122120472531217882_1085430501469714465_n.jpg',
  },
  {
    file: 'power-elements-gallery-13.jpg',
    slug: 'power-elements',
    altPl:
      'Kreacja porównawcza Power Elements — garść tabletek („Jak było kiedyś”) kontra jeden shaker („Jak jest dzisiaj”)',
    altEn:
      'Power Elements comparison creative: a scatter of pills ("Jak było kiedyś" — "How it used to be") against a single shaker ("Jak jest dzisiaj" — "How it is today").',
    source:
      'Power elements/708570950_122122845987217882_1902443638978879061_n.jpg',
  },
  {
    file: 'power-elements-gallery-14.jpg',
    slug: 'power-elements',
    altPl:
      'Kreacja edukacyjna Power Elements zestawiająca „Twoje problemy” (brak energii, słabe włosy, skomplikowana suplementacja, brak koncentracji) z „Nasze rozwiązania” i puszką suplementu',
    altEn:
      'Power Elements creative pairing "Twoje problemy" ("Your problems" — low energy, weak hair, complicated supplementation, poor focus) with "Nasze rozwiązania" ("Our solutions") and the supplement tub.',
    source: 'Power elements/Zrzut ekranu 2026-08-20 o 16.18.18.png',
  },
  {
    file: 'power-elements-gallery-15.jpg',
    slug: 'power-elements',
    altPl:
      'Kreacja Power Elements z shakerem i zakrętką, hasło „Co znajduje się w środku?”',
    altEn:
      'Power Elements creative showing a shaker and its cap, headlined "Co znajduje się w środku?" ("What\'s inside?").',
    source: 'Power elements/Zrzut ekranu 2026-08-20 o 16.18.42.png',
  },
  {
    file: 'pracuj-pl-gallery-1.jpg',
    slug: 'pracuj-pl',
    altPl:
      'Kreacja Pracuj.pl z maskotką bobra w bluzie marki na tle pustej sali konferencyjnej, napis „Kiedy wszyscy na ciebie krzyczą, bo zjadłeś biurka, a ty po prostu jesteś wychillowanym Bobrem, co lubi wrzucić coś na ząb”',
    altEn:
      'Pracuj.pl creative showing the beaver mascot in a branded hoodie in an empty meeting room, captioned "Kiedy wszyscy na ciebie krzyczą, bo zjadłeś biurka, a ty po prostu jesteś wychillowanym Bobrem, co lubi wrzucić coś na ząb" ("When everyone shouts at you for eating the desks, and you are just a chilled-out beaver who likes a snack").',
    source: 'Pracuj/FUNNY 2',
  },
  {
    file: 'pracuj-pl-gallery-2.jpg',
    slug: 'pracuj-pl',
    altPl:
      'Kadr z filmu Pracuj.pl — maskotka surykatki w biurze coworkingowym, napisy „Słowa kluczowe” i „Jak je znaleźć w ogłoszeniu?”',
    altEn:
      'Frame from a Pracuj.pl video: the meerkat mascot in a coworking office, captioned "Słowa kluczowe" ("Keywords") and "Jak je znaleźć w ogłoszeniu?" ("How to find them in a job ad").',
    source: 'Pracuj/EDU 2',
  },
  {
    file: 'pracuj-pl-gallery-3.jpg',
    slug: 'pracuj-pl',
    altPl:
      'Kadr z filmu Pracuj.pl — maskotka surykatki przed rozmytymi uczestniczkami nagrania, napisy „AI zastąpiło rekruterów?” i „Preselekcja AI w rekrutacji”',
    altEn:
      'Frame from a Pracuj.pl video: the meerkat mascot in front of blurred participants, captioned "AI zastąpiło rekruterów?" ("Has AI replaced recruiters?") and "Preselekcja AI w rekrutacji" ("AI pre-screening in recruitment").',
    source: 'Pracuj/blur 2',
  },
  {
    file: 'pracuj-pl-gallery-4.jpg',
    slug: 'pracuj-pl',
    altPl:
      'Kadr z filmu Pracuj.pl — osoba siedząca twarzą do kąta biura, napisy „Posadziliśmy go w kącie, bo źle się zachowywał w pracy” i „zgadnijcie co zrobił…”',
    altEn:
      'Frame from a Pracuj.pl video: a person sitting facing the corner of an office, captioned "Posadziliśmy go w kącie, bo źle się zachowywał w pracy" ("We put him in the corner for behaving badly at work") and "zgadnijcie co zrobił…" ("guess what he did").',
    source: 'Pracuj/FUNNY 1',
  },
  {
    file: 'pracuj-pl-gallery-5.jpg',
    slug: 'pracuj-pl',
    altPl:
      'Kadr z filmu Pracuj.pl — widok przez zęby widelca na pracownika w kamizelce odblaskowej, napis „Gdy kolega w pracy mnie denerwuje to patrzę na niego przez widelec i udaje, że jest za kratami”',
    altEn:
      'Frame from a Pracuj.pl video: a colleague in a hi-vis vest seen through the tines of a fork, captioned "Gdy kolega w pracy mnie denerwuje to patrzę na niego przez widelec i udaje, że jest za kratami" ("When a workmate annoys me I look at him through a fork and pretend he is behind bars").',
    source: 'Pracuj/FUNNY 3',
  },
  {
    file: 'stadler-form-gallery-11.jpg',
    slug: 'stadler-form',
    altPl:
      'Kadr z rolki Stadler Form — nawilżacz na tarasowym stole obok szklanki lemoniady, napis „A jak wygląda Twój, idealny letni wieczór?”',
    altEn:
      'Frame from a Stadler Form reel: a humidifier on a terrace table beside a glass of lemonade, captioned "A jak wygląda Twój, idealny letni wieczór?" ("What does your perfect summer evening look like?").',
    source: 'stadler form/Zrzut ekranu 2026-08-20 o 15.26.51.png',
  },
  {
    file: 'stadler-form-gallery-12.jpg',
    slug: 'stadler-form',
    altPl:
      'Kadr z rolki Stadler Form — oczyszczacz w salonie, w tle kobieta z psem na kanapie, napis „A Ty, jak spędzasz czas po pracy?”',
    altEn:
      'Frame from a Stadler Form reel: an air purifier in a living room with a woman and a dog on the sofa behind it, captioned "A Ty, jak spędzasz czas po pracy?" ("And how do you spend your time after work?").',
    source: 'stadler form/Zrzut ekranu 2026-08-20 o 15.27.44.png',
  },
  {
    file: 'stadler-form-gallery-13.jpg',
    slug: 'stadler-form',
    altPl:
      'Kadr z rolki Stadler Form — dłoń przy nawilżaczu, napisy „Jak przetrwać sezon grzewczy?” i „Z nawilżaczem Stadler Form”',
    altEn:
      'Frame from a Stadler Form reel: a hand at the humidifier, captioned "Jak przetrwać sezon grzewczy?" ("How to survive the heating season?") and "Z nawilżaczem Stadler Form" ("With a Stadler Form humidifier").',
    source: 'stadler form/Zrzut ekranu 2026-08-20 o 15.31.14.png',
  },
  {
    file: 'stadler-form-gallery-14.jpg',
    slug: 'stadler-form',
    altPl:
      'Kadr z rolki Stadler Form — ćwiczenie jogi na macie obok śpiącego psa, napis „A Ty, praktykujesz jogę?”',
    altEn:
      'Frame from a Stadler Form reel: a yoga stretch on a mat beside a sleeping dog, captioned "A Ty, praktykujesz jogę?" ("Do you practise yoga?").',
    source: 'stadler form/Zrzut ekranu 2026-08-20 o 15.28.16.png',
  },
  {
    file: 'stadler-form-gallery-15.jpg',
    slug: 'stadler-form',
    altPl:
      'Kadr z rolki Stadler Form — nawilżacz z zieloną poświatą mgły, napis „POV: zorze masz każdego dnia”',
    altEn:
      'Frame from a Stadler Form reel: a humidifier glowing green through its mist, captioned "POV: zorze masz każdego dnia" ("POV: you get the northern lights every day").',
    source: 'stadler form/Zrzut ekranu 2026-08-20 o 15.30.43.png',
  },
  {
    file: 'vobis-gallery-5.jpg',
    slug: 'vobis',
    altPl:
      'Kreacja Vobis ze słuchawkami nausznymi bez lewej muszli, hasło „Bez lewego to nie to samo”',
    altEn:
      'Vobis creative showing over-ear headphones missing the left cup, headlined "Bez lewego to nie to samo" ("Without the left one it\'s just not the same").',
    source: 'vobis/505158865_1112738304218549_2790371875953765235_n.jpg',
  },
  {
    file: 'vobis-gallery-6.jpg',
    slug: 'vobis',
    altPl:
      'Kreacja Vobis z psem przed wentylatorem, hasło „Najlepszy przyjaciel człowieka”',
    altEn:
      'Vobis creative showing a dog in front of a fan, headlined "Najlepszy przyjaciel człowieka" ("Man\'s best friend").',
    source: 'vobis/532442295_1164456692380043_1687323584962164229_n.jpg',
  },
  {
    file: 'vobis-gallery-7.jpg',
    slug: 'vobis',
    altPl:
      'Kreacja Vobis z pluszową małpą trzymającą smartfona, hasło „W dobrych rękach”',
    altEn:
      'Vobis creative showing a plush monkey holding a smartphone, headlined "W dobrych rękach" ("In good hands").',
    source: 'vobis/641115465_1323360486489662_1887726884410063712_n.jpg',
  },
  {
    file: 'vobis-gallery-8.jpg',
    slug: 'vobis',
    altPl:
      'Kreacja Vobis z lokalizatorami AirTag w etui, hasło „Lokalizacja: [nieznana]”',
    altEn:
      'Vobis creative showing AirTag trackers in cases, headlined "Lokalizacja: [nieznana]" ("Location: [unknown]").',
    source: 'vobis/645442464_1331444539014590_826427371036096827_n.jpg',
  },
  {
    file: 'vobis-gallery-9.jpg',
    slug: 'vobis',
    altPl:
      'Kreacja Vobis zestawiająca klawiaturę z podświetleniem RGB i klasyczną, hasło „Klawiatura RGB czy klasyczna?”',
    altEn:
      'Vobis creative pairing an RGB-backlit keyboard with a plain one, headlined "Klawiatura RGB czy klasyczna?" ("RGB keyboard or classic?").',
    source: 'vobis/740686631_1434382532054123_7966537560837324703_n.jpg',
  },
  {
    file: 'vobis-gallery-10.jpg',
    slug: 'vobis',
    altPl:
      'Biała kreacja Vobis z samym logo i notatką „Miał być post, ale grafik na wakacjach”',
    altEn:
      'Plain white Vobis creative with the logo and the line "Miał być post, ale grafik na wakacjach" ("There was going to be a post, but the designer is on holiday").',
    source: 'vobis/765769977_1461478362677873_2152396828897010356_n.jpg',
  },
  {
    file: 'volvo-gallery-1.jpg',
    slug: 'volvo',
    altPl:
      'Kreacja Volvo Car Warszawa z przeszklonym Domem Volvo, hasło „Midsommar w Domu Volvo: dni otwarte 25–27.06” i zapowiedź premiery Volvo XC60',
    altEn:
      'Volvo Car Warszawa creative showing the glass Dom Volvo showroom, headlined "Midsommar w Domu Volvo: dni otwarte 25–27.06" ("Midsommar at Dom Volvo: open days 25–27 June") with the Volvo XC60 launch.',
    source: 'Volvo/509971582_1245657084238156_8844092174364490013_n.jpg',
  },
  {
    file: 'volvo-gallery-2.jpg',
    slug: 'volvo',
    altPl:
      'Kreacja Volvo z dwiema markowymi butelkami na leśnym poszyciu, hasło „Styl i równowaga”',
    altEn:
      'Volvo creative showing two branded bottles on forest floor, headlined "Styl i równowaga" ("Style and balance").',
    source: 'Volvo/511140235_1248790593924805_98060554743243544_n.jpg',
  },
  {
    file: 'volvo-gallery-3.jpg',
    slug: 'volvo',
    altPl:
      'Kreacja Volvo z kobietą z rozwianymi włosami nad morzem, hasło „Gorący okres? Weź to na chłodno!”',
    altEn:
      'Volvo creative showing a woman with wind-blown hair by the sea, headlined "Gorący okres?" ("A hot spell?") over "Weź to na chłodno!" ("Take it cool").',
    source: 'Volvo/Zrzut ekranu 2026-08-20 o 14.46.32.png',
  },
  {
    file: 'volvo-gallery-4.jpg',
    slug: 'volvo',
    altPl:
      'Kreacja konkursowa Volvo z dziećmi rysującymi przy stole, hasło „Volvo oczami dziecka” i zaproszenie na wystawę prac w Domu Volvo 25–27.06',
    altEn:
      'Volvo contest creative showing children drawing at a table, headlined "Volvo oczami dziecka" ("Volvo through a child\'s eyes"), inviting visitors to the exhibition at Dom Volvo on 25–27 June.',
    source: 'Volvo/konkurs 1',
  },
  {
    file: 'volvo-gallery-5.jpg',
    slug: 'volvo',
    altPl:
      'Kreacja konkursowa Volvo z dzieckiem w elektrycznym autku Volvo, hasło „KONKURS — zostań projektantem Volvo i narysuj Volvo marzeń!”',
    altEn:
      'Volvo contest creative showing a child in a ride-on Volvo, headlined "KONKURS" ("Contest") over "zostań projektantem Volvo i narysuj Volvo marzeń!" ("become a Volvo designer and draw your dream Volvo").',
    source: 'Volvo/konkurs 2',
  },
  {
    file: 'volvo-gallery-6.jpg',
    slug: 'volvo',
    altPl:
      'Wystawa prac konkursowych „Volvo oczami dziecka” — rysunki rozwieszone na brzozowych stelażach w Domu Volvo',
    altEn:
      'The "Volvo oczami dziecka" exhibition: children\'s drawings pegged to birch frames at Dom Volvo.',
    source: 'Volvo/konkurs 3',
  },
]

export const COVERS: CoverSwap[] = [
  {
    slug: 'power-elements',
    file: 'power-elements-cover-2.jpg',
    altPl: 'Zbliżenie na zielony proszek ułożony w koncentryczne kręgi',
    altEn: 'A close-up of green powder raked into concentric circles',
    source: 'supplied by the owner 2026-08-21 (brand asset, 814×473)',
  },
]

export const BYTE_REPLACES: ByteReplace[] = [
  {
    file: 'fm-logistics-greensupply-1-cut.webp',
    slug: 'fm-logistics',
    altPl:
      'Kreacja FM Logistic Central Europe o ekspansji na trasie Polska–Czechy',
    altEn:
      'FM Logistic Central Europe creative about its expansion on the Poland–Czechia route.',
    note: 'post frame cut away',
  },
  {
    file: 'fm-logistics-gallery-3.jpg',
    slug: 'fm-logistics',
    note: 'post frame cut away',
  },
  {
    file: 'fm-logistics-crossdock-2.png',
    slug: 'fm-logistics',
    altPl: 'Kreacja FM Logistic Central Europe o logistyce farmaceutycznej',
    altEn:
      'FM Logistic Central Europe creative about pharmaceutical logistics.',
    note: 'post frame cut away',
  },
  {
    file: 'entelo-gallery-5-cut.webp',
    slug: 'entelo',
    note: 'phone mockup cut away',
  },
  {
    file: 'dolina-charlotty-gallery-3-cut.webp',
    slug: 'dolina-charlotty',
    altPl:
      'Relacja na Instagramie Doliny Charlotty — lama z Zoo Charlotta i ankieta „Będziecie?” z wynikiem 71% głosów na „Tak!”',
    altEn:
      'Dolina Charlotty Instagram story: a llama from Zoo Charlotta with a poll "Będziecie?" ("Will you come?") answered 71% "Tak!" ("Yes").',
    note: 'phone mockup cut away',
  },
  {
    file: 'dolina-charlotty-gallery-4-cut.webp',
    slug: 'dolina-charlotty',
    altPl:
      'Reklamowa kreacja Dolina Charlotty „Bilety do ZOO za pół ceny!” z dwoma lemurami',
    altEn:
      'Dolina Charlotty ad creative with two lemurs, headlined "Bilety do ZOO za pół ceny!" ("Zoo tickets at half price").',
    note: 'phone mockup cut away',
  },
  {
    file: 'dolina-charlotty-gallery-5-cut.webp',
    slug: 'dolina-charlotty',
    altPl:
      'Kadr z reelsa Doliny Charlotty — ujęcie nad wodą z hasłem „Odwiedź Dolinę Charlotty”',
    altEn:
      'Frame from a Dolina Charlotty reel: a shot over the water with the line "Odwiedź Dolinę Charlotty" ("Visit Dolina Charlotty").',
    note: 'phone mockup cut away',
  },
]
