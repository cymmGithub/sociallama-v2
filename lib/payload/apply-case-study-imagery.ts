import { targetProdEnv } from '@/lib/payload/prod-env'

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  targetProdEnv('apply-case-study-imagery', { blob: true })
}

/**
 * Targets are named by FILENAME, never by media id.
 *
 * Media ids are per-database and the sequences are unrelated: the image this
 * plan calls `fm-logistics-gallery-4.jpg` is id 155 on development and 493 in
 * production, and production's id 155 is an unrelated blog photograph. A plan
 * keyed on ids would detach the wrong images from the wrong studies the moment
 * it ran against the second database. Filenames are unique in the media
 * collection, so they identify the same image everywhere; the id is resolved
 * per run and asserted to be unambiguous.
 */
type Op = {
  slug: string
  /** Filename of the media document to detach. */
  file: string
  why: string
  /**
   * Which field holds it. Omitted means `approach[].media`, which is localized
   * and so written per locale. `cover` is NOT localized — one write, and it is
   * always a swap rather than a detach, because a study with no cover would
   * render an empty card on the listing.
   */
  target?: 'cover'
  /** Replacement drawn from the same client's own deck, or null to just detach. */
  replace: { file: string; altPl: string; altEn: string } | null
}

const PLAN: Op[] = [
  {
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-4.jpg',
    why: "Laurastar garment steamer — another client's product photo",
    replace: {
      file: 'fm-logistics-gallery-8.jpg',
      altPl:
        'Post FM Logistic Central Europe na LinkedInie o zrównoważonych magazynach i instalacjach fotowoltaicznych',
      altEn:
        'FM Logistic Central Europe LinkedIn post about sustainable warehousing and photovoltaic installations',
    },
  },
  {
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-5.jpg',
    why: 'Portrait carrying LinkedIn’s #OPENTOWORK frame',
    replace: {
      file: 'fm-logistics-gallery-9.jpg',
      altPl:
        'Grafika FM Logistic z Krystianem Koprowskim, dyrektorem sprzedaży transportu w Polsce, obok posta na LinkedInie',
      altEn:
        'FM Logistic graphic of Krystian Koprowski, Sales Director of Transport in Poland, next to the LinkedIn announcement',
    },
  },
  {
    // Reviewed as keep-with-note (an unbranded portrait), then decided against:
    // in the "Employer branding i pozycjonowanie ekspertów" pillar it sat beside
    // the branded expert card and added nothing the card was not already saying.
    // Detach only — the pillar keeps the card and drops to a single creative.
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-6.jpg',
    why: 'Bare headshot next to the branded expert card; the card carries the pillar alone',
    replace: null,
  },
  {
    slug: 'jw-construction',
    file: 'jw-construction-gallery-1.jpg',
    why: "Deck slide capture with a 'CLICK HERE' badge burnt in",
    replace: {
      file: 'jw-construction-gallery-7.jpg',
      altPl:
        'Kreacja JW Construction dla inwestycji Horizon Gdańsk z hasłem „Zamieszkaj nad morzem”',
      altEn:
        'JW Construction creative for the Horizon Gdansk development, headlined “Live by the sea”',
    },
  },
  {
    slug: 'jw-construction',
    file: 'jw-construction-gallery-3.jpg',
    why: "Deck slide capture with a 'CLICK HERE' badge burnt in",
    replace: {
      file: 'jw-construction-gallery-8.jpg',
      altPl:
        'Kreacja JW Construction promująca program poleceń J.W. Club z hasłem „Polecasz, zyskujesz”',
      altEn:
        'JW Construction creative promoting the J.W. Club referral programme, “Recommend and gain”',
    },
  },
  {
    slug: 'jw-construction',
    file: 'jw-construction-gallery-4.jpg',
    why: "Deck slide capture with a 'CLICK HERE' badge burnt in",
    replace: {
      file: 'jw-construction-gallery-9.jpg',
      altPl:
        'Kreacja JW Construction z pięcioma powodami, dla których warto kupić mieszkanie w Chorzowie',
      altEn:
        'JW Construction creative listing five reasons to buy an apartment in Chorzow',
    },
  },
  {
    slug: 'ariadna',
    file: 'ariadna-gallery-7.jpg',
    why: 'Enlarged notification badge glyph — interface furniture',
    replace: {
      file: 'ariadna-gallery-9.jpg',
      altPl:
        'Kadr z relacji Ariadny — kobieta na kanapie rozwiązuje ankietę w telefonie',
      altEn:
        'Still from an Ariadna story — a woman on a sofa filling in a survey on her phone',
    },
  },
  {
    slug: 'ariadna',
    file: 'ariadna-gallery-8.jpg',
    why: 'Stock business photo; its alt claimed it was Ariadna’s campaign data',
    replace: {
      file: 'ariadna-gallery-10.jpg',
      altPl:
        'Kadr z relacji Ariadny — kobieta prezentuje produkty otrzymane do testowania',
      altEn:
        'Still from an Ariadna story — a woman presenting products received for testing',
    },
  },
  {
    slug: 'faktoria-win',
    file: 'faktoria-win-gallery-1.jpg',
    why: 'Stock couple on white; not the brand’s own „Zgrana Para” models',
    replace: {
      file: 'faktoria-win-gallery-7.png',
      altPl:
        'Trzy wina z oferty Faktorii Win — Harris, Kumala i różowe Wine Grime',
      altEn:
        'Three wines from Faktoria Win’s range — Harris, Kumala and the Wine Grime rosé',
    },
  },
  {
    slug: 'foodsaver',
    file: 'foodsaver-cover.jpg',
    why: 'Same file as the study cover — duplicate use; cover keeps it',
    replace: null,
  },
  {
    // The old cover is an American novelty signpost — New York City, Seattle,
    // "P Town Fire Station" — on a brand that sells tailor-made travel. Not
    // merely generic: it contradicts the positioning, and the place names stay
    // legible even in the 418x199 listing card.
    //
    // The replacement is a frame from Getaway's own published post, cropped past
    // the Instagram header. It qualifies on provenance rather than on what it
    // shows — the spec counts "its own social-media communication" — and it is
    // the only option in the pool that reads well at card size. Hero upscales
    // 2.5x from a 468x262 source, which is accepted: soft, not broken.
    slug: 'getaway',
    file: 'getaway-cover.jpg',
    why: 'American roadside signpost on a tailor-made travel brand',
    target: 'cover',
    replace: {
      file: 'getaway-cover-2.jpg',
      altPl:
        'Kadr z posta Getaway — meander rzeki Kolorado w kanionie Horseshoe Bend',
      altEn:
        'Frame from a Getaway post — the Colorado River meander at Horseshoe Bend',
    },
  },

  /**
   * —— re-crops ——
   *
   * These ten covers were never the wrong SUBJECT, so the imagery audit passed
   * every one of them. They fail a different test: the listing card is 418x199
   * and the hero 1150x646, both landscape, while the sources are portrait or
   * square. `objectFit: cover` then crops wherever it lands — through a headline
   * on Bioagris, through the Facebook group bar on Kontigo, past the face
   * entirely on Adamed.
   *
   * Each replacement is the SAME image recropped to ~1.9:1, deliberately between
   * the card's 2.10 and the hero's 1.78 so neither box eats anything that
   * matters. Crop boxes were set from measured row-brightness profiles, not by
   * eye — three of the first attempts cut exactly what they were meant to save.
   *
   * `n-energia` and `volvo` are knowingly left alone: cropping cannot fix them
   * (Energia's sharp sunflower sits where the black band begins; Volvo's frame is
   * dark and abstract throughout) and neither pool holds a single landscape
   * photograph to swap in. Those two need client-supplied material.
   */
  {
    slug: 'bioagris',
    file: 'bioagris-cover.jpg',
    why: 'Card crop sliced the “PRZYWRÓĆ ŻYCIE” headline in half',
    target: 'cover',
    replace: {
      file: 'bioagris-cover-2.jpg',
      altPl:
        'Dłonie przesypujące żyzną, ciemną glebę w świetle zachodzącego słońca',
      altEn: 'Hands sifting rich dark soil in the light of the setting sun',
    },
  },
  {
    slug: 'kontigo',
    file: 'kontigo-cover.jpg',
    why: 'Facebook group bar was cut through, leaving a clipped “ontigoCLUB”',
    target: 'cover',
    replace: {
      file: 'kontigo-cover-2.jpg',
      altPl:
        'Dwie kobiety w turbanach z ręczników nakładają sobie maseczki kosmetyczne — kadr z okładki grupy KontigoCLUB',
      altEn:
        'Two women in towel turbans applying face masks to each other — from the KontigoCLUB group cover',
    },
  },
  {
    slug: 'produkty-cukiernicze-brzesc',
    file: 'produkty-cukiernicze-brzesc-cover.jpg',
    why: 'Crop clipped the “Wygraj iPhone 11” panel and the corner logo flash',
    target: 'cover',
    replace: {
      file: 'produkty-cukiernicze-brzesc-cover-2.jpg',
      altPl:
        'Opakowanie słomki ptysiowej Pano obok miski pełnej słomki na drewnianym blacie',
      altEn:
        'A pack of Pano choux straws beside a bowl of them on a wooden counter',
    },
  },
  {
    slug: 'galeria-rondo-wiatraczna',
    file: 'galeria-rondo-wiatraczna-cover.jpg',
    why: 'Crop landed on the crowd edge rather than the event itself',
    target: 'cover',
    replace: {
      file: 'galeria-rondo-wiatraczna-cover-2.jpg',
      altPl:
        'Rodziny przy kolorowych stanowiskach warsztatowych podczas eventu w Galerii Rondo Wiatraczna',
      altEn:
        'Families at colourful workshop stations during an event at Galeria Rondo Wiatraczna',
    },
  },
  {
    slug: 'vistula',
    file: 'vistula-cover.jpg',
    why: 'Crop cut through the campaign headline',
    target: 'cover',
    replace: {
      file: 'vistula-cover-2.jpg',
      altPl:
        'Czterech studentów Uczelni Vistula w kreacji kampanii „Why Vistula?”',
      altEn:
        'Four Vistula University students in the “Why Vistula?” campaign creative',
    },
  },
  {
    slug: 'entelo',
    file: 'entelo-cover.jpg',
    why: 'Portrait screenshot letterboxed to a sliver between white bars',
    target: 'cover',
    replace: {
      file: 'entelo-cover-2.jpg',
      altPl:
        'Strona Entelo — Dobre Krzesło na Facebooku z hasłem „Produkujemy meble. Tworzymy przestrzenie. Dbamy o zdrowie.”',
      altEn:
        'The Entelo — Dobre Krzesło Facebook page, headlined “We make furniture. We create spaces. We care about health.”',
    },
  },
  {
    slug: 'adamed',
    file: 'adamed-cover.jpg',
    why: 'Crop landed on a jaw and an ear — the face was outside the frame',
    target: 'cover',
    replace: {
      file: 'adamed-cover-2.jpg',
      altPl:
        'Kobieta z zamkniętymi oczami wdycha powietrze na tle zieleni — kreacja kampanii Adamed „Głęboki oddech”',
      altEn:
        'A woman breathing in with her eyes closed against greenery — from Adamed’s “Głęboki oddech” campaign',
    },
  },
  {
    slug: 'personal-effect',
    file: 'personal-effect-cover.jpg',
    why: 'Crop cut the face off, leaving a torso',
    target: 'cover',
    replace: {
      file: 'personal-effect-cover-2.jpg',
      altPl:
        'Kobieta przy biurku w jasnym wnętrzu — kadr z materiałów Personal Effect',
      altEn:
        'A woman at a desk in a bright interior — from Personal Effect’s own material',
    },
  },
  {
    slug: 'vobis',
    file: 'vobis-cover.jpg',
    why: 'Saw floated over a stadium with the “Krótka piłka” line cropped away, so the pun lost its punchline',
    target: 'cover',
    replace: {
      file: 'vobis-cover-2.jpg',
      altPl:
        'Kreacja Vobis „Krótka piłka” — składana piła Fiskars na tle stadionu piłkarskiego',
      altEn:
        'Vobis “Krótka piłka” creative — a folding Fiskars saw against a football stadium',
    },
  },
  {
    slug: 'asus',
    file: 'asus-cover.jpg',
    why: 'Crop showed a corner of the lid with no context',
    target: 'cover',
    replace: {
      file: 'asus-cover-2.jpg',
      altPl: 'Otwarty laptop ASUS Zenbook S 16 na jasnym tle',
      altEn: 'An open ASUS Zenbook S 16 laptop on a light background',
    },
  },

  /**
   * —— licensed stock, on instruction ——
   *
   * These two are Pexels photographs, which the `case-studies` spec forbids:
   * "Generic stock or library photography standing in for work" SHALL NOT
   * appear. They are here because the recrops could not rescue either cover and
   * neither client's deck holds a usable landscape frame — Getaway's own post
   * frame was only 468x262 and visibly soft at hero size, and Vobis's cover was
   * a Facebook screenshot whose joke died in the crop.
   *
   * Recorded as a deliberate exception rather than smuggled in: the spec and the
   * site now disagree on two covers, and the requirement needs amending to say
   * so, otherwise the next audit will "fix" these straight back.
   *
   * Both were chosen to carry NO third-party marks, which ruled out most of the
   * search results — an HP lid, a Miele oven, Samsung remotes, a Netflix screen,
   * a Coca-Cola can. A competitor's logo on a multi-brand retailer's cover would
   * be worse than the generic photograph.
   *
   * Provenance for the next audit: Pexels photo 2007395 (Getaway) and 6636320
   * (Vobis), cropped to 1600x842.
   */
  {
    slug: 'getaway',
    file: 'getaway-cover-2.jpg',
    why: 'Own-post frame was only 468x262 — visibly soft once the hero upscaled it 2.5x',
    target: 'cover',
    replace: {
      file: 'getaway-cover-3.jpg',
      altPl:
        'Skrzydło samolotu i chmury w zachodzącym słońcu, widok z okna pasażerskiego',
      altEn:
        'An aircraft wing and clouds at sunset, seen from a passenger window',
    },
  },
  {
    slug: 'vobis',
    file: 'vobis-cover-2.jpg',
    why: 'Recrop saved the pun but the source is a Facebook screenshot, not a cover image',
    target: 'cover',
    replace: {
      file: 'vobis-cover-3.jpg',
      altPl:
        'Telewizor na marmurowej ścianie w jasnym salonie, poniżej drewniana szafka RTV',
      altEn:
        'A wall-mounted television on a marble wall in a bright living room, with a wooden media console below',
    },
  },

  /**
   * —— fixing a regression the recrops caused ——
   *
   * Payload skips generating an image size when the source is smaller than the
   * target in BOTH dimensions. The `og` size is 1200x630, and the tall originals
   * cleared it on height alone: `bioagris-cover.jpg` at 648x810 produced an og
   * variant, `adamed-cover.jpg` at 934x1400 likewise.
   *
   * Recropping them into short landscape strips dropped every one below 630 tall
   * while still under 1200 wide, so the og variant stopped being generated. The
   * page then fell back to the original file while STILL declaring
   * `og:image:width 1200` / `og:image:height 630` — metadata that did not match
   * the bytes, on the image every social platform reads.
   *
   * The fix is the same crop rendered at exactly 1200x630, so the size is
   * generated and the declaration is true. Upscales run from 1.11x to 1.85x,
   * checked at 1:1: soft but clean, and an OG image renders near 500px in a feed.
   * The card variant (1024w) now generates too, which it did not before.
   *
   * `galeria-rondo-wiatraczna`, `getaway` and `vobis` are absent from this list —
   * their sources are already 1200px or wider, so their og variants were fine.
   */
  {
    slug: 'bioagris',
    file: 'bioagris-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'bioagris-cover-3.jpg',
      altPl:
        'Dłonie przesypujące żyzną, ciemną glebę w świetle zachodzącego słońca',
      altEn: 'Hands sifting rich dark soil in the light of the setting sun',
    },
  },
  {
    slug: 'kontigo',
    file: 'kontigo-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'kontigo-cover-3.jpg',
      altPl:
        'Dwie kobiety w turbanach z ręczników nakładają sobie maseczki kosmetyczne — kadr z okładki grupy KontigoCLUB',
      altEn:
        'Two women in towel turbans applying face masks to each other — from the KontigoCLUB group cover',
    },
  },
  {
    slug: 'produkty-cukiernicze-brzesc',
    file: 'produkty-cukiernicze-brzesc-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'produkty-cukiernicze-brzesc-cover-3.jpg',
      altPl:
        'Opakowanie słomki ptysiowej Pano obok miski pełnej słomki na drewnianym blacie',
      altEn:
        'A pack of Pano choux straws beside a bowl of them on a wooden counter',
    },
  },
  {
    slug: 'vistula',
    file: 'vistula-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'vistula-cover-3.jpg',
      altPl:
        'Czterech studentów Uczelni Vistula w kreacji kampanii „Why Vistula?”',
      altEn:
        'Four Vistula University students in the “Why Vistula?” campaign creative',
    },
  },
  {
    slug: 'entelo',
    file: 'entelo-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'entelo-cover-3.jpg',
      altPl:
        'Strona Entelo — Dobre Krzesło na Facebooku z hasłem „Produkujemy meble. Tworzymy przestrzenie. Dbamy o zdrowie.”',
      altEn:
        'The Entelo — Dobre Krzesło Facebook page, headlined “We make furniture. We create spaces. We care about health.”',
    },
  },
  {
    slug: 'adamed',
    file: 'adamed-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'adamed-cover-3.jpg',
      altPl:
        'Kobieta z zamkniętymi oczami wdycha powietrze na tle zieleni — kreacja kampanii Adamed „Głęboki oddech”',
      altEn:
        'A woman breathing in with her eyes closed against greenery — from Adamed’s “Głęboki oddech” campaign',
    },
  },
  {
    slug: 'personal-effect',
    file: 'personal-effect-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'personal-effect-cover-3.jpg',
      altPl:
        'Kobieta przy biurku w jasnym wnętrzu — kadr z materiałów Personal Effect',
      altEn:
        'A woman at a desk in a bright interior — from Personal Effect’s own material',
    },
  },
  {
    slug: 'asus',
    file: 'asus-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'asus-cover-3.jpg',
      altPl: 'Otwarty laptop ASUS Zenbook S 16 na jasnym tle',
      altEn: 'An open ASUS Zenbook S 16 laptop on a light background',
    },
  },

  /**
   * —— pre-cropped landscape masters (change `fix-case-study-covers`) ——
   *
   * The recrops above fixed WHERE the crop landed. These four fix what there
   * was to crop. Three shipped a source too small for the boxes that consume
   * it — `rabkoland` sent 607x788 into a 2300x1292 retina hero, and both
   * `kontigo-cover-3.jpg` and `bioagris-cover-3.jpg` are 1200x630 files cut
   * from originals that were smaller still. Their replacements are cut from
   * Higgsfield 4K upscales and land at 2400px on the long edge, so the hero
   * downscales instead of stretching.
   *
   * `faktoria-win` is the odd one out: no new pixels, just the recrop the
   * earlier pass never gave it. Its 1200x1200 creative was handed to
   * `objectFit: cover` unexamined, which decapitated the man at the hairline
   * and cut the "zgrana para" headline away entirely.
   *
   * Three of the four are AI reconstructions rather than photographs, and the
   * spec now requires that to be recorded where imagery provenance is tracked
   * — this is that record. `bioagris` additionally had its logo lockup
   * composited back from `public/case-studies/bioagris/bioagris-logo.png`
   * because the model rewrote the tagline "Skuteczność z natury" as
   * "Stuiea.mcês a.noluty"; the band that shipped sits below the lockup, so the
   * repair survives only in the stored master. `power-elements` was dropped
   * from this list for the same class of failure with no such escape: the
   * upscaler turned "30-Day Power Supply" on the tub into "20-Dey Porrar
   * Sapply", which is a false statement about a client's product rather than a
   * cosmetic one.
   *
   * Aspect ratios are deliberately not uniform. 1.90:1 sits between the hero
   * (1.78) and the 1440px listing card (2.10) so neither crops meaningfully,
   * and that is what three of them use. `faktoria-win` uses 2.19:1 instead,
   * because its badge ends 16px above its headline: any crop tall enough to
   * read as 1.90:1 hands the card box enough vertical overflow to slice
   * "zgrana" off the top, and any crop that clears the badge starts below it.
   * Widening the master until the card stops cropping vertically is the only
   * move the source allows.
   */
  {
    slug: 'faktoria-win',
    file: 'faktoria-win-cover.jpg',
    why: 'Square creative sent to objectFit cover — man decapitated at the hairline, headline cut away',
    target: 'cover',
    replace: {
      file: 'faktoria-win-cover-3.jpg',
      altPl:
        'Kreacja Faktorii Win z hasłem „zgrana para” — uśmiechnięta para nad butelkami wina',
      altEn:
        'Faktoria Win creative headlined “zgrana para” — a smiling couple above bottles of wine',
    },
  },
  {
    slug: 'rabkoland',
    file: 'rabkoland-cover.jpg',
    why: '607x788 source stretched 1.38x into the card and 3.79x into the retina hero',
    target: 'cover',
    replace: {
      file: 'rabkoland-cover-3.jpg',
      altPl:
        'Diabelski młyn w parku rozrywki Rabkoland na tle błękitnego nieba',
      altEn:
        'The Ferris wheel at the Rabkoland amusement park against a blue sky',
    },
  },
  {
    slug: 'kontigo',
    file: 'kontigo-cover-3.jpg',
    why: 'Proven bicubic upscale — round-trips to the 808x425 file at 1.6/255 error with lower gradient energy',
    target: 'cover',
    replace: {
      file: 'kontigo-cover-5.jpg',
      altPl:
        'Dwie kobiety w turbanach z ręczników nakładają sobie maseczki kosmetyczne — kadr z okładki grupy KontigoCLUB',
      altEn:
        'Two women in towel turbans applying face masks to each other — from the KontigoCLUB group cover',
    },
  },
  {
    slug: 'bioagris',
    file: 'bioagris-cover-3.jpg',
    why: 'No plane of critical focus at any scale — soft everywhere rather than soft outside the subject',
    target: 'cover',
    replace: {
      file: 'bioagris-cover-5.jpg',
      altPl:
        'Dłonie przesypujące żyzną, ciemną glebę w świetle zachodzącego słońca',
      altEn: 'Hands sifting rich dark soil in the light of the setting sun',
    },
  },
]

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { readFile, writeFile } = await import('node:fs/promises')
const payload = await getPayload({ config })

const ALTS_EN = 'content/media/alts.en.json'
const LOCALES = ['pl', 'en'] as const

/** Unwrap an upload value that may be an id or a populated doc. */
// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
function idOf(v: any): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'object') return v.id ?? null
  return v
}

/**
 * Removes the blob objects for one filename — the original plus the size
 * variants sharp derives from it (`<stem>-<W>x<H>.<ext>`).
 *
 * Needed because the development and production databases share ONE Vercel Blob
 * store (a single BLOB_READ_WRITE_TOKEN). Uploading a file on development
 * therefore creates the blob that the later production run then collides with:
 * Payload's create always uploads, the plugin exposes no `allowOverwrite`, and
 * `addRandomSuffix` would break the filename keying this plan depends on.
 *
 * Clearing and re-uploading is safe here specifically because media URLs are
 * Payload-proxied (`/api/media/file/<filename>`) rather than blob-identity URLs,
 * so the re-upload lands at the same pathname and the development rows keep
 * resolving. Matching is exact rather than by prefix: a `list({prefix})` for
 * `ariadna-gallery-1` would also sweep up `ariadna-gallery-10`.
 */
async function clearBlobs(file: string) {
  const { list, del } = await import('@vercel/blob')
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  const dot = file.lastIndexOf('.')
  const stem = file.slice(0, dot)
  const ext = file.slice(dot)
  const variant = new RegExp(
    `^${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+x\\d+)?${ext.replace('.', '\\.')}$`
  )
  const { blobs } = await list({ prefix: stem, token })
  const mine = blobs.filter((b) => variant.test(b.pathname))
  if (mine.length > 0)
    await del(
      mine.map((b) => b.url),
      { token }
    )
  return mine.length
}

/** Idempotent upload: reuse the media row if this filename is already in. */
async function findOrCreateMedia(file: string, slug: string, altPl: string) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: file } },
    limit: 1,
    locale: 'pl',
  })
  if (existing.docs[0]) return { doc: existing.docs[0], created: false }
  const create = () =>
    payload.create({
      collection: 'media',
      locale: 'pl',
      data: { alt: altPl },
      filePath: `public/case-studies/${slug}/${file}`,
    })
  try {
    return { doc: assertNamed(await create(), file), created: true }
  } catch (err) {
    if (!/already exists/i.test(String(err))) throw err
    const n = await clearBlobs(file)
    console.log(`  (cleared ${n} shared-store blob object(s) for ${file})`)
    return { doc: assertNamed(await create(), file), created: true }
  }
}

/**
 * Payload renames an upload rather than refusing it, and the check it renames
 * against is not the one you would expect. `getSafeFileName` tests the target
 * database AND `staticPath` on the local filesystem — and the local path is
 * consulted even when a storage adapter is writing the bytes to Vercel Blob.
 *
 * That makes dev-then-prod, run from one worktree, silently desynchronise the
 * two databases. The development run has no BLOB_READ_WRITE_TOKEN, so its bytes
 * land in `media/` on disk; the production run minutes later finds that file
 * sitting there and quietly ships `x-3.jpg` where the plan said `x-2.jpg`. It is
 * invisible in the output, because the log line prints the requested name.
 *
 * A silent rename is fatal to this script specifically, because the whole plan
 * is keyed on filenames being the same identifier in every database. So refuse
 * the run: clear the local `media/` copy (or rename the plan entry to the
 * generation that is actually free) and start again.
 */
// biome-ignore lint/suspicious/noExplicitAny: Payload doc shape
function assertNamed(doc: any, wanted: string) {
  if (doc.filename !== wanted) {
    throw new Error(
      `Payload stored ${doc.filename} for a plan entry named ${wanted}. ` +
        'Something already holds that name — most often a development copy in ' +
        "this worktree's media/ directory, which getSafeFileName checks even " +
        "when the bytes go to Vercel Blob. Filenames are this plan's only " +
        'cross-database identifier, so a rename is refused rather than shipped.'
    )
  }
  return doc
}

let changes = 0
let uploads = 0
const detached: { slug: string; mediaId: number; file: string }[] = []
/** Studies whose cache tags need expiring — only those actually edited. */
const touchedSlugs = new Set<string>()

for (const op of PLAN) {
  const found = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: op.slug } },
    limit: 1,
    draft: true,
    locale: 'pl',
    depth: 0,
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  const base = found.docs[0] as any
  if (!base) {
    console.log(`! ${op.slug}: no document — skipping`)
    continue
  }

  // Resolve the target for THIS database. Ambiguity is fatal rather than
  // best-effort: detaching the wrong media document is not recoverable from the
  // repository, so a duplicate filename must stop the run.
  const target = await payload.find({
    collection: 'media',
    where: { filename: { equals: op.file } },
    limit: 5,
  })
  const targetDoc = target.docs[0]
  if (!targetDoc) {
    console.log(`! ${op.slug}: no media named ${op.file} — skipping`)
    continue
  }
  if (target.totalDocs > 1) {
    throw new Error(
      `${op.file} matches ${target.totalDocs} media documents — refusing to guess which to detach`
    )
  }
  const mediaId = targetDoc.id as number

  // Resolve the replacement first, so both locales reference the same media row.
  let newId: number | null = null
  if (op.replace) {
    if (!APPLY) {
      const probe = await payload.find({
        collection: 'media',
        where: { filename: { equals: op.replace.file } },
        limit: 1,
      })
      newId = probe.docs[0] ? (probe.docs[0].id as number) : null
    } else {
      const { doc, created } = await findOrCreateMedia(
        op.replace.file,
        op.slug,
        op.replace.altPl
      )
      newId = doc.id as number
      if (created) {
        uploads++
        // EN alt is a separate localized write; the media collection makes `alt`
        // required, so a Polish-only upload would be an accessibility regression
        // on /en (design D6).
        await payload.update({
          collection: 'media',
          id: newId,
          locale: 'en',
          data: { alt: op.replace.altEn },
        })
        console.log(`  + uploaded ${op.replace.file} -> media ${newId}`)
      }
    }
  }

  // `cover` is a plain unlocalized upload field, so it takes one write and no
  // locale loop. It is always a swap: dropping a cover would leave a blank card
  // on the listing, which is worse than the image being replaced.
  if (op.target === 'cover') {
    if (idOf(base.cover) !== mediaId) {
      console.log(`  = ${op.slug} [cover]: ${op.file} already replaced`)
    } else if (!op.replace) {
      throw new Error(
        `${op.slug}: a cover op needs a replacement, not a detach`
      )
    } else {
      changes++
      touchedSlugs.add(op.slug)
      const verb = newId === null ? `upload ${op.replace.file}` : String(newId)
      console.log(
        `  ${APPLY ? '~' : 'would'} ${op.slug} [cover]: ${op.file} -> ${verb}`
      )
      if (APPLY) {
        if (newId === null) {
          throw new Error(
            `${op.slug}: replacement ${op.replace.file} has no media id — aborting rather than blanking the cover`
          )
        }
        await payload.update({
          collection: 'case-studies',
          id: base.id,
          data: { cover: newId },
        })
      }
    }
    if (!detached.some((d) => d.mediaId === mediaId)) {
      detached.push({ slug: op.slug, mediaId, file: op.file })
    }
    continue
  }

  for (const locale of LOCALES) {
    const res = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: op.slug } },
      limit: 1,
      draft: true,
      locale,
      fallbackLocale: false,
      depth: 0,
    })
    // biome-ignore lint/suspicious/noExplicitAny: doc shape
    const doc = res.docs[0] as any
    if (!doc?.approach?.length) continue

    let touched = false
    // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
    const approach = doc.approach.map((pillar: any) => {
      const media = pillar.media ?? []
      if (!media.some((m: unknown) => idOf(m) === mediaId)) return pillar
      touched = true
      const next: number[] = []
      for (const m of media) {
        const id = idOf(m)
        if (id !== mediaId) {
          if (id !== null) next.push(id)
          continue
        }
        // Replace in place so the creative keeps its position in the row.
        if (newId !== null && !next.includes(newId)) next.push(newId)
      }
      return { ...pillar, media: next }
    })

    if (!touched) {
      console.log(`  = ${op.slug} [${locale}]: ${op.file} already gone`)
      continue
    }
    changes++
    touchedSlugs.add(op.slug)
    // In a dry run the replacement has not been uploaded yet, so `newId` is
    // null; say so rather than printing "-> null", which reads as if the
    // creative would be dropped.
    let verb = '(detach only)'
    if (op.replace) {
      verb = newId === null ? `-> upload ${op.replace.file}` : `-> ${newId}`
    }
    console.log(
      `  ${APPLY ? '~' : 'would'} ${op.slug} [${locale}]: detach ${mediaId} (${op.file}) ${verb}`
    )
    if (APPLY) {
      if (op.replace && newId === null) {
        throw new Error(
          `${op.slug}: replacement ${op.replace.file} has no media id — aborting rather than dropping the creative`
        )
      }
      await payload.update({
        collection: 'case-studies',
        id: doc.id,
        locale,
        // No `draft: true`: these studies are published and the public page is
        // the thing being corrected.
        // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
        data: { approach } as any,
      })
    }
  }

  if (!detached.some((d) => d.mediaId === mediaId)) {
    detached.push({ slug: op.slug, mediaId, file: op.file })
  }
}

/**
 * —— record the English alts on disk ——
 *
 * `alts.en.json` is keyed by media id, and media ids are per-database: the
 * development and production sequences are completely disjoint (dev id 1 is
 * `tiktok.png`, production id 1 is `blog-1.png`). The committed file tracks
 * PRODUCTION, so appending development ids to it would attach one image's
 * English alt to a different image entirely — and `translate-media-alt.ts`
 * writes from this file back into the database by id, so the corruption would
 * eventually be applied.
 *
 * The guard is therefore ownership, not novelty: an id already present under a
 * DIFFERENT filename proves this file does not describe the database being
 * written, so the file is left alone and the mismatch is reported. The English
 * alt still reaches the database directly on upload, so nothing is lost on
 * development — only the bookkeeping is deferred to the production run.
 */
if (APPLY) {
  const raw = await readFile(ALTS_EN, 'utf8')
  // biome-ignore lint/suspicious/noExplicitAny: on-disk entry shape
  const entries = JSON.parse(raw) as any[]
  const byId = new Map(entries.map((e) => [e.id, e]))
  let added = 0
  let foreign = 0
  for (const op of PLAN) {
    if (!op.replace) continue
    const probe = await payload.find({
      collection: 'media',
      where: { filename: { equals: op.replace.file } },
      limit: 1,
    })
    const id = probe.docs[0]?.id
    if (id === undefined) continue
    const clash = byId.get(id)
    if (clash) {
      if (clash.filename !== op.replace.file) foreign++
      continue
    }
    entries.push({
      id,
      filename: op.replace.file,
      source: op.replace.altPl,
      alt: op.replace.altEn,
    })
    added++
  }
  if (foreign > 0) {
    console.log(
      `\n! ${ALTS_EN} left untouched: ${foreign} of its ids name different files ` +
        'in this database, so it describes another one (it tracks production). ' +
        'English alts were still written straight to the media rows.'
    )
  }
  if (added > 0) {
    entries.sort((a, b) => a.id - b.id)
    await writeFile(ALTS_EN, `${JSON.stringify(entries, null, 2)}\n`)
    console.log(`\n+ ${added} entries appended to ${ALTS_EN}`)
  }
}

// —— reference counts for the detached rows, so deletion stays a separate call ——
console.log('\nDetached media — reference check:')
const allStudies = await payload.find({
  collection: 'case-studies',
  limit: 200,
  draft: true,
  locale: 'pl',
  depth: 0,
})
for (const d of detached) {
  let refs = 0
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  for (const s of allStudies.docs as any[]) {
    if (idOf(s.cover) === d.mediaId) refs++
    if (idOf(s.seo?.ogImage) === d.mediaId) refs++
    if (idOf(s.client?.logo) === d.mediaId) refs++
    for (const g of s.gallery ?? []) if (idOf(g) === d.mediaId) refs++
    for (const p of s.approach ?? []) {
      for (const m of p.media ?? []) if (idOf(m) === d.mediaId) refs++
    }
  }
  const note =
    refs === 0
      ? 'orphaned — safe to delete later, kept so this change stays reversible'
      : `still referenced ${refs}x — MUST NOT be deleted`
  console.log(`  ${d.mediaId} ${d.file.padEnd(32)} ${note}`)
}

console.log(
  `\n${APPLY ? 'Applied' : 'Would apply'}: ${changes} locale-level edits, ` +
    `${uploads} uploads, ${detached.length} media detached, 0 deleted.`
)
if (!APPLY) console.log('Dry run — pass --apply to write.')

/**
 * —— expire the deployed cache ——
 *
 * A database write alone does not change what visitors see. The collection's
 * `afterChange` hook calls `revalidateTag`, but `safeRevalidate` deliberately
 * swallows the throw when there is no Next request scope — which is exactly this
 * script — so the data changes and the pages keep serving the old cache for
 * `cacheLife('days')`. Every removal here stayed invisible on the deployed site
 * until the tags were expired by hand.
 *
 * So the script does it itself rather than trusting anyone to remember. Target
 * comes from `--revalidate <baseUrl>` or REVALIDATE_BASE_URL; with neither, it
 * prints the exact command instead of quietly finishing "successfully" while the
 * public site still shows the images that were just removed.
 */
if (APPLY && touchedSlugs.size > 0) {
  const tags = [
    'case-studies',
    ...[...touchedSlugs].sort().map((s) => `case-study:${s}`),
  ]
  const query = tags.map((t) => `tag=${encodeURIComponent(t)}`).join('&')
  const flagIdx = process.argv.indexOf('--revalidate')
  const base = (
    flagIdx === -1 ? process.env.REVALIDATE_BASE_URL : process.argv[flagIdx + 1]
  )?.replace(/\/$/, '')
  const secret = process.env.REVALIDATE_SECRET

  if (!(base && secret)) {
    const why = base ? 'REVALIDATE_SECRET is not set' : 'no revalidation target'
    console.log(
      `\n! Deployed pages still show the old imagery — ${why}.\n` +
        '  The database is correct; the cache is not. Run:\n\n' +
        `  curl -X POST -H "x-revalidate-secret: $REVALIDATE_SECRET" \\\n` +
        `    "${base ?? '<baseUrl>'}/api/revalidate?${query}"\n`
    )
  } else {
    const res = await fetch(`${base}/api/revalidate?${query}`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    const body = await res.text()
    console.log(
      res.ok
        ? `\n+ revalidated ${tags.length} tag(s) on ${base}\n  ${body}`
        : `\n! revalidation failed (HTTP ${res.status}) on ${base}\n  ${body}\n` +
            '  The database is correct; the deployed pages are stale until this succeeds.'
    )
    // A failed revalidation leaves the site misrepresenting the data, so it is
    // a non-zero exit rather than a note at the bottom of a green run.
    if (!res.ok) process.exit(1)
  }
}

process.exit(0)
